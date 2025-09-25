const express = require('express');
const Joi = require('joi');
const db = require('../config/database');

const router = express.Router();

// Real HDBank Banking Products Data
const BANKING_PRODUCTS = {
  savings_accounts: [
    {
      id: 'hd_classic_savings',
      name: 'HD Classic Savings',
      type: 'savings_account',
      category: 'Personal Banking',
      description: 'Basic savings account with competitive interest rates',
      features: [
        'Free account opening and maintenance',
        'ATM card included',
        'Internet banking access',
        'Mobile banking app',
        'SMS banking alerts'
      ],
      interestRate: {
        min: 0.1,
        max: 1.5,
        tiers: [
          { amount: 0, rate: 0.1 },
          { amount: 50000000, rate: 0.8 },
          { amount: 500000000, rate: 1.2 },
          { amount: 1000000000, rate: 1.5 }
        ]
      },
      minimumBalance: 50000,
      fees: {
        maintenance: 0,
        atm_withdrawal: 1100,
        interbank_transfer: 6600
      },
      sovTokens: {
        openingBonus: 100,
        monthlyRate: 0.01, // 1% of balance in SOV tokens monthly
        transactionRate: 0.1 // 0.1% of transaction amount
      }
    },
    {
      id: 'hd_premium_savings',
      name: 'HD Premium Savings',
      type: 'savings_account',
      category: 'Premium Banking',
      description: 'High-yield savings account for premium customers',
      features: [
        'Higher interest rates',
        'Priority customer service',
        'Free unlimited ATM withdrawals',
        'Premium debit card',
        'Investment advisory services',
        'Exclusive banking lounges'
      ],
      interestRate: {
        min: 1.8,
        max: 3.2,
        tiers: [
          { amount: 0, rate: 1.8 },
          { amount: 100000000, rate: 2.5 },
          { amount: 1000000000, rate: 3.0 },
          { amount: 5000000000, rate: 3.2 }
        ]
      },
      minimumBalance: 10000000,
      fees: {
        maintenance: 0,
        atm_withdrawal: 0,
        interbank_transfer: 0
      },
      sovTokens: {
        openingBonus: 500,
        monthlyRate: 0.02,
        transactionRate: 0.15
      }
    }
  ],
  credit_cards: [
    {
      id: 'hd_classic_credit',
      name: 'HDBank Classic Credit Card',
      type: 'credit_card',
      category: 'Credit Cards',
      description: 'Entry-level credit card with essential benefits',
      features: [
        '0% interest for first 6 months',
        'Cashback on dining and shopping',
        'Travel insurance coverage',
        'EMV chip security',
        'Contactless payments'
      ],
      creditLimit: {
        min: 5000000,
        max: 50000000
      },
      interestRate: 24.9,
      annualFee: 600000,
      cashbackRate: {
        dining: 2.0,
        shopping: 1.5,
        general: 0.5
      },
      sovTokens: {
        openingBonus: 200,
        spendingRate: 0.2, // 0.2% of spending as SOV tokens
        cashbackMultiplier: 2 // Double SOV tokens for cashback categories
      }
    },
    {
      id: 'hd_platinum_credit',
      name: 'HDBank Platinum Credit Card',
      type: 'credit_card',
      category: 'Premium Credit Cards',
      description: 'Premium credit card with luxury benefits and rewards',
      features: [
        'Airport lounge access worldwide',
        'Concierge services',
        'Travel and purchase protection',
        'Higher credit limits',
        'Priority customer service',
        'Exclusive dining and shopping offers',
        'Complimentary travel insurance'
      ],
      creditLimit: {
        min: 50000000,
        max: 500000000
      },
      interestRate: 22.9,
      annualFee: 2500000,
      cashbackRate: {
        travel: 5.0,
        dining: 3.0,
        shopping: 2.0,
        general: 1.0
      },
      sovTokens: {
        openingBonus: 1000,
        spendingRate: 0.5,
        cashbackMultiplier: 3
      }
    }
  ],
  loans: [
    {
      id: 'hd_personal_loan',
      name: 'HDBank Personal Loan',
      type: 'personal_loan',
      category: 'Personal Loans',
      description: 'Flexible personal loan for various needs',
      features: [
        'Quick approval process',
        'Flexible repayment terms',
        'Competitive interest rates',
        'No collateral required',
        'Early repayment options'
      ],
      loanAmount: {
        min: 10000000,
        max: 500000000
      },
      interestRate: {
        min: 12.5,
        max: 18.9
      },
      term: {
        min: 6,
        max: 60
      },
      requirements: [
        'Age 18-65 years',
        'Minimum income 8,000,000 VND/month',
        'Valid employment contract',
        'Good credit history'
      ],
      sovTokens: {
        applicationBonus: 50,
        approvalBonus: 300,
        monthlyPaymentRate: 0.05 // 0.05% of monthly payment
      }
    },
    {
      id: 'hd_home_loan',
      name: 'HDBank Home Loan',
      type: 'home_loan',
      category: 'Property Loans',
      description: 'Competitive home loan rates for your dream home',
      features: [
        'Up to 85% loan-to-value ratio',
        'Long repayment terms up to 25 years',
        'Special rates for first-time buyers',
        'Free property valuation',
        'Flexible repayment options'
      ],
      loanAmount: {
        min: 100000000,
        max: 10000000000
      },
      interestRate: {
        min: 8.5,
        max: 12.0
      },
      term: {
        min: 60,
        max: 300
      },
      requirements: [
        'Age 18-65 years at loan maturity',
        'Stable income proof',
        'Property ownership documents',
        'Down payment 15-20%'
      ],
      sovTokens: {
        applicationBonus: 200,
        approvalBonus: 2000,
        monthlyPaymentRate: 0.1
      }
    }
  ],
  investments: [
    {
      id: 'hd_term_deposit',
      name: 'HDBank Term Deposit',
      type: 'term_deposit',
      category: 'Investment Products',
      description: 'Fixed-term deposit with guaranteed returns',
      features: [
        'Guaranteed interest rates',
        'Flexible terms from 1 month to 5 years',
        'Early withdrawal options',
        'Auto-renewal facility',
        'Competitive rates'
      ],
      minimumDeposit: 10000000,
      terms: [
        { months: 1, rate: 2.1 },
        { months: 3, rate: 2.8 },
        { months: 6, rate: 3.5 },
        { months: 12, rate: 4.2 },
        { months: 24, rate: 5.0 },
        { months: 36, rate: 5.5 },
        { months: 60, rate: 6.0 }
      ],
      sovTokens: {
        depositBonus: 100,
        maturityBonus: 500,
        interestRate: 0.1 // 10% of interest earned as SOV tokens
      }
    },
    {
      id: 'hd_mutual_funds',
      name: 'HDBank Mutual Funds',
      type: 'mutual_funds',
      category: 'Investment Products',
      description: 'Diversified investment portfolio managed by experts',
      features: [
        'Professional fund management',
        'Diversified portfolio',
        'Regular investment options',
        'Online portfolio tracking',
        'Tax-efficient investments'
      ],
      minimumInvestment: 1000000,
      funds: [
        { name: 'HD Balanced Fund', riskLevel: 'Medium', expectedReturn: '8-12%' },
        { name: 'HD Growth Fund', riskLevel: 'High', expectedReturn: '12-18%' },
        { name: 'HD Conservative Fund', riskLevel: 'Low', expectedReturn: '5-8%' },
        { name: 'HD International Fund', riskLevel: 'High', expectedReturn: '10-15%' }
      ],
      sovTokens: {
        investmentBonus: 50,
        monthlyInvestmentRate: 0.05,
        performanceBonus: 100 // Bonus for positive returns
      }
    }
  ]
};

