const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const winston = require('winston');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tokenRoutes = require('./routes/tokens');
const marketplaceRoutes = require('./routes/marketplace');
const cartRoutes = require('./routes/cart');
const servicesRoutes = require('./routes/services');
const transactionRoutes = require('./routes/transactions');
const web3Routes = require('./routes/web3');
const vietjetRoutes = require('./routes/vietjet');
const hdbankRoutes = require('./routes/hdbank');
const sovicoRoutes = require('./routes/sovico');
const loyaltyRoutes = require('./routes/loyalty');
const adminRoutes = require('./routes/admin');
const flightsRoutes = require('./routes/flights');
const bankingRoutes = require('./routes/banking');
const enhancedPaymentsRoutes = require('./routes/enhanced-payments');

// Admin CRUD routes
const adminUsersRoutes = require('./routes/admin-users');
const adminHdbankRoutes = require('./routes/admin-hdbank');
const adminVietjetRoutes = require('./routes/admin-vietjet');
const adminSovicoRoutes = require('./routes/admin-sovico');
const rankingRoutes = require('./routes/ranking');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Import database connection
const db = require('./config/database');
const blockchainService = require('./services/blockchainService');
const web3Service = require('./services/web3Service');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files for avatars
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/tokens', authMiddleware, tokenRoutes);
app.use('/api/marketplace', authMiddleware, marketplaceRoutes);
app.use('/api/cart', authMiddleware, cartRoutes);
app.use('/api/services', authMiddleware, servicesRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/web3', authMiddleware, web3Routes);
app.use('/api/vietjet', authMiddleware, vietjetRoutes);
app.use('/api/hdbank', authMiddleware, hdbankRoutes);
app.use('/api/sovico', authMiddleware, sovicoRoutes);
app.use('/api/loyalty', authMiddleware, loyaltyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/flights', authMiddleware, flightsRoutes);
app.use('/api/banking', authMiddleware, bankingRoutes);
app.use('/api/enhanced-payments', authMiddleware, enhancedPaymentsRoutes);

// Admin CRUD routes (require admin authentication)
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/hdbank', adminHdbankRoutes);
app.use('/api/admin/vietjet', adminVietjetRoutes);
app.use('/api/admin/sovico', adminSovicoRoutes);
app.use('/api/ranking', authMiddleware, rankingRoutes);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('socketio', io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

// Initialize services and start server
async function startServer() {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    logger.info('Database connected successfully');
    
    // Initialize blockchain service
    await blockchainService.initialize();
    logger.info('Blockchain service initialized');
    
    server.listen(PORT, () => {
      logger.info(`ATHENA Platform server running on port ${PORT}`);
      console.log(`🚀 ATHENA Platform server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer();

module.exports = app;
