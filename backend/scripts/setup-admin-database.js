const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function setupAdminDatabase() {
  try {
    console.log('🚀 Setting up admin database tables...');

    // Read and execute the admin tables SQL
    const sqlPath = path.join(__dirname, 'create-admin-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing admin tables creation...');
    await db.query(sql);

    console.log('✅ Admin tables created successfully!');

    // Verify tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('hdbank_products', 'vietjet_flights', 'sovico_services', 'sovico_packages', 'admin_activity_log')
      ORDER BY table_name;
    `;

    const result = await db.query(tablesQuery);
    console.log('📊 Created tables:', result.rows.map(row => row.table_name));

    // Check if data was inserted
    const dataCheck = await db.query('SELECT COUNT(*) FROM hdbank_products');
    console.log('💳 HDBank products count:', dataCheck.rows[0].count);

    const flightCheck = await db.query('SELECT COUNT(*) FROM vietjet_flights');
    console.log('✈️ Vietjet flights count:', flightCheck.rows[0].count);

    const serviceCheck = await db.query('SELECT COUNT(*) FROM sovico_services');
    console.log('🏨 Sovico services count:', serviceCheck.rows[0].count);

    console.log('🎉 Admin database setup completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin database:', error);
    process.exit(1);
  }
}

setupAdminDatabase();