// Get all banking products
router.get('/products', async (req, res, next) => {
  try {
    const { category, type } = req.query;
    
    let products = [];
    
    // Flatten all products
    Object.values(BANKING_PRODUCTS).forEach(categoryProducts => {
      products = products.concat(categoryProducts);
    });
    
    // Filter by category if specified
    if (category) {
      products = products.filter(product => 
        product.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // Filter by type if specified
    if (type) {
      products = products.filter(product => product.type === type);
    }
    
    res.json({
      success: true,
      products,
      categories: {
        'Personal Banking': BANKING_PRODUCTS.savings_accounts.filter(p => p.category === 'Personal Banking'),
        'Premium Banking': BANKING_PRODUCTS.savings_accounts.filter(p => p.category === 'Premium Banking'),
        'Credit Cards': BANKING_PRODUCTS.credit_cards.filter(p => p.category === 'Credit Cards'),
        'Premium Credit Cards': BANKING_PRODUCTS.credit_cards.filter(p => p.category === 'Premium Credit Cards'),
        'Personal Loans': BANKING_PRODUCTS.loans.filter(p => p.category === 'Personal Loans'),
        'Property Loans': BANKING_PRODUCTS.loans.filter(p => p.category === 'Property Loans'),
        'Investment Products': BANKING_PRODUCTS.investments
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get specific product details
router.get('/products/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    let product = null;
    
    // Search in all product categories
    Object.values(BANKING_PRODUCTS).forEach(categoryProducts => {
      const found = categoryProducts.find(p => p.id === productId);
      if (found) product = found;
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
});

// Calculate loan/deposit details
router.post('/calculate', async (req, res, next) => {
  try {
    const { productId, amount, term, paymentFrequency = 'monthly' } = req.body;
    
    let product = null;
    Object.values(BANKING_PRODUCTS).forEach(categoryProducts => {
      const found = categoryProducts.find(p => p.id === productId);
      if (found) product = found;
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    let calculation = {};
    
    if (product.type === 'personal_loan' || product.type === 'home_loan') {
      // Loan calculation
      const annualRate = product.interestRate.min / 100;
      const monthlyRate = annualRate / 12;
      const numPayments = term;
      
      const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                            (Math.pow(1 + monthlyRate, numPayments) - 1);
      
      const totalPayment = monthlyPayment * numPayments;
      const totalInterest = totalPayment - amount;
      
      calculation = {
        type: 'loan',
        loanAmount: amount,
        term: term,
        interestRate: product.interestRate.min,
        monthlyPayment: Math.round(monthlyPayment),
        totalPayment: Math.round(totalPayment),
        totalInterest: Math.round(totalInterest),
        sovTokensEarned: Math.round(totalPayment * (product.sovTokens.monthlyPaymentRate / 100))
      };
      
    } else if (product.type === 'term_deposit') {
      // Term deposit calculation
      const termData = product.terms.find(t => t.months === term);
      if (!termData) {
        return res.status(400).json({ error: 'Invalid term for this product' });
      }
      
      const annualRate = termData.rate / 100;
      const monthlyRate = annualRate / 12;
      const interest = amount * annualRate * (term / 12);
      const maturityAmount = amount + interest;
      
      calculation = {
        type: 'deposit',
        depositAmount: amount,
        term: term,
        interestRate: termData.rate,
        interestEarned: Math.round(interest),
        maturityAmount: Math.round(maturityAmount),
        sovTokensEarned: Math.round((interest * (product.sovTokens.interestRate || 0.1)) + product.sovTokens.maturityBonus)
      };
      
    } else if (product.type === 'savings_account') {
      // Savings account calculation
      const tier = product.interestRate.tiers
        .slice()
        .reverse()
        .find(t => amount >= t.amount);
      
      const annualRate = tier.rate / 100;
      const monthlyInterest = (amount * annualRate) / 12;
      const yearlyInterest = amount * annualRate;
      
      calculation = {
        type: 'savings',
        balance: amount,
        interestRate: tier.rate,
        monthlyInterest: Math.round(monthlyInterest),
        yearlyInterest: Math.round(yearlyInterest),
        sovTokensMonthly: Math.round(amount * (product.sovTokens.monthlyRate / 100))
      };
    }
    
    res.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        type: product.type
      },
      calculation
    });
    
  } catch (error) {
    next(error);
  }
});

// Apply for banking product
router.post('/apply', async (req, res, next) => {
  try {
    const {
      productId,
      applicationData,
      paymentMethod,
      sovTokenAmount,
      fiatAmount,
      bonusTokenPercentage = 0
    } = req.body;
    
    const userId = req.user.id;
    
    // Find product
    let product = null;
    Object.values(BANKING_PRODUCTS).forEach(categoryProducts => {
      const found = categoryProducts.find(p => p.id === productId);
      if (found) product = found;
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Validate application data based on product type
    const validationSchema = getApplicationValidationSchema(product.type);
    const { error, value } = validationSchema.validate(applicationData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Generate application reference
      const applicationRef = `HDB${Date.now().toString().slice(-8)}`;
      
      // Calculate SOV tokens to be earned
      const baseTokens = product.sovTokens.applicationBonus || 0;
      const bonusTokens = Math.floor(baseTokens * (bonusTokenPercentage / 100));
      const totalTokensEarned = baseTokens + bonusTokens;
      
      // Process any fees or initial payments
      let feeAmount = 0;
      if (product.type === 'credit_card') {
        feeAmount = product.annualFee;
      }
      
      if (feeAmount > 0) {
        // Process payment for fees
        if (paymentMethod === 'sov_token') {
          const tokenAmount = Math.floor(feeAmount / 1000); // 1 token = 1000 VND
          
          const balanceResult = await client.query(
            'SELECT balance FROM token_balances WHERE user_id = $1',
            [userId]
          );
          
          if (!balanceResult.rows[0] || parseFloat(balanceResult.rows[0].balance) < tokenAmount) {
            throw new Error('Insufficient SOV token balance');
          }
          
          await client.query(
            'UPDATE token_balances SET balance = balance - $1, total_spent = total_spent + $1 WHERE user_id = $2',
            [tokenAmount, userId]
          );
          
          // Record payment transaction
          await client.query(`
            INSERT INTO transactions (user_id, type, amount, description, service_type, status)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [userId, 'spend', tokenAmount, `${product.name} application fee`, 'hdbank', 'completed']);
        }
      }
      
      // Create application record
      const applicationResult = await client.query(`
        INSERT INTO hdbank_applications (
          user_id, product_id, product_type, application_reference, 
          application_data, fee_amount, status, tokens_earned
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        userId, 
        productId, 
        product.type, 
        applicationRef,
        JSON.stringify(applicationData),
        feeAmount,
        'pending_review',
        totalTokensEarned
      ]);
      
      // Award application bonus tokens
      if (totalTokensEarned > 0) {
        await client.query(
          'UPDATE token_balances SET balance = balance + $1, total_earned = total_earned + $1 WHERE user_id = $2',
          [totalTokensEarned, userId]
        );
        
        // Record token earning transaction
        await client.query(`
          INSERT INTO transactions (user_id, type, amount, description, service_type, status)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [userId, 'earn', totalTokensEarned, `Application bonus for ${product.name}`, 'hdbank', 'completed']);
      }
      
      await client.query('COMMIT');
      
      // Emit real-time notification
      const io = req.app.get('socketio');
      if (io) {
        io.to(`user_${userId}`).emit('application_submitted', {
          applicationRef,
          productName: product.name,
          tokensEarned: totalTokensEarned,
          message: 'Application submitted successfully!',
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        success: true,
        message: 'Application submitted successfully',
        application: {
          id: applicationResult.rows[0].id,
          reference: applicationRef,
          productName: product.name,
          status: 'pending_review',
          tokensEarned: totalTokensEarned,
          bonusTokensEarned: bonusTokens,
          estimatedProcessingTime: getProcessingTime(product.type)
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    next(error);
  }
});

// Get user's banking applications
router.get('/applications', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const result = await db.query(`
      SELECT 
        ha.*,
        (SELECT COUNT(*) FROM hdbank_applications WHERE user_id = $1) as total_count
      FROM hdbank_applications ha
      WHERE ha.user_id = $1
      ORDER BY ha.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    const applications = result.rows.map(app => ({
      id: app.id,
      productId: app.product_id,
      productType: app.product_type,
      reference: app.application_reference,
      status: app.status,
      feeAmount: parseFloat(app.fee_amount),
      tokensEarned: parseFloat(app.tokens_earned),
      createdAt: app.created_at,
      updatedAt: app.updated_at
    }));
    
    const totalCount = result.rows[0]?.total_count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      success: true,
      applications,
      pagination: {
        page,
        limit,
        total: parseInt(totalCount),
        totalPages
      }
    });
    
  } catch (error) {
    next(error);
  }
});

function getApplicationValidationSchema(productType) {
  const baseSchema = {
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    idNumber: Joi.string().required(),
    address: Joi.string().required(),
    occupation: Joi.string().required(),
    monthlyIncome: Joi.number().required()
  };
  
  if (productType === 'personal_loan' || productType === 'home_loan') {
    return Joi.object({
      ...baseSchema,
      loanAmount: Joi.number().required(),
      loanTerm: Joi.number().required(),
      loanPurpose: Joi.string().required(),
      employmentType: Joi.string().required(),
      companyName: Joi.string().required()
    });
  }
  
  if (productType === 'credit_card') {
    return Joi.object({
      ...baseSchema,
      preferredLimit: Joi.number().optional(),
      existingDebts: Joi.number().optional()
    });
  }
  
  return Joi.object(baseSchema);
}

function getProcessingTime(productType) {
  const times = {
    'savings_account': '1-2 business days',
    'credit_card': '3-5 business days',
    'personal_loan': '5-7 business days',
    'home_loan': '10-15 business days',
    'term_deposit': '1 business day',
    'mutual_funds': '2-3 business days'
  };
  
  return times[productType] || '3-5 business days';
}

module.exports = router;

