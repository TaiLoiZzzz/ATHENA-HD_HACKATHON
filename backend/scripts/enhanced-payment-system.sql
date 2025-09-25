-- Enhanced Payment System with Loyalty Bonus Features
-- This script creates a comprehensive payment and loyalty system

-- Drop existing problematic tables and recreate with better structure
DROP TABLE IF EXISTS loyalty_tiers CASCADE;
DROP TABLE IF EXISTS member_benefits CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;

-- Create enhanced loyalty tiers system
CREATE TABLE loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_name VARCHAR(50) UNIQUE NOT NULL,
    tier_level INTEGER UNIQUE NOT NULL,
    min_days_member INTEGER NOT NULL,
    min_total_spent DECIMAL(15,2) NOT NULL DEFAULT 0,
    min_transactions INTEGER NOT NULL DEFAULT 0,
    bonus_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00, -- 1.00 = no bonus, 1.5 = 50% bonus
    token_bonus_percentage INTEGER NOT NULL DEFAULT 0, -- Additional % bonus on purchases
    special_perks JSONB DEFAULT '{}',
    tier_color VARCHAR(20) DEFAULT '#gray',
    tier_icon VARCHAR(50) DEFAULT 'star',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create member benefits tracking table
CREATE TABLE member_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    tier_id UUID REFERENCES loyalty_tiers(id),
    member_since DATE NOT NULL,
    days_as_member INTEGER NOT NULL DEFAULT 0,
    total_spent_lifetime DECIMAL(15,2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    total_bonus_earned DECIMAL(18,8) DEFAULT 0,
    last_tier_upgrade TIMESTAMP,
    next_tier_progress DECIMAL(5,2) DEFAULT 0, -- Percentage to next tier
    special_achievements JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enhanced payment transactions table
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    transaction_type VARCHAR(50) NOT NULL, -- 'service_payment', 'token_purchase', 'marketplace_trade'
    service_type VARCHAR(50), -- 'vietjet', 'hdbank', 'resort', 'insurance'
    service_reference_id VARCHAR(100),
    
    -- Amount breakdown
    base_amount DECIMAL(15,2) NOT NULL, -- Original VND amount
    token_amount DECIMAL(18,8) NOT NULL, -- Tokens used/earned
    bonus_tokens DECIMAL(18,8) DEFAULT 0, -- Extra tokens from loyalty
    loyalty_discount_vnd DECIMAL(15,2) DEFAULT 0, -- VND discount from loyalty
    
    -- Loyalty information
    user_tier_at_time VARCHAR(50),
    bonus_multiplier_used DECIMAL(4,2) DEFAULT 1.00,
    bonus_percentage_used INTEGER DEFAULT 0,
    
    -- Transaction details
    payment_method VARCHAR(50), -- 'tokens', 'cash', 'hybrid'
    status VARCHAR(20) DEFAULT 'pending',
    payment_gateway_ref VARCHAR(100),
    
    -- Metadata
    transaction_metadata JSONB DEFAULT '{}',
    processing_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP
);

-- Insert loyalty tiers (from Bronze to Diamond)
INSERT INTO loyalty_tiers (tier_name, tier_level, min_days_member, min_total_spent, min_transactions, bonus_multiplier, token_bonus_percentage, tier_color, tier_icon, special_perks) VALUES
('Thành viên mới', 1, 0, 0, 0, 1.00, 0, '#94a3b8', 'user', '{"welcome_bonus": 100}'),
('Đồng', 2, 30, 1000000, 5, 1.05, 2, '#cd7f32', 'medal', '{"priority_support": true, "early_access": false}'),
('Bạc', 3, 90, 5000000, 15, 1.10, 5, '#c0c0c0', 'award', '{"priority_support": true, "early_access": true, "exclusive_deals": true}'),
('Vàng', 4, 180, 15000000, 30, 1.20, 8, '#ffd700', 'star', '{"priority_support": true, "early_access": true, "exclusive_deals": true, "personal_advisor": true}'),
('Bạch Kim', 5, 365, 50000000, 75, 1.35, 12, '#e5e4e2', 'crown', '{"priority_support": true, "early_access": true, "exclusive_deals": true, "personal_advisor": true, "vip_lounge": true}'),
('Kim Cương', 6, 730, 100000000, 150, 1.50, 15, '#b9f2ff', 'gem', '{"priority_support": true, "early_access": true, "exclusive_deals": true, "personal_advisor": true, "vip_lounge": true, "concierge_service": true}');

