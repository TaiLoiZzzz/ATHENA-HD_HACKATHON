const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'demo_jwt_secret_key';

// Demo users data
const demoUsers = [
  // Diamond Users
  {
    id: 'diamond-user-001',
    email: 'diamond1@athena.com',
    password: 'diamond123',
    fullName: 'Nguyễn Minh Đức',
    phone: '+84901234501',
    dateOfBirth: '1985-03-15',
    address: '123 Lê Duẩn, Quận 1, TP.HCM',
    athenaPrime: true,
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rank: {
      name: 'Diamond',
      level: 4,
      icon: '💎',
      color: '#3B82F6',
      benefits: ['Diamond tier benefits', 'Exclusive bonus rates', 'Priority customer support', 'Special promotions']
    },
    totalPoints: 28500,
    totalSpent: 125000000,
    totalTransactions: 85,
    servicesUsed: { vietjet: 25, hdbank: 30, sovico: 30 },
    achievements: ['Early Adopter', 'VIP Traveler', 'Premium Banking', 'Luxury Lifestyle', 'Diamond Explorer'],
    nextRankPoints: null,
    bonusMultiplier: 2.0,
    balance: 2580.50
  },
  {
    id: 'diamond-user-002',
    email: 'diamond2@athena.com',
    password: 'diamond123',
    fullName: 'Trần Thị Kim Anh',
    phone: '+84901234502',
    dateOfBirth: '1987-07-22',
    address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
    athenaPrime: true,
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    rank: {
      name: 'Diamond',
      level: 4,
      icon: '💎',
      color: '#3B82F6',
      benefits: ['Diamond tier benefits', 'Exclusive bonus rates', 'Priority customer support', 'Special promotions']
    },
    totalPoints: 22000,
    totalSpent: 98000000,
    totalTransactions: 72,
    servicesUsed: { vietjet: 20, hdbank: 25, sovico: 27 },
    achievements: ['Power User', 'Business Traveler', 'Investment Pro', 'Luxury Lover'],
    nextRankPoints: null,
    bonusMultiplier: 2.0,
    balance: 1950.75
  },
  // Gold Users
  {
    id: 'gold-user-001',
    email: 'gold1@athena.com',
    password: 'gold123',
    fullName: 'Phạm Văn Hùng',
    phone: '+84901234503',
    dateOfBirth: '1990-12-10',
    address: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
    athenaPrime: true,
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rank: {
      name: 'Gold',
      level: 3,
      icon: '🥇',
      color: '#F59E0B',
      benefits: ['Gold tier benefits', 'Enhanced bonus rates', 'Priority support', 'Exclusive offers']
    },
    totalPoints: 12500,
    totalSpent: 65000000,
    totalTransactions: 48,
    servicesUsed: { vietjet: 15, hdbank: 18, sovico: 15 },
    achievements: ['Frequent Flyer', 'Smart Investor', 'Resort Enthusiast'],
    nextRankPoints: 20000,
    bonusMultiplier: 1.5,
    balance: 850.25
  },
  {
    id: 'gold-user-002',
    email: 'gold2@athena.com',
    password: 'gold123',
    fullName: 'Lê Thị Mai',
    phone: '+84901234504',
    dateOfBirth: '1988-05-18',
    address: '321 Võ Văn Tần, Quận 3, TP.HCM',
    athenaPrime: false,
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rank: {
      name: 'Gold',
      level: 3,
      icon: '🥇',
      color: '#F59E0B',
      benefits: ['Gold tier benefits', 'Enhanced bonus rates', 'Priority support', 'Exclusive offers']
    },
    totalPoints: 8750,
    totalSpent: 42000000,
    totalTransactions: 35,
    servicesUsed: { vietjet: 12, hdbank: 12, sovico: 11 },
    achievements: ['Travel Lover', 'Banking Pro', 'Weekend Warrior'],
    nextRankPoints: 20000,
    bonusMultiplier: 1.5,
    balance: 650.00
  },
  // Silver Users
  {
    id: 'silver-user-001',
    email: 'silver1@athena.com',
    password: 'silver123',
    fullName: 'Hoàng Thanh Tùng',
    phone: '+84901234505',
    dateOfBirth: '1992-09-25',
    address: '654 Lý Tự Trọng, Quận 1, TP.HCM',
    athenaPrime: false,
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    rank: {
      name: 'Silver',
      level: 2,
      icon: '🥈',
      color: '#6B7280',
      benefits: ['Silver tier benefits', 'Good bonus rates', 'Standard support', 'Regular offers']
    },
    totalPoints: 3200,
    totalSpent: 18000000,
    totalTransactions: 22,
    servicesUsed: { vietjet: 8, hdbank: 7, sovico: 7 },
    achievements: ['Explorer', 'Smart Saver'],
    nextRankPoints: 5000,
    bonusMultiplier: 1.2,
    balance: 320.80
  },
  {
    id: 'silver-user-002',
    email: 'silver2@athena.com',
    password: 'silver123',
    fullName: 'Vũ Thị Lan',
    phone: '+84901234506',
    dateOfBirth: '1994-02-14',
    address: '987 Hai Bà Trưng, Quận 1, TP.HCM',
    athenaPrime: false,
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
    rank: {
      name: 'Silver',
      level: 2,
      icon: '🥈',
      color: '#6B7280',
      benefits: ['Silver tier benefits', 'Good bonus rates', 'Standard support', 'Regular offers']
    },
    totalPoints: 2100,
    totalSpent: 12000000,
    totalTransactions: 18,
    servicesUsed: { vietjet: 6, hdbank: 6, sovico: 6 },
    achievements: ['Rising Star', 'Budget Traveler'],
    nextRankPoints: 5000,
    bonusMultiplier: 1.2,
    balance: 275.40
  },
  // Bronze User
  {
    id: 'bronze-user-001',
    email: 'bronze1@athena.com',
    password: 'bronze123',
    fullName: 'Nguyễn Văn Nam',
    phone: '+84901234507',
    dateOfBirth: '1995-11-08',
    address: '159 Pasteur, Quận 3, TP.HCM',
    athenaPrime: false,
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face',
    rank: {
      name: 'Bronze',
      level: 1,
      icon: '🥉',
      color: '#F97316',
      benefits: ['Bronze tier benefits', 'Basic bonus rates', 'Standard support', 'Basic offers']
    },
    totalPoints: 850,
    totalSpent: 5000000,
    totalTransactions: 8,
    servicesUsed: { vietjet: 3, hdbank: 2, sovico: 3 },
    achievements: ['Newcomer'],
    nextRankPoints: 1000,
    bonusMultiplier: 1.0,
    balance: 125.50
  }
];

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions
const getDemoUser = (email) => demoUsers.find(user => user.email === email);
const isDemoUser = (email) => email && email.includes('@athena.com');
const validateDemoPassword = (email, password) => {
  const user = getDemoUser(email);
  return user && user.password === password ? user : null;
};

// Auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Demo server running', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Demo API running', timestamp: new Date().toISOString() });
});

// Auth login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Admin login
    if (email === 'admin@sovico.com' && password === 'admin123') {
      const adminToken = jwt.sign(
        { 
          username: 'admin',
          email: 'admin@sovico.com',
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
          email: 'admin@sovico.com',
          fullName: 'Administrator',
          role: 'admin',
          isAdmin: true
        },
        token: adminToken
      });
    }

    // Demo user login
    if (isDemoUser(email)) {
      const demoUser = validateDemoPassword(email, password);
      if (demoUser) {
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
            createdAt: '2023-01-01T00:00:00Z'
          },
          token
        });
      }
    }

    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User ranking
app.get('/api/ranking/user-rank', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    
    if (userEmail && isDemoUser(userEmail)) {
      const demoUser = getDemoUser(userEmail);
      if (demoUser) {
        return res.json({
          success: true,
          ranking: {
            rank: demoUser.rank,
            totalPoints: demoUser.totalPoints,
            totalSpent: demoUser.totalSpent,
            totalTransactions: demoUser.totalTransactions,
            servicesUsed: demoUser.servicesUsed,
            achievements: demoUser.achievements,
            nextRankPoints: demoUser.nextRankPoints,
            bonusMultiplier: demoUser.bonusMultiplier
          }
        });
      }
    }

    return res.status(404).json({ error: 'User ranking not found' });
  } catch (error) {
    console.error('Ranking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Service bonus
app.get('/api/ranking/service-bonus/:serviceType', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const { serviceType } = req.params;

    if (userEmail && isDemoUser(userEmail)) {
      const demoUser = getDemoUser(userEmail);
      if (demoUser) {
        const baseBonus = demoUser.rank.name === 'Diamond' ? 25 :
                         demoUser.rank.name === 'Gold' ? 15 :
                         demoUser.rank.name === 'Silver' ? 10 : 5;
        
        const calculatedBonus = Math.round(baseBonus * demoUser.bonusMultiplier);
        
        return res.json({
          success: true,
          userRank: demoUser.rank.name,
          bonusAmount: calculatedBonus,
          message: `🎉 Bạn sẽ nhận được ${calculatedBonus} SOV với rank ${demoUser.rank.name}!`,
          multiplier: demoUser.bonusMultiplier
        });
      }
    }

    return res.status(404).json({ error: 'User not found' });
  } catch (error) {
    console.error('Service bonus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User profile
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    
    if (userEmail && isDemoUser(userEmail)) {
      const demoUser = getDemoUser(userEmail);
      if (demoUser) {
        return res.json({
          success: true,
          profile: {
            id: demoUser.id,
            email: demoUser.email,
            fullName: demoUser.fullName,
            phone: demoUser.phone,
            dateOfBirth: demoUser.dateOfBirth,
            address: demoUser.address,
            athenaPrime: demoUser.athenaPrime,
            isVerified: demoUser.isVerified,
            avatarUrl: demoUser.avatarUrl,
            createdAt: '2023-01-01T00:00:00Z',
            lastLogin: new Date().toISOString()
          },
          stats: {
            totalTransactions: demoUser.totalTransactions,
            totalSpent: demoUser.totalSpent,
            sovBalance: demoUser.balance,
            joinedDaysAgo: Math.floor(Math.random() * 365) + 30
          }
        });
      }
    }

    return res.status(404).json({ error: 'User profile not found' });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SOV wallet
app.get('/api/sov/balance', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    
    if (userEmail && isDemoUser(userEmail)) {
      const demoUser = getDemoUser(userEmail);
      if (demoUser) {
        return res.json({
          success: true,
          balance: {
            balance: demoUser.balance,
            lockedBalance: 0,
            pendingBalance: 0
          }
        });
      }
    }

    return res.json({
      success: true,
      balance: { balance: 0, lockedBalance: 0, pendingBalance: 0 }
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch-all for other API routes
app.get('/api/*', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Demo endpoint - functionality simulated', 
    endpoint: req.path 
  });
});

app.post('/api/*', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Demo endpoint - action simulated', 
    endpoint: req.path 
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Demo server running on http://localhost:${PORT}`);
  console.log('\n📋 Available Demo Users:');
  console.log('================================');
  
  demoUsers.forEach(user => {
    console.log(`👤 ${user.fullName} (${user.rank.name})`);
    console.log(`   📧 ${user.email}`);
    console.log(`   🔑 Password: ${user.password}`);
    console.log(`   ⭐ Points: ${user.totalPoints.toLocaleString()}`);
    console.log(`   💰 Balance: ${user.balance} SOV`);
    console.log('   ──────────────────────────');
  });
  
  console.log('\n🔐 Admin Login:');
  console.log('📧 admin@sovico.com | 🔑 admin123');
  console.log('\n✨ Server ready for testing!');
});

module.exports = app;

