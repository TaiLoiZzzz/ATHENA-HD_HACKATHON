-- Create sample users with different ranks
-- This script creates demo users with various ranking levels

-- Insert sample users with different profiles
INSERT INTO users (id, email, password_hash, full_name, phone, date_of_birth, address, athena_prime, is_verified, avatar_url) VALUES
-- Diamond Rank Users (20,000+ points)
(
    'diamond-user-001'::uuid,
    'diamond1@athena.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm', -- password: diamond123
    'Nguyễn Minh Đức',
    '+84901234501',
    '1985-03-15',
    '123 Lê Duẩn, Quận 1, TP.HCM',
    true,
    true,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
),
(
    'diamond-user-002'::uuid,
    'diamond2@athena.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm', -- password: diamond123
    'Trần Thị Kim Anh',
    '+84901234502',
    '1987-07-22',
    '456 Nguyễn Huệ, Quận 1, TP.HCM',
    true,
    true,
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
),

-- Gold Rank Users (5,000-19,999 points)
(
    'gold-user-001'::uuid,
    'gold1@athena.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm', -- password: gold123
    'Phạm Văn Hùng',
    '+84901234503',
    '1990-12-10',
    '789 Trần Hưng Đạo, Quận 5, TP.HCM',
    true,
    true,
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
),
(
    'gold-user-002'::uuid,
    'gold2@athena.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm', -- password: gold123
    'Lê Thị Mai',
    '+84901234504',
    '1988-05-18',
    '321 Võ Văn Tần, Quận 3, TP.HCM',
    false,
    true,
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
),

-- Silver Rank Users (1,000-4,999 points)
(
    'silver-user-001'::uuid,
    'silver1@athena.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm', -- password: silver123
    'Hoàng Thanh Tùng',
    '+84901234505',
    '1992-09-25',
    '654 Lý Tự Trọng, Quận 1, TP.HCM',
    false,
    true,
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
),
(
    'silver-user-002'::uuid,
    'silver2@athena.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm', -- password: silver123
    'Vũ Thị Lan',
    '+84901234506',
    '1994-02-14',
    '987 Hai Bà Trưng, Quận 1, TP.HCM',
    false,
    true,
    'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face'
)
ON CONFLICT (email) DO NOTHING;

-- Create token balances for sample users
INSERT INTO token_balances (user_id, balance) VALUES
('diamond-user-001'::uuid, 2580.50),
('diamond-user-002'::uuid, 1950.75),
('gold-user-001'::uuid, 850.25),
('gold-user-002'::uuid, 650.00),
('silver-user-001'::uuid, 320.80),
('silver-user-002'::uuid, 275.40)
ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance;

-- Get rank IDs
DO $$
DECLARE
    diamond_rank_id UUID;
    gold_rank_id UUID;
    silver_rank_id UUID;
BEGIN
    SELECT id INTO diamond_rank_id FROM user_ranks WHERE name = 'Diamond';
    SELECT id INTO gold_rank_id FROM user_ranks WHERE name = 'Gold';
    SELECT id INTO silver_rank_id FROM user_ranks WHERE name = 'Silver';

    -- Create ranking progress for Diamond users
    INSERT INTO user_ranking_progress (user_id, current_rank_id, total_points, total_spent, total_transactions, services_used, achievements) VALUES
    ('diamond-user-001'::uuid, diamond_rank_id, 28500, 125000000, 85, 
     '{"vietjet": 25, "hdbank": 30, "sovico": 30}'::jsonb,
     '["Early Adopter", "VIP Traveler", "Premium Banking", "Luxury Lifestyle", "Diamond Explorer"]'::jsonb),
    ('diamond-user-002'::uuid, diamond_rank_id, 22000, 98000000, 72, 
     '{"vietjet": 20, "hdbank": 25, "sovico": 27}'::jsonb,
     '["Power User", "Business Traveler", "Investment Pro", "Luxury Lover"]'::jsonb),

    -- Create ranking progress for Gold users  
    ('gold-user-001'::uuid, gold_rank_id, 12500, 65000000, 48, 
     '{"vietjet": 15, "hdbank": 18, "sovico": 15}'::jsonb,
     '["Frequent Flyer", "Smart Investor", "Resort Enthusiast"]'::jsonb),
    ('gold-user-002'::uuid, gold_rank_id, 8750, 42000000, 35, 
     '{"vietjet": 12, "hdbank": 12, "sovico": 11}'::jsonb,
     '["Travel Lover", "Banking Pro", "Weekend Warrior"]'::jsonb),

    -- Create ranking progress for Silver users
    ('silver-user-001'::uuid, silver_rank_id, 3200, 18000000, 22, 
     '{"vietjet": 8, "hdbank": 7, "sovico": 7}'::jsonb,
     '["Explorer", "Smart Saver"]'::jsonb),
    ('silver-user-002'::uuid, silver_rank_id, 2100, 12000000, 18, 
     '{"vietjet": 6, "hdbank": 6, "sovico": 6}'::jsonb,
     '["Rising Star", "Budget Traveler"]'::jsonb)
    ON CONFLICT (user_id) DO UPDATE SET
        current_rank_id = EXCLUDED.current_rank_id,
        total_points = EXCLUDED.total_points,
        total_spent = EXCLUDED.total_spent,
        total_transactions = EXCLUDED.total_transactions,
        services_used = EXCLUDED.services_used,
        achievements = EXCLUDED.achievements;
END $$;

