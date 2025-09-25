const db = require('../config/database');

async function setupSovicoTables() {
  try {
    console.log('Creating Sovico unified payment tables...');

    // Create unified_payments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS unified_payments (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        offer_id VARCHAR(100) NOT NULL,
        offer_title VARCHAR(200) NOT NULL,
        total_sov_amount DECIMAL(20, 8) NOT NULL,
        total_vnd_amount DECIMAL(15, 2) NOT NULL,
        services JSONB NOT NULL,
        components JSONB NOT NULL,
        processed_components JSONB,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        refunded_at TIMESTAMP,
        metadata JSONB DEFAULT '{}'
      )
    `);

    // Create cross_service_rewards table for tracking rewards across services
    await db.query(`
      CREATE TABLE IF NOT EXISTS cross_service_rewards (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        reward_type VARCHAR(50) NOT NULL,
        service_combination TEXT[] NOT NULL,
        base_amount DECIMAL(20, 8) NOT NULL,
        bonus_amount DECIMAL(20, 8) DEFAULT 0,
        total_amount DECIMAL(20, 8) NOT NULL,
        trigger_transaction_id UUID,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'awarded', 'expired')),
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        awarded_at TIMESTAMP
      )
    `);

    // Create sovico_ecosystem_stats table for user statistics
    await db.query(`
      CREATE TABLE IF NOT EXISTS sovico_ecosystem_stats (
        user_id UUID PRIMARY KEY REFERENCES users(id),
        services_used TEXT[] DEFAULT '{}',
        total_unified_payments INTEGER DEFAULT 0,
        total_unified_amount DECIMAL(20, 8) DEFAULT 0,
        total_cross_rewards DECIMAL(20, 8) DEFAULT 0,
        first_service_date TIMESTAMP,
        last_activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        loyalty_tier VARCHAR(20) DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
        tier_points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create promotional_offers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS promotional_offers (
        id UUID PRIMARY KEY,
        offer_code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        offer_type VARCHAR(50) NOT NULL,
        services TEXT[] NOT NULL,
        discount_percentage DECIMAL(5, 2),
        discount_amount DECIMAL(20, 8),
        min_purchase_amount DECIMAL(15, 2),
        max_discount_amount DECIMAL(15, 2),
        usage_limit INTEGER,
        usage_count INTEGER DEFAULT 0,
        user_usage_limit INTEGER DEFAULT 1,
        target_users TEXT[], -- specific user IDs or 'all', 'prime', etc.
        valid_from TIMESTAMP NOT NULL,
        valid_until TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'disabled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'
      )
    `);

    // Create user_promotional_usage table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_promotional_usage (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        offer_id UUID REFERENCES promotional_offers(id),
        unified_payment_id UUID REFERENCES unified_payments(id),
        discount_applied DECIMAL(20, 8) NOT NULL,
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, offer_id, unified_payment_id)
      )
    `);

    // Create indexes for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_unified_payments_user_id ON unified_payments(user_id);
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_unified_payments_status ON unified_payments(status);
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_unified_payments_created_at ON unified_payments(created_at);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_cross_service_rewards_user_id ON cross_service_rewards(user_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_promotional_offers_valid_dates ON promotional_offers(valid_from, valid_until);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_promotional_offers_status ON promotional_offers(status);
    `);

    // Insert sample promotional offers
    await db.query(`
      INSERT INTO promotional_offers (
        id, offer_code, title, description, offer_type, services,
        discount_percentage, min_purchase_amount, usage_limit,
        target_users, valid_from, valid_until, status
      ) VALUES 
      (
        gen_random_uuid(),
        'WELCOME2024',
        'Welcome to Sovico Ecosystem',
        'Get 20% off your first unified payment across HDBank and Vietjet services',
        'first_time_user',
        ARRAY['hdbank', 'vietjet'],
        20.00,
        100000,
        1000,
        ARRAY['all'],
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '3 months',
        'active'
      ),
      (
        gen_random_uuid(),
        'PRIME50',
        'ATHENA Prime Upgrade Special',
        'Upgrade to ATHENA Prime with 50 SOV tokens discount',
        'prime_upgrade',
        ARRAY['sovico'],
        NULL,
        NULL,
        500,
        ARRAY['all'],
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '1 month',
        'active'
      ),
      (
        gen_random_uuid(),
        'CROSSSERVICE',
        'Cross-Service Bonus',
        'Use 3+ services in one month and get 100 bonus SOV tokens',
        'cross_service_bonus',
        ARRAY['hdbank', 'vietjet', 'marketplace'],
        NULL,
        NULL,
        NULL,
        ARRAY['all'],
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '6 months',
        'active'
      )
      ON CONFLICT (offer_code) DO NOTHING
    `);

    // Create trigger to update sovico_ecosystem_stats
    await db.query(`
      CREATE OR REPLACE FUNCTION update_sovico_stats()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO sovico_ecosystem_stats (
          user_id, 
          services_used, 
          total_unified_payments, 
          total_unified_amount,
          first_service_date,
          last_activity_date
        )
        VALUES (
          NEW.user_id,
          (SELECT ARRAY_AGG(DISTINCT service_type) FROM service_bookings WHERE user_id = NEW.user_id),
          1,
          NEW.total_sov_amount,
          NEW.created_at,
          NEW.created_at
        )
        ON CONFLICT (user_id) DO UPDATE SET
          services_used = (SELECT ARRAY_AGG(DISTINCT service_type) FROM service_bookings WHERE user_id = NEW.user_id),
          total_unified_payments = sovico_ecosystem_stats.total_unified_payments + 1,
          total_unified_amount = sovico_ecosystem_stats.total_unified_amount + NEW.total_sov_amount,
          last_activity_date = NEW.created_at,
          updated_at = CURRENT_TIMESTAMP;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await db.query(`
      DROP TRIGGER IF EXISTS trigger_update_sovico_stats ON unified_payments;
      CREATE TRIGGER trigger_update_sovico_stats
        AFTER INSERT ON unified_payments
        FOR EACH ROW
        EXECUTE FUNCTION update_sovico_stats();
    `);

    console.log('✅ Sovico unified payment tables created successfully!');
    
    // Show created tables
    const tablesResult = await db.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('unified_payments', 'cross_service_rewards', 'sovico_ecosystem_stats', 'promotional_offers', 'user_promotional_usage')
      ORDER BY tablename
    `);

    console.log('📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });

  } catch (error) {
    console.error('❌ Error setting up Sovico tables:', error);
    throw error;
  }
}

// Run the setup if called directly
if (require.main === module) {
  setupSovicoTables()
    .then(() => {
      console.log('✨ Sovico database setup completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupSovicoTables;

