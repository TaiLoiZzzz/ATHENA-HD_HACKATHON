const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Unified payment offers
const unifiedOffers = [
  {
    id: 'travel-banking-combo',
    title: 'Travel + Banking Combo',
    description: 'Book flight and get instant credit card approval with SOV rewards',
    services: ['vietjet', 'hdbank'],
    originalPrice: 5000000,
    sovPrice: 450,
    discount: 15,
    validUntil: '2024-12-31',
    features: [
      'Round-trip flight booking',
      'HDBank credit card with 50M limit',
      'Free travel insurance',
      '3x SOV rewards on all purchases',
    ],
    components: {
      vietjet: {
        type: 'flight_booking',
        value: 3000000,
        sovValue: 270,
      },
      hdbank: {
        type: 'credit_card_application',
        value: 2000000,
        sovValue: 180,
      }
    }
  },
  {
    id: 'prime-ecosystem',
    title: 'ATHENA Prime Ecosystem',
    description: 'Unlock premium benefits across all Sovico services',
    services: ['hdbank', 'vietjet', 'marketplace'],
    originalPrice: 2000000,
    sovPrice: 180,
    discount: 10,
    validUntil: '2024-12-31',
    features: [
      '1.5x SOV earning rate',
      'Priority customer service',
      'Exclusive deals and offers',
      'Monthly bonus tokens',
    ],
    components: {
      prime_upgrade: {
        type: 'athena_prime',
        value: 2000000,
        sovValue: 180,
        duration: '1 year'
      }
    }
  },
];