-- Create function to calculate user tier
CREATE OR REPLACE FUNCTION calculate_user_tier(p_user_id UUID)
RETURNS TABLE(
    tier_name VARCHAR(50),
    tier_level INTEGER,
    bonus_multiplier DECIMAL(4,2),
    token_bonus_percentage INTEGER,
    tier_color VARCHAR(20),
    tier_icon VARCHAR(50),
    special_perks JSONB,
    next_tier_name VARCHAR(50),
    progress_to_next DECIMAL(5,2)
) AS $$
DECLARE
    v_days_member INTEGER;
    v_total_spent DECIMAL(15,2);
    v_total_transactions INTEGER;
    v_current_tier RECORD;
    v_next_tier RECORD;
    v_progress DECIMAL(5,2);
BEGIN
    -- Calculate member stats
    SELECT 
        COALESCE(CURRENT_DATE - u.created_at::date, 0),
        COALESCE(SUM(pt.base_amount), 0),
        COALESCE(COUNT(pt.id), 0)
    INTO v_days_member, v_total_spent, v_total_transactions
    FROM users u
    LEFT JOIN payment_transactions pt ON pt.user_id = u.id AND pt.status = 'completed'
    WHERE u.id = p_user_id
    GROUP BY u.id, u.created_at;
    
    -- Find current tier
    SELECT * INTO v_current_tier
    FROM loyalty_tiers lt
    WHERE v_days_member >= lt.min_days_member 
      AND v_total_spent >= lt.min_total_spent 
      AND v_total_transactions >= lt.min_transactions
    ORDER BY lt.tier_level DESC
    LIMIT 1;
    
    -- Find next tier
    SELECT * INTO v_next_tier
    FROM loyalty_tiers lt
    WHERE lt.tier_level > v_current_tier.tier_level
    ORDER BY lt.tier_level ASC
    LIMIT 1;
    
    -- Calculate progress to next tier
    IF v_next_tier.id IS NOT NULL THEN
        v_progress := GREATEST(
            (v_days_member::DECIMAL / v_next_tier.min_days_member * 100),
            (v_total_spent / v_next_tier.min_total_spent * 100),
            (v_total_transactions::DECIMAL / v_next_tier.min_transactions * 100)
        );
        v_progress := LEAST(v_progress, 99.99);
    ELSE
        v_progress := 100.00;
    END IF;
    
    -- Return tier information
    RETURN QUERY SELECT 
        v_current_tier.tier_name,
        v_current_tier.tier_level,
        v_current_tier.bonus_multiplier,
        v_current_tier.token_bonus_percentage,
        v_current_tier.tier_color,
        v_current_tier.tier_icon,
        v_current_tier.special_perks,
        COALESCE(v_next_tier.tier_name, 'Tối đa'),
        v_progress;
END;
$$ LANGUAGE plpgsql;

-- Create enhanced token payment function
CREATE OR REPLACE FUNCTION process_enhanced_token_payment(
    p_user_id UUID,
    p_service_type VARCHAR(50),
    p_base_amount_vnd DECIMAL(15,2),
    p_token_amount DECIMAL(18,8),
    p_description TEXT,
    p_service_reference_id VARCHAR(100) DEFAULT NULL,
    p_payment_method VARCHAR(50) DEFAULT 'tokens'
) RETURNS TABLE(
    success BOOLEAN,
    transaction_id UUID,
    new_balance DECIMAL(18,8),
    bonus_tokens_earned DECIMAL(18,8),
    loyalty_discount DECIMAL(15,2),
    tier_info JSONB,
    message TEXT
) AS $$
DECLARE
    v_current_balance DECIMAL(18,8);
    v_user_tier RECORD;
    v_bonus_tokens DECIMAL(18,8) := 0;
    v_loyalty_discount DECIMAL(15,2) := 0;
    v_final_token_cost DECIMAL(18,8);
    v_transaction_id UUID;
    v_tier_info JSONB;
