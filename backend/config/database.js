const { Pool } = require('pg');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'athena_db',
  user: process.env.DB_USER || 'athena_user',
  password: process.env.DB_PASSWORD || 'athena_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Database connection test
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

// Export query method
module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Users table
    await pool.query(`
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
      )
    `);

    // SOV-Token balances table
    await pool.query(`
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
      )
    `);

    // Transactions table
    await pool.query(`
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
      )
    `);

    // Marketplace orders table
    await pool.query(`
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
      )
    `);

    // Marketplace trades table
    await pool.query(`
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
      )
    `);

    // Shopping cart table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shopping_cart (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        service_type VARCHAR(100) NOT NULL,
        service_item_id VARCHAR(255) NOT NULL,
        quantity INTEGER DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Service bookings table
    await pool.query(`
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
      )
    `);

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_marketplace_orders_user_id ON marketplace_orders(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_marketplace_orders_type ON marketplace_orders(order_type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON marketplace_orders(status)');

    logger.info('Database tables initialized successfully');
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
};

// Initialize on module load
initializeDatabase().catch(console.error);

module.exports.initializeDatabase = initializeDatabase;
