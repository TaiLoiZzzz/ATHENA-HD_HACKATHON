-- Fix missing tables and columns for token payment functionality

-- Add missing avatar_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create missing blockchain_transactions table
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT,
    transaction_type VARCHAR(50) NOT NULL, -- earn, spend, transfer, trade
    amount DECIMAL(18,8) NOT NULL,
    token_address VARCHAR(42),
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    gas_used BIGINT,
    gas_price BIGINT,
    transaction_fee DECIMAL(18,8),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- Create missing sovico_ecosystem_stats table  
CREATE TABLE IF NOT EXISTS sovico_ecosystem_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_users BIGINT DEFAULT 0,
    active_users_today BIGINT DEFAULT 0,
    total_tokens_issued DECIMAL(18,8) DEFAULT 0,
    total_tokens_redeemed DECIMAL(18,8) DEFAULT 0,
    total_vnd_spent DECIMAL(15,2) DEFAULT 0,
    vietjet_bookings_count BIGINT DEFAULT 0,
    hdbank_products_count BIGINT DEFAULT 0,
    resort_bookings_count BIGINT DEFAULT 0,
    insurance_policies_count BIGINT DEFAULT 0,
    marketplace_trades_count BIGINT DEFAULT 0,
    marketplace_volume DECIMAL(18,8) DEFAULT 0,
    average_token_price DECIMAL(10,2) DEFAULT 8300,
    platform_fees_collected DECIMAL(15,2) DEFAULT 0,
    athena_prime_users BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint for daily stats
CREATE UNIQUE INDEX IF NOT EXISTS idx_sovico_stats_date ON sovico_ecosystem_stats(stat_date);

-- Create indexes for blockchain_transactions
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_user_id ON blockchain_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_hash ON blockchain_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_type ON blockchain_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_status ON blockchain_transactions(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_created_at ON blockchain_transactions(created_at);

-- Insert initial sovico stats
INSERT INTO sovico_ecosystem_stats (
    stat_date, total_users, active_users_today, total_tokens_issued, 
    total_tokens_redeemed, average_token_price, athena_prime_users
) VALUES (
    CURRENT_DATE, 4, 4, 50000.00, 8000.00, 8300.00, 2
) ON CONFLICT (stat_date) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    active_users_today = EXCLUDED.active_users_today,
    updated_at = CURRENT_TIMESTAMP;

-- Create improved token payment procedure
CREATE OR REPLACE FUNCTION process_token_payment(
    p_user_id UUID,
    p_amount DECIMAL(18,8),
    p_description TEXT,
    p_service_type TEXT DEFAULT NULL,
    p_service_reference_id TEXT DEFAULT NULL
) RETURNS TABLE(success BOOLEAN, new_balance DECIMAL(18,8), transaction_id UUID) AS $$
DECLARE
    current_balance DECIMAL(18,8);
    new_tx_id UUID;
BEGIN
    -- Get current balance
    SELECT balance INTO current_balance 
    FROM token_balances 
    WHERE user_id = p_user_id;
    
    -- Check if user has enough balance
    IF current_balance IS NULL OR current_balance < p_amount THEN
        RETURN QUERY SELECT FALSE, current_balance, NULL::UUID;
        RETURN;
    END IF;
    
    -- Generate transaction ID
    new_tx_id := gen_random_uuid();
    
    -- Start transaction
    BEGIN
        -- Deduct tokens from balance
        UPDATE token_balances 
        SET 
            balance = balance - p_amount,
            total_spent = total_spent + p_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id;
        
        -- Record transaction
        INSERT INTO transactions (
            id, user_id, type, amount, description, 
            service_type, service_reference_id, status
        ) VALUES (
            new_tx_id, p_user_id, 'spend', p_amount, p_description,
            p_service_type, p_service_reference_id, 'completed'
        );
        
        -- Record blockchain transaction (simulation)
        INSERT INTO blockchain_transactions (
            user_id, transaction_hash, transaction_type, amount,
            status, metadata
        ) VALUES (
            p_user_id, 
            '0x' || encode(gen_random_bytes(32), 'hex'),
            'spend',
            p_amount,
            'confirmed',
            jsonb_build_object(
                'description', p_description,
                'service_type', p_service_type,
                'service_reference_id', p_service_reference_id,
                'simulation_mode', true
            )
        );
        
        -- Get new balance
        SELECT balance INTO current_balance 
        FROM token_balances 
        WHERE user_id = p_user_id;
        
        -- Return success
        RETURN QUERY SELECT TRUE, current_balance, new_tx_id;
        
    EXCEPTION WHEN OTHERS THEN
        -- Rollback and return failure
        RETURN QUERY SELECT FALSE, current_balance, NULL::UUID;
    END;
END;
$$ LANGUAGE plpgsql;

-- Update existing transactions to fix ambiguous column references
-- Create view to handle ambiguous amount column
CREATE OR REPLACE VIEW user_activity_view AS
SELECT 
    t.id,
    t.user_id,
    t.type,
    t.amount as transaction_amount,
    t.description,
    t.service_type,
    t.status,
    t.created_at,
    u.full_name,
    u.email
FROM transactions t
JOIN users u ON t.user_id = u.id;

-- Add sample blockchain transactions for existing users
INSERT INTO blockchain_transactions (
    user_id, transaction_hash, transaction_type, amount, status, metadata
)
SELECT 
    user_id,
    '0x' || encode(gen_random_bytes(32), 'hex'),
    CASE 
        WHEN type IN ('earn', 'spend') THEN type
        ELSE 'transfer'
    END,
    amount,
    'confirmed',
    jsonb_build_object(
        'description', description,
        'service_type', service_type,
        'migrated_from_transactions', true,
        'simulation_mode', true
    )
FROM transactions 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
ON CONFLICT (transaction_hash) DO NOTHING;

COMMIT;