BEGIN
    -- Get current balance
    SELECT balance INTO v_current_balance 
    FROM token_balances 
    WHERE user_id = p_user_id;
    
    -- Get user tier information
    SELECT * INTO v_user_tier
    FROM calculate_user_tier(p_user_id);
    
    -- Calculate bonuses based on tier
    IF v_user_tier.tier_level > 1 THEN
        -- Calculate loyalty discount (reduce token cost)
        v_loyalty_discount := p_base_amount_vnd * (v_user_tier.tier_level - 1) * 0.01; -- 1% per tier level
        
        -- Calculate bonus tokens (extra tokens earned if applicable)
        IF p_service_type IN ('vietjet', 'hdbank', 'resort', 'insurance') THEN
            v_bonus_tokens := p_token_amount * (v_user_tier.token_bonus_percentage / 100.0);
        END IF;
    END IF;
    
    -- Calculate final token cost (reduced by loyalty discount)
    v_final_token_cost := p_token_amount * (1 - (v_loyalty_discount / p_base_amount_vnd));
    
    -- Check if user has enough balance
    IF v_current_balance IS NULL OR v_current_balance < v_final_token_cost THEN
        v_tier_info := jsonb_build_object(
            'tier_name', v_user_tier.tier_name,
            'tier_level', v_user_tier.tier_level,
            'bonus_multiplier', v_user_tier.bonus_multiplier,
            'tier_color', v_user_tier.tier_color
        );
        
        RETURN QUERY SELECT 
            FALSE, 
            NULL::UUID, 
            v_current_balance, 
            0::DECIMAL(18,8), 
            0::DECIMAL(15,2),
            v_tier_info,
            'Số dư token không đủ. Cần: ' || v_final_token_cost || ' SOV';
        RETURN;
    END IF;
    
    -- Generate transaction ID
    v_transaction_id := gen_random_uuid();
    
    -- Process payment
    BEGIN
        -- Deduct tokens from balance
        UPDATE token_balances 
        SET 
            balance = balance - v_final_token_cost + v_bonus_tokens,
            total_spent = total_spent + v_final_token_cost,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id;
        
        -- Record enhanced payment transaction
        INSERT INTO payment_transactions (
            id, user_id, transaction_type, service_type, service_reference_id,
            base_amount, token_amount, bonus_tokens, loyalty_discount_vnd,
            user_tier_at_time, bonus_multiplier_used, bonus_percentage_used,
            payment_method, status, transaction_metadata
        ) VALUES (
            v_transaction_id, p_user_id, 'service_payment', p_service_type, p_service_reference_id,
            p_base_amount_vnd, v_final_token_cost, v_bonus_tokens, v_loyalty_discount,
            v_user_tier.tier_name, v_user_tier.bonus_multiplier, v_user_tier.token_bonus_percentage,
            p_payment_method, 'completed',
            jsonb_build_object(
                'description', p_description,
                'original_token_amount', p_token_amount,
                'discount_applied', v_loyalty_discount > 0,
                'bonus_earned', v_bonus_tokens > 0
            )
        );
        
        -- Record in traditional transactions table for compatibility
        INSERT INTO transactions (
            id, user_id, type, amount, description, service_type, 
            service_reference_id, status
        ) VALUES (
            gen_random_uuid(), p_user_id, 'spend', v_final_token_cost, 
            p_description || CASE 
                WHEN v_bonus_tokens > 0 THEN ' (Bonus: +' || v_bonus_tokens || ' SOV)'
                ELSE ''
            END,
            p_service_type, p_service_reference_id, 'completed'
        );
        
        -- Update member benefits
        INSERT INTO member_benefits (user_id, tier_id, member_since, total_spent_lifetime, total_transactions)
        VALUES (p_user_id, (SELECT id FROM loyalty_tiers WHERE tier_name = v_user_tier.tier_name), 
                (SELECT created_at::date FROM users WHERE id = p_user_id), 
                p_base_amount_vnd, 1)
        ON CONFLICT (user_id) DO UPDATE SET
            total_spent_lifetime = member_benefits.total_spent_lifetime + p_base_amount_vnd,
            total_transactions = member_benefits.total_transactions + 1,
            total_bonus_earned = member_benefits.total_bonus_earned + v_bonus_tokens,
            updated_at = CURRENT_TIMESTAMP;
        
        -- Get new balance
        SELECT balance INTO v_current_balance 
        FROM token_balances 
        WHERE user_id = p_user_id;
        
        -- Prepare tier info for response
        v_tier_info := jsonb_build_object(
            'tier_name', v_user_tier.tier_name,
            'tier_level', v_user_tier.tier_level,
            'bonus_multiplier', v_user_tier.bonus_multiplier,
            'token_bonus_percentage', v_user_tier.token_bonus_percentage,
            'tier_color', v_user_tier.tier_color,
            'tier_icon', v_user_tier.tier_icon,
            'next_tier', v_user_tier.next_tier_name,
            'progress_to_next', v_user_tier.progress_to_next,
            'special_perks', v_user_tier.special_perks
        );
        
        -- Return success
        RETURN QUERY SELECT 
            TRUE, 
            v_transaction_id, 
            v_current_balance, 
            v_bonus_tokens, 
            v_loyalty_discount,
            v_tier_info,
            CASE 
                WHEN v_bonus_tokens > 0 AND v_loyalty_discount > 0 THEN 
                    'Thanh toán thành công! Bonus: +' || v_bonus_tokens || ' SOV, Giảm giá: ' || v_loyalty_discount || ' VND'
                WHEN v_bonus_tokens > 0 THEN 
                    'Thanh toán thành công! Bonus: +' || v_bonus_tokens || ' SOV'
                WHEN v_loyalty_discount > 0 THEN 
                    'Thanh toán thành công! Giảm giá: ' || v_loyalty_discount || ' VND'
                ELSE 
                    'Thanh toán thành công!'
            END;
            
    EXCEPTION WHEN OTHERS THEN
        -- Return failure
        RETURN QUERY SELECT 
            FALSE, 
            NULL::UUID, 
            v_current_balance, 
            0::DECIMAL(18,8), 
            0::DECIMAL(15,2),
            '{}'::JSONB,
            'Lỗi xử lý thanh toán: ' || SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user loyalty dashboard
