-- User Ranking System for ATHENA Platform
-- This script creates tables for user ranking and bonus system

-- User Ranks Table
CREATE TABLE IF NOT EXISTS user_ranks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    level INTEGER NOT NULL UNIQUE,
    min_points INTEGER NOT NULL,
    max_points INTEGER,
    bonus_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    icon VARCHAR(50),
    color VARCHAR(20),
    benefits JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Ranking Progress Table
CREATE TABLE IF NOT EXISTS user_ranking_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_rank_id UUID NOT NULL REFERENCES user_ranks(id),
    total_points INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    services_used JSONB DEFAULT '{}', -- Track usage by service type
    achievements JSONB DEFAULT '[]',
    rank_updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Service Bonus Configuration Table
CREATE TABLE IF NOT EXISTS service_bonus_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type VARCHAR(50) NOT NULL, -- 'hdbank', 'vietjet', 'sovico'
    service_category VARCHAR(50), -- 'cards', 'flights', 'resort', etc.
    rank_id UUID NOT NULL REFERENCES user_ranks(id),
    base_bonus_amount DECIMAL(10,2) NOT NULL,
    bonus_percentage DECIMAL(5,2), -- Additional percentage bonus
    max_bonus_per_transaction DECIMAL(10,2),
    min_spending_required DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Ranking Activity Log Table
CREATE TABLE IF NOT EXISTS ranking_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL, -- 'transaction', 'service_usage', 'rank_upgrade'
    points_earned INTEGER DEFAULT 0,
    old_rank_id UUID REFERENCES user_ranks(id),
    new_rank_id UUID REFERENCES user_ranks(id),
    transaction_id UUID REFERENCES transactions(id),
    service_type VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default ranks
INSERT INTO user_ranks (name, level, min_points, max_points, bonus_multiplier, icon, color, benefits) VALUES
('Bronze', 1, 0, 999, 1.00, 'bronze', '#CD7F32', '["Welcome bonus", "Basic support"]'),
('Silver', 2, 1000, 4999, 1.25, 'silver', '#C0C0C0', '["25% bonus SOV", "Priority support", "Monthly newsletter"]'),
('Gold', 3, 5000, 19999, 1.50, 'gold', '#FFD700', '["50% bonus SOV", "VIP support", "Exclusive offers", "Birthday bonus"]'),
('Diamond', 4, 20000, NULL, 2.00, 'diamond', '#B9F2FF', '["100% bonus SOV", "Personal advisor", "Premium benefits", "Early access", "Custom offers"]')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_ranking_progress_user_id ON user_ranking_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ranking_progress_rank_id ON user_ranking_progress(current_rank_id);
CREATE INDEX IF NOT EXISTS idx_service_bonus_config_service_rank ON service_bonus_config(service_type, rank_id);
CREATE INDEX IF NOT EXISTS idx_ranking_activity_log_user_id ON ranking_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ranking_activity_log_created_at ON ranking_activity_log(created_at);

-- Insert sample service bonus configurations
INSERT INTO service_bonus_config (service_type, service_category, rank_id, base_bonus_amount, bonus_percentage, max_bonus_per_transaction, description) 
SELECT 
    'vietjet', 
    'flights', 
    r.id,
    CASE 
        WHEN r.level = 1 THEN 5.00   -- Bronze: 5 SOV
        WHEN r.level = 2 THEN 10.00  -- Silver: 10 SOV
        WHEN r.level = 3 THEN 15.00  -- Gold: 15 SOV
        WHEN r.level = 4 THEN 20.00  -- Diamond: 20 SOV
    END,
    CASE 
        WHEN r.level = 1 THEN 1.00   -- Bronze: 1%
        WHEN r.level = 2 THEN 2.00   -- Silver: 2%
        WHEN r.level = 3 THEN 3.00   -- Gold: 3%
        WHEN r.level = 4 THEN 5.00   -- Diamond: 5%
    END,
    CASE 
        WHEN r.level = 1 THEN 50.00  -- Bronze: max 50 SOV
        WHEN r.level = 2 THEN 100.00 -- Silver: max 100 SOV
        WHEN r.level = 3 THEN 200.00 -- Gold: max 200 SOV
        WHEN r.level = 4 THEN 500.00 -- Diamond: max 500 SOV
    END,
    CONCAT('Vietjet flight booking bonus for ', r.name, ' members')
