const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration from environment or defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'athena_db',
  user: process.env.DB_USER || 'athena_user',
  password: process.env.DB_PASSWORD || 'athena_password',
};

const pool = new Pool(dbConfig);

async function setupEnhancedPaymentSystem() {
  console.log('🚀 Setting up Enhanced Payment System with Loyalty Features...');
  
  const client = await pool.connect();
  
  try {
    // Read and execute the enhanced payment system SQL
    const sqlPath = path.join(__dirname, 'enhanced-payment-system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 Executing enhanced payment system setup...');
    await client.query(sql);
    
    console.log('✅ Enhanced payment system setup completed!');
    
    // Test the new functions
    console.log('\n🧪 Testing payment system functions...');
    
    // Test tier calculation for demo user
    console.log('📊 Testing tier calculation...');
    const demoUserResult = await client.query(`
      SELECT id FROM users WHERE email = 'demo@athena.com' LIMIT 1
    `);
    
    if (demoUserResult.rows.length > 0) {
      const userId = demoUserResult.rows[0].id;
      
      const tierResult = await client.query(`
        SELECT * FROM calculate_user_tier($1)
      `, [userId]);
      
      if (tierResult.rows.length > 0) {
        const tier = tierResult.rows[0];
        console.log(`✅ Demo user tier: ${tier.tier_name} (Level ${tier.tier_level})`);
        console.log(`   Bonus multiplier: ${tier.bonus_multiplier}x`);
        console.log(`   Token bonus: ${tier.token_bonus_percentage}%`);
        console.log(`   Progress to next: ${tier.progress_to_next}%`);
      }
      
      // Test loyalty dashboard
      console.log('📊 Testing loyalty dashboard...');
      const dashboardResult = await client.query(`
        SELECT * FROM get_user_loyalty_dashboard($1)
      `, [userId]);
      
      if (dashboardResult.rows.length > 0) {
        console.log('✅ Loyalty dashboard data retrieved successfully');
      }
      
      // Test payment preview (simulation)
      console.log('💳 Testing payment preview...');
      const testAmount = 100.50; // 100.50 SOV
      const testVndAmount = 1000000; // 1,000,000 VND
      
      try {
        const paymentResult = await client.query(`
          SELECT * FROM process_enhanced_token_payment($1, $2, $3, $4, $5, $6, $7)
        `, [
          userId,
          'vietjet',
          testVndAmount,
          testAmount,
          'Test payment with loyalty benefits',
          'TEST-001',
          'tokens'
        ]);
        
        if (paymentResult.rows.length > 0) {
          const payment = paymentResult.rows[0];
          console.log(`✅ Payment test: ${payment.success ? 'SUCCESS' : 'FAILED'}`);
          console.log(`   Message: ${payment.message}`);
          if (payment.success) {
            console.log(`   New balance: ${payment.new_balance} SOV`);
            console.log(`   Bonus tokens: ${payment.bonus_tokens_earned} SOV`);
            console.log(`   Loyalty discount: ${payment.loyalty_discount} VND`);
          }
        }
      } catch (error) {
        console.log('⚠️  Payment test failed (expected if insufficient balance):', error.message);
      }
    } else {
      console.log('⚠️  Demo user not found, skipping function tests');
    }
    
    // Display loyalty tiers
    console.log('\n🏆 Available Loyalty Tiers:');
    const tiersResult = await client.query(`
      SELECT tier_name, tier_level, min_days_member, min_total_spent, 
             bonus_multiplier, token_bonus_percentage, tier_color
      FROM loyalty_tiers 
      ORDER BY tier_level ASC
    `);
    
    tiersResult.rows.forEach(tier => {
      console.log(`   ${tier.tier_level}. ${tier.tier_name}`);
      console.log(`      Requirements: ${tier.min_days_member} days, ${tier.min_total_spent} VND spent`);
      console.log(`      Benefits: ${tier.bonus_multiplier}x multiplier, +${tier.token_bonus_percentage}% tokens`);
      console.log(`      Color: ${tier.tier_color}`);
      console.log('');
    });
    
    console.log('🎉 Enhanced Payment System is ready!');
    console.log('\n📖 New Features Available:');
    console.log('   • Loyalty tier system with 6 levels');
    console.log('   • Automatic bonus tokens for loyal members');
    console.log('   • Loyalty discounts based on member tier');
    console.log('   • Enhanced payment tracking with benefits');
    console.log('   • Comprehensive loyalty dashboard');
    console.log('\n🔗 API Endpoints:');
    console.log('   • GET /api/enhanced-payments/loyalty/tier');
    console.log('   • GET /api/enhanced-payments/loyalty/dashboard');
    console.log('   • POST /api/enhanced-payments/preview');
    console.log('   • POST /api/enhanced-payments/pay');
    console.log('   • GET /api/enhanced-payments/history');
    console.log('   • GET /api/enhanced-payments/loyalty/tiers');
    
  } catch (error) {
    console.error('❌ Error setting up enhanced payment system:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupEnhancedPaymentSystem()
    .then(() => {
      console.log('\n✅ Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupEnhancedPaymentSystem };


