import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Check if this is a demo user or admin before logging out
      const userData = Cookies.get('userData');
      let shouldLogout = true;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          // Don't logout demo users or admin automatically
          if (user.isDemoUser || user.isAdmin || user.email?.includes('@athena.com') || user.email === 'admin@sovico.com') {
            shouldLogout = false;
          }
        } catch (e) {
          // Invalid user data, proceed with logout
        }
      }
      
      if (shouldLogout) {
        Cookies.remove('authToken');
        Cookies.remove('userData');
        toast.error('Session expired. Please login again.');
        window.location.href = '/auth/login';
      }
    } else if (response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (!response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

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

// API Service Class
class ApiService {
  // Authentication
  async login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
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
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data;
      
      Cookies.set('authToken', token, { expires: 7 });
      Cookies.set('userData', JSON.stringify(user), { expires: 7 });
      
      return { user, token };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
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
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateUserProfile(profileData: any) {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async upgradeToAthenaPrime() {
    try {
      const response = await api.post('/users/upgrade-prime');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Token Management
  async getTokenBalance(): Promise<TokenBalance> {
    try {
      const response = await api.get('/tokens/balance');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getTokenTransactions(page = 1, limit = 20, type?: string) {
    try {
      const params: any = { page, limit };
      if (type) params.type = type;
      
      const response = await api.get('/tokens/transactions', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async redeemTokens(amount: number, redeemType: string, redeemDetails?: any) {
    try {
      const response = await api.post('/tokens/redeem', {
        amount,
        redeemType,
        redeemDetails
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Marketplace
  async getMarketplaceOverview() {
    try {
      const response = await api.get('/marketplace/overview');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getOrderBook(limit = 20) {
    try {
      const response = await api.get('/marketplace/orderbook', { params: { limit } });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async createMarketplaceOrder(orderData: any) {
    try {
      const response = await api.post('/marketplace/orders', orderData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getUserOrders(status = 'active', page = 1, limit = 20) {
    try {
      const response = await api.get('/marketplace/my-orders', {
        params: { status, page, limit }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async cancelOrder(orderId: string) {
    try {
      const response = await api.delete(`/marketplace/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Shopping Cart
  async getCart() {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async addToCart(itemData: any) {
    try {
      const response = await api.post('/cart/items', itemData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateCartItem(itemId: string, quantity: number) {
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async removeFromCart(itemId: string) {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async checkout(checkoutData: any) {
    try {
      const response = await api.post('/cart/checkout', checkoutData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Services
  async searchVietjetFlights(searchParams: any) {
    try {
      const response = await api.get('/services/vietjet/flights', { params: searchParams });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getHDBankProducts(type?: string) {
    try {
      const params = type ? { type } : {};
      const response = await api.get('/services/hdbank/products', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async searchResorts(searchParams: any) {
    try {
      const response = await api.get('/services/resorts', { params: searchParams });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getInsuranceProducts(type?: string) {
    try {
      const params = type ? { type } : {};
      const response = await api.get('/services/insurance', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Analytics
  async getTransactionAnalytics(period = '30') {
    try {
      const response = await api.get('/transactions/analytics', { params: { period } });
      return response.data;
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
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.data;
    } catch (error) {
      return { status: 'unhealthy', error: (error as Error).message };
    }
  }

  // Generic HTTP methods
  async get(endpoint: string, params?: any) {
    try {
      const response = await api.get(endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async post(endpoint: string, data?: any, config?: any) {
    try {
      const response = await api.post(endpoint, data, config);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async put(endpoint: string, data?: any) {
    try {
      const response = await api.put(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async delete(endpoint: string) {
    try {
      const response = await api.delete(endpoint);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

