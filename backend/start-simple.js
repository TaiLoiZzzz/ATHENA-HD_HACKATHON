// Simple backend server without npm dependencies
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

// Mock user data
const users = {
  '1': {
    id: '1',
    email: 'demo@sovico.com',
    fullName: 'Demo User',
    phone: '+84 123 456 789',
    dateOfBirth: '1990-01-01',
    address: 'Ho Chi Minh City, Vietnam',
    avatarUrl: null,
    isVerified: true,
    athenaPrime: true,
    createdAt: '2024-01-01T00:00:00Z',
    tokenBalance: {
      balance: 1250.50,
      totalEarned: 2500.75,
      totalSpent: 1250.25
    }
  }
};

const statistics = {
  '1': {
    totalEarningTransactions: 45,
    totalSpendingTransactions: 23,
    totalMarketplaceTransactions: 8,
    servicesUsed: 3
  }
};

const activity = {
  period: '30 days',
  transactionActivity: [],
  serviceUsage: [
    { serviceType: 'hdbank', bookingCount: 2, totalSpent: 5000000 },
    { serviceType: 'vietjet', bookingCount: 1, totalSpent: 2500000 }
  ],
  marketplaceActivity: { tradeCount: 3, totalTokensTraded: 150.5 }
};

// CORS headers
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Simple JSON response
function jsonResponse(res, data, statusCode = 200) {
  setCORSHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Handle avatar uploads directory
const uploadsDir = path.join(__dirname, 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve static avatar files
  if (pathname.startsWith('/uploads/avatars/')) {
    const filePath = path.join(__dirname, pathname);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = ext === '.webp' ? 'image/webp' : 
                         ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                         ext === '.png' ? 'image/png' : 'application/octet-stream';
      
      setCORSHeaders(res);
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // API Routes
  if (pathname === '/api/users/profile' && method === 'GET') {
    jsonResponse(res, { user: users['1'], statistics: statistics['1'] });
    return;
  }

  if (pathname === '/api/users/activity' && method === 'GET') {
    jsonResponse(res, activity);
    return;
  }

  if (pathname === '/api/users/profile' && method === 'PUT') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        // Update user data
        Object.assign(users['1'], updates);
        jsonResponse(res, { success: true, message: 'Profile updated successfully', user: users['1'] });
      } catch (error) {
        jsonResponse(res, { error: 'Invalid JSON' }, 400);
      }
    });
    return;
  }

  if (pathname === '/api/users/password' && method === 'PUT') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      jsonResponse(res, { success: true, message: 'Password changed successfully' });
    });
    return;
  }

  if (pathname === '/api/users/avatar' && method === 'POST') {
    // Simple avatar upload mock
    const avatarUrl = `/uploads/avatars/avatar_1_${Date.now()}.webp`;
    users['1'].avatarUrl = avatarUrl;
    jsonResponse(res, { success: true, message: 'Avatar uploaded successfully', avatarUrl });
    return;
  }

  if (pathname === '/api/users/avatar' && method === 'DELETE') {
    users['1'].avatarUrl = null;
    jsonResponse(res, { success: true, message: 'Avatar deleted successfully' });
    return;
  }

  if (pathname === '/api/tokens/balance' && method === 'GET') {
    jsonResponse(res, users['1'].tokenBalance);
    return;
  }

  if (pathname === '/api/loyalty/status' && method === 'GET') {
    jsonResponse(res, {
      currentTier: { name: 'Gold', level: 'gold', points: 7500, multiplier: 1.5, benefits: ['50% bonus rewards', 'VIP support', 'Exclusive offers'] },
      nextTier: { name: 'Platinum', level: 'platinum', pointsNeeded: 12500, benefits: ['100% bonus rewards', 'Personal advisor'] },
      stats: { servicesUsedThisMonth: 2, totalCrossRewards: 450 },
      availableBonuses: [
        { type: 'two_services', description: 'Use 2 services in a month', bonus: 50, multiplier: 1.1, eligible: true }
      ],
      recentActivity: []
    });
    return;
  }

  // Health check
  if (pathname === '/health') {
    jsonResponse(res, { status: 'healthy', timestamp: new Date().toISOString() });
    return;
  }

  // 404
  jsonResponse(res, { error: 'Not found' }, 404);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Simple Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👤 Profile API: http://localhost:${PORT}/api/users/profile`);
});