CREATE OR REPLACE FUNCTION get_user_loyalty_dashboard(p_user_id UUID)
RETURNS TABLE(
    current_tier JSONB,
    next_tier JSONB,
    member_stats JSONB,
    recent_benefits JSONB,
    achievement_progress JSONB
) AS $$
DECLARE
    v_tier_info RECORD;
    v_member_benefits RECORD;
    v_current_tier_json JSONB;
    v_next_tier_json JSONB;
    v_member_stats_json JSONB;
    v_recent_benefits_json JSONB;
    v_achievements_json JSONB;
BEGIN
    -- Get tier information
    SELECT * INTO v_tier_info FROM calculate_user_tier(p_user_id);
    
    -- Get member benefits
    SELECT * INTO v_member_benefits 
    FROM member_benefits 
    WHERE user_id = p_user_id;
    
    -- Build current tier JSON
    v_current_tier_json := jsonb_build_object(
        'name', v_tier_info.tier_name,
        'level', v_tier_info.tier_level,
        'color', v_tier_info.tier_color,
        'icon', v_tier_info.tier_icon,
        'bonus_multiplier', v_tier_info.bonus_multiplier,
        'token_bonus_percentage', v_tier_info.token_bonus_percentage,
        'perks', v_tier_info.special_perks
    );
    
    -- Build next tier JSON
    v_next_tier_json := jsonb_build_object(
        'name', v_tier_info.next_tier_name,
        'progress', v_tier_info.progress_to_next,
        'requirements', (
            SELECT jsonb_build_object(
                'min_days', min_days_member,
                'min_spent', min_total_spent,
                'min_transactions', min_transactions
            )
            FROM loyalty_tiers 
            WHERE tier_level = v_tier_info.tier_level + 1
        )
    );
    
    -- Build member stats JSON
    v_member_stats_json := jsonb_build_object(
        'member_since', v_member_benefits.member_since,
        'days_as_member', COALESCE(v_member_benefits.days_as_member, 0),
        'total_spent', COALESCE(v_member_benefits.total_spent_lifetime, 0),
        'total_transactions', COALESCE(v_member_benefits.total_transactions, 0),
        'total_bonus_earned', COALESCE(v_member_benefits.total_bonus_earned, 0)
    );
    
    -- Get recent benefits
    SELECT jsonb_agg(
        jsonb_build_object(
            'date', created_at,
            'type', transaction_type,
            'bonus_tokens', bonus_tokens,
            'discount', loyalty_discount_vnd,
            'service', service_type
        ) ORDER BY created_at DESC
    ) INTO v_recent_benefits_json
    FROM payment_transactions
    WHERE user_id = p_user_id 
      AND (bonus_tokens > 0 OR loyalty_discount_vnd > 0)
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    LIMIT 10;
    
    -- Build achievements progress
    v_achievements_json := jsonb_build_object(
        'loyalty_champion', v_tier_info.tier_level >= 4,
        'early_adopter', COALESCE(v_member_benefits.days_as_member, 0) >= 365,
        'big_spender', COALESCE(v_member_benefits.total_spent_lifetime, 0) >= 50000000,
        'frequent_user', COALESCE(v_member_benefits.total_transactions, 0) >= 100
    );
    
    RETURN QUERY SELECT 
        v_current_tier_json,
        v_next_tier_json,
        v_member_stats_json,
        COALESCE(v_recent_benefits_json, '[]'::jsonb),
        v_achievements_json;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_service_type ON payment_transactions(service_type);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_member_benefits_user_id ON member_benefits(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_level ON loyalty_tiers(tier_level);

-- Initialize member benefits for existing users
INSERT INTO member_benefits (
    user_id, tier_id, member_since, days_as_member, total_spent_lifetime, total_transactions
)
SELECT 
    u.id,
    (SELECT id FROM loyalty_tiers WHERE tier_name = 'Thành viên mới'),
    u.created_at::date,
    GREATEST(CURRENT_DATE - u.created_at::date, 0),
    COALESCE(SUM(t.amount), 0),
    COALESCE(COUNT(t.id), 0)
FROM users u
LEFT JOIN transactions t ON t.user_id = u.id AND t.type = 'spend'
WHERE u.email != 'system@athena.com'
GROUP BY u.id, u.created_at
ON CONFLICT (user_id) DO NOTHING;

COMMIT;


