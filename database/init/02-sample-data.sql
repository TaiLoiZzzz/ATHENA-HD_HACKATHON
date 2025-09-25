-- ATHENA Platform Sample Data
-- This script creates demo users and sample data for testing

-- Create demo users with hashed passwords
INSERT INTO users (id, email, password_hash, full_name, phone, date_of_birth, address, athena_prime, is_verified) VALUES
(
    'demo-user-001'::uuid,
    'demo@athena.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm', -- demo123
    'Demo User',
    '+84901234567',
    '1990-05-15',
    '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
    false,
    true
),
(
    'prime-user-002'::uuid,
    'prime@athena.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm', -- prime123
    'Prime User',
    '+84901234568',
    '1985-08-22',
    '456 Le Loi Street, District 3, Ho Chi Minh City',
    true,
    true
),
(
    'trader-user-003'::uuid,
    'trader@athena.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm', -- trader123
    'Active Trader',
    '+84901234569',
    '1992-12-10',
    '789 Dong Khoi Street, District 1, Ho Chi Minh City',
    false,
    true
),
(
    'business-user-004'::uuid,
    'business@athena.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm', -- business123
    'Business User',
    '+84901234570',
    '1988-03-18',
    '321 Hai Ba Trung Street, District 1, Ho Chi Minh City',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Create token balances for demo users
INSERT INTO token_balances (user_id, balance, locked_balance, total_earned, total_spent) VALUES
('demo-user-001'::uuid, 1250.50, 0, 2500.00, 1249.50),
('prime-user-002'::uuid, 5420.75, 250.00, 8000.00, 2579.25),
('trader-user-003'::uuid, 850.25, 100.00, 3200.00, 2349.75),
('business-user-004'::uuid, 12750.80, 500.00, 15000.00, 2249.20)
ON CONFLICT (user_id) DO UPDATE SET
    balance = EXCLUDED.balance,
    locked_balance = EXCLUDED.locked_balance,
    total_earned = EXCLUDED.total_earned,
    total_spent = EXCLUDED.total_spent;

-- Create sample transactions
INSERT INTO transactions (user_id, type, amount, description, service_type, service_reference_id, status, created_at) VALUES
-- Demo user transactions
('demo-user-001'::uuid, 'earn', 150.00, 'Earned from Vietjet flight booking HAN-SGN', 'vietjet', 'VJ-20240115-001', 'completed', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('demo-user-001'::uuid, 'earn', 220.00, 'Earned from resort booking at Phu Quoc', 'resort', 'RST-20240118-001', 'completed', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('demo-user-001'::uuid, 'spend', 119.50, 'Redeemed for Grab voucher', NULL, NULL, 'completed', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('demo-user-001'::uuid, 'marketplace_sell', 200.00, 'Sold tokens on marketplace', NULL, NULL, 'completed', CURRENT_TIMESTAMP - INTERVAL '2 days'),

-- Prime user transactions (with 1.5x multiplier)
('prime-user-002'::uuid, 'earn', 375.00, 'Earned from HDBank investment (Prime bonus)', 'hdbank', 'HDB-20240110-001', 'completed', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('prime-user-002'::uuid, 'earn', 450.00, 'Earned from business travel package', 'vietjet', 'VJ-20240112-002', 'completed', CURRENT_TIMESTAMP - INTERVAL '8 days'),
('prime-user-002'::uuid, 'marketplace_buy', 500.00, 'Bought tokens on marketplace', NULL, NULL, 'completed', CURRENT_TIMESTAMP - INTERVAL '6 days'),
('prime-user-002'::uuid, 'spend', 79.25, 'Redeemed for insurance premium discount', 'insurance', 'INS-20240120-001', 'completed', CURRENT_TIMESTAMP - INTERVAL '1 day'),

-- Trader user transactions
('trader-user-003'::uuid, 'earn', 180.00, 'Earned from resort booking', 'resort', 'RST-20240108-001', 'completed', CURRENT_TIMESTAMP - INTERVAL '12 days'),
('trader-user-003'::uuid, 'marketplace_sell', 300.00, 'Sold tokens on marketplace', NULL, NULL, 'completed', CURRENT_TIMESTAMP - INTERVAL '9 days'),
('trader-user-003'::uuid, 'marketplace_buy', 150.00, 'Bought tokens on marketplace', NULL, NULL, 'completed', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('trader-user-003'::uuid, 'earn', 95.00, 'Earned from insurance purchase', 'insurance', 'INS-20240119-001', 'completed', CURRENT_TIMESTAMP - INTERVAL '4 days'),

-- Business user transactions
('business-user-004'::uuid, 'earn', 750.00, 'Earned from corporate flight bookings', 'vietjet', 'VJ-20240105-003', 'completed', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('business-user-004'::uuid, 'earn', 900.00, 'Earned from HDBank business account', 'hdbank', 'HDB-20240107-002', 'completed', CURRENT_TIMESTAMP - INTERVAL '13 days'),
('business-user-004'::uuid, 'spend', 249.20, 'Redeemed for corporate insurance', 'insurance', 'INS-20240116-002', 'completed', CURRENT_TIMESTAMP - INTERVAL '6 days');

-- Create sample marketplace orders
INSERT INTO marketplace_orders (user_id, order_type, amount, price_per_token, total_value, filled_amount, status, created_at) VALUES
-- Active sell orders
('prime-user-002'::uuid, 'sell', 1000.00, 8500.00, 8500000.00, 0, 'active', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('business-user-004'::uuid, 'sell', 500.00, 8400.00, 4200000.00, 0, 'active', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
('demo-user-001'::uuid, 'sell', 250.00, 8600.00, 2150000.00, 0, 'active', CURRENT_TIMESTAMP - INTERVAL '1 hour'),

-- Active buy orders
('trader-user-003'::uuid, 'buy', 300.00, 8200.00, 2460000.00, 0, 'active', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
('demo-user-001'::uuid, 'buy', 150.00, 8100.00, 1215000.00, 0, 'active', CURRENT_TIMESTAMP - INTERVAL '5 hours'),

-- Completed orders
('prime-user-002'::uuid, 'sell', 200.00, 8300.00, 1660000.00, 200.00, 'filled', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('trader-user-003'::uuid, 'buy', 200.00, 8300.00, 1660000.00, 200.00, 'filled', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Create sample marketplace trades
INSERT INTO marketplace_trades (buy_order_id, sell_order_id, buyer_id, seller_id, amount, price_per_token, total_value, platform_fee, created_at) VALUES
-- Recent trade between prime user and trader
(
    (SELECT id FROM marketplace_orders WHERE user_id = 'trader-user-003'::uuid AND order_type = 'buy' AND status = 'filled' LIMIT 1),
    (SELECT id FROM marketplace_orders WHERE user_id = 'prime-user-002'::uuid AND order_type = 'sell' AND status = 'filled' LIMIT 1),
    'trader-user-003'::uuid,
    'prime-user-002'::uuid,
    200.00,
    8300.00,
    1660000.00,
    24900.00, -- 1.5% fee
    CURRENT_TIMESTAMP - INTERVAL '1 day'
);

-- Create sample service bookings
INSERT INTO service_bookings (user_id, service_type, booking_reference, total_amount, tokens_earned, status, booking_details, created_at) VALUES
-- Flight bookings
('demo-user-001'::uuid, 'vietjet', 'VJ-20240115-001', 1500000.00, 150.00, 'confirmed', 
 '{"flight": "VJ001", "route": "HAN-SGN", "passengers": 1, "date": "2024-01-15T08:00:00Z", "seat": "12A"}', 
 CURRENT_TIMESTAMP - INTERVAL '7 days'),

('prime-user-002'::uuid, 'vietjet', 'VJ-20240112-002', 3000000.00, 450.00, 'confirmed', 
 '{"flight": "VJ150", "route": "SGN-NRT", "passengers": 2, "date": "2024-01-12T23:30:00Z", "class": "business"}', 
 CURRENT_TIMESTAMP - INTERVAL '8 days'),

('business-user-004'::uuid, 'vietjet', 'VJ-20240105-003', 5000000.00, 750.00, 'confirmed', 
 '{"flights": ["VJ101", "VJ102"], "route": "HAN-BKK-HAN", "passengers": 5, "type": "corporate"}', 
 CURRENT_TIMESTAMP - INTERVAL '15 days'),

-- Resort bookings
('demo-user-001'::uuid, 'resort', 'RST-20240118-001', 2200000.00, 220.00, 'confirmed', 
 '{"resort": "Sunrise Beach Resort", "location": "Phu Quoc", "nights": 2, "guests": 2, "room": "Deluxe Ocean View"}', 
 CURRENT_TIMESTAMP - INTERVAL '5 days'),

('trader-user-003'::uuid, 'resort', 'RST-20240108-001', 1800000.00, 180.00, 'confirmed', 
 '{"resort": "Mountain View Lodge", "location": "Sapa", "nights": 3, "guests": 2, "room": "Standard Mountain View"}', 
 CURRENT_TIMESTAMP - INTERVAL '12 days'),

-- Banking services
('prime-user-002'::uuid, 'hdbank', 'HDB-20240110-001', 2500000.00, 375.00, 'approved', 
 '{"product": "HD Smart Investment", "amount": 2500000, "term": "12 months", "rate": 8.5}', 
 CURRENT_TIMESTAMP - INTERVAL '10 days'),

('business-user-004'::uuid, 'hdbank', 'HDB-20240107-002', 6000000.00, 900.00, 'approved', 
 '{"product": "Business Account Premium", "type": "corporate", "initial_deposit": 6000000}', 
 CURRENT_TIMESTAMP - INTERVAL '13 days'),

-- Insurance policies
('trader-user-003'::uuid, 'insurance', 'INS-20240119-001', 950000.00, 95.00, 'active', 
 '{"type": "travel_insurance", "coverage": 100000000, "duration": "1 year", "destinations": ["Asia", "Europe"]}', 
 CURRENT_TIMESTAMP - INTERVAL '4 days'),

('prime-user-002'::uuid, 'insurance', 'INS-20240120-001', 1200000.00, 180.00, 'active', 
 '{"type": "health_insurance", "coverage": 500000000, "family_members": 3, "premium_type": "annual"}', 
 CURRENT_TIMESTAMP - INTERVAL '1 day'),

('business-user-004'::uuid, 'insurance', 'INS-20240116-002', 3000000.00, 450.00, 'active', 
 '{"type": "corporate_insurance", "employees": 50, "coverage": 1000000000, "benefits": ["health", "travel", "accident"]}', 
 CURRENT_TIMESTAMP - INTERVAL '6 days');

-- Update locked balances for users with active sell orders
UPDATE token_balances 
SET locked_balance = (
    SELECT COALESCE(SUM(amount - filled_amount), 0)
    FROM marketplace_orders 
    WHERE user_id = token_balances.user_id 
    AND order_type = 'sell' 
    AND status = 'active'
);

-- Create some sample cart items (temporary data)
INSERT INTO shopping_cart (user_id, service_type, service_item_id, quantity, price, metadata, created_at) VALUES
('demo-user-001'::uuid, 'vietjet', 'VJ003', 1, 1200000.00, 
 '{"route": "HAN-DAD", "date": "2024-02-01", "passengers": 1, "class": "economy"}', 
 CURRENT_TIMESTAMP - INTERVAL '30 minutes'),

('demo-user-001'::uuid, 'resort', 'RST002', 1, 3600000.00, 
 '{"resort": "Mountain View Lodge", "location": "Sapa", "nights": 2, "guests": 2, "checkin": "2024-02-01"}', 
 CURRENT_TIMESTAMP - INTERVAL '25 minutes'),

('prime-user-002'::uuid, 'insurance', 'INS001', 1, 250000.00, 
 '{"type": "travel_insurance", "coverage": 100000000, "duration": "3 months", "destination": "Europe"}', 
 CURRENT_TIMESTAMP - INTERVAL '15 minutes');

-- Log sample data creation
INSERT INTO transactions (user_id, type, amount, description, status, created_at) 
SELECT 
    u.id, 
    'system', 
    0, 
    'Sample data created successfully for user: ' || u.full_name, 
    'completed', 
    CURRENT_TIMESTAMP
FROM users u 
WHERE u.email IN ('demo@athena.com', 'prime@athena.com', 'trader@athena.com', 'business@athena.com');

