const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const paymentSchema = Joi.object({
  serviceType: Joi.string().valid('vietjet', 'hdbank', 'resort', 'insurance', 'marketplace').required(),
  baseAmountVnd: Joi.number().positive().required(),
  tokenAmount: Joi.number().positive().required(),
  description: Joi.string().required(),
  serviceReferenceId: Joi.string().optional(),
  paymentMethod: Joi.string().valid('tokens', 'cash', 'hybrid').default('tokens')
});

// Get user loyalty tier and benefits
router.get('/loyalty/tier', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(`
      SELECT * FROM calculate_user_tier($1)
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tier not found' });
    }
    
    const tierInfo = result.rows[0];
    
    res.json({
      success: true,
      tier: {
        name: tierInfo.tier_name,
        level: tierInfo.tier_level,
        bonusMultiplier: tierInfo.bonus_multiplier,
        tokenBonusPercentage: tierInfo.token_bonus_percentage,
        color: tierInfo.tier_color,
        icon: tierInfo.tier_icon,
        specialPerks: tierInfo.special_perks,
        nextTier: tierInfo.next_tier_name,
        progressToNext: tierInfo.progress_to_next
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// Get comprehensive loyalty dashboard
router.get('/loyalty/dashboard', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(`
      SELECT * FROM get_user_loyalty_dashboard($1)
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard data not found' });
    }
    
    const dashboard = result.rows[0];
    
    res.json({
      success: true,
      dashboard: {
        currentTier: dashboard.current_tier,
        nextTier: dashboard.next_tier,
        memberStats: dashboard.member_stats,
        recentBenefits: dashboard.recent_benefits,
        achievementProgress: dashboard.achievement_progress
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// Process enhanced token payment
router.post('/pay', auth, async (req, res, next) => {
  try {
    const { error, value } = paymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const {
      serviceType,
      baseAmountVnd,
      tokenAmount,
      description,
      serviceReferenceId,
      paymentMethod
    } = value;
    
    const userId = req.user.id;
    
    // Process payment with loyalty bonuses
    const result = await db.query(`
      SELECT * FROM process_enhanced_token_payment($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      serviceType,
      baseAmountVnd,
      tokenAmount,
      description,
      serviceReferenceId,
      paymentMethod
    ]);
    
    const paymentResult = result.rows[0];
    
    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        error: paymentResult.message,
        currentBalance: paymentResult.new_balance
      });
    }
    
    res.json({
      success: true,
      message: paymentResult.message,
      transaction: {
        id: paymentResult.transaction_id,
        newBalance: paymentResult.new_balance,
        bonusTokensEarned: paymentResult.bonus_tokens_earned,
        loyaltyDiscount: paymentResult.loyalty_discount,
        tierInfo: paymentResult.tier_info
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// Calculate payment preview with bonuses
router.post('/preview', auth, async (req, res, next) => {
  try {
    const { error, value } = paymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { serviceType, baseAmountVnd, tokenAmount } = value;
    const userId = req.user.id;
    
    // Get user tier
    const tierResult = await db.query(`
      SELECT * FROM calculate_user_tier($1)
    `, [userId]);
    
    const tierInfo = tierResult.rows[0];
    
    // Calculate preview
    let bonusTokens = 0;
    let loyaltyDiscount = 0;
    let finalTokenCost = tokenAmount;
    
    if (tierInfo.tier_level > 1) {
      // Calculate loyalty discount
      loyaltyDiscount = baseAmountVnd * (tierInfo.tier_level - 1) * 0.01;
      
      // Calculate bonus tokens for earning services
      if (['vietjet', 'hdbank', 'resort', 'insurance'].includes(serviceType)) {
        bonusTokens = tokenAmount * (tierInfo.token_bonus_percentage / 100.0);
      }
      
      // Reduce token cost by loyalty discount
      finalTokenCost = tokenAmount * (1 - (loyaltyDiscount / baseAmountVnd));
    }
    
    // Get current balance
    const balanceResult = await db.query(`
      SELECT balance FROM token_balances WHERE user_id = $1
    `, [userId]);
    
    const currentBalance = balanceResult.rows[0]?.balance || 0;
    const canAfford = currentBalance >= finalTokenCost;
    
    res.json({
      success: true,
      preview: {
        originalTokenCost: tokenAmount,
        finalTokenCost: finalTokenCost,
        bonusTokensEarned: bonusTokens,
        loyaltyDiscountVnd: loyaltyDiscount,
        currentBalance: currentBalance,
        canAfford: canAfford,
        savingsPercentage: loyaltyDiscount > 0 ? ((loyaltyDiscount / baseAmountVnd) * 100) : 0,
        tierInfo: {
          name: tierInfo.tier_name,
          level: tierInfo.tier_level,
          color: tierInfo.tier_color,
          icon: tierInfo.tier_icon,
          bonusMultiplier: tierInfo.bonus_multiplier,
          tokenBonusPercentage: tierInfo.token_bonus_percentage
        }
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// Get payment history with loyalty benefits
router.get('/history', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    
    const result = await db.query(`
      SELECT 
        pt.*,
        CASE 
          WHEN pt.bonus_tokens > 0 OR pt.loyalty_discount_vnd > 0 THEN true
          ELSE false
        END as had_loyalty_benefits
      FROM payment_transactions pt
      WHERE pt.user_id = $1
      ORDER BY pt.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    const countResult = await db.query(`
      SELECT COUNT(*) as total FROM payment_transactions WHERE user_id = $1
    `, [userId]);
    
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      success: true,
      payments: result.rows.map(payment => ({
        id: payment.id,
        serviceType: payment.service_type,
        baseAmount: payment.base_amount,
        tokenAmount: payment.token_amount,
        bonusTokens: payment.bonus_tokens,
        loyaltyDiscount: payment.loyalty_discount_vnd,
        tierAtTime: payment.user_tier_at_time,
        status: payment.status,
        hadLoyaltyBenefits: payment.had_loyalty_benefits,
        createdAt: payment.created_at,
        metadata: payment.transaction_metadata
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// Get all available loyalty tiers (for information display)
router.get('/loyalty/tiers', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        tier_name,
        tier_level,
        min_days_member,
        min_total_spent,
        min_transactions,
        bonus_multiplier,
        token_bonus_percentage,
        tier_color,
        tier_icon,
        special_perks
      FROM loyalty_tiers
      ORDER BY tier_level ASC
    `);
    
    res.json({
      success: true,
      tiers: result.rows.map(tier => ({
        name: tier.tier_name,
        level: tier.tier_level,
        requirements: {
          minDaysMember: tier.min_days_member,
          minTotalSpent: tier.min_total_spent,
          minTransactions: tier.min_transactions
        },
        benefits: {
          bonusMultiplier: tier.bonus_multiplier,
          tokenBonusPercentage: tier.token_bonus_percentage,
          specialPerks: tier.special_perks
        },
        design: {
          color: tier.tier_color,
          icon: tier.tier_icon
        }
      }))
    });
    
  } catch (error) {
    next(error);
  }
});

// Get loyalty statistics for admin
router.get('/admin/loyalty/stats', auth, async (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const result = await db.query(`
      SELECT 
        lt.tier_name,
        lt.tier_level,
        COUNT(mb.user_id) as user_count,
        AVG(mb.total_spent_lifetime) as avg_spent,
        SUM(mb.total_bonus_earned) as total_bonuses_given
      FROM loyalty_tiers lt
      LEFT JOIN member_benefits mb ON mb.tier_id = lt.id
      GROUP BY lt.id, lt.tier_name, lt.tier_level
      ORDER BY lt.tier_level ASC
    `);
    
    res.json({
      success: true,
      statistics: result.rows
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;


