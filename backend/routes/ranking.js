const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { getDemoUser, isDemoUser } = require('../demo-users');

const router = express.Router();

// Get user ranking information
router.get('/user-rank', async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const userEmail = req.user?.email;
    
    if (!userId && !userEmail) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if this is a demo user
    if (userEmail && isDemoUser(userEmail)) {
      const demoUser = getDemoUser(userEmail);
      if (demoUser) {
        const ranking = {
          rank: {
            name: demoUser.rank.name,
            level: demoUser.rank.level,
            icon: demoUser.rank.name === 'Diamond' ? '💎' :
                  demoUser.rank.name === 'Gold' ? '🥇' :
                  demoUser.rank.name === 'Silver' ? '🥈' : '🥉',
            color: demoUser.rank.name === 'Diamond' ? '#3B82F6' :
                   demoUser.rank.name === 'Gold' ? '#F59E0B' :
                   demoUser.rank.name === 'Silver' ? '#6B7280' : '#F97316',
            benefits: [
              `${demoUser.rank.name} tier benefits`,
              'Exclusive bonus rates',
              'Priority customer support',
              'Special promotions'
            ]
          },
          totalPoints: demoUser.rank.points,
          totalSpent: demoUser.rank.totalSpent,
          totalTransactions: demoUser.rank.totalTransactions,
          servicesUsed: demoUser.rank.servicesUsed,
          achievements: demoUser.rank.achievements,
          nextRankPoints: demoUser.rank.nextRankPoints,
          bonusMultiplier: demoUser.rank.name === 'Diamond' ? 2.0 :
                          demoUser.rank.name === 'Gold' ? 1.5 :
                          demoUser.rank.name === 'Silver' ? 1.2 : 1.0
        };

        return res.json({
          success: true,
          ranking
        });
      }
    }

    // Get user ranking progress with rank details
    const rankingQuery = `
      SELECT 
        urp.*,
        ur.name as rank_name,
        ur.level as rank_level,
        ur.bonus_multiplier,
        ur.icon as rank_icon,
        ur.color as rank_color,
        ur.benefits,
        ur.min_points as current_rank_min_points,
        ur.max_points as current_rank_max_points,
        next_rank.name as next_rank_name,
        next_rank.min_points as next_rank_min_points,
        next_rank.icon as next_rank_icon,
        next_rank.color as next_rank_color
      FROM user_ranking_progress urp
      JOIN user_ranks ur ON urp.current_rank_id = ur.id
      LEFT JOIN user_ranks next_rank ON next_rank.level = ur.level + 1
      WHERE urp.user_id = $1
    `;

    const result = await db.query(rankingQuery, [userId]);
    
    if (result.rows.length === 0) {
      // Initialize user with Bronze rank if not exists
      const bronzeRank = await db.query('SELECT * FROM user_ranks WHERE level = 1');
      
      if (bronzeRank.rows.length > 0) {
        await db.query(`
          INSERT INTO user_ranking_progress (user_id, current_rank_id, total_points, total_spent, total_transactions)
          VALUES ($1, $2, 0, 0, 0)
        `, [userId, bronzeRank.rows[0].id]);
        
        // Fetch again
        const newResult = await db.query(rankingQuery, [userId]);
        
        if (newResult.rows.length > 0) {
          const ranking = newResult.rows[0];
          return res.json({
            success: true,
            ranking: {
              currentRank: {
                name: ranking.rank_name,
                level: ranking.rank_level,
                icon: ranking.rank_icon,
                color: ranking.rank_color,
                bonusMultiplier: parseFloat(ranking.bonus_multiplier),
                benefits: ranking.benefits,
                minPoints: ranking.current_rank_min_points,
                maxPoints: ranking.current_rank_max_points
              },
              progress: {
                totalPoints: ranking.total_points,
                totalSpent: parseFloat(ranking.total_spent || 0),
                totalTransactions: ranking.total_transactions,
                servicesUsed: ranking.services_used || {},
                pointsToNextRank: ranking.next_rank_min_points ? ranking.next_rank_min_points - ranking.total_points : 0
              },
              nextRank: ranking.next_rank_name ? {
                name: ranking.next_rank_name,
                minPoints: ranking.next_rank_min_points,
                icon: ranking.next_rank_icon,
                color: ranking.next_rank_color
              } : null
            }
          });
        }
      }
      
      return res.status(404).json({ error: 'Unable to initialize user ranking' });
    }

    const ranking = result.rows[0];

    res.json({
      success: true,
      ranking: {
        currentRank: {
          name: ranking.rank_name,
          level: ranking.rank_level,
          icon: ranking.rank_icon,
          color: ranking.rank_color,
          bonusMultiplier: parseFloat(ranking.bonus_multiplier),
          benefits: ranking.benefits,
          minPoints: ranking.current_rank_min_points,
          maxPoints: ranking.current_rank_max_points
        },
        progress: {
          totalPoints: ranking.total_points,
          totalSpent: parseFloat(ranking.total_spent || 0),
          totalTransactions: ranking.total_transactions,
          servicesUsed: ranking.services_used || {},
          pointsToNextRank: ranking.next_rank_min_points ? ranking.next_rank_min_points - ranking.total_points : 0
        },
        nextRank: ranking.next_rank_name ? {
          name: ranking.next_rank_name,
          minPoints: ranking.next_rank_min_points,
          icon: ranking.next_rank_icon,
          color: ranking.next_rank_color
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get service bonus preview for user's rank
router.get('/service-bonus/:serviceType', async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const userEmail = req.user?.email;
    const { serviceType } = req.params;
    const { amount = 0, category } = req.query;

    if (!userId && !userEmail) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if this is a demo user
    if (userEmail && isDemoUser(userEmail)) {
      const demoUser = getDemoUser(userEmail);
      if (demoUser) {
        const baseBonus = demoUser.rank.name === 'Diamond' ? 25 :
                         demoUser.rank.name === 'Gold' ? 15 :
                         demoUser.rank.name === 'Silver' ? 10 : 5;
        
        const multiplier = demoUser.rank.name === 'Diamond' ? 2.0 :
                          demoUser.rank.name === 'Gold' ? 1.5 :
                          demoUser.rank.name === 'Silver' ? 1.2 : 1.0;

        const calculatedBonus = Math.round(baseBonus * multiplier);
        
        return res.json({
          success: true,
          userRank: demoUser.rank.name,
          bonusAmount: calculatedBonus,
          message: `🎉 Bạn sẽ nhận được ${calculatedBonus} SOV với rank ${demoUser.rank.name}!`,
          multiplier: multiplier
        });
      }
    }

    // Get user's current rank
    const userRankQuery = `
      SELECT ur.id, ur.name, ur.level, ur.bonus_multiplier
      FROM user_ranking_progress urp
      JOIN user_ranks ur ON urp.current_rank_id = ur.id
      WHERE urp.user_id = $1
    `;

    const userRankResult = await db.query(userRankQuery, [userId]);
    
    if (userRankResult.rows.length === 0) {
      return res.status(404).json({ error: 'User ranking not found' });
    }

    const userRank = userRankResult.rows[0];

    // Get service bonus configuration for user's rank
    let bonusQuery = `
      SELECT 
        sbc.*,
        ur.name as rank_name,
        ur.color as rank_color,
        ur.icon as rank_icon
      FROM service_bonus_config sbc
      JOIN user_ranks ur ON sbc.rank_id = ur.id
      WHERE sbc.service_type = $1 
        AND sbc.rank_id = $2 
        AND sbc.is_active = true
    `;
    
    const queryParams = [serviceType, userRank.id];
    
    if (category) {
      bonusQuery += ' AND sbc.service_category = $3';
      queryParams.push(category);
    }

    bonusQuery += ' ORDER BY sbc.created_at DESC LIMIT 1';

    const bonusResult = await db.query(bonusQuery, queryParams);

    if (bonusResult.rows.length === 0) {
      return res.json({
        success: true,
        bonus: {
          eligible: false,
          message: 'Không có bonus cho dịch vụ này',
          userRank: {
            name: userRank.name,
            level: userRank.level
          }
        }
      });
    }

    const bonusConfig = bonusResult.rows[0];
    const transactionAmount = parseFloat(amount);

    // Calculate bonus
    let calculatedBonus = parseFloat(bonusConfig.base_bonus_amount);
    
    if (bonusConfig.bonus_percentage && transactionAmount > 0) {
      const percentageBonus = (transactionAmount * parseFloat(bonusConfig.bonus_percentage)) / 100;
      calculatedBonus += percentageBonus;
    }

    // Apply max bonus limit
    if (bonusConfig.max_bonus_per_transaction && calculatedBonus > parseFloat(bonusConfig.max_bonus_per_transaction)) {
      calculatedBonus = parseFloat(bonusConfig.max_bonus_per_transaction);
    }

    // Check minimum spending requirement
    const meetsMinSpending = transactionAmount >= parseFloat(bonusConfig.min_spending_required || 0);

    res.json({
      success: true,
      bonus: {
        eligible: meetsMinSpending,
        amount: Math.round(calculatedBonus * 100) / 100, // Round to 2 decimal places
        baseAmount: parseFloat(bonusConfig.base_bonus_amount),
        percentageBonus: bonusConfig.bonus_percentage ? (transactionAmount * parseFloat(bonusConfig.bonus_percentage)) / 100 : 0,
        maxBonus: parseFloat(bonusConfig.max_bonus_per_transaction || calculatedBonus),
        minSpendingRequired: parseFloat(bonusConfig.min_spending_required || 0),
        description: bonusConfig.description,
        userRank: {
          name: bonusConfig.rank_name,
          color: bonusConfig.rank_color,
          icon: bonusConfig.rank_icon,
          level: userRank.level,
          bonusMultiplier: parseFloat(userRank.bonus_multiplier)
        },
        transactionAmount: transactionAmount,
        message: meetsMinSpending 
          ? `🎉 Bạn sẽ nhận được ${Math.round(calculatedBonus * 100) / 100} SOV với rank ${bonusConfig.rank_name}!`
          : `💎 Cần chi tối thiểu ${bonusConfig.min_spending_required?.toLocaleString('vi-VN')} VND để nhận bonus`
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all ranks information
router.get('/ranks', async (req, res, next) => {
  try {
    const ranksQuery = `
      SELECT 
        ur.*,
        COALESCE(
          (SELECT COUNT(*) FROM user_ranking_progress urp WHERE urp.current_rank_id = ur.id), 
          0
        ) as user_count
      FROM user_ranks ur
      ORDER BY ur.level ASC
    `;

    const result = await db.query(ranksQuery);

    res.json({
      success: true,
      ranks: result.rows.map(rank => ({
        id: rank.id,
        name: rank.name,
        level: rank.level,
        minPoints: rank.min_points,
        maxPoints: rank.max_points,
        bonusMultiplier: parseFloat(rank.bonus_multiplier),
        icon: rank.icon,
        color: rank.color,
        benefits: rank.benefits,
        userCount: rank.user_count
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get user ranking leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const leaderboardQuery = `
      SELECT 
        u.full_name,
        u.email,
        urp.total_points,
        urp.total_spent,
        urp.total_transactions,
        ur.name as rank_name,
        ur.level as rank_level,
        ur.icon as rank_icon,
        ur.color as rank_color,
        ROW_NUMBER() OVER (ORDER BY urp.total_points DESC, urp.total_spent DESC) as position
      FROM user_ranking_progress urp
      JOIN users u ON urp.user_id = u.id
      JOIN user_ranks ur ON urp.current_rank_id = ur.id
      ORDER BY urp.total_points DESC, urp.total_spent DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(leaderboardQuery, [parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      leaderboard: result.rows.map(row => ({
        position: row.position,
        user: {
          name: row.full_name,
          email: row.email.replace(/(.{2}).*(@.*)/, '$1***$2') // Mask email for privacy
        },
        stats: {
          totalPoints: row.total_points,
          totalSpent: parseFloat(row.total_spent),
          totalTransactions: row.total_transactions
        },
        rank: {
          name: row.rank_name,
          level: row.rank_level,
          icon: row.rank_icon,
          color: row.rank_color
        }
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get user's ranking history
router.get('/history', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const historyQuery = `
      SELECT 
        ral.*,
        old_rank.name as old_rank_name,
        old_rank.icon as old_rank_icon,
        new_rank.name as new_rank_name,
        new_rank.icon as new_rank_icon,
        t.description as transaction_description,
        t.amount as transaction_amount
      FROM ranking_activity_log ral
      LEFT JOIN user_ranks old_rank ON ral.old_rank_id = old_rank.id
      LEFT JOIN user_ranks new_rank ON ral.new_rank_id = new_rank.id
      LEFT JOIN transactions t ON ral.transaction_id = t.id
      WHERE ral.user_id = $1
      ORDER BY ral.created_at DESC
      LIMIT $2
    `;

    const result = await db.query(historyQuery, [userId, parseInt(limit)]);

    res.json({
      success: true,
      history: result.rows.map(row => ({
        id: row.id,
        activityType: row.activity_type,
        pointsEarned: row.points_earned,
        serviceType: row.service_type,
        oldRank: row.old_rank_name ? {
          name: row.old_rank_name,
          icon: row.old_rank_icon
        } : null,
        newRank: row.new_rank_name ? {
          name: row.new_rank_name,
          icon: row.new_rank_icon
        } : null,
        transaction: row.transaction_description ? {
          description: row.transaction_description,
          amount: parseFloat(row.transaction_amount || 0)
        } : null,
        metadata: row.metadata,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

