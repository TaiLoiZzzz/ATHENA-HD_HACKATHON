const { Pool } = require('pg');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'athena_db_dev',
  user: process.env.DB_USER || 'athena_dev',
  password: process.env.DB_PASSWORD || 'athena_dev_password',
};

const pool = new Pool(dbConfig);

async function setupBankingTables() {
  const client = await pool.connect();
  
  try {
    console.log('Setting up HDBank applications table...');
    
    // HDBank applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hdbank_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id VARCHAR(100) NOT NULL,
        product_type VARCHAR(50) NOT NULL,
        application_reference VARCHAR(20) UNIQUE NOT NULL,
        application_data JSONB NOT NULL,
        fee_amount DECIMAL(15, 2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending_review',
        tokens_earned DECIMAL(20, 8) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Banking accounts table (for approved accounts)
    await client.query(`
      CREATE TABLE IF NOT EXISTS hdbank_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        application_id UUID REFERENCES hdbank_applications(id),
        account_number VARCHAR(20) UNIQUE NOT NULL,
        product_id VARCHAR(100) NOT NULL,
        product_type VARCHAR(50) NOT NULL,
        account_status VARCHAR(20) DEFAULT 'active',
        balance DECIMAL(15, 2) DEFAULT 0,
        credit_limit DECIMAL(15, 2) DEFAULT NULL,
        interest_rate DECIMAL(5, 4) DEFAULT NULL,
        account_details JSONB,
        opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Banking transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hdbank_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID REFERENCES hdbank_accounts(id) ON DELETE CASCADE,
        transaction_type VARCHAR(50) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        balance_after DECIMAL(15, 2) NOT NULL,
        description TEXT,
        reference_number VARCHAR(50),
        sov_tokens_earned DECIMAL(20, 8) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hdbank_applications_user_id 
      ON hdbank_applications(user_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hdbank_applications_status 
      ON hdbank_applications(status)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hdbank_accounts_user_id 
      ON hdbank_accounts(user_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hdbank_transactions_account_id 
      ON hdbank_transactions(account_id)
    `);
    
    console.log('HDBank tables created successfully!');
    
  } catch (error) {
    console.error('Error setting up HDBank tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupBankingTables()
    .then(() => {
      console.log('HDBank database setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('HDBank database setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupBankingTables;