// Get all unified offers
router.get('/offers', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's current services to personalize offers
    const userServices = await db.query(`
      SELECT DISTINCT service_type 
      FROM service_bookings 
      WHERE user_id = $1 AND status != 'cancelled'
    `, [userId]);

    const usedServices = userServices.rows.map(row => row.service_type);
    
    // Filter and enhance offers based on user's history
    const personalizedOffers = unifiedOffers.map(offer => ({
      ...offer,
      isRecommended: offer.services.some(service => usedServices.includes(service)),
      userDiscount: usedServices.length >= 2 ? 5 : 0, // Extra discount for multi-service users
    }));

    res.json({
      offers: personalizedOffers,
      userServices: usedServices,
      totalOffers: unifiedOffers.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's cross-service statistics
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get comprehensive stats across all services
    const statsQuery = await db.query(`
      SELECT 
        COUNT(DISTINCT service_type) as services_used,
        SUM(total_amount) as total_spent,
        COUNT(*) as total_bookings,
        AVG(total_amount) as avg_spending
      FROM service_bookings 
      WHERE user_id = $1 AND status != 'cancelled'
    `, [userId]);

    const tokenStats = await db.query(`
      SELECT 
        balance,
        total_earned,
        total_spent,
        (total_earned - total_spent) as net_tokens
      FROM token_balances 
      WHERE user_id = $1
    `, [userId]);

    // Calculate savings from SOV usage
    const sovSavingsQuery = await db.query(`
      SELECT 
        COUNT(*) as sov_transactions,
        SUM(amount) as total_sov_used
      FROM transactions 
      WHERE user_id = $1 AND type = 'spend'
    `, [userId]);

    const stats = statsQuery.rows[0];
    const tokens = tokenStats.rows[0] || { balance: 0, total_earned: 0, total_spent: 0, net_tokens: 0 };
    const sovSavings = sovSavingsQuery.rows[0];

    // Calculate estimated savings (assuming 10% average discount with SOV)
    const estimatedSavings = (sovSavings.total_sov_used || 0) * 10000 * 0.1;

    res.json({
      servicesUsed: parseInt(stats.services_used) || 0,
      totalSpent: parseFloat(stats.total_spent) || 0,
      totalBookings: parseInt(stats.total_bookings) || 0,
      avgSpending: parseFloat(stats.avg_spending) || 0,
      sovBalance: parseFloat(tokens.balance) || 0,
      sovEarned: parseFloat(tokens.total_earned) || 0,
      sovSpent: parseFloat(tokens.total_spent) || 0,
      estimatedSavings: estimatedSavings,
      nextMilestone: {
        target: Math.ceil((parseFloat(tokens.total_earned) || 0) / 500) * 500,
        current: parseFloat(tokens.total_earned) || 0,
        reward: 'Bonus 50 SOV tokens'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Process unified payment
router.post('/pay', async (req, res, next) => {
  try {
    const { offerId, paymentDetails, selectedComponents } = req.body;
    const userId = req.user.id;

    if (!offerId) {
      return res.status(400).json({ error: 'Offer ID is required' });
    }

    const offer = unifiedOffers.find(o => o.id === offerId);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Check if offer is still valid
    if (new Date() > new Date(offer.validUntil)) {
      return res.status(400).json({ error: 'Offer has expired' });
    }

    // Check user's SOV balance
    const balanceResult = await db.query(
      'SELECT balance FROM token_balances WHERE user_id = $1',
      [userId]
    );

    const userBalance = parseFloat(balanceResult.rows[0]?.balance || 0);
    if (userBalance < offer.sovPrice) {
      return res.status(400).json({ 
        error: 'Insufficient SOV token balance',
        required: offer.sovPrice,
        available: userBalance
      });
    }

    // Start database transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      const unifiedPaymentId = uuidv4();
      
      // Create unified payment record
      await client.query(`
        INSERT INTO unified_payments (
          id, user_id, offer_id, offer_title, total_sov_amount,
          total_vnd_amount, services, components, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      `, [
        unifiedPaymentId,
        userId,
        offerId,
        offer.title,
        offer.sovPrice,
        offer.originalPrice,
        JSON.stringify(offer.services),
        JSON.stringify(selectedComponents || offer.components),
        'processing'
      ]);

      // Deduct SOV tokens
      await client.query(
        'UPDATE token_balances SET balance = balance - $1, total_spent = total_spent + $1 WHERE user_id = $2',
        [offer.sovPrice, userId]
      );

      // Create transaction record
      const transactionId = uuidv4();
      await client.query(`
        INSERT INTO transactions (
          id, user_id, type, amount, description, 
          service_type, service_reference_id, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        transactionId,
        userId,
        'spend',
        offer.sovPrice,
        `Unified payment: ${offer.title}`,
        'sovico',
        unifiedPaymentId,
        'completed'
      ]);

      // Process individual service components
      const processedComponents = {};
      
      for (const [componentKey, component] of Object.entries(offer.components)) {
        if (component.type === 'athena_prime') {
          // Upgrade user to ATHENA Prime
          await client.query(
            'UPDATE users SET athena_prime = true, prime_expires_at = NOW() + INTERVAL \'1 year\' WHERE id = $1',
            [userId]
          );
          processedComponents[componentKey] = {
            status: 'completed',
            details: 'ATHENA Prime activated for 1 year'
          };
        } else if (component.type === 'flight_booking') {
          // Create flight booking placeholder (to be completed by user)
          const bookingId = uuidv4();
          await client.query(`
            INSERT INTO service_bookings (
              id, user_id, service_type, booking_reference, 
              total_amount, booking_details, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          `, [
            bookingId,
            userId,
            'vietjet',
            `SOVICO-${Date.now()}`,
            component.value,
            JSON.stringify({
              type: 'unified_offer_credit',
              unifiedPaymentId,
              creditAmount: component.value,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }),
            'credit_available'
          ]);
          processedComponents[componentKey] = {
            status: 'credit_issued',
            bookingId,
            creditAmount: component.value,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          };
        } else if (component.type === 'credit_card_application') {
          // Create HDBank service application
          const applicationId = uuidv4();
          await client.query(`
            INSERT INTO service_bookings (
              id, user_id, service_type, booking_reference, 
              total_amount, booking_details, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          `, [
            applicationId,
            userId,
            'hdbank',
            `SOVICO-CC-${Date.now()}`,
            component.value,
            JSON.stringify({
              type: 'unified_offer_application',
              unifiedPaymentId,
              productType: 'credit_card',
              preApproved: true,
              creditLimit: 50000000
            }),
            'pre_approved'
          ]);
          processedComponents[componentKey] = {
            status: 'pre_approved',
            applicationId,
            creditLimit: 50000000
          };
        }
      }

      // Update unified payment status
      await client.query(
        'UPDATE unified_payments SET status = $1, processed_components = $2, processed_at = NOW() WHERE id = $3',
        ['completed', JSON.stringify(processedComponents), unifiedPaymentId]
      );

      // Award bonus tokens for unified purchase (5% bonus)
      const bonusTokens = Math.floor(offer.sovPrice * 0.05);
      if (bonusTokens > 0) {
        await client.query(
          'UPDATE token_balances SET balance = balance + $1, total_earned = total_earned + $1 WHERE user_id = $2',
          [bonusTokens, userId]
        );

        await client.query(`
          INSERT INTO transactions (
            id, user_id, type, amount, description, 
            service_type, service_reference_id, status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, [
          uuidv4(),
          userId,
          'earn',
          bonusTokens,
          'Unified payment bonus (5%)',
          'sovico',
          unifiedPaymentId,
          'completed'
        ]);
      }

      await client.query('COMMIT');

      // Emit real-time update
      const io = req.app.get('socketio');
      if (io) {
        io.to(`user_${userId}`).emit('unified_payment_completed', {
          paymentId: unifiedPaymentId,
          offer: offer.title,
          amount: offer.sovPrice,
          components: processedComponents,
          bonusTokens
        });
      }

      res.json({
        success: true,
        paymentId: unifiedPaymentId,
        offer: {
          id: offerId,
          title: offer.title,
          sovPrice: offer.sovPrice,
        },
        processedComponents,
        bonusTokens,
        message: 'Unified payment completed successfully!'
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

// Get user's unified payment history
router.get('/payments', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const paymentsResult = await db.query(`
      SELECT 
        id,
        offer_id,
        offer_title,
        total_sov_amount,
        total_vnd_amount,
        services,
        components,
        processed_components,
        status,
        created_at,
        processed_at
      FROM unified_payments 
      WHERE user_id = $1
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const countResult = await db.query(
      'SELECT COUNT(*) FROM unified_payments WHERE user_id = $1',
      [userId]
    );

    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      payments: paymentsResult.rows.map(payment => ({
        id: payment.id,
        offerId: payment.offer_id,
        title: payment.offer_title,
        sovAmount: parseFloat(payment.total_sov_amount),
        vndAmount: parseFloat(payment.total_vnd_amount),
        services: payment.services,
        components: payment.components,
        processedComponents: payment.processed_components,
        status: payment.status,
        createdAt: payment.created_at,
        processedAt: payment.processed_at,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get Sovico ecosystem benefits and features
router.get('/benefits', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user's ATHENA Prime status
    const userResult = await db.query(
      'SELECT athena_prime, prime_expires_at FROM users WHERE id = $1',
      [userId]
    );
    
    const user = userResult.rows[0];
    const isAthenaPrime = user?.athena_prime || false;
    const primeExpiresAt = user?.prime_expires_at;

    const benefits = {
      universal: [
        'Pay with SOV tokens across all Sovico services',
        'Earn SOV rewards on every transaction',
        'Unified transaction history',
        'Cross-service promotions and deals',
        'Single sign-on across platforms',
      ],
      prime: [
        '1.5x SOV earning multiplier',
        'Priority customer support',
        'Exclusive deals and early access',
        'Monthly bonus SOV tokens',
        'VIP treatment across services',
        'Advanced analytics and insights',
      ],
      services: {
        hdbank: [
          'Reduced processing fees with SOV',
          'Instant loan pre-approvals',
          'Premium credit card offers',
          'Investment opportunities',
        ],
        vietjet: [
          'Flight booking discounts',
          'Free baggage upgrades',
          'Airport lounge access',
          'Priority boarding',
        ],
        marketplace: [
          'Zero trading fees for SOV',
          'Exclusive NFT collections',
          'Early access to new tokens',
          'VIP marketplace features',
        ]
      }
    };

    res.json({
      benefits,
      userStatus: {
        isAthenaPrime,
        primeExpiresAt,
        primeTimeRemaining: primeExpiresAt ? Math.max(0, new Date(primeExpiresAt) - new Date()) : null,
      },
      ecosystem: {
        totalServices: 3,
        activeServices: ['hdbank', 'vietjet', 'marketplace'],
        upcomingServices: ['insurance', 'real-estate', 'entertainment'],
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

