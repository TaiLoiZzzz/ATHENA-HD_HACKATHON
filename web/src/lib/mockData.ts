// Mock Data for ATHENA Platform
// This file contains all mock data for the frontend-only version

import { User, TokenBalance, Transaction, MarketplaceOrder, CartItem, CartSummary } from './api';

// Mock Users with diverse ranks and SOV token balances
export const mockUsers: User[] = [
  // Diamond Tier Users (10,000+ points)
  {
    id: '1',
    email: 'diamond@athena.com',
    fullName: 'Diamond Elite',
    phone: '+84 123 456 789',
    dateOfBirth: '1985-03-15',
    address: 'Ho Chi Minh City, Vietnam',
    isVerified: true,
    athenaPrime: true,
    role: 'user',
    isAdmin: false,
    isDemoUser: false,
    balance: 75000, // Diamond tier - highest balance
    createdAt: '2023-06-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'admin@sovico.com',
    fullName: 'Sovico Admin',
    phone: '+84 987 654 321',
    dateOfBirth: '1980-08-20',
    address: 'Hanoi, Vietnam',
    isVerified: true,
    athenaPrime: true,
    role: 'admin',
    isAdmin: true,
    isDemoUser: false,
    balance: 100000, // Admin gets unlimited access
    createdAt: '2023-01-01T00:00:00Z'
  },

  // Gold Tier Users (5,000-9,999 points)
  {
    id: '3',
    email: 'gold@athena.com',
    fullName: 'Gold Member',
    phone: '+84 555 123 456',
    dateOfBirth: '1988-12-10',
    address: 'Da Nang, Vietnam',
    isVerified: true,
    athenaPrime: true,
    role: 'user',
    isAdmin: false,
    isDemoUser: false,
    balance: 45000, // Gold tier balance
    createdAt: '2023-09-15T00:00:00Z'
  },
  {
    id: '4',
    email: 'business@athena.com',
    fullName: 'Business Pro',
    phone: '+84 333 777 999',
    dateOfBirth: '1982-07-25',
    address: 'Ho Chi Minh City, Vietnam',
    isVerified: true,
    athenaPrime: true,
    role: 'user',
    isAdmin: false,
    isDemoUser: false,
    balance: 52000, // Business user with high activity
    createdAt: '2023-04-20T00:00:00Z'
  },
  {
    id: '5',
    email: 'premium@athena.com',
    fullName: 'Premium User',
    phone: '+84 666 888 111',
    dateOfBirth: '1990-05-30',
    address: 'Can Tho, Vietnam',
    isVerified: true,
    athenaPrime: true,
    role: 'user',
    isAdmin: false,
    isDemoUser: false,
    balance: 38000, // Premium user
    createdAt: '2023-11-10T00:00:00Z'
  },

  // Silver Tier Users (1,000-4,999 points)
  {
    id: '6',
    email: 'silver@athena.com',
    fullName: 'Silver Member',
    phone: '+84 444 555 666',
    dateOfBirth: '1992-11-18',
    address: 'Hai Phong, Vietnam',
    isVerified: true,
    athenaPrime: false,
    role: 'user',
    isAdmin: false,
    isDemoUser: false,
    balance: 18000, // Silver tier balance
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '7',
    email: 'frequent@athena.com',
    fullName: 'Frequent Traveler',
    phone: '+84 777 999 222',
    dateOfBirth: '1987-09-05',
    address: 'Nha Trang, Vietnam',
    isVerified: true,
    athenaPrime: false,
    role: 'user',
    isAdmin: false,
    isDemoUser: false,
    balance: 22000, // Frequent user
    createdAt: '2023-12-01T00:00:00Z'
  },
  {
    id: '8',
    email: 'banking@athena.com',
    fullName: 'Banking Enthusiast',
    phone: '+84 888 111 333',
    dateOfBirth: '1991-02-14',
    address: 'Hue, Vietnam',
    isVerified: true,
    athenaPrime: false,
    role: 'user',
    isAdmin: false,
    isDemoUser: false,
    balance: 15000, // Banking focused user
    createdAt: '2024-02-01T00:00:00Z'
  },

  // Bronze Tier Users (0-999 points)
  {
    id: '9',
    email: 'demo@athena.com',
    fullName: 'Demo User',
    phone: '+84 123 456 789',
    dateOfBirth: '1995-06-20',
    address: 'Ho Chi Minh City, Vietnam',
    isVerified: true,
    athenaPrime: false,
    role: 'user',
    isAdmin: false,
    isDemoUser: true,
    balance: 12000, // Demo user with moderate balance
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '10',
    email: 'newbie@athena.com',
    fullName: 'New User',
    phone: '+84 999 888 777',
    dateOfBirth: '1998-03-12',
    address: 'Vung Tau, Vietnam',
    isVerified: false,
    athenaPrime: false,
    role: 'user',
    isAdmin: false,
    isDemoUser: false,
    balance: 5000, // New user with basic balance
    createdAt: '2024-03-01T00:00:00Z'
  },
  {
    id: '11',
    email: 'student@athena.com',
    fullName: 'Student User',
    phone: '+84 111 222 333',
    dateOfBirth: '2000-08-25',
    address: 'Da Lat, Vietnam',
    isVerified: false,
    athenaPrime: false,
    role: 'user',
    isAdmin: false,
    isDemoUser: false,
    balance: 3000, // Student with limited balance
    createdAt: '2024-03-15T00:00:00Z'
  },
  {
    id: '12',
    email: 'casual@athena.com',
    fullName: 'Casual User',
    phone: '+84 555 666 777',
    dateOfBirth: '1993-10-08',
    address: 'Quy Nhon, Vietnam',
    isVerified: true,
    athenaPrime: false,
    role: 'user',
    isAdmin: false,
    isDemoUser: false,
    balance: 8000, // Casual user
    createdAt: '2024-02-20T00:00:00Z'
  },

  // Special Users
  {
    id: '13',
    email: 'vip@athena.com',
    fullName: 'VIP Member',
    phone: '+84 999 000 111',
    dateOfBirth: '1975-12-01',
    address: 'Ho Chi Minh City, Vietnam',
    isVerified: true,
    athenaPrime: true,
    role: 'user',
    isAdmin: false,
    isDemoUser: false,
    balance: 85000, // VIP with highest balance
    createdAt: '2023-03-01T00:00:00Z'
  },
  {
    id: '14',
    email: 'enterprise@athena.com',
    fullName: 'Enterprise Client',
    phone: '+84 222 333 444',
    dateOfBirth: '1978-04-15',
    address: 'Hanoi, Vietnam',
    isVerified: true,
    athenaPrime: true,
    role: 'user',
    isAdmin: false,
    isDemoUser: false,
    balance: 65000, // Enterprise user
    createdAt: '2023-05-10T00:00:00Z'
  },
  {
    id: '15',
    email: 'influencer@athena.com',
    fullName: 'Influencer',
    phone: '+84 777 888 999',
    dateOfBirth: '1989-11-30',
    address: 'Ho Chi Minh City, Vietnam',
    isVerified: true,
    athenaPrime: true,
    role: 'user',
    isAdmin: false,
    isDemoUser: false,
    balance: 55000, // Influencer with good balance
    createdAt: '2023-08-20T00:00:00Z'
  }
];