-- Create sample transactions for these users to show activity
INSERT INTO transactions (id, user_id, type, amount, description, service_type, metadata, created_at) VALUES
-- Diamond user 1 transactions
('trans-diamond-001'::uuid, 'diamond-user-001'::uuid, 'earn', 25.0, 'Vietjet flight booking bonus - Diamond tier', 'vietjet', '{"flight_id": "VJ123", "bonus_tier": "diamond"}'::jsonb, NOW() - INTERVAL '2 days'),
('trans-diamond-002'::uuid, 'diamond-user-001'::uuid, 'earn', 20.0, 'HDBank premium card application bonus', 'hdbank', '{"product": "platinum_card", "bonus_tier": "diamond"}'::jsonb, NOW() - INTERVAL '5 days'),
('trans-diamond-003'::uuid, 'diamond-user-001'::uuid, 'earn', 45.0, 'Sovico resort booking bonus - Diamond tier', 'sovico', '{"resort": "phu_quoc_premium", "bonus_tier": "diamond"}'::jsonb, NOW() - INTERVAL '1 week'),

-- Diamond user 2 transactions
('trans-diamond-004'::uuid, 'diamond-user-002'::uuid, 'earn', 25.0, 'Vietjet business class bonus - Diamond tier', 'vietjet', '{"flight_id": "VJ456", "class": "business", "bonus_tier": "diamond"}'::jsonb, NOW() - INTERVAL '3 days'),
('trans-diamond-005'::uuid, 'diamond-user-002'::uuid, 'earn', 35.0, 'Sovico luxury package bonus - Diamond tier', 'sovico', '{"package": "luxury_spa", "bonus_tier": "diamond"}'::jsonb, NOW() - INTERVAL '1 week'),

-- Gold user 1 transactions
('trans-gold-001'::uuid, 'gold-user-001'::uuid, 'earn', 15.0, 'Vietjet flight booking bonus - Gold tier', 'vietjet', '{"flight_id": "VJ789", "bonus_tier": "gold"}'::jsonb, NOW() - INTERVAL '1 day'),
('trans-gold-002'::uuid, 'gold-user-001'::uuid, 'earn', 12.0, 'HDBank savings account bonus - Gold tier', 'hdbank', '{"product": "savings_plus", "bonus_tier": "gold"}'::jsonb, NOW() - INTERVAL '4 days'),

-- Gold user 2 transactions
('trans-gold-003'::uuid, 'gold-user-002'::uuid, 'earn', 15.0, 'Vietjet weekend flight bonus - Gold tier', 'vietjet', '{"flight_id": "VJ101", "bonus_tier": "gold"}'::jsonb, NOW() - INTERVAL '2 days'),
('trans-gold-004'::uuid, 'gold-user-002'::uuid, 'earn', 25.0, 'Sovico resort weekend bonus - Gold tier', 'sovico', '{"resort": "da_nang_beach", "bonus_tier": "gold"}'::jsonb, NOW() - INTERVAL '6 days'),

-- Silver user 1 transactions
('trans-silver-001'::uuid, 'silver-user-001'::uuid, 'earn', 10.0, 'Vietjet economy flight bonus - Silver tier', 'vietjet', '{"flight_id": "VJ202", "bonus_tier": "silver"}'::jsonb, NOW() - INTERVAL '1 day'),
('trans-silver-002'::uuid, 'silver-user-001'::uuid, 'earn', 7.0, 'HDBank basic card bonus - Silver tier', 'hdbank', '{"product": "basic_card", "bonus_tier": "silver"}'::jsonb, NOW() - INTERVAL '3 days'),

-- Silver user 2 transactions
('trans-silver-003'::uuid, 'silver-user-002'::uuid, 'earn', 10.0, 'Vietjet domestic flight bonus - Silver tier', 'vietjet', '{"flight_id": "VJ303", "bonus_tier": "silver"}'::jsonb, NOW() - INTERVAL '2 days'),
('trans-silver-004'::uuid, 'silver-user-002'::uuid, 'earn', 15.0, 'Sovico budget travel bonus - Silver tier', 'sovico', '{"package": "budget_tour", "bonus_tier": "silver"}'::jsonb, NOW() - INTERVAL '5 days')

ON CONFLICT (id) DO NOTHING;

-- Create some ranking activity logs
INSERT INTO ranking_activity_log (user_id, activity_type, points_earned, old_rank_id, new_rank_id, service_type, metadata) 
SELECT 
    'diamond-user-001'::uuid,
    'rank_upgrade',
    5000,
    (SELECT id FROM user_ranks WHERE name = 'Gold'),
    (SELECT id FROM user_ranks WHERE name = 'Diamond'),
    'vietjet',
    '{"upgrade_trigger": "luxury_booking_spree", "total_spent": 50000000}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM ranking_activity_log 
    WHERE user_id = 'diamond-user-001'::uuid AND activity_type = 'rank_upgrade'
);

-- Update users to set their creation dates to simulate long-term membership
UPDATE users SET created_at = NOW() - INTERVAL '2 years' WHERE id = 'diamond-user-001'::uuid;
UPDATE users SET created_at = NOW() - INTERVAL '18 months' WHERE id = 'diamond-user-002'::uuid;
UPDATE users SET created_at = NOW() - INTERVAL '1 year' WHERE id = 'gold-user-001'::uuid;
UPDATE users SET created_at = NOW() - INTERVAL '10 months' WHERE id = 'gold-user-002'::uuid;
UPDATE users SET created_at = NOW() - INTERVAL '6 months' WHERE id = 'silver-user-001'::uuid;
UPDATE users SET created_at = NOW() - INTERVAL '4 months' WHERE id = 'silver-user-002'::uuid;


