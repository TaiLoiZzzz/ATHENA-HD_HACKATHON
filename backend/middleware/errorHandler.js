const winston = require('winston');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user.id : null
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details || err.message
    });
  }

  if (err.name === 'UnauthorizedError' || err.message === 'jwt malformed') {
    return res.status(401).json({
      error: 'Unauthorized access'
    });
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({
      error: 'Resource already exists',
      details: 'A record with this information already exists'
    });
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    return res.status(400).json({
      error: 'Invalid reference',
      details: 'Referenced resource does not exist'
    });
  }

  if (err.code === '23502') { // PostgreSQL not null violation
    return res.status(400).json({
      error: 'Missing required field',
      details: 'Required information is missing'
    });
  }

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      details: 'Database connection error'
    });
  }

  // Blockchain service errors
  if (err.message && err.message.includes('blockchain')) {
    return res.status(503).json({
      error: 'Blockchain service unavailable',
      details: 'Please try again later'
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler;

