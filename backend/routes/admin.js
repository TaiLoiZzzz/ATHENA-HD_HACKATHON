const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const router = express.Router();

// Admin credentials (in production, store in database)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: '$2a$12$sivTm.jAguf7XBFIqIJ0zuZRZrAg9PPYkmFyq1yWssnrhczA/S1Ti' // "admin123"
};

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No admin token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid admin token.' });
  }
};

// Admin login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (username !== ADMIN_CREDENTIALS.username) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, ADMIN_CREDENTIALS.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { 
        username: username,
        role: 'admin',
        timestamp: Date.now()
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: { username }
    });
  } catch (error) {
    next(error);
  }
});

// Verify admin token
router.get('/verify', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
});

// Admin logout
router.post('/logout', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get admin dashboard stats
router.get('/stats', verifyAdminToken, async (req, res, next) => {
  try {
    // Get total users
    const totalUsersResult = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Get total transactions
    const totalTransactionsResult = await db.query('SELECT COUNT(*) as count FROM transactions WHERE status = $1', ['completed']);
    const totalTransactions = parseInt(totalTransactionsResult.rows[0].count);

    // Get total revenue (from completed service bookings)
    const totalRevenueResult = await db.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM service_bookings 
      WHERE status = 'confirmed'
    `);
    const totalRevenue = parseFloat(totalRevenueResult.rows[0].total);

    // Get total tokens issued
    const totalTokensResult = await db.query(`
      SELECT COALESCE(SUM(total_earned), 0) as total 
      FROM token_balances
    `);
    const totalTokensIssued = parseFloat(totalTokensResult.rows[0].total);

    // Get active bookings
    const activeBookingsResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM service_bookings 
      WHERE status IN ('confirmed', 'pending')
    `);
    const activeBookings = parseInt(activeBookingsResult.rows[0].count);

    // Get pending orders (marketplace orders)
    const pendingOrdersResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM marketplace_orders 
      WHERE status = 'active'
    `);
    const pendingOrders = parseInt(pendingOrdersResult.rows[0].count);

    // Get today's revenue
    const todayRevenueResult = await db.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM service_bookings 
      WHERE status = 'confirmed' 
      AND DATE(created_at) = CURRENT_DATE
    `);
    const todayRevenue = parseFloat(todayRevenueResult.rows[0].total);

    // Calculate monthly growth
    const currentMonthResult = await db.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM service_bookings 
      WHERE status = 'confirmed' 
      AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    const currentMonth = parseFloat(currentMonthResult.rows[0].total);

    const lastMonthResult = await db.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM service_bookings 
      WHERE status = 'confirmed' 
      AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    `);
    const lastMonth = parseFloat(lastMonthResult.rows[0].total);

    const monthlyGrowth = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth * 100).toFixed(1) : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTransactions,
        totalRevenue,
        totalTokensIssued,
        activeBookings,
        pendingOrders,
        todayRevenue,
        monthlyGrowth: parseFloat(monthlyGrowth)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get recent activity
router.get('/recent-activity', verifyAdminToken, async (req, res, next) => {
  try {
    // Get recent transactions
    const recentTransactions = await db.query(`
      SELECT 
        t.id,
        t.type,
        t.amount,
        t.description,
        t.status,
        t.created_at,
        u.full_name as user_name,
        u.email as user_email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);

    // Get recent bookings
    const recentBookings = await db.query(`
      SELECT 
        sb.id,
        sb.service_type,
        sb.total_amount,
        sb.status,
        sb.created_at,
        u.full_name as user_name,
        u.email as user_email
      FROM service_bookings sb
      JOIN users u ON sb.user_id = u.id
      ORDER BY sb.created_at DESC
      LIMIT 5
    `);

    // Get recent user registrations
    const recentUsers = await db.query(`
      SELECT 
        id,
        full_name,
        email,
        created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const activities = [];

    // Add transactions
    recentTransactions.rows.forEach(transaction => {
      activities.push({
        id: `tx_${transaction.id}`,
        type: transaction.type === 'earn' ? 'token_purchase' : 'payment',
        description: transaction.description || `${transaction.type} transaction`,
        amount: transaction.type === 'earn' ? null : parseFloat(transaction.amount),
        user: transaction.user_name,
        timestamp: transaction.created_at,
        status: transaction.status === 'completed' ? 'success' : transaction.status
      });
    });

    // Add bookings
    recentBookings.rows.forEach(booking => {
      activities.push({
        id: `booking_${booking.id}`,
        type: 'booking',
        description: `${booking.service_type} booking`,
        amount: parseFloat(booking.total_amount),
        user: booking.user_name,
        timestamp: booking.created_at,
        status: booking.status === 'confirmed' ? 'success' : booking.status
      });
    });

    // Add registrations
    recentUsers.rows.forEach(user => {
      activities.push({
        id: `user_${user.id}`,
        type: 'registration',
        description: 'New user registration',
        user: user.full_name,
        timestamp: user.created_at,
        status: 'success'
      });
    });

    // Sort by timestamp and limit to 15 most recent
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivities = activities.slice(0, 15);

    res.json({
      success: true,
      activities: recentActivities
    });
  } catch (error) {
    next(error);
  }
});

// Get users list with pagination
router.get('/users', verifyAdminToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = `
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.is_verified,
        u.athena_prime,
        u.created_at,
        tb.balance,
        tb.total_earned,
        tb.total_spent
      FROM users u
      LEFT JOIN token_balances tb ON u.id = tb.user_id
    `;
    
    let countQuery = 'SELECT COUNT(*) as total FROM users u';
    let params = [];
    let countParams = [];

    if (search) {
      query += ` WHERE u.full_name ILIKE $1 OR u.email ILIKE $1`;
      countQuery += ` WHERE u.full_name ILIKE $1 OR u.email ILIKE $1`;
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [usersResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      users: usersResult.rows.map(user => ({
        ...user,
        balance: parseFloat(user.balance) || 0,
        totalEarned: parseFloat(user.total_earned) || 0,
        totalSpent: parseFloat(user.total_spent) || 0
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get flight bookings management
router.get('/flights', verifyAdminToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        sb.id,
        sb.booking_reference,
        sb.total_amount,
        sb.tokens_earned,
        sb.status,
        sb.booking_details,
        sb.created_at,
        u.full_name as user_name,
        u.email as user_email
      FROM service_bookings sb
      JOIN users u ON sb.user_id = u.id
      WHERE sb.service_type = 'vietjet'
      ORDER BY sb.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM service_bookings 
      WHERE service_type = 'vietjet'
    `;

    const [bookingsResult, countResult] = await Promise.all([
      db.query(query, [limit, offset]),
      db.query(countQuery)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      bookings: bookingsResult.rows.map(booking => ({
        ...booking,
        total_amount: parseFloat(booking.total_amount),
        tokens_earned: parseFloat(booking.tokens_earned),
        booking_details: booking.booking_details
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
});

// Export/Import data endpoints would go here...

module.exports = router;
