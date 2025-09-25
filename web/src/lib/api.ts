import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { 
  mockUsers, 
  mockTokenBalances, 
  mockTransactions, 
  mockMarketplaceOrders, 
  mockCartItems, 
  mockCartSummary,
  mockVietjetFlights,
  mockHDBankProducts,
  mockSovicoResorts,
  mockInsuranceProducts,
  mockAnalytics,
  mockRankingData,
  mockLeaderboard,
  mockServiceBonus,
  mockPersonalization,
  getMockDataByUserId,
  simulateApiDelay,
  generateId
} from './mockData';
import { sovTokenService } from '@/services/sovTokenService';

// API Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  isVerified: boolean;
  athenaPrime: boolean;
  role?: string;
  isAdmin?: boolean;
  isDemoUser?: boolean;
  ranking?: any;
  balance?: number;
  createdAt: string;
}

export interface TokenBalance {
  balance: number;
  lockedBalance: number;
  totalEarned: number;
  totalSpent: number;
  netTokens: number;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  serviceType?: string;
  serviceReferenceId?: string;
  status: string;
  metadata?: any;
  createdAt: string;
}

export interface MarketplaceOrder {
  id: string;
  orderType: 'buy' | 'sell';
  amount: number;
  filledAmount: number;
  remainingAmount: number;
  pricePerToken: number;
  totalValue: number;
  status: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  serviceType: string;
  serviceItemId: string;
  quantity: number;
  price: number;
  subtotal: number;
  metadata?: any;
  estimatedTokens: number;
  addedAt: string;
}

export interface CartSummary {
  totalItems: number;
  totalAmount: number;
  estimatedTokens: number;
  isAthenaPrime: boolean;
  currency: string;
}

// API Service Class - Mock Implementation
class ApiService {
  // Authentication
  async login(email: string, password: string) {
    try {
      await simulateApiDelay(800);
      
      // Find user in mock data
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Simulate password check (always pass for demo)
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      const token = `mock_token_${user.id}_${Date.now()}`;
      
      // Store auth data in cookies
      Cookies.set('authToken', token, { expires: 7 });
      Cookies.set('userData', JSON.stringify(user), { expires: 7 });
      
      return { user, token };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async register(userData: any) {
    try {
      await simulateApiDelay(1000);
      
      // Check if email already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }
      
      // Create new user
      const newUser: User = {
        id: generateId('user'),
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
        address: userData.address,
        isVerified: false,
        athenaPrime: false,
        role: 'user',
        isAdmin: false,
        isDemoUser: false,
        balance: 0,
        createdAt: new Date().toISOString()
      };
      
      const token = `mock_token_${newUser.id}_${Date.now()}`;
      
      // Store auth data in cookies
      Cookies.set('authToken', token, { expires: 7 });
      Cookies.set('userData', JSON.stringify(newUser), { expires: 7 });
      
      return { user: newUser, token };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await simulateApiDelay(200);
      Cookies.remove('authToken');
      Cookies.remove('userData');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  // User Management
  async getUserProfile() {
    try {
      await simulateApiDelay(500);
      
      const userData = Cookies.get('userData');
      if (!userData) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(userData);
      return { user };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateUserProfile(profileData: any) {
    try {
      await simulateApiDelay(600);
      
      const userData = Cookies.get('userData');
      if (!userData) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(userData);
      const updatedUser = { ...user, ...profileData };
      
      // Update stored user data
      Cookies.set('userData', JSON.stringify(updatedUser), { expires: 7 });
      
      return { user: updatedUser };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async upgradeToAthenaPrime() {
    try {
      await simulateApiDelay(800);
      
      const userData = Cookies.get('userData');
      if (!userData) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(userData);
      const updatedUser = { ...user, athenaPrime: true };
      
      // Update stored user data
      Cookies.set('userData', JSON.stringify(updatedUser), { expires: 7 });
      
      return { 
        user: updatedUser,
        benefits: ['1.5x token earning rate', 'Priority support', 'Exclusive rewards']
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Token Management
  async getTokenBalance(): Promise<TokenBalance> {
    try {
      await simulateApiDelay(400);
      
      const userData = Cookies.get('userData');
      if (!userData) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(userData);
      
      // Use SOV token service for real wallet data
      const sovWallet = sovTokenService.getWallet();
      
      return {
        balance: sovWallet.balance,
        lockedBalance: sovWallet.lockedBalance,
        totalEarned: sovWallet.totalEarned,
        totalSpent: sovWallet.totalSpent,
        netTokens: sovWallet.netTokens
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getTokenTransactions(page = 1, limit = 20, type?: string) {
    try {
      await simulateApiDelay(500);
      
      // Use SOV token service for real transaction data
      let transactions = sovTokenService.getTransactions();
      
      if (type) {
        transactions = transactions.filter(t => t.type === type);
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTransactions = transactions.slice(startIndex, endIndex);
      
      return {
        transactions: paginatedTransactions,
        total: transactions.length,
        page,
        limit,
        totalPages: Math.ceil(transactions.length / limit)
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async redeemTokens(amount: number, redeemType: string, redeemDetails?: any) {
    try {
      await simulateApiDelay(700);
      
      const userData = Cookies.get('userData');
      if (!userData) {
        throw new Error('User not authenticated');
      }
      
      // Use SOV token service for real redemption
      const transaction = sovTokenService.spendTokens(
        amount, 
        `Redemption: ${redeemType}`, 
        'redemption',
        { redeemType, redeemDetails }
      );
      
      return {
        redemptionId: transaction.id,
        amount,
        redeemType,
        redeemDetails,
        status: 'completed',
        processedAt: transaction.createdAt
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Marketplace
  async getMarketplaceOverview() {
    try {
      await simulateApiDelay(400);
      
      return {
        totalVolume: 2500000,
        totalOrders: 150,
        averagePrice: 0.89,
        priceChange: 2.5,
        marketCap: 50000000,
        volume24h: 125000
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getOrderBook(limit = 20) {
    try {
      await simulateApiDelay(300);
      
      const buyOrders = mockMarketplaceOrders.filter(o => o.orderType === 'buy').slice(0, limit / 2);
      const sellOrders = mockMarketplaceOrders.filter(o => o.orderType === 'sell').slice(0, limit / 2);
      
      return {
        buyOrders,
        sellOrders,
        totalBuyOrders: buyOrders.length,
        totalSellOrders: sellOrders.length
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async createMarketplaceOrder(orderData: any) {
    try {
      await simulateApiDelay(600);
      
      const newOrder: MarketplaceOrder = {
        id: generateId('order'),
        orderType: orderData.orderType,
        amount: orderData.amount,
        filledAmount: 0,
        remainingAmount: orderData.amount,
        pricePerToken: orderData.pricePerToken,
        totalValue: orderData.amount * orderData.pricePerToken,
        status: 'active',
        expiresAt: orderData.expiresAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return { order: newOrder };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getUserOrders(status = 'active', page = 1, limit = 20) {
    try {
      await simulateApiDelay(400);
      
      let filteredOrders = mockMarketplaceOrders;
      if (status !== 'all') {
        filteredOrders = mockMarketplaceOrders.filter(o => o.status === status);
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
      
      return {
        orders: paginatedOrders,
        total: filteredOrders.length,
        page,
        limit,
        totalPages: Math.ceil(filteredOrders.length / limit)
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async cancelOrder(orderId: string) {
    try {
      await simulateApiDelay(500);
      
      const order = mockMarketplaceOrders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      if (order.status !== 'active') {
        throw new Error('Order cannot be cancelled');
      }
      
      return {
        orderId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Shopping Cart
  async getCart() {
    try {
      await simulateApiDelay(300);
      
      return {
        items: mockCartItems,
        summary: mockCartSummary
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async addToCart(itemData: any) {
    try {
      await simulateApiDelay(400);
      
      const newItem: CartItem = {
        id: generateId('cart'),
        serviceType: itemData.serviceType,
        serviceItemId: itemData.serviceItemId,
        quantity: itemData.quantity,
        price: itemData.price,
        subtotal: itemData.price * itemData.quantity,
        metadata: itemData.metadata,
        estimatedTokens: itemData.estimatedTokens || Math.floor(itemData.price * itemData.quantity / 5000),
        addedAt: new Date().toISOString()
      };
      
      return { item: newItem };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateCartItem(itemId: string, quantity: number) {
    try {
      await simulateApiDelay(300);
      
      const item = mockCartItems.find(i => i.id === itemId);
      if (!item) {
        throw new Error('Item not found in cart');
      }
      
      const updatedItem = {
        ...item,
        quantity,
        subtotal: item.price * quantity,
        estimatedTokens: Math.floor(item.price * quantity / 5000)
      };
      
      return { item: updatedItem };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async removeFromCart(itemId: string) {
    try {
      await simulateApiDelay(300);
      
      const item = mockCartItems.find(i => i.id === itemId);
      if (!item) {
        throw new Error('Item not found in cart');
      }
      
      return {
        itemId,
        removed: true,
        removedAt: new Date().toISOString()
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async checkout(checkoutData: any) {
    try {
      await simulateApiDelay(1000);
      
      // Use SOV token service for real payment processing
      const payment = sovTokenService.processPayment(
        checkoutData.estimatedTokens,
        'cart',
        checkoutData.orderId || generateId('order'),
        `Cart checkout - ${checkoutData.totalItems} items`
      );
      
      return {
        orderId: payment.serviceId,
        transactionId: payment.id,
        status: 'completed',
        totalAmount: checkoutData.totalAmount,
        estimatedTokens: checkoutData.estimatedTokens,
        processedAt: payment.completedAt
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // SOV Token specific methods
  async getSOVWallet() {
    try {
      await simulateApiDelay(300);
      return sovTokenService.getWallet();
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getSOVTransactions() {
    try {
      await simulateApiDelay(400);
      return sovTokenService.getTransactions();
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getSOVPayments() {
    try {
      await simulateApiDelay(400);
      return sovTokenService.getPayments();
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getSOVWalletStats() {
    try {
      await simulateApiDelay(300);
      return sovTokenService.getWalletStats();
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async stakeSOVTokens(amount: number, duration: number = 30) {
    try {
      await simulateApiDelay(800);
      return sovTokenService.stakeTokens(amount, duration);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async unstakeSOVTokens(amount: number) {
    try {
      await simulateApiDelay(800);
      return sovTokenService.unstakeTokens(amount);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async transferSOVTokens(amount: number, recipientId: string, description: string) {
    try {
      await simulateApiDelay(600);
      return sovTokenService.transferTokens(amount, recipientId, description);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async earnSOVTokens(amount: number, description: string, serviceType?: string, metadata?: any) {
    try {
      await simulateApiDelay(500);
      return sovTokenService.earnTokens(amount, description, serviceType, metadata);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Web3 specific methods
  async getWeb3Transactions() {
    try {
      await simulateApiDelay(500);
      return {
        transactions: [
          {
            id: 'tx_001',
            hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            type: 'swap',
            transaction_type: 'swap',
            wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
            from: '0x1234567890abcdef1234567890abcdef12345678',
            to: '0xabcdef1234567890abcdef1234567890abcdef12',
            amount: 1.5,
            token: 'ETH',
            timestamp: '2024-01-15T10:30:00Z',
            created_at: '2024-01-15T10:30:00Z',
            status: 'confirmed',
            confirmations: 12,
            gas_used: 21000,
            gas_price: 20
          },
          {
            id: 'tx_002',
            hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            type: 'transfer',
            transaction_type: 'transfer',
            wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
            from: '0x1234567890abcdef1234567890abcdef12345678',
            to: '0x9876543210fedcba9876543210fedcba98765432',
            amount: 1000,
            token: 'USDC',
            timestamp: '2024-01-14T15:45:00Z',
            created_at: '2024-01-14T15:45:00Z',
            status: 'confirmed',
            confirmations: 8,
            gas_used: 21000,
            gas_price: 18
          }
        ]
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getWeb3ContractInfo() {
    try {
      await simulateApiDelay(300);
      return {
        contract: {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          name: 'ATHENA Token',
          symbol: 'ATHENA',
          decimals: 18,
          totalSupply: '1000000000000000000000000',
          network: 'Ethereum',
          abi: '[]',
          verified: true,
          simulation: true,
          features: ['ERC20', 'Mintable', 'Burnable', 'Pausable']
        }
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getWeb3WalletBalance(walletAddress: string) {
    try {
      await simulateApiDelay(400);
      return {
        balance: {
          ETH: '2.5',
          USDC: '1000.00',
          ATHENA: '5000.00',
          total_usd: '8500.00'
        }
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Loyalty methods
  async getLoyaltyStatus() {
    try {
      await simulateApiDelay(400);
      return {
        data: {
          currentTier: {
            name: 'Gold',
            level: '3',
            icon: '🥇',
            color: '#F59E0B',
            bonusMultiplier: 1.5,
            benefits: ['Priority support', 'Exclusive offers', '1.5x earning bonus'],
            minPoints: 5000,
            maxPoints: 9999,
            points: 7500,
            multiplier: 1.5
          },
          points: 7500,
          nextTierPoints: 2500,
          totalSpent: 150000,
          benefits: ['Priority support', 'Exclusive offers', '1.5x earning bonus'],
          recentActivity: [
            { 
              service: 'flight', 
              transactionCount: 5, 
              lastTransaction: '2024-01-15' 
            },
            { 
              service: 'banking', 
              transactionCount: 3, 
              lastTransaction: '2024-01-10' 
            }
          ],
          nextTier: {
            name: 'Diamond',
            level: '4',
            icon: '💎',
            color: '#8B5CF6',
            bonusMultiplier: 2.0,
            benefits: ['VIP support', 'Exclusive events', '2x earning bonus'],
            minPoints: 10000,
            maxPoints: 99999,
            points: 10000,
            multiplier: 2.0
          },
          stats: {
            totalUnifiedPayments: 25,
            totalUnifiedAmount: 150000,
            totalCrossRewards: 50000,
            servicesUsed: ['flight', 'banking', 'resort', 'insurance'],
            servicesUsedThisMonth: 8,
            firstServiceDate: '2023-06-01',
            lastActivityDate: '2024-01-15'
          },
          availableBonuses: [
            { 
              type: 'welcome', 
              description: 'New member bonus', 
              bonus: 1000, 
              multiplier: 1.0, 
              eligible: true 
            },
            { 
              type: 'referral', 
              description: 'Refer a friend', 
              bonus: 500, 
              multiplier: 1.0, 
              eligible: true 
            }
          ]
        }
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getWeb3Profile() {
    try {
      await simulateApiDelay(400);
      return {
        profile: {
          wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
          wallet_type: 'EVM',
          nft_count: 5,
          total_transactions: 25,
          last_activity: '2024-01-15T10:30:00Z',
          connected_wallets: ['MetaMask', 'WalletConnect'],
          blockchain_networks: ['Ethereum', 'Polygon', 'BSC'],
          reputation_score: 85,
          governance_power: 150,
          total_staked: 5000,
          defi_protocols: ['Uniswap', 'Aave', 'Compound'],
          social_connections: 12,
          achievements: ['Early Adopter', 'DeFi Pioneer', 'NFT Collector'],
          token_balance: 7500,
          completed_trades: 45,
          staking_history: [
            { 
              protocol: 'Ethereum 2.0', 
              amount: 2.0, 
              duration: '365 days',
              duration_days: 365,
              apy_rate: 5.2,
              start_date: '2023-01-15',
              end_date: '2024-01-15',
              status: 'active',
              rewards_earned: 0.104
            },
            { 
              protocol: 'Uniswap LP', 
              amount: 1000, 
              duration: '90 days',
              duration_days: 90,
              apy_rate: 12.5,
              start_date: '2023-10-01',
              end_date: '2023-12-30',
              status: 'completed',
              rewards_earned: 30.8
            }
          ],
          nft_collections: [
            { 
              id: 'nft_001',
              name: 'CryptoPunk #1234',
              description: 'Rare CryptoPunk with unique attributes',
              image_url: 'https://example.com/cryptopunk1234.png',
              attributes: [
                { trait_type: 'Type', value: 'Alien' },
                { trait_type: 'Accessories', value: 'Cap Forward' }
              ],
              rarity_score: 95
            },
            { 
              id: 'nft_002',
              name: 'Bored Ape #5678',
              description: 'Exclusive Bored Ape from the collection',
              image_url: 'https://example.com/boredape5678.png',
              attributes: [
                { trait_type: 'Background', value: 'Blue' },
                { trait_type: 'Eyes', value: 'Bored' }
              ],
              rarity_score: 78
            },
            { 
              id: 'nft_003',
              name: 'Art Block #9999',
              description: 'Generative art piece from Art Blocks',
              image_url: 'https://example.com/artblock9999.png',
              attributes: [
                { trait_type: 'Algorithm', value: 'Fidenza' },
                { trait_type: 'Color', value: 'Multi' }
              ],
              rarity_score: 88
            }
          ]
        }
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Services
  async getAirports() {
    try {
      await simulateApiDelay(400);
      
      const airports = [
        { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam' },
        { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam' },
        { code: 'DAD', name: 'Da Nang International Airport', city: 'Da Nang', country: 'Vietnam' },
        { code: 'CXR', name: 'Cam Ranh International Airport', city: 'Nha Trang', country: 'Vietnam' },
        { code: 'PQC', name: 'Phu Quoc International Airport', city: 'Phu Quoc', country: 'Vietnam' },
        { code: 'HUI', name: 'Phu Bai Airport', city: 'Hue', country: 'Vietnam' },
        { code: 'VCA', name: 'Can Tho International Airport', city: 'Can Tho', country: 'Vietnam' },
        { code: 'DLI', name: 'Lien Khuong Airport', city: 'Da Lat', country: 'Vietnam' },
        { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
        { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore' },
        { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia' },
        { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' }
      ];
      
      return { airports };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async searchVietjetFlights(searchParams: any) {
    try {
      await simulateApiDelay(600);
      
      let filteredFlights = mockVietjetFlights;
      
      if (searchParams.departure) {
        filteredFlights = filteredFlights.filter(f => f.departure === searchParams.departure);
      }
      if (searchParams.arrival) {
        filteredFlights = filteredFlights.filter(f => f.arrival === searchParams.arrival);
      }
      if (searchParams.date) {
        // Simple date filtering for demo
        filteredFlights = filteredFlights.filter(f => f.departure.date.includes(searchParams.date));
      }
      
      return {
        flights: filteredFlights,
        total: filteredFlights.length,
        searchParams
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getHDBankProducts(type?: string) {
    try {
      await simulateApiDelay(400);
      
      let filteredProducts = mockHDBankProducts;
      if (type) {
        filteredProducts = mockHDBankProducts.filter(p => p.type === type);
      }
      
      return {
        products: filteredProducts,
        total: filteredProducts.length,
        type
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // HDBank specific endpoints
  async getHDBankLoans() {
    try {
      await simulateApiDelay(500);
      
      const mockLoans = [
        {
          id: 'loan_001',
          type: 'personal',
          name: 'Personal Loan',
          description: 'Flexible personal loan with competitive rates',
          minAmount: 10000000,
          maxAmount: 500000000,
          interestRates: {
            standard: { annual: 12.5, sovToken: 8.5 },
            prime: { annual: 10.5, sovToken: 7.5 },
            vip: { annual: 9.5, sovToken: 6.5 }
          },
          terms: [12, 24, 36, 48],
          processingFee: {
            fiat: 500000,
            sovToken: 100
          },
          features: ['Quick approval', 'Flexible terms', 'Low interest rates'],
          userTier: 'prime',
          applicableRates: { annual: 10.5, sovToken: 7.5 }
        },
        {
          id: 'loan_002',
          type: 'business',
          name: 'Business Loan',
          description: 'Business expansion and working capital loan',
          minAmount: 50000000,
          maxAmount: 2000000000,
          interestRates: {
            standard: { annual: 14.5, sovToken: 10.5 },
            prime: { annual: 12.5, sovToken: 9.5 },
            vip: { annual: 11.5, sovToken: 8.5 }
          },
          terms: [24, 36, 48, 60],
          processingFee: {
            fiat: 1000000,
            sovToken: 200
          },
          features: ['High amount', 'Long terms', 'Business support'],
          userTier: 'standard',
          applicableRates: { annual: 14.5, sovToken: 10.5 }
        }
      ];
      
      return { products: mockLoans };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getHDBankCreditCards() {
    try {
      await simulateApiDelay(500);
      
      const mockCards = [
        {
          id: 'card_001',
          type: 'premium',
          name: 'HDBank Premium Card',
          description: 'Premium credit card with exclusive benefits',
          annualFee: {
            fiat: 500000,
            sovToken: 100
          },
          creditLimit: {
            min: 10000000,
            max: 100000000
          },
          applicableCashback: 2.5,
          applicableRewards: 5,
          features: ['Cashback rewards', 'Travel insurance', 'Priority support'],
          userTier: 'prime'
        },
        {
          id: 'card_002',
          type: 'business',
          name: 'HDBank Business Card',
          description: 'Business credit card for entrepreneurs',
          annualFee: {
            fiat: 1000000,
            sovToken: 200
          },
          creditLimit: {
            min: 50000000,
            max: 500000000
          },
          applicableCashback: 3.0,
          applicableRewards: 8,
          features: ['Business expenses', 'Expense tracking', 'Corporate benefits'],
          userTier: 'standard'
        }
      ];
      
      return { products: mockCards };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getHDBankInvestments() {
    try {
      await simulateApiDelay(500);
      
      const mockInvestments = [
        {
          id: 'inv_001',
          type: 'mutual_fund',
          name: 'Growth Mutual Fund',
          description: 'Balanced growth investment fund',
          minInvestment: 5000000,
          expectedReturns: {
            low: 8.5,
            high: 12.5
          },
          riskLevel: 'medium',
          features: ['Diversified portfolio', 'Professional management', 'Regular dividends'],
          userTier: 'prime'
        },
        {
          id: 'inv_002',
          type: 'fixed_deposit',
          name: 'High Yield Fixed Deposit',
          description: 'Secure fixed deposit with competitive rates',
          minInvestment: 10000000,
          expectedReturns: {
            low: 6.5,
            high: 8.0
          },
          riskLevel: 'low',
          features: ['Guaranteed returns', 'Flexible terms', 'Early withdrawal option'],
          userTier: 'standard'
        }
      ];
      
      return { products: mockInvestments };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getHDBankMyServices() {
    try {
      await simulateApiDelay(400);
      
      const mockUserServices = {
        loans: [
          {
            id: 'loan_001',
            loan_type: 'personal',
            amount: 50000000,
            term_months: 24,
            interest_rate: 10.5,
            monthly_payment: 2300000,
            purpose: 'Home renovation',
            status: 'approved'
          }
        ],
        creditCards: [],
        insurance: [],
        investments: [
          {
            id: 'inv_001',
            product_type: 'mutual_fund',
            amount: 10000000,
            current_value: 10500000,
            expected_return: 500000,
            risk_level: 'medium',
            status: 'active'
          }
        ],
        summary: {
          totalServices: 2,
          activeLoans: 1,
          activeCreditCards: 0,
          activeInsurance: 0,
          activeInvestments: 1
        }
      };
      
      return mockUserServices;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async searchResorts(searchParams: any) {
    try {
      await simulateApiDelay(500);
      
      let filteredResorts = mockSovicoResorts;
      
      if (searchParams.location) {
        filteredResorts = filteredResorts.filter(r => 
          r.location.toLowerCase().includes(searchParams.location.toLowerCase())
        );
      }
      if (searchParams.maxPrice) {
        filteredResorts = filteredResorts.filter(r => r.price <= searchParams.maxPrice);
      }
      if (searchParams.minRating) {
        filteredResorts = filteredResorts.filter(r => r.rating >= searchParams.minRating);
      }
      
      return {
        resorts: filteredResorts,
        total: filteredResorts.length,
        searchParams
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getInsuranceProducts(type?: string) {
    try {
      await simulateApiDelay(400);
      
      let filteredProducts = mockInsuranceProducts;
      if (type) {
        filteredProducts = mockInsuranceProducts.filter(p => p.type === type);
      }
      
      return {
        products: filteredProducts,
        total: filteredProducts.length,
        type
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Analytics
  async getTransactionAnalytics(period = '30') {
    try {
      await simulateApiDelay(500);
      
      return mockAnalytics;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Utility methods
  handleError(error: any) {
    if (error.response) {
      const { data, status } = error.response;
      return {
        message: data.error || 'An error occurred',
        details: data.details || null,
        status,
      };
    } else if (error.request) {
      return {
        message: 'Network error. Please check your connection.',
        details: null,
        status: null,
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        details: null,
        status: null,
      };
    }
  }

  // Health check
  async healthCheck() {
    try {
      await simulateApiDelay(200);
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: (error as Error).message };
    }
  }

  // Generic HTTP methods (mock implementations)
  async get(endpoint: string, params?: any) {
    try {
      await simulateApiDelay(300);
      
      // Route to appropriate mock data based on endpoint
      if (endpoint.includes('/ranking')) {
        return mockRankingData;
      } else if (endpoint.includes('/leaderboard')) {
        return { leaderboard: mockLeaderboard };
      } else if (endpoint.includes('/service-bonus')) {
        return mockServiceBonus;
      } else if (endpoint.includes('/personalization')) {
        return mockPersonalization;
      }
      
      return { message: 'Mock data endpoint', endpoint, params };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async post(endpoint: string, data?: any, config?: any) {
    try {
      await simulateApiDelay(500);
      
      // Simulate successful POST operations
      const responseId = generateId('response');
      return { 
        id: responseId, 
        status: 'success', 
        data, 
        timestamp: new Date().toISOString() 
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async put(endpoint: string, data?: any) {
    try {
      await simulateApiDelay(400);
      
      const responseId = generateId('response');
      return { 
        id: responseId, 
        status: 'updated', 
        data, 
        timestamp: new Date().toISOString() 
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async delete(endpoint: string) {
    try {
      await simulateApiDelay(300);
      
      const responseId = generateId('response');
      return { 
        id: responseId, 
        status: 'deleted', 
        timestamp: new Date().toISOString() 
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

