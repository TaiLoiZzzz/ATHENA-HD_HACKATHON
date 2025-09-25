const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const blockchainService = require('../services/blockchainService');

const router = express.Router();

// Validation schemas
const loanApplicationSchema = Joi.object({
  loanType: Joi.string().valid('personal', 'home', 'car', 'business').required(),
  amount: Joi.number().min(10000000).max(5000000000).required(), // 10M - 5B VND
  term: Joi.number().valid(12, 24, 36, 48, 60, 84, 120, 240).required(), // months
  purpose: Joi.string().required(),
  monthlyIncome: Joi.number().min(5000000).required(), // Min 5M VND
  employmentType: Joi.string().valid('employee', 'business_owner', 'freelancer').required(),
  documents: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    url: Joi.string().uri().required()
  })).required(),
  paymentMethod: Joi.string().valid('sov_token', 'fiat', 'hybrid').required(),
  paymentDetails: Joi.object({
    sovTokenAmount: Joi.number().min(0).optional(),
    fiatAmount: Joi.number().min(0).optional()
  }).required()
});

const creditCardApplicationSchema = Joi.object({
  cardType: Joi.string().valid('classic', 'gold', 'platinum', 'diamond').required(),
  annualIncome: Joi.number().min(120000000).required(), // Min 120M VND annually
  employmentInfo: Joi.object({
    company: Joi.string().required(),
    position: Joi.string().required(),
    workingYears: Joi.number().min(1).required()
  }).required(),
  requestedLimit: Joi.number().min(10000000).max(500000000).required(),
  paymentMethod: Joi.string().valid('sov_token', 'fiat').required(),
  applicationFee: Joi.number().required()
});

const insuranceApplicationSchema = Joi.object({
  insuranceType: Joi.string().valid('life', 'health', 'travel', 'car', 'home').required(),
  coverage: Joi.object({
    amount: Joi.number().required(),
    duration: Joi.number().required(), // years
    beneficiaries: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      percentage: Joi.number().min(0).max(100).required()
    })).required()
  }).required(),
  personalInfo: Joi.object({
    age: Joi.number().min(18).max(70).required(),
    healthConditions: Joi.array().items(Joi.string()).default([]),
    occupation: Joi.string().required(),
    smoker: Joi.boolean().default(false)
  }).required(),
  paymentMethod: Joi.string().valid('sov_token', 'fiat', 'hybrid').required(),
  premiumFrequency: Joi.string().valid('monthly', 'quarterly', 'annually').required()
});

const investmentSchema = Joi.object({
  productType: Joi.string().valid('mutual_fund', 'bonds', 'stocks', 'fixed_deposit', 'crypto_fund').required(),
  amount: Joi.number().min(1000000).required(), // Min 1M VND
  riskLevel: Joi.string().valid('low', 'medium', 'high').required(),
  duration: Joi.number().min(1).max(120).required(), // months
  paymentMethod: Joi.string().valid('sov_token', 'fiat', 'hybrid').required(),
  autoReinvest: Joi.boolean().default(false),
  paymentDetails: Joi.object({
    sovTokenAmount: Joi.number().min(0).optional(),
    fiatAmount: Joi.number().min(0).optional()
  }).required()
});

// Get available loan products
router.get('/loans/products', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    let userTier = 'standard';
    let sovTokenDiscount = 1.0;

    if (userId) {
      // Check user tier and token balance for personalized rates
      const userResult = await db.query(`
        SELECT 
          u.athena_prime,
          COALESCE(tb.balance, 0) as token_balance,
          COALESCE(wp.reputation_score, 100) as reputation_score
        FROM users u
        LEFT JOIN token_balances tb ON u.id = tb.user_id
        LEFT JOIN web3_profiles wp ON u.id = wp.user_id
        WHERE u.id = $1
      `, [userId]);

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        if (user.athena_prime) userTier = 'prime';
        if (user.token_balance > 10000) userTier = 'vip';
        if (user.reputation_score > 800) sovTokenDiscount = 0.9; // 10% discount for high reputation
      }
    }

    const loanProducts = [
      {
        id: uuidv4(),
        type: 'personal',
        name: 'Personal Loan',
        description: 'Flexible personal financing for your needs',
        minAmount: 10000000,
        maxAmount: 500000000,
        interestRates: {
          standard: { annual: 12.5, sovToken: 11.0 },
          prime: { annual: 11.5, sovToken: 10.0 },
          vip: { annual: 10.5, sovToken: 9.0 }
        },
        terms: [12, 24, 36, 48, 60],
        processingFee: {
          fiat: 1000000, // 1M VND
          sovToken: 100 * sovTokenDiscount
        },
        features: [
          'No collateral required',
          'Quick approval (24-48 hours)',
          'Flexible repayment terms',
          'Early repayment allowed'
        ]
      },
      {
        id: uuidv4(),
        type: 'home',
        name: 'Home Loan',
        description: 'Make your dream home a reality',
        minAmount: 100000000,
        maxAmount: 5000000000,
        interestRates: {
          standard: { annual: 8.5, sovToken: 7.8 },
          prime: { annual: 8.0, sovToken: 7.3 },
          vip: { annual: 7.5, sovToken: 6.8 }
        },
        terms: [120, 180, 240],
        processingFee: {
          fiat: 5000000, // 5M VND
          sovToken: 500 * sovTokenDiscount
        },
        features: [
          'Up to 85% financing',
          'Competitive interest rates',
          'Flexible repayment options',
          'Home insurance included'
        ]
      },
      {
        id: uuidv4(),
        type: 'car',
        name: 'Auto Loan',
        description: 'Drive your dream car today',
        minAmount: 50000000,
        maxAmount: 2000000000,
        interestRates: {
          standard: { annual: 9.5, sovToken: 8.8 },
          prime: { annual: 9.0, sovToken: 8.3 },
          vip: { annual: 8.5, sovToken: 7.8 }
        },
        terms: [24, 36, 48, 60, 84],
        processingFee: {
          fiat: 2000000, // 2M VND
          sovToken: 200 * sovTokenDiscount
        },
        features: [
          'Up to 90% financing',
          'New and used cars',
          'Comprehensive insurance',
          'Fast approval process'
        ]
      }
    ];

    res.json({
      products: loanProducts.map(product => ({
        ...product,
        userTier,
        applicableRates: product.interestRates[userTier]
      }))
    });

  } catch (error) {
    next(error);
  }
});

