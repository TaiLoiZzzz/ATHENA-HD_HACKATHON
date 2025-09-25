const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'athena_db',
  password: 'admin123',
  port: 5432,
});

async function setupSampleUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Setting up sample users with ranks...');
    
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'create-sample-users-with-ranks.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query(sqlContent);
    
    console.log('✅ Sample users created successfully!');
    
    // Verify users were created
    const result = await client.query(`
      SELECT 
        u.email, 
        u.full_name, 
        ur.name as rank_name, 
        urp.total_points,
        tb.balance as sov_balance
      FROM users u
      LEFT JOIN user_ranking_progress urp ON u.id = urp.user_id
      LEFT JOIN user_ranks ur ON urp.current_rank_id = ur.id
      LEFT JOIN token_balances tb ON u.id = tb.user_id
      WHERE u.email LIKE '%@athena.com'
      ORDER BY urp.total_points DESC
    `);
    
    console.log('\n📊 Created Users Summary:');
    console.log('================================');
    result.rows.forEach(user => {
      console.log(`👤 ${user.full_name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🏆 Rank: ${user.rank_name || 'Bronze'}`);
      console.log(`   ⭐ Points: ${(user.total_points || 0).toLocaleString()}`);
      console.log(`   💰 SOV Balance: ${(user.sov_balance || 0).toFixed(2)}`);
      console.log('   ──────────────────────────');
    });
    
    console.log('\n🔐 Login Information:');
    console.log('================================');
    console.log('Diamond Users:');
    console.log('  📧 diamond1@athena.com | 🔑 diamond123');
    console.log('  📧 diamond2@athena.com | 🔑 diamond123');
    console.log('\nGold Users:');
    console.log('  📧 gold1@athena.com | 🔑 gold123');
    console.log('  📧 gold2@athena.com | 🔑 gold123');
    console.log('\nSilver Users:');
    console.log('  📧 silver1@athena.com | 🔑 silver123');
    console.log('  📧 silver2@athena.com | 🔑 silver123');
    console.log('\n🎯 All users can now be used to test the ranking system!');
    
  } catch (error) {
    console.error('❌ Error setting up sample users:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await setupSampleUsers();
    console.log('\n✨ Setup completed successfully!');
  } catch (error) {
    console.error('💥 Setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { setupSampleUsers };