// Mock Token Balances - Diverse amounts for different user tiers
export const mockTokenBalances: Record<string, TokenBalance> = {
  // Diamond Tier (10,000+ points)
  '1': {
    balance: 75000, // Diamond Elite
    lockedBalance: 15000,
    totalEarned: 90000,
    totalSpent: 15000,
    netTokens: 75000
  },
  '2': {
    balance: 100000, // Admin - unlimited
    lockedBalance: 20000,
    totalEarned: 120000,
    totalSpent: 20000,
    netTokens: 100000
  },
  '13': {
    balance: 85000, // VIP Member
    lockedBalance: 17000,
    totalEarned: 102000,
    totalSpent: 17000,
    netTokens: 85000
  },
  '14': {
    balance: 65000, // Enterprise Client
    lockedBalance: 13000,
    totalEarned: 78000,
    totalSpent: 13000,
    netTokens: 65000
  },
  '15': {
    balance: 55000, // Influencer
    lockedBalance: 11000,
    totalEarned: 66000,
    totalSpent: 11000,
    netTokens: 55000
  },

  // Gold Tier (5,000-9,999 points)
  '3': {
    balance: 45000, // Gold Member
    lockedBalance: 9000,
    totalEarned: 54000,
    totalSpent: 9000,
    netTokens: 45000
  },
  '4': {
    balance: 52000, // Business Pro
    lockedBalance: 10400,
    totalEarned: 62400,
    totalSpent: 10400,
    netTokens: 52000
  },
  '5': {
    balance: 38000, // Premium User
    lockedBalance: 7600,
    totalEarned: 45600,
    totalSpent: 7600,
    netTokens: 38000
  },

  // Silver Tier (1,000-4,999 points)
  '6': {
    balance: 18000, // Silver Member
    lockedBalance: 3600,
    totalEarned: 21600,
    totalSpent: 3600,
    netTokens: 18000
  },
  '7': {
    balance: 22000, // Frequent Traveler
    lockedBalance: 4400,
    totalEarned: 26400,
    totalSpent: 4400,
    netTokens: 22000
  },
  '8': {
    balance: 15000, // Banking Enthusiast
    lockedBalance: 3000,
    totalEarned: 18000,
    totalSpent: 3000,
    netTokens: 15000
  },

  // Bronze Tier (0-999 points)
  '9': {
    balance: 12000, // Demo User
    lockedBalance: 2400,
    totalEarned: 14400,
    totalSpent: 2400,
    netTokens: 12000
  },
  '10': {
    balance: 5000, // New User
    lockedBalance: 1000,
    totalEarned: 6000,
    totalSpent: 1000,
    netTokens: 5000
  },
  '11': {
    balance: 3000, // Student User
    lockedBalance: 600,
    totalEarned: 3600,
    totalSpent: 600,
    netTokens: 3000
  },
  '12': {
    balance: 8000, // Casual User
    lockedBalance: 1600,
    totalEarned: 9600,
    totalSpent: 1600,
    netTokens: 8000
  }
};

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'tx_001',
    type: 'earn',
    amount: 500,
    description: 'Flight booking reward - VietJet Air',
    serviceType: 'flight',
    serviceReferenceId: 'VJ123',
    status: 'completed',
    metadata: { airline: 'VietJet Air', route: 'SGN-HAN' },
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'tx_002',
    type: 'earn',
    amount: 300,
    description: 'Banking service reward - HDBank',
    serviceType: 'banking',
    serviceReferenceId: 'HD456',
    status: 'completed',
    metadata: { bank: 'HDBank', service: 'Savings Account' },
    createdAt: '2024-01-14T14:20:00Z'
  },
  {
    id: 'tx_003',
    type: 'spend',
    amount: -200,
    description: 'Marketplace purchase - Electronics',
    serviceType: 'marketplace',
    serviceReferenceId: 'MP789',
    status: 'completed',
    metadata: { category: 'Electronics', item: 'Smartphone' },
    createdAt: '2024-01-13T09:15:00Z'
  },
  {
    id: 'tx_004',
    type: 'stake',
    amount: 1000,
    description: 'SOV Token Staking',
    serviceType: 'staking',
    serviceReferenceId: 'STK001',
    status: 'active',
    metadata: { apy: '12.5%', duration: '30 days' },
    createdAt: '2024-01-12T16:45:00Z'
  },
  {
    id: 'tx_005',
    type: 'earn',
    amount: 150,
    description: 'Resort booking reward - Sovico',
    serviceType: 'resort',
    serviceReferenceId: 'SR001',
    status: 'completed',
    metadata: { resort: 'Sovico Resort', location: 'Phu Quoc' },
    createdAt: '2024-01-11T11:30:00Z'
  }
];