// Apply for loan
router.post('/loans/apply', async (req, res, next) => {
  try {
    const { error, value } = loanApplicationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid application data', 
        details: error.details[0].message 
      });
    }

    const userId = req.user.id;
    const { loanType, amount, term, purpose, monthlyIncome, employmentType, documents, paymentMethod, paymentDetails } = value;

    // Calculate loan terms and fees
    const interestRate = calculateInterestRate(loanType, amount, userId);
    const processingFee = calculateProcessingFee(loanType, amount, paymentMethod);
    const monthlyPayment = calculateMonthlyPayment(amount, interestRate, term);

    await db.query('BEGIN');

    try {
      // Process application fee payment
      if (paymentMethod === 'sov_token' || paymentMethod === 'hybrid') {
        const tokenFee = paymentDetails.sovTokenAmount || processingFee.sovToken;
        
        const balanceResult = await db.query(
          'SELECT balance FROM token_balances WHERE user_id = $1',
          [userId]
        );

        if (parseFloat(balanceResult.rows[0]?.balance || 0) < tokenFee) {
          throw new Error('Insufficient SOV token balance for processing fee');
        }

        // Deduct processing fee in tokens
        await db.query(
          'UPDATE token_balances SET balance = balance - $1 WHERE user_id = $2',
          [tokenFee, userId]
        );

        // Record fee transaction
        await db.query(`
          INSERT INTO transactions (
            id, user_id, type, amount, description, 
            transaction_hash, status, created_at
          ) VALUES ($1, $2, 'debit', $3, $4, $5, 'completed', NOW())
        `, [
          uuidv4(), 
          userId, 
          tokenFee, 
          `Loan application processing fee - ${loanType}`,
          `fee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        ]);
      }

      // Create loan application
      const applicationResult = await db.query(`
        INSERT INTO hdbank_loans (
          id, user_id, loan_type, amount, term_months, purpose,
          monthly_income, employment_type, interest_rate, monthly_payment,
          documents, payment_method, processing_fee, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        RETURNING *
      `, [
        uuidv4(),
        userId,
        loanType,
        amount,
        term,
        purpose,
        monthlyIncome,
        employmentType,
        interestRate,
        monthlyPayment,
        JSON.stringify(documents),
        paymentMethod,
        processingFee.fiat || processingFee.sovToken,
        'pending_review'
      ]);

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Loan application submitted successfully',
        application: applicationResult.rows[0],
        estimatedApprovalTime: '24-48 hours'
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    next(error);
  }
});

// Get credit card products
// Get products from database or mock data
const getHDBankProducts = async () => {
  try {
    const result = await db.query('SELECT * FROM hdbank_products WHERE is_active = true ORDER BY created_at DESC');
    if (result.rows.length > 0) {
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        description: row.description,
        features: Array.isArray(row.features) ? row.features : JSON.parse(row.features || '[]'),
        annualFee: row.annual_fee ? (typeof row.annual_fee === 'object' ? row.annual_fee : JSON.parse(row.annual_fee)) : null,
        creditLimit: row.credit_limit ? (typeof row.credit_limit === 'object' ? row.credit_limit : JSON.parse(row.credit_limit)) : null,
        applicableCashback: row.applicable_cashback,
        applicableRewards: row.applicable_rewards,
        interestRate: row.interest_rate ? (typeof row.interest_rate === 'object' ? row.interest_rate : JSON.parse(row.interest_rate)) : null,
        loanAmount: row.loan_amount ? (typeof row.loan_amount === 'object' ? row.loan_amount : JSON.parse(row.loan_amount)) : null,
        term: row.term ? (typeof row.term === 'object' ? row.term : JSON.parse(row.term)) : null,
        minInvestment: row.min_investment,
        expectedReturns: row.expected_returns ? (typeof row.expected_returns === 'object' ? row.expected_returns : JSON.parse(row.expected_returns)) : null,
        riskLevel: row.risk_level,
        coverage: row.coverage ? (typeof row.coverage === 'object' ? row.coverage : JSON.parse(row.coverage)) : null,
        premium: row.premium ? (typeof row.premium === 'object' ? row.premium : JSON.parse(row.premium)) : null,
        isActive: row.is_active,
        createdAt: row.created_at
      }));
    }
  } catch (error) {
    console.error('Database error, using mock data:', error);
  }
  
  // Return mock data if database is not available
  return Object.values(mockProducts).flat();
};

router.get('/credit-cards/products', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    let userTier = 'standard';

    if (userId) {
      const userResult = await db.query(
        'SELECT athena_prime FROM users WHERE id = $1',
        [userId]
      );
      if (userResult.rows[0]?.athena_prime) userTier = 'prime';
    }

    const cardProducts = [
      {
        id: uuidv4(),
        type: 'classic',
        name: 'HDBank Classic Card',
        description: 'Essential credit card for everyday spending',
        annualFee: { fiat: 500000, sovToken: 50 },
        creditLimit: { min: 10000000, max: 50000000 },
        cashback: { standard: 0.5, prime: 0.8 },
        sovTokenRewards: { standard: 1, prime: 1.5 }, // tokens per 100k VND
        benefits: [
          'No foreign transaction fees',
          'Contactless payments',
          'Mobile app management',
          'SMS alerts'
        ]
      },
      {
        id: uuidv4(),
        type: 'gold',
        name: 'HDBank Gold Card',
        description: 'Premium card with enhanced rewards',
        annualFee: { fiat: 1500000, sovToken: 150 },
        creditLimit: { min: 50000000, max: 200000000 },
        cashback: { standard: 1.0, prime: 1.3 },
        sovTokenRewards: { standard: 2, prime: 2.5 },
        benefits: [
          'Airport lounge access',
          'Travel insurance',
          'Concierge service',
          'Priority customer service'
        ]
      },
      {
        id: uuidv4(),
        type: 'platinum',
        name: 'HDBank Platinum Card',
        description: 'Luxury card for high-value transactions',
        annualFee: { fiat: 3000000, sovToken: 300 },
        creditLimit: { min: 200000000, max: 500000000 },
        cashback: { standard: 1.5, prime: 2.0 },
        sovTokenRewards: { standard: 3, prime: 4 },
        benefits: [
          'Global airport lounge access',
          'Comprehensive travel insurance',
          'Personal concierge',
          'Exclusive dining privileges'
        ]
      }
    ];

    res.json({
      products: cardProducts.map(card => ({
        ...card,
        userTier,
        applicableCashback: card.cashback[userTier],
        applicableRewards: card.sovTokenRewards[userTier]
      }))
    });

  } catch (error) {
    next(error);
  }
});

// Apply for credit card
router.post('/credit-cards/apply', async (req, res, next) => {
  try {
    const { error, value } = creditCardApplicationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid application data', 
        details: error.details[0].message 
      });
    }

    const userId = req.user.id;
    const { cardType, annualIncome, employmentInfo, requestedLimit, paymentMethod, applicationFee } = value;

    await db.query('BEGIN');

    try {
      // Process application fee
      if (paymentMethod === 'sov_token') {
        const tokenFee = applicationFee / 10000; // Convert VND to tokens
        
        const balanceResult = await db.query(
          'SELECT balance FROM token_balances WHERE user_id = $1',
          [userId]
        );

        if (parseFloat(balanceResult.rows[0]?.balance || 0) < tokenFee) {
          throw new Error('Insufficient SOV token balance');
        }

        await db.query(
          'UPDATE token_balances SET balance = balance - $1 WHERE user_id = $2',
          [tokenFee, userId]
        );
      }

      // Create credit card application
      const applicationResult = await db.query(`
        INSERT INTO hdbank_credit_cards (
          id, user_id, card_type, annual_income, employment_info,
          requested_limit, payment_method, application_fee, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *
      `, [
        uuidv4(),
        userId,
        cardType,
        annualIncome,
        JSON.stringify(employmentInfo),
        requestedLimit,
        paymentMethod,
        applicationFee,
        'pending_review'
      ]);

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Credit card application submitted successfully',
        application: applicationResult.rows[0],
        estimatedApprovalTime: '5-7 business days'
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    next(error);
  }
});

// Get insurance products
router.get('/insurance/products', async (req, res, next) => {
  try {
    const { type } = req.query;
    
    let insuranceProducts = [
      {
        id: uuidv4(),
        type: 'life',
        name: 'Life Insurance Plus',
        description: 'Comprehensive life coverage with investment benefits',
        coverageOptions: [500000000, 1000000000, 2000000000, 5000000000],
        premiumRates: {
          age_18_30: { annual: 0.002, sovToken: 0.0018 },
          age_31_45: { annual: 0.003, sovToken: 0.0027 },
          age_46_60: { annual: 0.005, sovToken: 0.0045 }
        },
        benefits: [
          'Death benefit',
          'Critical illness coverage',
          'Investment component',
          'Premium waiver benefit'
        ]
      },
      {
        id: uuidv4(),
        type: 'health',
        name: 'Health Shield Pro',
        description: 'Complete health insurance with worldwide coverage',
        coverageOptions: [100000000, 300000000, 500000000, 1000000000],
        premiumRates: {
          individual: { annual: 0.015, sovToken: 0.013 },
          family: { annual: 0.025, sovToken: 0.022 }
        },
        benefits: [
          'Hospitalization coverage',
          'Outpatient treatment',
          'Emergency evacuation',
          'Dental and vision care'
        ]
      },
      {
        id: uuidv4(),
        type: 'travel',
        name: 'Travel Guard',
        description: 'Comprehensive travel insurance for peace of mind',
        coverageOptions: [50000000, 100000000, 200000000],
        premiumRates: {
          domestic: { daily: 50000, sovToken: 5 },
          international: { daily: 150000, sovToken: 15 }
        },
        benefits: [
          'Trip cancellation',
          'Medical emergencies',
          'Lost baggage',
          'Flight delays'
        ]
      }
    ];

    if (type) {
      insuranceProducts = insuranceProducts.filter(product => product.type === type);
    }

    res.json({ products: insuranceProducts });

  } catch (error) {
    next(error);
  }
});

// Apply for insurance
router.post('/insurance/apply', async (req, res, next) => {
  try {
    const { error, value } = insuranceApplicationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid application data', 
        details: error.details[0].message 
      });
    }

    const userId = req.user.id;
    const { insuranceType, coverage, personalInfo, paymentMethod, premiumFrequency } = value;

    // Calculate premium based on coverage and personal info
    const premium = calculateInsurancePremium(insuranceType, coverage.amount, personalInfo);

    await db.query('BEGIN');

    try {
      // Create insurance application
      const applicationResult = await db.query(`
        INSERT INTO hdbank_insurance (
          id, user_id, insurance_type, coverage_amount, coverage_duration,
          beneficiaries, personal_info, premium_amount, premium_frequency,
          payment_method, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *
      `, [
        uuidv4(),
        userId,
        insuranceType,
        coverage.amount,
        coverage.duration,
        JSON.stringify(coverage.beneficiaries),
        JSON.stringify(personalInfo),
        premium.amount,
        premiumFrequency,
        paymentMethod,
        'pending_review'
      ]);

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Insurance application submitted successfully',
        application: applicationResult.rows[0],
        premium: premium,
        estimatedApprovalTime: '3-5 business days'
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    next(error);
  }
});

// Get investment products
router.get('/investments/products', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    let userRiskProfile = 'medium';

    if (userId) {
      // Get user's risk profile from previous investments
      const riskResult = await db.query(
        'SELECT risk_level FROM hdbank_investments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      if (riskResult.rows.length > 0) {
        userRiskProfile = riskResult.rows[0].risk_level;
      }
    }

    const investmentProducts = [
      {
        id: uuidv4(),
        type: 'mutual_fund',
        name: 'ATHENA Growth Fund',
        description: 'Diversified fund focusing on growth stocks and SOV token integration',
        minInvestment: 1000000,
        expectedReturns: {
          low: 8, medium: 12, high: 18
        },
        riskLevel: 'medium',
        sovTokenIntegration: true,
        sovTokenBonus: 0.5, // Additional 0.5% return when paid with SOV tokens
        features: [
          'Professional management',
          'Diversified portfolio',
          'SOV token rewards',
          'Quarterly reporting'
        ]
      },
      {
        id: uuidv4(),
        type: 'bonds',
        name: 'HDBank Corporate Bonds',
        description: 'Secure fixed-income investment with guaranteed returns',
        minInvestment: 5000000,
        expectedReturns: {
          low: 6, medium: 7, high: 8
        },
        riskLevel: 'low',
        sovTokenIntegration: true,
        sovTokenBonus: 0.3,
        features: [
          'Fixed returns',
          'Capital protection',
          'Regular interest payments',
          'Government guaranteed'
        ]
      },
      {
        id: uuidv4(),
        type: 'crypto_fund',
        name: 'Digital Asset Fund',
        description: 'Cryptocurrency and blockchain technology investment fund',
        minInvestment: 10000000,
        expectedReturns: {
          low: 15, medium: 25, high: 40
        },
        riskLevel: 'high',
        sovTokenIntegration: true,
        sovTokenBonus: 1.0, // 1% additional return
        features: [
          'Cryptocurrency exposure',
          'Blockchain technology investments',
          'High growth potential',
          'Professional crypto management'
        ]
      }
    ];

    // Filter products based on user's risk profile
    const recommendedProducts = investmentProducts.filter(product => 
      product.riskLevel === userRiskProfile || product.riskLevel === 'medium'
    );

    res.json({
      products: investmentProducts,
      recommended: recommendedProducts,
      userRiskProfile
    });

  } catch (error) {
    next(error);
  }
});

// Create investment
router.post('/investments', async (req, res, next) => {
  try {
    const { error, value } = investmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid investment data', 
        details: error.details[0].message 
      });
    }

    const userId = req.user.id;
    const { productType, amount, riskLevel, duration, paymentMethod, autoReinvest, paymentDetails } = value;

    await db.query('BEGIN');

    try {
      // Process payment
      if (paymentMethod === 'sov_token' || paymentMethod === 'hybrid') {
        const tokenAmount = paymentDetails.sovTokenAmount;
        
        const balanceResult = await db.query(
          'SELECT balance FROM token_balances WHERE user_id = $1',
          [userId]
        );

        if (parseFloat(balanceResult.rows[0]?.balance || 0) < tokenAmount) {
          throw new Error('Insufficient SOV token balance');
        }

        // Deduct investment amount in tokens
        await db.query(
          'UPDATE token_balances SET balance = balance - $1 WHERE user_id = $2',
          [tokenAmount, userId]
        );

        // Record investment transaction
        await db.query(`
          INSERT INTO transactions (
            id, user_id, type, amount, description, 
            transaction_hash, status, created_at
          ) VALUES ($1, $2, 'debit', $3, $4, $5, 'completed', NOW())
        `, [
          uuidv4(), 
          userId, 
          tokenAmount, 
          `Investment in ${productType}`,
          `invest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        ]);
      }

      // Create investment record
      const investmentResult = await db.query(`
        INSERT INTO hdbank_investments (
          id, user_id, product_type, amount, risk_level, duration_months,
          payment_method, auto_reinvest, expected_return, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING *
      `, [
        uuidv4(),
        userId,
        productType,
        paymentDetails.sovTokenAmount || paymentDetails.fiatAmount,
        riskLevel,
        duration,
        paymentMethod,
        autoReinvest,
        calculateExpectedReturn(productType, amount, duration),
        'active'
      ]);

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Investment created successfully',
        investment: investmentResult.rows[0]
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    next(error);
  }
});

// Get user's HDBank services
router.get('/my-services', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all user's HDBank services
    const [loans, creditCards, insurance, investments] = await Promise.all([
      db.query('SELECT * FROM hdbank_loans WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
      db.query('SELECT * FROM hdbank_credit_cards WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
      db.query('SELECT * FROM hdbank_insurance WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
      db.query('SELECT * FROM hdbank_investments WHERE user_id = $1 ORDER BY created_at DESC', [userId])
    ]);

    res.json({
      loans: loans.rows,
      creditCards: creditCards.rows,
      insurance: insurance.rows,
      investments: investments.rows,
      summary: {
        totalServices: loans.rows.length + creditCards.rows.length + insurance.rows.length + investments.rows.length,
        activeLoans: loans.rows.filter(l => l.status === 'approved').length,
        activeCreditCards: creditCards.rows.filter(c => c.status === 'approved').length,
        activeInsurance: insurance.rows.filter(i => i.status === 'active').length,
        activeInvestments: investments.rows.filter(i => i.status === 'active').length
      }
    });

  } catch (error) {
    next(error);
  }
});

// Helper functions
function calculateInterestRate(loanType, amount, userId) {
  const baseRates = {
    personal: 12.5,
    home: 8.5,
    car: 9.5,
    business: 11.0
  };
  
  // Apply discounts based on amount and user tier
  let rate = baseRates[loanType];
  if (amount > 100000000) rate -= 0.5; // Large amount discount
  
  return rate;
}

function calculateProcessingFee(loanType, amount, paymentMethod) {
  const feeRates = {
    personal: 0.01,
    home: 0.005,
    car: 0.008,
    business: 0.012
  };
  
  const fiatFee = Math.max(amount * feeRates[loanType], 500000);
  const sovTokenFee = fiatFee / 10000; // 1 token = 10,000 VND
  
  return paymentMethod === 'sov_token' ? { sovToken: sovTokenFee } : { fiat: fiatFee };
}

function calculateMonthlyPayment(principal, annualRate, termMonths) {
  const monthlyRate = annualRate / 100 / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                  (Math.pow(1 + monthlyRate, termMonths) - 1);
  return Math.round(payment);
}

function calculateInsurancePremium(type, coverageAmount, personalInfo) {
  const baseRates = {
    life: 0.002,
    health: 0.015,
    travel: 0.001,
    car: 0.03,
    home: 0.005
  };
  
  let rate = baseRates[type];
  
  // Adjust based on personal info
  if (personalInfo.age > 45) rate *= 1.5;
  if (personalInfo.smoker) rate *= 1.8;
  
  return {
    amount: Math.round(coverageAmount * rate),
    sovTokenAmount: Math.round(coverageAmount * rate * 0.9 / 10000) // 10% discount with SOV tokens
  };
}

function calculateExpectedReturn(productType, amount, duration) {
  const annualReturns = {
    mutual_fund: 12,
    bonds: 7,
    stocks: 15,
    fixed_deposit: 5,
    crypto_fund: 25
  };
  
  const annualReturn = annualReturns[productType] || 8;
  return Math.round(amount * (annualReturn / 100) * (duration / 12));
}

// Get all products (for frontend display)
router.get('/all-products', async (req, res, next) => {
  try {
    const products = await getHDBankProducts();
    
    res.json({
      success: true,
      products: products,
      message: 'All products retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get products by type
router.get('/products/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const products = await getHDBankProducts();
    const filteredProducts = products.filter(p => p.type === type);
    
    res.json({
      success: true,
      products: filteredProducts,
      message: `${type} products retrieved successfully`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

