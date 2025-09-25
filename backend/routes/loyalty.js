const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Loyalty tier configuration
const LOYALTY_TIERS = {
  bronze: { minPoints: 0, multiplier: 1.0, name: 'Bronze', benefits: ['Basic rewards', 'Standard support'] },
  silver: { minPoints: 1000, multiplier: 1.2, name: 'Silver', benefits: ['20% bonus rewards', 'Priority support', 'Monthly bonus'] },
  gold: { minPoints: 5000, multiplier: 1.5, name: 'Gold', benefits: ['50% bonus rewards', 'VIP support', 'Exclusive offers', 'Free services'] },
  platinum: { minPoints: 20000, multiplier: 2.0, name: 'Platinum', benefits: ['100% bonus rewards', 'Personal advisor', 'Premium benefits', 'Early access'] }
};

// Cross-service bonus configuration
const CROSS_SERVICE_BONUSES = {
  two_services: { multiplier: 1.1, bonus: 50, description: 'Use 2 services in a month' },
  three_services: { multiplier: 1.25, bonus: 150, description: 'Use all 3 services in a month' },
  unified_payment: { multiplier: 1.15, bonus: 100, description: 'Use unified payment system' },
  prime_user: { multiplier: 1.5, bonus: 200, description: 'ATHENA Prime member' },
  consecutive_months: { multiplier: 1.3, bonus: 300, description: 'Active for 3+ consecutive months' }
};

