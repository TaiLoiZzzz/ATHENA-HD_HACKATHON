const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'athena_super_secret_key_change_in_production';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No valid token provided.' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Verify user still exists in database
      const userResult = await db.query(
        'SELECT id, email, full_name, athena_prime FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid token. User not found.' });
      }
      
      req.user = {
        id: decoded.userId,
        email: userResult.rows[0].email,
        fullName: userResult.rows[0].full_name,
        athenaPrime: userResult.rows[0].athena_prime
      };
      
      next();
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

// Optional auth middleware for public endpoints that can work with or without auth
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const userResult = await db.query(
        'SELECT id, email, full_name, athena_prime FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (userResult.rows.length > 0) {
        req.user = {
          id: decoded.userId,
          email: userResult.rows[0].email,
          fullName: userResult.rows[0].full_name,
          athenaPrime: userResult.rows[0].athena_prime
        };
      } else {
        req.user = null;
      }
    } catch (jwtError) {
      req.user = null;
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

// Admin authentication middleware (optimized)
const adminAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No valid token provided.' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fast admin check
    if (decoded.role === 'admin' || decoded.username === 'admin' || decoded.email === 'admin@sovico.com') {
      req.user = decoded;
      return next();
    }

    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
module.exports.adminAuthMiddleware = adminAuthMiddleware;
module.exports.JWT_SECRET = JWT_SECRET;
module.exports.optionalAuth = optionalAuthMiddleware;
module.exports.JWT_SECRET = JWT_SECRET;