// Mock Marketplace Orders
export const mockMarketplaceOrders: MarketplaceOrder[] = [
  {
    id: 'order_001',
    orderType: 'buy',
    amount: 1000,
    filledAmount: 500,
    remainingAmount: 500,
    pricePerToken: 0.85,
    totalValue: 850,
    status: 'active',
    expiresAt: '2024-02-01T00:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'order_002',
    orderType: 'sell',
    amount: 2000,
    filledAmount: 0,
    remainingAmount: 2000,
    pricePerToken: 0.92,
    totalValue: 1840,
    status: 'active',
    expiresAt: '2024-02-05T00:00:00Z',
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-14T15:30:00Z'
  }
];

// Mock Cart Items
export const mockCartItems: CartItem[] = [
  {
    id: 'cart_001',
    serviceType: 'flight',
    serviceItemId: 'VJ456',
    quantity: 2,
    price: 1500000,
    subtotal: 3000000,
    metadata: { 
      airline: 'VietJet Air', 
      route: 'SGN-HAN', 
      date: '2024-02-15',
      passengers: 2
    },
    estimatedTokens: 600,
    addedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cart_002',
    serviceType: 'banking',
    serviceItemId: 'HD789',
    quantity: 1,
    price: 500000,
    subtotal: 500000,
    metadata: { 
      bank: 'HDBank', 
      service: 'Premium Savings',
      duration: '12 months'
    },
    estimatedTokens: 100,
    addedAt: '2024-01-15T11:00:00Z'
  }
];