// Get user's loyalty status and statistics
router.get('/status', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get or create user loyalty stats
    let statsResult = await db.query(
      'SELECT * FROM sovico_ecosystem_stats WHERE user_id = $1',
      [userId]
    );

    if (statsResult.rows.length === 0) {
      // Create initial stats
      await db.query(`
        INSERT INTO sovico_ecosystem_stats (user_id, services_used, loyalty_tier, tier_points)
        VALUES ($1, '{}', 'bronze', 0)
      `, [userId]);
      
      statsResult = await db.query(
        'SELECT * FROM sovico_ecosystem_stats WHERE user_id = $1',
        [userId]
      );
    }

    const stats = statsResult.rows[0];
    const currentTier = LOYALTY_TIERS[stats.loyalty_tier];
    
    // Calculate next tier
    const nextTierName = Object.keys(LOYALTY_TIERS).find(tier => 
      LOYALTY_TIERS[tier].minPoints > stats.tier_points
    );
    const nextTier = nextTierName ? LOYALTY_TIERS[nextTierName] : null;

    // Get recent activity for cross-service bonuses
    const recentActivity = await db.query(`
      SELECT 
        service_type,
        COUNT(*) as transaction_count,
        MAX(created_at) as last_transaction
      FROM service_bookings 
      WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL '30 days'
        AND status NOT IN ('cancelled', 'failed')
      GROUP BY service_type
    `, [userId]);

    const servicesUsedThisMonth = recentActivity.rows.length;
    const availableBonuses = [];

    // Check for cross-service bonuses
    if (servicesUsedThisMonth >= 2) {
      availableBonuses.push({
        type: 'two_services',
        ...CROSS_SERVICE_BONUSES.two_services,
        eligible: true
      });
    }

    if (servicesUsedThisMonth >= 3) {
      availableBonuses.push({
        type: 'three_services',
        ...CROSS_SERVICE_BONUSES.three_services,
        eligible: true
      });
    }

    // Check for ATHENA Prime bonus
    const userResult = await db.query(
      'SELECT athena_prime FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows[0]?.athena_prime) {
      availableBonuses.push({
        type: 'prime_user',
        ...CROSS_SERVICE_BONUSES.prime_user,
        eligible: true
      });
    }

    // Check for consecutive months bonus
    const consecutiveMonths = await db.query(`
      SELECT COUNT(*) as months
      FROM (
        SELECT DATE_TRUNC('month', created_at) as month
        FROM service_bookings 
        WHERE user_id = $1 
          AND status NOT IN ('cancelled', 'failed')
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
        LIMIT 3
      ) recent_months
    `, [userId]);

    if (parseInt(consecutiveMonths.rows[0].months) >= 3) {
      availableBonuses.push({
        type: 'consecutive_months',
        ...CROSS_SERVICE_BONUSES.consecutive_months,
        eligible: true
      });
    }

    res.json({
      currentTier: {
        name: currentTier.name,
        level: stats.loyalty_tier,
        points: parseInt(stats.tier_points),
        multiplier: currentTier.multiplier,
        benefits: currentTier.benefits
      },
      nextTier: nextTier ? {
        name: nextTier.name,
        level: nextTierName,
        pointsNeeded: nextTier.minPoints - stats.tier_points,
        benefits: nextTier.benefits
      } : null,
      stats: {
        totalUnifiedPayments: parseInt(stats.total_unified_payments),
        totalUnifiedAmount: parseFloat(stats.total_unified_amount),
        totalCrossRewards: parseFloat(stats.total_cross_rewards),
        servicesUsed: stats.services_used || [],
        servicesUsedThisMonth,
        firstServiceDate: stats.first_service_date,
        lastActivityDate: stats.last_activity_date
      },
      availableBonuses,
      recentActivity: recentActivity.rows.map(activity => ({
        service: activity.service_type,
        transactionCount: parseInt(activity.transaction_count),
        lastTransaction: activity.last_transaction
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Claim cross-service bonus
router.post('/claim-bonus', async (req, res, next) => {
  try {
    const { bonusType } = req.body;
    const userId = req.user.id;

    if (!bonusType || !CROSS_SERVICE_BONUSES[bonusType]) {
      return res.status(400).json({ error: 'Invalid bonus type' });
    }

    const bonus = CROSS_SERVICE_BONUSES[bonusType];

    // Check if user has already claimed this bonus recently
    const existingClaim = await db.query(`
      SELECT id FROM cross_service_rewards 
      WHERE user_id = $1 
        AND reward_type = $2 
        AND created_at >= NOW() - INTERVAL '30 days'
        AND status = 'awarded'
    `, [userId, bonusType]);

    if (existingClaim.rows.length > 0) {
      return res.status(400).json({ error: 'Bonus already claimed this month' });
    }

    // Verify eligibility based on bonus type
    let eligible = false;
    let servicesCombination = [];

    switch (bonusType) {
      case 'two_services':
      case 'three_services':
        const recentServices = await db.query(`
          SELECT DISTINCT service_type
          FROM service_bookings 
          WHERE user_id = $1 
            AND created_at >= NOW() - INTERVAL '30 days'
            AND status NOT IN ('cancelled', 'failed')
        `, [userId]);
        
        servicesCombination = recentServices.rows.map(row => row.service_type);
        eligible = servicesCombination.length >= (bonusType === 'two_services' ? 2 : 3);
        break;

      case 'unified_payment':
        const unifiedPayments = await db.query(`
          SELECT COUNT(*) as count
          FROM unified_payments 
          WHERE user_id = $1 
            AND created_at >= NOW() - INTERVAL '30 days'
            AND status = 'completed'
        `, [userId]);
        
        eligible = parseInt(unifiedPayments.rows[0].count) > 0;
        servicesCombination = ['sovico'];
        break;

      case 'prime_user':
        const userResult = await db.query(
          'SELECT athena_prime FROM users WHERE id = $1',
          [userId]
        );
        eligible = userResult.rows[0]?.athena_prime || false;
        servicesCombination = ['athena_prime'];
        break;

      case 'consecutive_months':
        const consecutiveCheck = await db.query(`
          SELECT COUNT(*) as months
          FROM (
            SELECT DATE_TRUNC('month', created_at) as month
            FROM service_bookings 
            WHERE user_id = $1 
              AND status NOT IN ('cancelled', 'failed')
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month DESC
            LIMIT 3
          ) recent_months
        `, [userId]);
        
        eligible = parseInt(consecutiveCheck.rows[0].months) >= 3;
        servicesCombination = ['consecutive_activity'];
        break;
    }

    if (!eligible) {
      return res.status(400).json({ error: 'Not eligible for this bonus' });
    }

    // Start database transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      const rewardId = uuidv4();
      
      // Create cross-service reward record
      await client.query(`
        INSERT INTO cross_service_rewards (
          id, user_id, reward_type, service_combination, 
          base_amount, bonus_amount, total_amount, status, awarded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        rewardId,
        userId,
        bonusType,
        servicesCombination,
        0,
        bonus.bonus,
        bonus.bonus,
        'awarded'
      ]);

      // Award SOV tokens
      await client.query(`
        INSERT INTO token_balances (user_id, balance, total_earned)
        VALUES ($1, $2, $2)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          balance = token_balances.balance + $2,
          total_earned = token_balances.total_earned + $2,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, bonus.bonus]);

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
        'earn',
        bonus.bonus,
        `Cross-service bonus: ${bonus.description}`,
        'loyalty',
        rewardId,
        'completed'
      ]);

      // Update loyalty points
      const pointsEarned = Math.floor(bonus.bonus * 0.1); // 10% of bonus as points
      await client.query(`
        UPDATE sovico_ecosystem_stats 
        SET 
          total_cross_rewards = total_cross_rewards + $2,
          tier_points = tier_points + $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [userId, bonus.bonus, pointsEarned]);

      // Check for tier upgrade
      const updatedStats = await client.query(
        'SELECT tier_points, loyalty_tier FROM sovico_ecosystem_stats WHERE user_id = $1',
        [userId]
      );

      const currentPoints = parseInt(updatedStats.rows[0].tier_points);
      const currentTier = updatedStats.rows[0].loyalty_tier;
      
      let newTier = currentTier;
      for (const [tierName, tierData] of Object.entries(LOYALTY_TIERS)) {
        if (currentPoints >= tierData.minPoints && tierData.minPoints > LOYALTY_TIERS[currentTier].minPoints) {
          newTier = tierName;
        }
      }

      if (newTier !== currentTier) {
        await client.query(
          'UPDATE sovico_ecosystem_stats SET loyalty_tier = $1 WHERE user_id = $2',
          [newTier, userId]
        );
      }

      await client.query('COMMIT');

      // Emit real-time update
      const io = req.app.get('socketio');
      if (io) {
        io.to(`user_${userId}`).emit('bonus_claimed', {
          bonusType,
          amount: bonus.bonus,
          pointsEarned,
          newTier: newTier !== currentTier ? newTier : null
        });
      }

      res.json({
        success: true,
        reward: {
          id: rewardId,
          type: bonusType,
          description: bonus.description,
          amount: bonus.bonus,
          pointsEarned
        },
        tierUpgrade: newTier !== currentTier ? {
          from: currentTier,
          to: newTier,
          benefits: LOYALTY_TIERS[newTier].benefits
        } : null
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

// Get user's loyalty history
router.get('/history', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const historyResult = await db.query(`
      SELECT 
        id,
        reward_type,
        service_combination,
        base_amount,
        bonus_amount,
        total_amount,
        status,
        created_at,
        awarded_at
      FROM cross_service_rewards 
      WHERE user_id = $1
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const countResult = await db.query(
      'SELECT COUNT(*) FROM cross_service_rewards WHERE user_id = $1',
      [userId]
    );

    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      rewards: historyResult.rows.map(reward => ({
        id: reward.id,
        type: reward.reward_type,
        description: CROSS_SERVICE_BONUSES[reward.reward_type]?.description || reward.reward_type,
        serviceCombination: reward.service_combination,
        baseAmount: parseFloat(reward.base_amount),
        bonusAmount: parseFloat(reward.bonus_amount),
        totalAmount: parseFloat(reward.total_amount),
        status: reward.status,
        createdAt: reward.created_at,
        awardedAt: reward.awarded_at
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

// Get loyalty program information
router.get('/program-info', async (req, res, next) => {
  try {
    res.json({
      tiers: Object.entries(LOYALTY_TIERS).map(([key, tier]) => ({
        level: key,
        name: tier.name,
        minPoints: tier.minPoints,
        multiplier: tier.multiplier,
        benefits: tier.benefits
      })),
      crossServiceBonuses: Object.entries(CROSS_SERVICE_BONUSES).map(([key, bonus]) => ({
        type: key,
        description: bonus.description,
        multiplier: bonus.multiplier,
        bonusAmount: bonus.bonus
      })),
      howItWorks: [
        'Use multiple Sovico services to earn cross-service bonuses',
        'Accumulate loyalty points to unlock higher tiers',
        'Higher tiers provide better rewards and exclusive benefits',
        'ATHENA Prime members get additional multipliers',
        'Unified payments provide extra bonus rewards'
      ]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

