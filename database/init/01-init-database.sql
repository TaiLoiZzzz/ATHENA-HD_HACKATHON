-- ATHENA Platform Database Initialization Script
-- This script runs automatically when the PostgreSQL container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database user if not exists (handled by Docker environment)
-- The database and user are created automatically by Docker

-- Set timezone
SET timezone = 'UTC';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    athena_prime BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create token_balances table
CREATE TABLE IF NOT EXISTS token_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(20, 8) DEFAULT 0,
    locked_balance DECIMAL(20, 8) DEFAULT 0,
    total_earned DECIMAL(20, 8) DEFAULT 0,
    total_spent DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'earn', 'spend', 'transfer', 'marketplace_buy', 'marketplace_sell'
    amount DECIMAL(20, 8) NOT NULL,
    description TEXT,
    service_type VARCHAR(100), -- 'vietjet', 'hdbank', 'resort', etc.
    service_reference_id VARCHAR(255),
    blockchain_tx_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create marketplace_orders table
CREATE TABLE IF NOT EXISTS marketplace_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_type VARCHAR(10) NOT NULL, -- 'buy', 'sell'
    amount DECIMAL(20, 8) NOT NULL,
    price_per_token DECIMAL(10, 2) NOT NULL,
    total_value DECIMAL(20, 2) NOT NULL,
    filled_amount DECIMAL(20, 8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'partially_filled', 'filled', 'cancelled'
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create marketplace_trades table
CREATE TABLE IF NOT EXISTS marketplace_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buy_order_id UUID REFERENCES marketplace_orders(id),
    sell_order_id UUID REFERENCES marketplace_orders(id),
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    amount DECIMAL(20, 8) NOT NULL,
    price_per_token DECIMAL(10, 2) NOT NULL,
    total_value DECIMAL(20, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create shopping_cart table
CREATE TABLE IF NOT EXISTS shopping_cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    service_item_id VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create service_bookings table
CREATE TABLE IF NOT EXISTS service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    booking_reference VARCHAR(255) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    tokens_earned DECIMAL(20, 8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'confirmed',
    booking_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_token_balances_user_id ON token_balances(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_service_type ON transactions(service_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_user_id ON marketplace_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_type ON marketplace_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON marketplace_orders(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_price ON marketplace_orders(price_per_token);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_created_at ON marketplace_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_marketplace_trades_buyer_id ON marketplace_trades(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_trades_seller_id ON marketplace_trades(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_trades_created_at ON marketplace_trades(created_at);

CREATE INDEX IF NOT EXISTS idx_shopping_cart_user_id ON shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_service_type ON shopping_cart(service_type);

CREATE INDEX IF NOT EXISTS idx_service_bookings_user_id ON service_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_service_type ON service_bookings(service_type);
CREATE INDEX IF NOT EXISTS idx_service_bookings_reference ON service_bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_service_bookings_created_at ON service_bookings(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_balances_updated_at 
    BEFORE UPDATE ON token_balances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_orders_updated_at 
    BEFORE UPDATE ON marketplace_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial system data
INSERT INTO users (id, email, password_hash, full_name, phone, athena_prime, is_verified) VALUES
(
    gen_random_uuid(),
    'system@athena.com',
    '$2b$12$system.hash.placeholder',
    'System Account',
    NULL,
    false,
    true
) ON CONFLICT (email) DO NOTHING;

-- Create view for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.athena_prime,
    COALESCE(tb.balance, 0) as current_balance,
    COALESCE(tb.total_earned, 0) as total_earned,
    COALESCE(tb.total_spent, 0) as total_spent,
    COUNT(t.id) as total_transactions,
    COUNT(sb.id) as total_bookings,
    COUNT(mo.id) as total_marketplace_orders
FROM users u
LEFT JOIN token_balances tb ON u.id = tb.user_id
LEFT JOIN transactions t ON u.id = t.user_id
LEFT JOIN service_bookings sb ON u.id = sb.user_id
LEFT JOIN marketplace_orders mo ON u.id = mo.user_id
GROUP BY u.id, u.email, u.full_name, u.athena_prime, tb.balance, tb.total_earned, tb.total_spent;

-- Create view for marketplace overview
CREATE OR REPLACE VIEW marketplace_overview AS
SELECT 
    COUNT(CASE WHEN order_type = 'buy' AND status = 'active' THEN 1 END) as active_buy_orders,
    COUNT(CASE WHEN order_type = 'sell' AND status = 'active' THEN 1 END) as active_sell_orders,
    SUM(CASE WHEN order_type = 'buy' AND status = 'active' THEN amount - filled_amount END) as total_buy_volume,
    SUM(CASE WHEN order_type = 'sell' AND status = 'active' THEN amount - filled_amount END) as total_sell_volume,
    AVG(CASE WHEN order_type = 'buy' AND status = 'active' THEN price_per_token END) as avg_buy_price,
    AVG(CASE WHEN order_type = 'sell' AND status = 'active' THEN price_per_token END) as avg_sell_price,
    MAX(CASE WHEN order_type = 'buy' AND status = 'active' THEN price_per_token END) as highest_buy_price,
    MIN(CASE WHEN order_type = 'sell' AND status = 'active' THEN price_per_token END) as lowest_sell_price
FROM marketplace_orders
WHERE status = 'active' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO athena_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO athena_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO athena_user;

-- Log initialization completion
INSERT INTO transactions (user_id, type, amount, description, status, created_at) 
SELECT 
    u.id, 
    'system', 
    0, 
    'Database initialized successfully', 
    'completed', 
    CURRENT_TIMESTAMP
FROM users u 
WHERE u.email = 'system@athena.com'
ON CONFLICT DO NOTHING;

