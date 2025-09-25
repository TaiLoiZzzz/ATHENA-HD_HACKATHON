const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'athena_db',
  user: process.env.DB_USER || 'athena_user',
  password: process.env.DB_PASSWORD || 'athena_password',
};

const pool = new Pool(dbConfig);

async function setupDatabase() {
  console.log('🚀 Setting up ATHENA Platform database...');
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');

    // Create tables (tables are created automatically by database.js)
    console.log('📋 Database tables initialized');

    // Create sample data
    await createSampleData();

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📊 Sample data created:');
    console.log('- Demo users with various token balances');
    console.log('- Sample transactions and marketplace orders');
    console.log('- Mock service bookings');
    console.log('\n🔐 Demo Login Credentials:');
    console.log('Email: demo@athena.com');
    console.log('Password: demo123');
    console.log('\nEmail: prime@athena.com (ATHENA Prime user)');
    console.log('Password: prime123');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function createSampleData() {
  console.log('📝 Creating sample data...');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create demo users
    const users = [
      {
        id: uuidv4(),
        email: 'demo@athena.com',
        password: await bcrypt.hash('demo123', 12),
        fullName: 'Demo User',
        phone: '+84901234567',
        athenaPrime: false,
      },
      {
        id: uuidv4(),
        email: 'prime@athena.com',
        password: await bcrypt.hash('prime123', 12),
        fullName: 'Prime User',
        phone: '+84901234568',
        athenaPrime: true,
      },
      {
        id: uuidv4(),
        email: 'trader@athena.com',
        password: await bcrypt.hash('trader123', 12),
        fullName: 'Active Trader',
        phone: '+84901234569',
        athenaPrime: false,
      },
    ];

    for (const user of users) {
      await client.query(`
        INSERT INTO users (id, email, password_hash, full_name, phone, athena_prime, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT (email) DO NOTHING
      `, [user.id, user.email, user.password, user.fullName, user.phone, user.athenaPrime]);
    }

    // Create token balances
    const balances = [
      { userId: users[0].id, balance: 1250.5, totalEarned: 2500, totalSpent: 1249.5 },
      { userId: users[1].id, balance: 5420.75, totalEarned: 8000, totalSpent: 2579.25 },
      { userId: users[2].id, balance: 850.25, totalEarned: 3200, totalSpent: 2349.75 },
    ];

    for (const balance of balances) {
      await client.query(`
        INSERT INTO token_balances (user_id, balance, total_earned, total_spent)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE SET
          balance = EXCLUDED.balance,
          total_earned = EXCLUDED.total_earned,
          total_spent = EXCLUDED.total_spent
      `, [balance.userId, balance.balance, balance.totalEarned, balance.totalSpent]);
    }

    // Create sample transactions
    const transactions = [
      {
        userId: users[0].id,
        type: 'earn',
        amount: 150,
        description: 'Earned from Vietjet flight booking',
        serviceType: 'vietjet',
        status: 'completed',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        userId: users[0].id,
        type: 'earn',
        amount: 220,
        description: 'Earned from resort booking',
        serviceType: 'resort',
        status: 'completed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        userId: users[1].id,
        type: 'earn',
        amount: 375, // Prime user with 1.5x multiplier
        description: 'Earned from HDBank investment',
        serviceType: 'hdbank',
        status: 'completed',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        userId: users[1].id,
        type: 'marketplace_sell',
        amount: 500,
        description: 'Sold tokens on marketplace',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        userId: users[2].id,
        type: 'spend',
        amount: 100,
        description: 'Redeemed for voucher',
        status: 'completed',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];

    for (const transaction of transactions) {
      await client.query(`
        INSERT INTO transactions (user_id, type, amount, description, service_type, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        transaction.userId,
        transaction.type,
        transaction.amount,
        transaction.description,
        transaction.serviceType,
        transaction.status,
        transaction.createdAt,
      ]);
    }

    // Create sample marketplace orders
    const orders = [
      {
        userId: users[1].id,
        orderType: 'sell',
        amount: 1000,
        pricePerToken: 8500,
        totalValue: 8500000,
        status: 'active',
      },
      {
        userId: users[2].id,
        orderType: 'buy',
        amount: 500,
        pricePerToken: 8200,
        totalValue: 4100000,
        status: 'active',
      },
      {
        userId: users[0].id,
        orderType: 'sell',
        amount: 250,
        pricePerToken: 8400,
        totalValue: 2100000,
        status: 'active',
      },
    ];

    for (const order of orders) {
      await client.query(`
        INSERT INTO marketplace_orders (user_id, order_type, amount, price_per_token, total_value, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        order.userId,
        order.orderType,
        order.amount,
        order.pricePerToken,
        order.totalValue,
        order.status,
      ]);
    }

    // Create sample service bookings
    const bookings = [
      {
        userId: users[0].id,
        serviceType: 'vietjet',
        bookingReference: 'VJ-001-DEMO',
        totalAmount: 1500000,
        tokensEarned: 150,
        bookingDetails: {
          flight: 'VJ001',
          route: 'HAN-SGN',
          passengers: 1,
          date: '2024-01-15',
        },
      },
      {
        userId: users[1].id,
        serviceType: 'resort',
        bookingReference: 'RST-001-DEMO',
        totalAmount: 2200000,
        tokensEarned: 330, // Prime user bonus
        bookingDetails: {
          resort: 'Sunrise Beach Resort',
          location: 'Phu Quoc Island',
          nights: 2,
          guests: 2,
        },
      },
      {
        userId: users[2].id,
        serviceType: 'insurance',
        bookingReference: 'INS-001-DEMO',
        totalAmount: 250000,
        tokensEarned: 25,
        bookingDetails: {
          type: 'travel_insurance',
          coverage: 100000000,
          duration: '1 year',
        },
      },
    ];

    for (const booking of bookings) {
      await client.query(`
        INSERT INTO service_bookings (
          user_id, service_type, booking_reference, 
          total_amount, tokens_earned, booking_details
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        booking.userId,
        booking.serviceType,
        booking.bookingReference,
        booking.totalAmount,
        booking.tokensEarned,
        JSON.stringify(booking.bookingDetails),
      ]);
    }

    // Create sample marketplace trades
    const trades = [
      {
        buyOrderId: null, // Would reference actual order IDs in production
        sellOrderId: null,
        buyerId: users[0].id,
        sellerId: users[1].id,
        amount: 200,
        pricePerToken: 8300,
        totalValue: 1660000,
        platformFee: 24900, // 1.5%
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
    ];

    for (const trade of trades) {
      await client.query(`
        INSERT INTO marketplace_trades (
          buyer_id, seller_id, amount, price_per_token, 
          total_value, platform_fee, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        trade.buyerId,
        trade.sellerId,
        trade.amount,
        trade.pricePerToken,
        trade.totalValue,
        trade.platformFee,
        trade.createdAt,
      ]);
    }

    await client.query('COMMIT');
    console.log('✅ Sample data created successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };

