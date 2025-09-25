const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const multer = require('multer');
// const sharp = require('sharp'); // Temporarily commented out
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for avatar uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

// Validation schemas
const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).optional(),
  phone: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  address: Joi.string().optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const userResult = await db.query(`
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.date_of_birth,
        u.address,
        u.avatar_url,
        u.is_verified,
        u.athena_prime,
        u.created_at,
        tb.balance,
        tb.total_earned,
        tb.total_spent
      FROM users u
      LEFT JOIN token_balances tb ON u.id = tb.user_id
      WHERE u.id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    
    // Get user statistics
    const statsResult = await db.query(`
      SELECT 
        COUNT(CASE WHEN type = 'earn' THEN 1 END) as total_earning_transactions,
        COUNT(CASE WHEN type = 'spend' THEN 1 END) as total_spending_transactions,
        COUNT(CASE WHEN type LIKE 'marketplace_%' THEN 1 END) as total_marketplace_transactions,
        COUNT(DISTINCT service_type) as services_used
      FROM transactions 
      WHERE user_id = $1
    `, [userId]);

    const stats = statsResult.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        address: user.address,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
        athenaPrime: user.athena_prime,
        createdAt: user.created_at,
        tokenBalance: {
          balance: parseFloat(user.balance) || 0,
          totalEarned: parseFloat(user.total_earned) || 0,
          totalSpent: parseFloat(user.total_spent) || 0
        }
      },
      statistics: {
        totalEarningTransactions: parseInt(stats.total_earning_transactions) || 0,
        totalSpendingTransactions: parseInt(stats.total_spending_transactions) || 0,
        totalMarketplaceTransactions: parseInt(stats.total_marketplace_transactions) || 0,
        servicesUsed: parseInt(stats.services_used) || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', async (req, res, next) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user.id;
    const { fullName, phone, dateOfBirth, address } = value;

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (fullName !== undefined) {
      updateFields.push(`full_name = $${paramCount++}`);
      updateValues.push(fullName);
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramCount++}`);
      updateValues.push(phone);
    }
    if (dateOfBirth !== undefined) {
      updateFields.push(`date_of_birth = $${paramCount++}`);
      updateValues.push(dateOfBirth);
    }
    if (address !== undefined) {
      updateFields.push(`address = $${paramCount++}`);
      updateValues.push(address);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, full_name, phone, date_of_birth, address, updated_at
    `;

    const result = await db.query(updateQuery, updateValues);
    const updatedUser = result.rows[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.date_of_birth,
        address: updatedUser.address,
        updatedAt: updatedUser.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Upload avatar
router.post('/avatar', upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No avatar file provided' });
    }

    const userId = req.user.id;
    const fileExtension = 'webp';
    const fileName = `avatar_${userId}_${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // TODO: Process and optimize image with Sharp (temporarily disabled)
    // For now, just save the file directly
    fs.writeFileSync(filePath, req.file.buffer);

    // Get the old avatar URL to delete it later
    const oldAvatarResult = await db.query(
      'SELECT avatar_url FROM users WHERE id = $1',
      [userId]
    );

    const avatarUrl = `/uploads/avatars/${fileName}`;

    // Update user avatar URL in database
    await db.query(
      'UPDATE users SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [avatarUrl, userId]
    );

    // Delete old avatar file if it exists
    if (oldAvatarResult.rows[0]?.avatar_url) {
      const oldFilePath = path.join(__dirname, '..', oldAvatarResult.rows[0].avatar_url);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl
    });
  } catch (error) {
    next(error);
  }
});

