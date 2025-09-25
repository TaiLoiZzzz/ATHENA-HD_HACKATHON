import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' // Development
  : 'https://your-production-api.com/api'; // Production

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
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
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
  (response) => response,
  async (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      showMessage({
        message: 'Session Expired',
        description: 'Please login again',
        type: 'warning',
      });
      // You might want to navigate to login screen here
    } else if (response?.status >= 500) {
      showMessage({
        message: 'Server Error',
        description: 'Something went wrong. Please try again later.',
        type: 'danger',
      });
    } else if (!response) {
      showMessage({
        message: 'Network Error',
        description: 'Please check your internet connection',
        type: 'danger',
      });
    }
    
    return Promise.reject(error);
  }
);

// API Service Class
class ApiService {
  // Authentication endpoints
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      // Store auth data
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data;
      
      // Store auth data
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyToken(token) {
    try {
      const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }

  async logout() {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  // User endpoints
  async getUserProfile() {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUserProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/users/password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async upgradeToAthenaPrime() {
    try {
      const response = await api.post('/users/upgrade-prime');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Token endpoints
  async getTokenBalance() {
    try {
      const response = await api.get('/tokens/balance');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTokenTransactions(page = 1, limit = 20, type = null) {
    try {
      const params = { page, limit };
      if (type) params.type = type;
      
      const response = await api.get('/tokens/transactions', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async calculateTokenEarning(vndAmount, serviceType) {
    try {
      const response = await api.post('/tokens/calculate-earning', {
        vndAmount,
        serviceType
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async redeemTokens(amount, redeemType, redeemDetails) {
    try {
      const response = await api.post('/tokens/redeem', {
        amount,
        redeemType,
        redeemDetails
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Marketplace endpoints
  async getMarketplaceOverview() {
    try {
      const response = await api.get('/marketplace/overview');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrderBook(limit = 20) {
    try {
      const response = await api.get('/marketplace/orderbook', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createMarketplaceOrder(orderData) {
    try {
      const response = await api.post('/marketplace/orders', orderData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserOrders(status = 'active', page = 1, limit = 20) {
    try {
      const response = await api.get('/marketplace/my-orders', {
        params: { status, page, limit }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelOrder(orderId) {
    try {
      const response = await api.delete(`/marketplace/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTradingHistory(page = 1, limit = 20) {
    try {
      const response = await api.get('/marketplace/trades', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cart endpoints
  async getCart() {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addToCart(itemData) {
    try {
      const response = await api.post('/cart/items', itemData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCartItem(itemId, quantity) {
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeFromCart(itemId) {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async clearCart() {
    try {
      const response = await api.delete('/cart');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkout(checkoutData) {
    try {
      const response = await api.post('/cart/checkout', checkoutData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Service endpoints
  async searchVietjetFlights(searchParams) {
    try {
      const response = await api.get('/services/vietjet/flights', {
        params: searchParams
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bookVietjetFlight(bookingData) {
    try {
      const response = await api.post('/services/vietjet/book', bookingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getHDBankProducts(type = null) {
    try {
      const params = type ? { type } : {};
      const response = await api.get('/services/hdbank/products', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async applyHDBankProduct(applicationData) {
    try {
      const response = await api.post('/services/hdbank/apply', applicationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchResorts(searchParams) {
    try {
      const response = await api.get('/services/resorts', {
        params: searchParams
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bookResort(bookingData) {
    try {
      const response = await api.post('/services/resorts/book', bookingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getInsuranceProducts(type = null) {
    try {
      const params = type ? { type } : {};
      const response = await api.get('/services/insurance', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async purchaseInsurance(purchaseData) {
    try {
      const response = await api.post('/services/insurance/purchase', purchaseData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserBookings(page = 1, limit = 20, serviceType = null) {
    try {
      const params = { page, limit };
      if (serviceType) params.service_type = serviceType;
      
      const response = await api.get('/services/bookings', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Transaction endpoints
  async getTransactionAnalytics(period = '30') {
    try {
      const response = await api.get('/transactions/analytics', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportTransactions(startDate, endDate, format = 'json') {
    try {
      const response = await api.get('/transactions/export', {
        params: { start_date: startDate, end_date: endDate, format }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTransactionDetails(transactionId) {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSpendingInsights() {
    try {
      const response = await api.get('/transactions/insights/spending');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { data, status } = error.response;
      return {
        message: data.error || 'An error occurred',
        details: data.details || null,
        status,
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        details: null,
        status: null,
      };
    } else {
      // Other error
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
      return { status: 'unhealthy', error: error.message };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
