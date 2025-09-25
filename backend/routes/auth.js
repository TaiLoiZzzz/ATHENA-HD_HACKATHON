const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');
const { validateDemoPassword, isDemoUser, getDemoUser } = require('../demo-users');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(2).required(),
  phone: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  address: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, fullName, phone, dateOfBirth, address } = value;

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userResult = await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone, date_of_birth, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, created_at`,
      [email, passwordHash, fullName, phone, dateOfBirth, address]
    );

    const user = userResult.rows[0];

    // Create initial token balance with 10 SOV welcome bonus
    await db.query(
      'INSERT INTO token_balances (user_id, balance) VALUES ($1, $2)',
      [user.id, 10]
    );

    // Record welcome bonus transaction
    await db.query(
      `INSERT INTO transactions (user_id, type, amount, description, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user.id,
        'earn',
        10,
        'Chào mừng bạn đến với ATHENA! Bonus 10 SOV token cho thành viên mới',
        JSON.stringify({ type: 'welcome_bonus', source: 'registration' })
      ]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Check if this is admin login credentials
    const ADMIN_CREDENTIALS = {
      username: 'admin',
      email: 'admin@sovico.com',
      password: '$2a$12$sivTm.jAguf7XBFIqIJ0zuZRZrAg9PPYkmFyq1yWssnrhczA/S1Ti' // "admin123"
    };

    // Check for admin login
    if (email === ADMIN_CREDENTIALS.email) {
      const isValidAdminPassword = await bcrypt.compare(password, ADMIN_CREDENTIALS.password);
      if (isValidAdminPassword) {
        // Generate admin JWT token
        const adminToken = jwt.sign(
          { 
            username: ADMIN_CREDENTIALS.username,
            email: ADMIN_CREDENTIALS.email,
            role: 'admin',
            timestamp: Date.now()
          },
          JWT_SECRET,
          { expiresIn: '8h' }
        );

        return res.json({
          message: 'Admin login successful',
          user: {
            id: 'admin',
            email: ADMIN_CREDENTIALS.email,
            fullName: 'Administrator',
            role: 'admin',
            isAdmin: true
          },
          token: adminToken
        });
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    // Check if this is a demo user
    if (isDemoUser(email)) {
      const demoUser = await validateDemoPassword(email, password);
      if (demoUser) {
        // Generate JWT token for demo user
        const token = jwt.sign(
          { 
            userId: demoUser.id,
            email: demoUser.email,
            timestamp: Date.now()
          },
          JWT_SECRET,
          { expiresIn: '8h' }
        );

        return res.json({
          message: 'Demo user login successful',
          user: {
            id: demoUser.id,
            email: demoUser.email,
            fullName: demoUser.fullName,
            phone: demoUser.phone,
            dateOfBirth: demoUser.dateOfBirth,
            address: demoUser.address,
            athenaPrime: demoUser.athenaPrime,
            isVerified: demoUser.isVerified,
            avatarUrl: demoUser.avatarUrl,
            isAdmin: false,
            isDemoUser: true,
            // Include ranking data
            ranking: demoUser.rank,
            balance: demoUser.balance
          },
          token
        });
      } else {
        return res.status(401).json({ error: 'Invalid demo user credentials' });
      }
    }

    // Regular user login
    const userResult = await db.query(
      'SELECT id, email, password_hash, full_name, athena_prime FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get user's token balance
    const balanceResult = await db.query(
      'SELECT balance, total_earned, total_spent FROM token_balances WHERE user_id = $1',
      [user.id]
    );

    const balance = balanceResult.rows[0] || { balance: 0, total_earned: 0, total_spent: 0 };

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        athenaPrime: user.athena_prime,
        role: 'user',
        isAdmin: false,
        tokenBalance: balance
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Generate new token
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({ token: newToken });
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    next(error);
  }
});

// Verify token
router.get('/verify', async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Check if this is an admin token
      if (decoded.role === 'admin') {
        return res.json({
          valid: true,
          user: {
            id: 'admin',
            email: decoded.email,
            fullName: 'Administrator',
            role: 'admin',
            isAdmin: true
          }
        });
      }
      
      // Regular user token verification
      const userResult = await db.query(
        'SELECT id, email, full_name, athena_prime FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(401).json({ valid: false, error: 'User not found' });
      }
      
      const user = userResult.rows[0];
      
      res.json({
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          athenaPrime: user.athena_prime,
          role: 'user',
          isAdmin: false
        }
      });
    } catch (jwtError) {
      return res.status(401).json({ valid: false, error: 'Invalid token' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

