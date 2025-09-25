const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function setupWeb3Tables() {
  try {
    console.log('🚀 Setting up Web3 and advanced service tables...');

    // Create Web3 related tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_wallets (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        wallet_address VARCHAR(42) UNIQUE NOT NULL,
        wallet_type VARCHAR(20) NOT NULL,
        nonce VARCHAR(64),
        connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS web3_profiles (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) UNIQUE,
        wallet_id UUID REFERENCES user_wallets(id),
        profile_nft_id UUID,
        reputation_score INTEGER DEFAULT 100,
        governance_power DECIMAL(20, 8) DEFAULT 0,
        total_staked DECIMAL(20, 8) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS token_staking (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        amount DECIMAL(20, 8) NOT NULL,
        duration_days INTEGER NOT NULL,
        apy_rate DECIMAL(5, 2) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        actual_end_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        rewards_earned DECIMAL(20, 8) DEFAULT 0,
        penalty_amount DECIMAL(20, 8) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS nft_collections (
        id UUID PRIMARY KEY,
        owner_id UUID REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT,
        attributes JSONB,
        rarity_score INTEGER DEFAULT 0,
        nft_type VARCHAR(50) DEFAULT 'collectible',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS governance_proposals (
        id UUID PRIMARY KEY,
        proposer_id UUID REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        proposal_type VARCHAR(50) NOT NULL,
        voting_start TIMESTAMP NOT NULL,
        voting_end TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS governance_votes (
        id UUID PRIMARY KEY,
        proposal_id UUID REFERENCES governance_proposals(id),
        user_id UUID REFERENCES users(id),
        vote VARCHAR(10) NOT NULL CHECK (vote IN ('for', 'against')),
        voting_power DECIMAL(20, 8) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(proposal_id, user_id)
      )
    `);

    // Create Vietjet booking tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS vietjet_bookings (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        flight_id UUID NOT NULL,
        flight_number VARCHAR(10) NOT NULL,
        booking_reference VARCHAR(20) UNIQUE NOT NULL,
        origin VARCHAR(3) NOT NULL,
        destination VARCHAR(3) NOT NULL,
        departure_time TIMESTAMP NOT NULL,
        arrival_time TIMESTAMP NOT NULL,
        passengers JSONB NOT NULL,
        contact_info JSONB NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        payment_details JSONB,
        add_ons JSONB DEFAULT '{}',
        total_amount DECIMAL(15, 2) DEFAULT 0,
        total_tokens DECIMAL(20, 8) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'confirmed',
        cancelled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create HDBank service tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS hdbank_loans (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        loan_type VARCHAR(20) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        term_months INTEGER NOT NULL,
        purpose TEXT,
        monthly_income DECIMAL(15, 2),
        employment_type VARCHAR(50),
        interest_rate DECIMAL(5, 2),
        monthly_payment DECIMAL(15, 2),
        documents JSONB,
        payment_method VARCHAR(20),
        processing_fee DECIMAL(15, 2),
        status VARCHAR(20) DEFAULT 'pending_review',
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS hdbank_credit_cards (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        card_type VARCHAR(20) NOT NULL,
        annual_income DECIMAL(15, 2),
        employment_info JSONB,
        requested_limit DECIMAL(15, 2),
        approved_limit DECIMAL(15, 2),
        payment_method VARCHAR(20),
        application_fee DECIMAL(10, 2),
        status VARCHAR(20) DEFAULT 'pending_review',
        card_number VARCHAR(16),
        expiry_date DATE,
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS hdbank_insurance (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        insurance_type VARCHAR(20) NOT NULL,
        coverage_amount DECIMAL(15, 2) NOT NULL,
        coverage_duration INTEGER,
        beneficiaries JSONB,
        personal_info JSONB,
        premium_amount DECIMAL(10, 2),
        premium_frequency VARCHAR(20),
        payment_method VARCHAR(20),
        status VARCHAR(20) DEFAULT 'pending_review',
        policy_number VARCHAR(20),
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS hdbank_investments (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        product_type VARCHAR(20) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        risk_level VARCHAR(10),
        duration_months INTEGER,
        payment_method VARCHAR(20),
        auto_reinvest BOOLEAN DEFAULT false,
        expected_return DECIMAL(15, 2),
        current_value DECIMAL(15, 2),
        status VARCHAR(20) DEFAULT 'active',
        maturity_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Web3 and service tables created successfully');

    // Create sample Web3 data
    await createSampleWeb3Data();

    console.log('🎉 Web3 setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up Web3 tables:', error);
    throw error;
  }
}

async function createSampleWeb3Data() {
  console.log('📝 Creating sample Web3 data...');

  // Get existing users
  const usersResult = await db.query('SELECT id, email FROM users LIMIT 3');
  const users = usersResult.rows;

  if (users.length === 0) {
    console.log('⚠️  No users found. Please run basic setup first.');
    return;
  }

  // Create sample wallets
  const wallets = [];
  for (let i = 0; i < users.length; i++) {
    const walletId = uuidv4();
    const walletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    
    await db.query(`
      INSERT INTO user_wallets (id, user_id, wallet_address, wallet_type, nonce)
      VALUES ($1, $2, $3, $4, $5)
    `, [walletId, users[i].id, walletAddress, 'metamask', Math.random().toString(16).substr(2, 32)]);
    
    wallets.push({ id: walletId, userId: users[i].id, address: walletAddress });
  }

  // Create Web3 profiles
  for (let i = 0; i < wallets.length; i++) {
    await db.query(`
      INSERT INTO web3_profiles (id, user_id, wallet_id, reputation_score, governance_power, total_staked)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      uuidv4(),
      wallets[i].userId,
      wallets[i].id,
      100 + (i * 50), // Different reputation scores
      i * 1000, // Different governance power
      i * 500 // Different staked amounts
    ]);
  }

  // Create sample NFTs
  const nftAttributes = [
    { background: 'rare', eyes: 'laser', accessories: 'crown' },
    { background: 'common', eyes: 'normal', accessories: 'glasses' },
    { background: 'legendary', eyes: 'diamond', accessories: 'crown' }
  ];

  for (let i = 0; i < users.length; i++) {
    await db.query(`
      INSERT INTO nft_collections (id, owner_id, name, description, image_url, attributes, rarity_score, nft_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      uuidv4(),
      users[i].id,
      `ATHENA Profile #${i + 1}`,
      `Unique ATHENA platform profile NFT`,
      `https://api.athena.com/nft/${i + 1}.png`,
      JSON.stringify(nftAttributes[i]),
      (i + 1) * 100,
      'profile'
    ]);
  }

  // Create sample governance proposal
  const proposalId = uuidv4();
  await db.query(`
    INSERT INTO governance_proposals (id, proposer_id, title, description, proposal_type, voting_start, voting_end, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [
    proposalId,
    users[0].id,
    'Increase SOV Token Staking Rewards',
    'Proposal to increase staking rewards from 18% to 22% APY for 1-year staking periods to incentivize long-term holding.',
    'tokenomics',
    new Date(),
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    'active'
  ]);

  // Create sample staking records
  for (let i = 0; i < users.length; i++) {
    const stakingAmount = (i + 1) * 500;
    const duration = [30, 90, 365][i];
    const apyRate = [5, 8, 18][i];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    await db.query(`
      INSERT INTO token_staking (id, user_id, amount, duration_days, apy_rate, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      uuidv4(),
      users[i].id,
      stakingAmount,
      duration,
      apyRate,
      new Date(),
      endDate,
      'active'
    ]);
  }

  // Create sample Vietjet bookings
  const bookingData = [
    {
      userId: users[0].id,
      flightNumber: 'VJ123',
      origin: 'SGN',
      destination: 'HAN',
      departure: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      arrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2.25 * 60 * 60 * 1000),
      passengers: [{ type: 'adult', firstName: 'John', lastName: 'Doe' }],
      paymentMethod: 'sov_token',
      totalTokens: 150
    },
    {
      userId: users[1].id,
      flightNumber: 'VJ456',
      origin: 'SGN',
      destination: 'DAD',
      departure: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      arrival: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 1.25 * 60 * 60 * 1000),
      passengers: [{ type: 'adult', firstName: 'Jane', lastName: 'Smith' }],
      paymentMethod: 'hybrid',
      totalTokens: 75
    }
  ];

  for (const booking of bookingData) {
    await db.query(`
      INSERT INTO vietjet_bookings (
        id, user_id, flight_id, flight_number, booking_reference,
        origin, destination, departure_time, arrival_time,
        passengers, contact_info, payment_method, total_tokens, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      uuidv4(),
      booking.userId,
      uuidv4(),
      booking.flightNumber,
      `VJ${Date.now().toString().slice(-8)}`,
      booking.origin,
      booking.destination,
      booking.departure,
      booking.arrival,
      JSON.stringify(booking.passengers),
      JSON.stringify({ email: 'user@example.com', phone: '+84901234567' }),
      booking.paymentMethod,
      booking.totalTokens,
      'confirmed'
    ]);
  }

  // Create sample HDBank services
  for (let i = 0; i < users.length; i++) {
    // Sample loan
    await db.query(`
      INSERT INTO hdbank_loans (
        id, user_id, loan_type, amount, term_months, purpose,
        monthly_income, employment_type, interest_rate, monthly_payment,
        payment_method, processing_fee, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      uuidv4(),
      users[i].id,
      ['personal', 'home', 'car'][i],
      [50000000, 2000000000, 800000000][i],
      [36, 240, 60][i],
      ['Personal expenses', 'Home purchase', 'Car purchase'][i],
      [15000000, 50000000, 25000000][i],
      'employee',
      [12.5, 8.5, 9.5][i],
      [1500000, 12000000, 15000000][i],
      'sov_token',
      [500, 2000, 800][i],
      'approved'
    ]);

    // Sample investment
    await db.query(`
      INSERT INTO hdbank_investments (
        id, user_id, product_type, amount, risk_level, duration_months,
        payment_method, expected_return, current_value, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      uuidv4(),
      users[i].id,
      ['mutual_fund', 'bonds', 'crypto_fund'][i],
      [10000000, 50000000, 20000000][i],
      ['medium', 'low', 'high'][i],
      [12, 24, 6][i],
      'hybrid',
      [1200000, 3500000, 5000000][i],
      [10500000, 52000000, 22000000][i],
      'active'
    ]);
  }

  console.log('✅ Sample Web3 data created successfully');
}

// Run setup if called directly
if (require.main === module) {
  setupWeb3Tables()
    .then(() => {
      console.log('Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupWeb3Tables };