FROM user_ranks r
ON CONFLICT DO NOTHING;

INSERT INTO service_bonus_config (service_type, service_category, rank_id, base_bonus_amount, bonus_percentage, max_bonus_per_transaction, description) 
SELECT 
    'hdbank', 
    'cards', 
    r.id,
    CASE 
        WHEN r.level = 1 THEN 3.00   -- Bronze: 3 SOV
        WHEN r.level = 2 THEN 7.00   -- Silver: 7 SOV
        WHEN r.level = 3 THEN 12.00  -- Gold: 12 SOV
        WHEN r.level = 4 THEN 18.00  -- Diamond: 18 SOV
    END,
    CASE 
        WHEN r.level = 1 THEN 0.5    -- Bronze: 0.5%
        WHEN r.level = 2 THEN 1.0    -- Silver: 1%
        WHEN r.level = 3 THEN 1.5    -- Gold: 1.5%
        WHEN r.level = 4 THEN 2.5    -- Diamond: 2.5%
    END,
    CASE 
        WHEN r.level = 1 THEN 30.00  -- Bronze: max 30 SOV
        WHEN r.level = 2 THEN 75.00  -- Silver: max 75 SOV
        WHEN r.level = 3 THEN 150.00 -- Gold: max 150 SOV
        WHEN r.level = 4 THEN 300.00 -- Diamond: max 300 SOV
    END,
    CONCAT('HDBank service bonus for ', r.name, ' members')
FROM user_ranks r
ON CONFLICT DO NOTHING;

INSERT INTO service_bonus_config (service_type, service_category, rank_id, base_bonus_amount, bonus_percentage, max_bonus_per_transaction, description) 
SELECT 
    'sovico', 
    'resort', 
    r.id,
    CASE 
        WHEN r.level = 1 THEN 8.00   -- Bronze: 8 SOV
        WHEN r.level = 2 THEN 15.00  -- Silver: 15 SOV
        WHEN r.level = 3 THEN 25.00  -- Gold: 25 SOV
        WHEN r.level = 4 THEN 40.00  -- Diamond: 40 SOV
    END,
    CASE 
        WHEN r.level = 1 THEN 2.00   -- Bronze: 2%
        WHEN r.level = 2 THEN 3.00   -- Silver: 3%
        WHEN r.level = 3 THEN 4.00   -- Gold: 4%
        WHEN r.level = 4 THEN 6.00   -- Diamond: 6%
    END,
    CASE 
        WHEN r.level = 1 THEN 80.00  -- Bronze: max 80 SOV
        WHEN r.level = 2 THEN 150.00 -- Silver: max 150 SOV
        WHEN r.level = 3 THEN 300.00 -- Gold: max 300 SOV
        WHEN r.level = 4 THEN 600.00 -- Diamond: max 600 SOV
    END,
    CONCAT('Sovico resort booking bonus for ', r.name, ' members')
FROM user_ranks r
ON CONFLICT DO NOTHING;

-- Function to calculate user rank based on points
CREATE OR REPLACE FUNCTION calculate_user_rank(user_points INTEGER)
RETURNS UUID AS $$
DECLARE
    rank_id UUID;
BEGIN
    SELECT id INTO rank_id
    FROM user_ranks
    WHERE user_points >= min_points 
      AND (max_points IS NULL OR user_points <= max_points)
    ORDER BY level DESC
    LIMIT 1;
    
    RETURN rank_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update user ranking progress
CREATE OR REPLACE FUNCTION update_user_ranking(
    p_user_id UUID,
    p_points_to_add INTEGER DEFAULT 0,
    p_amount_spent DECIMAL DEFAULT 0,
    p_service_type VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    old_rank_name VARCHAR,
    new_rank_name VARCHAR,
    rank_upgraded BOOLEAN,
    total_points INTEGER,
    points_to_next_rank INTEGER
) AS $$
DECLARE
    v_old_rank_id UUID;
    v_new_rank_id UUID;
    v_old_rank_name VARCHAR;
    v_new_rank_name VARCHAR;
    v_current_points INTEGER;
    v_services_used JSONB;
    v_next_rank_min_points INTEGER;
BEGIN
    -- Get current ranking progress or create new one
    SELECT 
        current_rank_id, 
        total_points, 
        services_used
    INTO 
        v_old_rank_id, 
        v_current_points, 
        v_services_used
    FROM user_ranking_progress 
    WHERE user_id = p_user_id;
    
    -- If no record exists, create one with Bronze rank
    IF NOT FOUND THEN
        SELECT id INTO v_old_rank_id FROM user_ranks WHERE level = 1;
        v_current_points := 0;
        v_services_used := '{}';
        
        INSERT INTO user_ranking_progress (
            user_id, 
            current_rank_id, 
            total_points, 
            total_spent, 
            total_transactions,
            services_used
        ) VALUES (
            p_user_id, 
            v_old_rank_id, 
            0, 
            0, 
            0,
            '{}'
        );
    END IF;
    
    -- Update points and spending
    v_current_points := v_current_points + p_points_to_add;
    
    -- Update service usage tracking
    IF p_service_type IS NOT NULL THEN
        v_services_used := jsonb_set(
            v_services_used,
            ARRAY[p_service_type],
            to_jsonb(COALESCE((v_services_used->p_service_type)::INTEGER, 0) + 1)
        );
    END IF;
    
    -- Calculate new rank
    v_new_rank_id := calculate_user_rank(v_current_points);
    
    -- Get rank names
    SELECT name INTO v_old_rank_name FROM user_ranks WHERE id = v_old_rank_id;
    SELECT name INTO v_new_rank_name FROM user_ranks WHERE id = v_new_rank_id;
    
    -- Update user ranking progress
    UPDATE user_ranking_progress 
    SET 
        current_rank_id = v_new_rank_id,
        total_points = v_current_points,
        total_spent = total_spent + p_amount_spent,
        total_transactions = total_transactions + 1,
        services_used = v_services_used,
        rank_updated_at = CASE WHEN v_old_rank_id != v_new_rank_id THEN NOW() ELSE rank_updated_at END,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Log the activity
    INSERT INTO ranking_activity_log (
        user_id,
        activity_type,
        points_earned,
        old_rank_id,
        new_rank_id,
        service_type,
        metadata
    ) VALUES (
        p_user_id,
        CASE WHEN v_old_rank_id != v_new_rank_id THEN 'rank_upgrade' ELSE 'points_earned' END,
        p_points_to_add,
        v_old_rank_id,
        v_new_rank_id,
        p_service_type,
        jsonb_build_object(
            'amount_spent', p_amount_spent,
            'total_points', v_current_points
        )
    );
    
    -- Calculate points to next rank
    SELECT min_points INTO v_next_rank_min_points 
    FROM user_ranks 
    WHERE level > (SELECT level FROM user_ranks WHERE id = v_new_rank_id)
    ORDER BY level ASC 
    LIMIT 1;
    
    RETURN QUERY SELECT 
        v_old_rank_name,
        v_new_rank_name,
        (v_old_rank_id != v_new_rank_id),
        v_current_points,
        COALESCE(v_next_rank_min_points - v_current_points, 0);
END;
$$ LANGUAGE plpgsql;


