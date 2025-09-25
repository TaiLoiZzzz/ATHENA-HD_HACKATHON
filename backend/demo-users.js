// Demo users for testing the ranking system
// Note: Using simple password comparison for demo purposes

// Pre-hashed passwords for demo users
const demoUsers = [
  // Diamond Rank Users
  {
    id: 'diamond-user-001',
    email: 'diamond1@athena.com',
    password: 'diamond123', // Will be hashed
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm',
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
      points: 28500,
      totalSpent: 125000000,
      totalTransactions: 85,
      servicesUsed: { vietjet: 25, hdbank: 30, sovico: 30 },
      achievements: ['Early Adopter', 'VIP Traveler', 'Premium Banking', 'Luxury Lifestyle', 'Diamond Explorer'],
      nextRankPoints: null // Max rank
    },
    balance: 2580.50
  },
  {
    id: 'diamond-user-002',
    email: 'diamond2@athena.com',
    password: 'diamond123',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm',
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
      points: 22000,
      totalSpent: 98000000,
      totalTransactions: 72,
      servicesUsed: { vietjet: 20, hdbank: 25, sovico: 27 },
      achievements: ['Power User', 'Business Traveler', 'Investment Pro', 'Luxury Lover'],
      nextRankPoints: null
    },
    balance: 1950.75
  },

  // Gold Rank Users
  {
    id: 'gold-user-001',
    email: 'gold1@athena.com',
    password: 'gold123',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm',
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
      points: 12500,
      totalSpent: 65000000,
      totalTransactions: 48,
      servicesUsed: { vietjet: 15, hdbank: 18, sovico: 15 },
      achievements: ['Frequent Flyer', 'Smart Investor', 'Resort Enthusiast'],
      nextRankPoints: 20000
    },
    balance: 850.25
  },
  {
    id: 'gold-user-002',
    email: 'gold2@athena.com',
    password: 'gold123',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm',
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
      points: 8750,
      totalSpent: 42000000,
      totalTransactions: 35,
      servicesUsed: { vietjet: 12, hdbank: 12, sovico: 11 },
      achievements: ['Travel Lover', 'Banking Pro', 'Weekend Warrior'],
      nextRankPoints: 20000
    },
    balance: 650.00
  },

  // Silver Rank Users
  {
    id: 'silver-user-001',
    email: 'silver1@athena.com',
    password: 'silver123',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm',
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
      points: 3200,
      totalSpent: 18000000,
      totalTransactions: 22,
      servicesUsed: { vietjet: 8, hdbank: 7, sovico: 7 },
      achievements: ['Explorer', 'Smart Saver'],
      nextRankPoints: 5000
    },
    balance: 320.80
  },
  {
    id: 'silver-user-002',
    email: 'silver2@athena.com',
    password: 'silver123',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm',
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
      points: 2100,
      totalSpent: 12000000,
      totalTransactions: 18,
      servicesUsed: { vietjet: 6, hdbank: 6, sovico: 6 },
      achievements: ['Rising Star', 'Budget Traveler'],
      nextRankPoints: 5000
    },
    balance: 275.40
  },

  // Bronze Rank Users
  {
    id: 'bronze-user-001',
    email: 'bronze1@athena.com',
    password: 'bronze123',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/7OZqLgfhm',
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
      points: 850,
      totalSpent: 5000000,
      totalTransactions: 8,
      servicesUsed: { vietjet: 3, hdbank: 2, sovico: 3 },
      achievements: ['Newcomer'],
      nextRankPoints: 1000
    },
    balance: 125.50
  }
];

// Get demo user by email
const getDemoUser = (email) => {
  return demoUsers.find(user => user.email === email);
};

// Validate demo user password
const validateDemoPassword = async (email, password) => {
  const user = getDemoUser(email);
  if (!user) return null;
  
  // Simple password comparison for demo
  return password === user.password ? user : null;
};

// Get all demo users (for admin purposes)
const getAllDemoUsers = () => {
  return demoUsers.map(user => ({
    ...user,
    password: undefined, // Don't expose passwords
    passwordHash: undefined
  }));
};

// Check if email is a demo user
const isDemoUser = (email) => {
  return email && email.includes('@athena.com');
};

module.exports = {
  demoUsers,
  getDemoUser,
  validateDemoPassword,
  getAllDemoUsers,
  isDemoUser
};