// Delete avatar
router.delete('/avatar', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get current avatar URL
    const avatarResult = await db.query(
      'SELECT avatar_url FROM users WHERE id = $1',
      [userId]
    );

    if (avatarResult.rows[0]?.avatar_url) {
      const filePath = path.join(__dirname, '..', avatarResult.rows[0].avatar_url);
      
      // Delete file if it exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove avatar URL from database
    await db.query(
      'UPDATE users SET avatar_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/password', async (req, res, next) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = value;

    // Get current password hash
    const userResult = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentHash = userResult.rows[0].password_hash;

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, currentHash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [newPasswordHash, userId]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Upgrade to ATHENA Prime
router.post('/upgrade-prime', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Check if user is already ATHENA Prime
    const userResult = await db.query(
      'SELECT athena_prime FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userResult.rows[0].athena_prime) {
      return res.status(400).json({ error: 'User is already ATHENA Prime' });
    }

    // In a real implementation, you would process payment here
    // For demo purposes, we'll just upgrade the user
    
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Upgrade user to ATHENA Prime
      await client.query(`
        UPDATE users 
        SET athena_prime = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [userId]);

      // Create a transaction record for the upgrade
      await client.query(`
        INSERT INTO transactions (
          user_id, type, amount, description, status
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        userId, 'spend', 0, // In real implementation, this would be the subscription cost
        'Upgraded to ATHENA Prime subscription',
        'completed'
      ]);

      await client.query('COMMIT');

      // Emit real-time update
      const io = req.app.get('socketio');
      if (io) {
        io.to(`user_${userId}`).emit('prime_upgrade', {
          message: 'Successfully upgraded to ATHENA Prime!',
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: 'Successfully upgraded to ATHENA Prime',
        benefits: [
          '1.5x token earning multiplier',
          'Priority customer support',
          'Exclusive marketplace features',
          'Early access to new services'
        ]
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

// Get user activity summary
router.get('/activity', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;

    // Get transaction activity for the specified period
    const activityResult = await db.query(`
      SELECT 
        DATE(created_at) as date,
        type,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
      FROM transactions 
      WHERE user_id = $1 
        AND created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at), type
      ORDER BY date DESC
    `, [userId]);

    // Get service usage
    const serviceResult = await db.query(`
      SELECT 
        service_type,
        COUNT(*) as booking_count,
        SUM(total_amount) as total_spent
      FROM service_bookings 
      WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '${days} days'
      GROUP BY service_type
    `, [userId]);

    // Get marketplace activity
    const marketplaceResult = await db.query(`
      SELECT 
        'marketplace' as activity_type,
        COUNT(*) as trade_count,
        SUM(amount) as total_tokens_traded
      FROM marketplace_trades t
      LEFT JOIN marketplace_orders bo ON t.buy_order_id = bo.id
      LEFT JOIN marketplace_orders so ON t.sell_order_id = so.id
      WHERE (bo.user_id = $1 OR so.user_id = $1)
        AND t.created_at > NOW() - INTERVAL '${days} days'
    `, [userId]);

    res.json({
      period: `${days} days`,
      transactionActivity: activityResult.rows.map(row => ({
        date: row.date,
        type: row.type,
        transactionCount: parseInt(row.transaction_count),
        totalAmount: parseFloat(row.total_amount)
      })),
      serviceUsage: serviceResult.rows.map(row => ({
        serviceType: row.service_type,
        bookingCount: parseInt(row.booking_count),
        totalSpent: parseFloat(row.total_spent)
      })),
      marketplaceActivity: marketplaceResult.rows[0] ? {
        tradeCount: parseInt(marketplaceResult.rows[0].trade_count) || 0,
        totalTokensTraded: parseFloat(marketplaceResult.rows[0].total_tokens_traded) || 0
      } : {
        tradeCount: 0,
        totalTokensTraded: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user notifications/alerts
router.get('/notifications', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // In a real implementation, you would have a notifications table
    // For demo purposes, we'll generate some mock notifications based on user activity
    
    const notifications = [];
    
    // Check for recent token earnings
    const recentEarnings = await db.query(`
      SELECT amount, created_at FROM transactions 
      WHERE user_id = $1 AND type = 'earn' 
      ORDER BY created_at DESC LIMIT 3
    `, [userId]);

    recentEarnings.rows.forEach(earning => {
      notifications.push({
        id: `earn_${earning.created_at}`,
        type: 'token_earned',
        title: 'Tokens Earned!',
        message: `You earned ${earning.amount} SOV-Tokens`,
        timestamp: earning.created_at,
        read: false
      });
    });

    // Check for marketplace trades
    const recentTrades = await db.query(`
      SELECT amount, price_per_token, created_at FROM marketplace_trades t
      LEFT JOIN marketplace_orders bo ON t.buy_order_id = bo.id
      LEFT JOIN marketplace_orders so ON t.sell_order_id = so.id
      WHERE bo.user_id = $1 OR so.user_id = $1
      ORDER BY t.created_at DESC LIMIT 2
    `, [userId]);

    recentTrades.rows.forEach(trade => {
      notifications.push({
        id: `trade_${trade.created_at}`,
        type: 'marketplace_trade',
        title: 'Marketplace Trade Completed',
        message: `${trade.amount} tokens traded at ${trade.price_per_token} VND each`,
        timestamp: trade.created_at,
        read: false
      });
    });

    // Sort notifications by timestamp
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      notifications: notifications.slice(0, 10), // Limit to 10 most recent
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    next(error);
  }
});

// Delete user account (with confirmation)
router.delete('/account', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { confirmation } = req.body;

    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return res.status(400).json({ 
        error: 'Account deletion requires confirmation. Please send "DELETE_MY_ACCOUNT" in the confirmation field.' 
      });
    }

    // Check if user has active marketplace orders
    const activeOrders = await db.query(`
      SELECT COUNT(*) as count FROM marketplace_orders 
      WHERE user_id = $1 AND status = 'active'
    `, [userId]);

    if (parseInt(activeOrders.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete account with active marketplace orders. Please cancel all orders first.' 
      });
    }

    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Delete user data in correct order (respecting foreign key constraints)
      await client.query('DELETE FROM marketplace_trades WHERE buyer_id = $1 OR seller_id = $1', [userId]);
      await client.query('DELETE FROM marketplace_orders WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM shopping_cart WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM service_bookings WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM token_balances WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM users WHERE id = $1', [userId]);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Account deleted successfully'
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

module.exports = router;