// Mock Cart Summary
export const mockCartSummary: CartSummary = {
  totalItems: 2,
  totalAmount: 3500000,
  estimatedTokens: 700,
  isAthenaPrime: true,
  currency: 'VND'
};

// Mock VietJet Flights
export const mockVietjetFlights = [
  {
    id: 'VJ001',
    flightNumber: 'VJ123',
    airline: 'VietJet Air',
    aircraft: 'A320',
    departure: {
      airport: { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam' },
      time: '08:00',
      date: '2024-02-15'
    },
    arrival: {
      airport: { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam' },
      time: '10:00',
      date: '2024-02-15'
    },
    duration: '2h 00m',
    price: {
      base: 1500000,
      currency: 'VND',
      breakdown: {
        baseFare: 1200000,
        taxes: 200000,
        fees: 100000
      }
    },
    sovTokens: {
      standard: 150,
      prime: 225
    },
    cabin: 'economy',
    availableSeats: 45,
    baggage: {
      carry: '7kg',
      checked: '20kg'
    },
    amenities: ['WiFi', 'Entertainment', 'Meal'],
    cancellationPolicy: 'Free cancellation up to 24 hours before departure'
  },
  {
    id: 'VJ002',
    flightNumber: 'VJ456',
    airline: 'VietJet Air',
    aircraft: 'A321',
    departure: {
      airport: { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam' },
      time: '14:00',
      date: '2024-02-20'
    },
    arrival: {
      airport: { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam' },
      time: '16:00',
      date: '2024-02-20'
    },
    duration: '2h 00m',
    price: {
      base: 1800000,
      currency: 'VND',
      breakdown: {
        baseFare: 1500000,
        taxes: 200000,
        fees: 100000
      }
    },
    sovTokens: {
      standard: 180,
      prime: 270
    },
    cabin: 'economy',
    availableSeats: 32,
    baggage: {
      carry: '7kg',
      checked: '20kg'
    },
    amenities: ['WiFi', 'Entertainment', 'Meal'],
    cancellationPolicy: 'Free cancellation up to 24 hours before departure'
  },
  {
    id: 'VJ003',
    flightNumber: 'VJ789',
    airline: 'VietJet Air',
    aircraft: 'A320',
    departure: {
      airport: { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam' },
      time: '20:00',
      date: '2024-02-25'
    },
    arrival: {
      airport: { code: 'DAD', name: 'Da Nang International Airport', city: 'Da Nang', country: 'Vietnam' },
      time: '21:30',
      date: '2024-02-25'
    },
    duration: '1h 30m',
    price: {
      base: 1200000,
      currency: 'VND',
      breakdown: {
        baseFare: 1000000,
        taxes: 150000,
        fees: 50000
      }
    },
    sovTokens: {
      standard: 120,
      prime: 180
    },
    cabin: 'economy',
    availableSeats: 28,
    baggage: {
      carry: '7kg',
      checked: '20kg'
    },
    amenities: ['WiFi', 'Entertainment', 'Meal'],
    cancellationPolicy: 'Free cancellation up to 24 hours before departure'
  }
];

// Mock HDBank Products
export const mockHDBankProducts = [
  {
    id: 'HD001',
    name: 'Premium Savings Account',
    type: 'savings',
    interestRate: 6.5,
    minDeposit: 10000000,
    duration: '12 months',
    features: ['High interest rate', 'Online banking', 'Mobile app'],
    description: 'Premium savings account with competitive interest rates'
  },
  {
    id: 'HD002',
    name: 'Business Loan',
    type: 'loan',
    interestRate: 8.5,
    maxAmount: 500000000,
    duration: '24 months',
    features: ['Quick approval', 'Flexible terms', 'Low interest'],
    description: 'Business loan for small and medium enterprises'
  },
  {
    id: 'HD003',
    name: 'Credit Card',
    type: 'credit',
    creditLimit: 50000000,
    annualFee: 500000,
    features: ['Cashback rewards', 'Travel insurance', 'Online shopping'],
    description: 'Premium credit card with exclusive benefits'
  }
];

// Mock Sovico Resorts
export const mockSovicoResorts = [
  {
    id: 'SR001',
    name: 'Sovico Resort Phu Quoc',
    location: 'Phu Quoc, Vietnam',
    rating: 4.8,
    price: 2500000,
    amenities: ['Beach access', 'Spa', 'Restaurant', 'Pool'],
    description: 'Luxury beachfront resort with world-class amenities',
    images: ['resort1.jpg', 'resort2.jpg', 'resort3.jpg']
  },
  {
    id: 'SR002',
    name: 'Sovico Resort Da Nang',
    location: 'Da Nang, Vietnam',
    rating: 4.6,
    price: 1800000,
    amenities: ['City view', 'Gym', 'Restaurant', 'Business center'],
    description: 'Modern resort in the heart of Da Nang city',
    images: ['resort4.jpg', 'resort5.jpg', 'resort6.jpg']
  }
];

// Mock Insurance Products
export const mockInsuranceProducts = [
  {
    id: 'INS001',
    name: 'Travel Insurance',
    type: 'travel',
    coverage: 100000000,
    premium: 500000,
    duration: '30 days',
    features: ['Medical coverage', 'Trip cancellation', 'Baggage protection'],
    description: 'Comprehensive travel insurance for your peace of mind'
  },
  {
    id: 'INS002',
    name: 'Health Insurance',
    type: 'health',
    coverage: 500000000,
    premium: 2000000,
    duration: '12 months',
    features: ['Hospital coverage', 'Outpatient care', 'Emergency services'],
    description: 'Complete health insurance coverage for you and your family'
  }
];

// Mock Analytics Data
export const mockAnalytics = {
  period: '30',
  totalTransactions: 25,
  totalVolume: 15000000,
  averageTransaction: 600000,
  topServices: [
    { service: 'Flight Booking', count: 8, percentage: 32 },
    { service: 'Banking', count: 6, percentage: 24 },
    { service: 'Marketplace', count: 5, percentage: 20 },
    { service: 'Resort Booking', count: 4, percentage: 16 },
    { service: 'Insurance', count: 2, percentage: 8 }
  ],
  monthlyTrend: [
    { month: 'Jan', transactions: 15, volume: 8000000 },
    { month: 'Feb', transactions: 20, volume: 12000000 },
    { month: 'Mar', transactions: 25, volume: 15000000 }
  ]
};

// Mock Ranking Data
export const mockRankingData = {
  userRank: {
    name: 'Gold',
    level: 3,
    icon: '🥇',
    color: '#FFD700',
    bonusMultiplier: 1.5,
    benefits: ['Priority support', 'Exclusive rewards', 'Higher earning rates'],
    minPoints: 5000,
    maxPoints: 9999
  },
  rank: {
    name: 'Gold',
    level: 3,
    icon: '🥇',
    color: '#FFD700',
    bonusMultiplier: 1.5,
    benefits: ['Priority support', 'Exclusive rewards', 'Higher earning rates'],
    minPoints: 5000,
    maxPoints: 9999
  },
  totalPoints: 7500,
  totalSpent: 15000000,
  totalTransactions: 25,
  servicesUsed: {
    'flight': 8,
    'banking': 6,
    'marketplace': 5,
    'resort': 4,
    'insurance': 2
  },
  achievements: [
    'First Flight',
    'Banking Pro',
    'Marketplace Explorer',
    'Resort Lover',
    'Insurance Guardian'
  ],
  nextRankPoints: 10000,
  bonusMultiplier: 1.5
};

// Mock Leaderboard
export const mockLeaderboard = [
  {
    position: 1,
    user: { name: 'Diamond User', email: 'diamond@athena.com' },
    stats: { totalPoints: 25000, totalSpent: 50000000, totalTransactions: 100 },
    rank: { name: 'Diamond', level: 4, icon: '💎', color: '#B9F2FF' }
  },
  {
    position: 2,
    user: { name: 'Gold User', email: 'gold@athena.com' },
    stats: { totalPoints: 15000, totalSpent: 30000000, totalTransactions: 75 },
    rank: { name: 'Gold', level: 3, icon: '🥇', color: '#FFD700' }
  },
  {
    position: 3,
    user: { name: 'Silver User', email: 'silver@athena.com' },
    stats: { totalPoints: 10000, totalSpent: 20000000, totalTransactions: 50 },
    rank: { name: 'Silver', level: 2, icon: '🥈', color: '#C0C0C0' }
  }
];

// Mock Service Bonus
export const mockServiceBonus = {
  eligible: true,
  amount: 150,
  baseAmount: 100,
  percentageBonus: 50,
  maxBonus: 200,
  minSpendingRequired: 1000000,
  description: 'Gold member bonus for flight booking',
  userRank: {
    name: 'Gold',
    color: '#FFD700',
    icon: '🥇',
    level: 3,
    bonusMultiplier: 1.5
  },
  transactionAmount: 1500000,
  message: 'You earned 150 bonus tokens!'
};

// Mock Personalization Data
export const mockPersonalization = {
  preferences: {
    language: 'vi',
    currency: 'VND',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    theme: 'dark' as 'dark' | 'light' | 'auto',
    dashboard: {
      layout: 'grid' as 'grid' | 'list' | 'compact',
      widgets: ['portfolio', 'transactions', 'marketplace', 'ranking']
    }
  },
  lastUpdated: '2024-01-15T10:30:00Z',
  recommendations: [
    {
      id: 'rec_001',
      type: 'flight' as 'flight' | 'banking' | 'marketplace' | 'resort' | 'insurance',
      title: 'Recommended Flight to Bangkok',
      description: 'Based on your travel history',
      price: 2000000,
      savings: 300000,
      priority: 'high' as 'high' | 'medium' | 'low'
    },
    {
      id: 'rec_002',
      type: 'banking' as 'flight' | 'banking' | 'marketplace' | 'resort' | 'insurance',
      title: 'Premium Savings Account',
      description: 'Higher interest rate for your balance',
      interestRate: 7.5,
      currentRate: 6.5,
      priority: 'medium' as 'high' | 'medium' | 'low'
    },
    {
      id: 'rec_003',
      type: 'resort' as 'flight' | 'banking' | 'marketplace' | 'resort' | 'insurance',
      title: 'Sovico Resort Phu Quoc',
      description: 'Perfect for your upcoming vacation',
      price: 2500000,
      discount: 10,
      priority: 'low' as 'high' | 'medium' | 'low'
    }
  ],
  insights: [
    {
      id: 'insight_001',
      type: 'spending' as 'spending' | 'earning' | 'saving' | 'trend',
      title: 'Monthly Spending Analysis',
      description: 'You spent 15% more this month',
      value: 15000000,
      change: 15,
      trend: 'up' as 'up' | 'down' | 'stable',
      period: 'monthly',
      actionable: true
    },
    {
      id: 'insight_002',
      type: 'earning' as 'spending' | 'earning' | 'saving' | 'trend',
      title: 'Token Earning Potential',
      description: 'You could earn 500 more tokens',
      value: 500,
      change: 25,
      trend: 'up' as 'up' | 'down' | 'stable',
      suggestion: 'Complete 2 more transactions',
      period: 'weekly',
      actionable: true
    }
  ]
};

// Helper function to get mock data by user ID
export const getMockDataByUserId = (userId: string) => {
  const user = mockUsers.find(u => u.id === userId);
  const tokenBalance = mockTokenBalances[userId];
  const userTransactions = mockTransactions.filter(t => t.id.startsWith('tx_'));
  
  return {
    user,
    tokenBalance,
    transactions: userTransactions,
    cartItems: mockCartItems,
    cartSummary: mockCartSummary,
    marketplaceOrders: mockMarketplaceOrders,
    analytics: mockAnalytics,
    ranking: mockRankingData,
    leaderboard: mockLeaderboard,
    personalization: mockPersonalization
  };
};

// Helper function to simulate API delay
export const simulateApiDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper function to generate random ID
export const generateId = (prefix: string = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
