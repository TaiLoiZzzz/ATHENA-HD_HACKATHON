const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const db = require('../config/database');
const { adminAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(2).required(),
  phone: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  address: Joi.string().optional(),
  athenaPrime: Joi.boolean().optional(),
  isVerified: Joi.boolean().optional()
});

const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  fullName: Joi.string().min(2).optional(),
  phone: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  address: Joi.string().optional(),
  athenaPrime: Joi.boolean().optional(),
  isVerified: Joi.boolean().optional(),
  isActive: Joi.boolean().optional()
});

// Apply admin middleware to all routes
router.use(adminAuthMiddleware);

// Get all users with pagination and filters
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      athenaPrime = null,
      isVerified = null,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    let whereClause = '1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex + 1})`;
      queryParams.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }

    if (athenaPrime !== null) {
      whereClause += ` AND athena_prime = $${paramIndex}`;
      queryParams.push(athenaPrime === 'true');
      paramIndex++;
    }

    if (isVerified !== null) {
      whereClause += ` AND is_verified = $${paramIndex}`;
      queryParams.push(isVerified === 'true');
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM users WHERE ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams);
    const totalUsers = parseInt(countResult.rows[0].count);

    // Get users with pagination
    const usersQuery = `
      SELECT 
        id, email, full_name, phone, date_of_birth, address,
        athena_prime, is_verified, created_at, updated_at,
        avatar_url,
        (SELECT balance FROM token_balances WHERE user_id = users.id) as token_balance
      FROM users 
      WHERE ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(parseInt(limit), offset);
    const usersResult = await db.query(usersQuery, queryParams);

    // Get user statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN athena_prime = true THEN 1 END) as prime_users,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d
      FROM users
    `;
    const statsResult = await db.query(statsQuery);

    res.json({
      users: usersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      },
      statistics: statsResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const userQuery = `
      SELECT 
        u.*, 
        tb.balance as token_balance,
        (SELECT COUNT(*) FROM transactions WHERE user_id = u.id) as total_transactions,
        (SELECT SUM(CASE WHEN type = 'earn' THEN amount ELSE 0 END) FROM transactions WHERE user_id = u.id) as total_earned,
        (SELECT SUM(CASE WHEN type = 'spend' THEN amount ELSE 0 END) FROM transactions WHERE user_id = u.id) as total_spent
      FROM users u
      LEFT JOIN token_balances tb ON u.id = tb.user_id
      WHERE u.id = $1
    `;

    const userResult = await db.query(userQuery, [id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent transactions
    const transactionsQuery = `
      SELECT * FROM transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    const transactionsResult = await db.query(transactionsQuery, [id]);

    res.json({
      user: userResult.rows[0],
      recentTransactions: transactionsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

// Create new user
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, fullName, phone, dateOfBirth, address, athenaPrime = false, isVerified = false } = value;

    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userResult = await db.query(`
      INSERT INTO users (email, password_hash, full_name, phone, date_of_birth, address, athena_prime, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, full_name, created_at
    `, [email, passwordHash, fullName, phone, dateOfBirth, address, athenaPrime, isVerified]);

    const user = userResult.rows[0];

    // Create initial token balance with 10 SOV welcome bonus
    await db.query('INSERT INTO token_balances (user_id, balance) VALUES ($1, $2)', [user.id, 10]);

    // Record welcome bonus transaction
    await db.query(
      `INSERT INTO transactions (user_id, type, amount, description, metadata, created_by_admin)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        'earn',
        10,
        'Chào mừng bạn đến với ATHENA! Bonus 10 SOV token cho thành viên mới',
        JSON.stringify({ type: 'welcome_bonus', source: 'admin_creation' }),
        req.user.email
      ]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: user
    });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateUserSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user exists
    const existingUser = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(value).forEach(([key, val]) => {
      if (val !== undefined) {
        const dbField = key === 'fullName' ? 'full_name' : 
                       key === 'dateOfBirth' ? 'date_of_birth' :
                       key === 'athenaPrime' ? 'athena_prime' :
                       key === 'isVerified' ? 'is_verified' :
                       key === 'isActive' ? 'is_active' : key;
        updates.push(`${dbField} = $${paramIndex}`);
        values.push(val);
        paramIndex++;
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING id, email, full_name, phone, date_of_birth, address, athena_prime, is_verified, updated_at
    `;

    const result = await db.query(updateQuery, values);

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete by setting is_active = false
    await db.query(`
      UPDATE users 
      SET is_active = false, updated_at = NOW() 
      WHERE id = $1
    `, [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Update user token balance
router.patch('/:id/balance', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, operation } = req.body; // operation: 'add' or 'set'

    if (!amount || !operation) {
      return res.status(400).json({ error: 'Amount and operation are required' });
    }

    let updateQuery;
    if (operation === 'add') {
      updateQuery = `
        UPDATE token_balances 
        SET balance = balance + $1, updated_at = NOW() 
        WHERE user_id = $2
        RETURNING balance
      `;
    } else if (operation === 'set') {
      updateQuery = `
        UPDATE token_balances 
        SET balance = $1, updated_at = NOW() 
        WHERE user_id = $2
        RETURNING balance
      `;
    } else {
      return res.status(400).json({ error: 'Invalid operation. Use "add" or "set"' });
    }

    const result = await db.query(updateQuery, [amount, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found or no token balance record' });
    }

    // Log the balance change
    await db.query(`
      INSERT INTO transactions (user_id, type, amount, description, created_by_admin)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      id, 
      operation === 'add' && amount > 0 ? 'earn' : 'admin_adjustment',
      Math.abs(amount),
      `Admin ${operation === 'add' ? 'added' : 'set'} balance: ${amount} SOV`,
      req.user.email
    ]);

    res.json({
      message: 'Balance updated successfully',
      newBalance: result.rows[0].balance
    });
  } catch (error) {
    next(error);
  }
});

// Get user activity log
router.get('/:id/activity', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const activityQuery = `
      SELECT 
        'transaction' as type,
        t.created_at,
        t.type as action,
        t.amount,
        t.description,
        t.service_type,
        NULL as details
      FROM transactions t
      WHERE t.user_id = $1
      
      UNION ALL
      
      SELECT 
        'login' as type,
        NOW() as created_at,
        'user_login' as action,
        NULL as amount,
        'User logged in' as description,
        NULL as service_type,
        NULL as details
      FROM users
      WHERE id = $1
      
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(activityQuery, [id, limit, offset]);

    res.json({
      activities: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
