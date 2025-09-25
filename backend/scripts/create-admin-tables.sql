-- Create admin management tables for CRUD operations

-- HDBank Products Table
CREATE TABLE IF NOT EXISTS hdbank_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('cards', 'loans', 'savings', 'insurance')),
    description TEXT NOT NULL,
    features JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    
    -- Card specific fields
    annual_fee JSONB,
    credit_limit JSONB,
    applicable_cashback DECIMAL(5,2),
    applicable_rewards DECIMAL(10,2),
    
    -- Loan specific fields
    interest_rate JSONB,
    loan_amount JSONB,
    term JSONB,
    
    -- Investment specific fields
    min_investment DECIMAL(15,2),
    expected_returns JSONB,
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
    
    -- Insurance specific fields
    coverage JSONB,
    premium JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vietjet Flights Table
CREATE TABLE IF NOT EXISTS vietjet_flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number VARCHAR(20) NOT NULL,
    airline VARCHAR(100) DEFAULT 'Vietjet Air',
    departure JSONB NOT NULL,
    arrival JSONB NOT NULL,
    aircraft VARCHAR(50),
    duration VARCHAR(20) NOT NULL,
    price JSONB NOT NULL,
    availability JSONB NOT NULL,
    baggage JSONB,
    amenities JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    departure_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sovico Services Table
CREATE TABLE IF NOT EXISTS sovico_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('resort', 'insurance', 'travel', 'lifestyle', 'financial')),
    description TEXT NOT NULL,
    price JSONB NOT NULL,
    features JSONB NOT NULL DEFAULT '[]',
    images JSONB DEFAULT '[]',
    location JSONB,
    availability JSONB,
    policies JSONB,
    ratings JSONB DEFAULT '{"average": 0, "count": 0}',
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sovico Packages Table
CREATE TABLE IF NOT EXISTS sovico_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    services JSONB NOT NULL, -- Array of service IDs
    price JSONB NOT NULL,
    duration VARCHAR(100),
    highlights JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hdbank_products_type ON hdbank_products(type);
CREATE INDEX IF NOT EXISTS idx_hdbank_products_active ON hdbank_products(is_active);
CREATE INDEX IF NOT EXISTS idx_hdbank_products_created ON hdbank_products(created_at);

CREATE INDEX IF NOT EXISTS idx_vietjet_flights_departure_date ON vietjet_flights(departure_date);
CREATE INDEX IF NOT EXISTS idx_vietjet_flights_active ON vietjet_flights(is_active);
CREATE INDEX IF NOT EXISTS idx_vietjet_flights_airports ON vietjet_flights USING GIN ((departure->>'airport'), (arrival->>'airport'));

CREATE INDEX IF NOT EXISTS idx_sovico_services_category ON sovico_services(category);
CREATE INDEX IF NOT EXISTS idx_sovico_services_active ON sovico_services(is_active);
CREATE INDEX IF NOT EXISTS idx_sovico_services_featured ON sovico_services(is_featured);

-- Insert sample data for HDBank products
INSERT INTO hdbank_products (name, type, description, features, annual_fee, credit_limit, applicable_cashback, applicable_rewards) VALUES
('HDBank Platinum Credit Card', 'cards', 'Thẻ tín dụng cao cấp với nhiều ưu đãi', 
 '["Cashback 2%", "Miễn phí rút tiền ATM", "Bảo hiểm du lịch", "Ưu đãi dining"]',
 '{"fiat": 2000000, "sovToken": 200}',
 '{"min": 50000000, "max": 500000000}',
 2.0, 100),

('HDBank Home Loan', 'loans', 'Vay mua nhà với lãi suất ưu đãi',
 '["Lãi suất thả nổi", "Thời hạn vay linh hoạt", "Không cần thế chấp bổ sung"]',
 NULL, NULL, NULL, NULL),

('HDBank Savings Plus', 'savings', 'Tiết kiệm với lãi suất cao',
 '["Lãi suất cạnh tranh", "Gửi góp linh hoạt", "Tặng SOV token"]',
 NULL, NULL, NULL, NULL),

('HDBank Travel Insurance', 'insurance', 'Bảo hiểm du lịch toàn diện',
 '["Bồi thường y tế", "Hỗ trợ khẩn cấp 24/7", "Bảo hiểm hành lý"]',
 NULL, NULL, NULL, NULL);

-- Insert sample data for Vietjet flights
INSERT INTO vietjet_flights (flight_number, departure, arrival, duration, price, availability, departure_date) VALUES
('VJ123', 
 '{"airport": "SGN", "city": "Ho Chi Minh City", "time": "08:30", "terminal": "T1"}',
 '{"airport": "HAN", "city": "Hanoi", "time": "10:45", "terminal": "T1"}',
 '2h 15m',
 '{"economy": 1500000, "business": 3500000, "sovTokenDiscount": 10}',
 '{"economy": 150, "business": 20}',
 CURRENT_DATE + INTERVAL '7 days'),

('VJ456', 
 '{"airport": "HAN", "city": "Hanoi", "time": "14:00", "terminal": "T1"}',
 '{"airport": "SGN", "city": "Ho Chi Minh City", "time": "16:15", "terminal": "T1"}',
 '2h 15m',
 '{"economy": 1600000, "business": 3600000, "sovTokenDiscount": 10}',
 '{"economy": 120, "business": 15}',
 CURRENT_DATE + INTERVAL '10 days'),

('VJ789', 
 '{"airport": "SGN", "city": "Ho Chi Minh City", "time": "19:30", "terminal": "T1"}',
 '{"airport": "DAD", "city": "Da Nang", "time": "20:45", "terminal": "T1"}',
 '1h 15m',
 '{"economy": 900000, "business": 2200000, "sovTokenDiscount": 15}',
 '{"economy": 180, "business": 25}',
 CURRENT_DATE + INTERVAL '5 days');

-- Insert sample data for Sovico services
INSERT INTO sovico_services (name, category, description, price, features, is_featured) VALUES
('Phu Quoc Resort Package', 'resort', 'Gói nghỉ dưỡng 3 ngày 2 đêm tại Phú Quốc',
 '{"amount": 5000000, "currency": "VND", "sovTokenPrice": 500, "sovTokenDiscount": 20}',
 '["Phòng view biển", "Ăn sáng buffet", "Xe đưa đón sân bay", "Spa miễn phí"]',
 true),

('Comprehensive Health Insurance', 'insurance', 'Bảo hiểm sức khỏe toàn diện cho gia đình',
 '{"amount": 12000000, "currency": "VND", "sovTokenPrice": 1200, "sovTokenDiscount": 15}',
 '["Bảo hiểm nội trú", "Bảo hiểm ngoại trú", "Khám sức khỏe định kỳ", "Hỗ trợ 24/7"]',
 true),

('City Tour Experience', 'travel', 'Tour khám phá thành phố với hướng dẫn viên',
 '{"amount": 800000, "currency": "VND", "sovTokenPrice": 80, "sovTokenDiscount": 25}',
 '["Hướng dẫn viên chuyên nghiệp", "Xe du lịch đời mới", "Bữa trưa truyền thống"]',
 false),

('Premium Lifestyle Service', 'lifestyle', 'Dịch vụ phong cách sống cao cấp',
 '{"amount": 15000000, "currency": "VND", "sovTokenPrice": 1500, "sovTokenDiscount": 10}',
 '["Tư vấn phong cách", "Shopping cá nhân", "Concierge service"]',
 false);

-- Update transactions table to support admin tracking
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by_admin VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_admin ON admin_activity_log(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity_log(created_at);


