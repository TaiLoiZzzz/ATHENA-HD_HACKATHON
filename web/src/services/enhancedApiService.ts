// Enhanced API service with comprehensive error handling
import { fetchWithErrorHandling, TransactionResponse } from '@/utils/transactionErrorHandler';
import { errorHandlingService, ErrorContext } from './errorHandlingService';

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: any;
  status?: number;
  headers?: Record<string, string>;
}

class EnhancedApiService {
  private baseURL: string;
  private defaultTimeout: number = 30000; // 30 seconds
  private defaultRetries: number = 3;
  private defaultRetryDelay: number = 1000; // 1 second

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '/api') {
    this.baseURL = baseURL;
  }

  // Enhanced fetch with error handling
  private async enhancedFetch<T>(
    endpoint: string,
    config: ApiRequestConfig = {},
    context?: ErrorContext
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const requestConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    requestConfig.signal = controller.signal;

    try {
      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        const timeoutError = errorHandlingService.handleTimeoutError(`${method} ${endpoint}`, context);
        return {
          success: false,
          error: timeoutError,
          status: 408
        };
      }

      if (error.message.includes('fetch')) {
        const networkError = errorHandlingService.handleNetworkError(error, context);
        return {
          success: false,
          error: networkError,
          status: 0
        };
      }

      const processedError = await errorHandlingService.handleApiError(error, context);
      return {
        success: false,
        error: processedError,
        status: 500
      };
    }
  }

  // Retry logic
  private async retryOperation<T>(
    operation: () => Promise<ApiResponse<T>>,
    retries: number,
    delay: number,
    context?: ErrorContext
  ): Promise<ApiResponse<T>> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying operation in ${delay}ms (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryOperation(operation, retries - 1, delay * 2, context);
      }
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, config: ApiRequestConfig = {}, context?: ErrorContext): Promise<ApiResponse<T>> {
    return this.enhancedFetch<T>(endpoint, { ...config, method: 'GET' }, context);
  }

  // POST request
  async post<T>(endpoint: string, data: any, config: ApiRequestConfig = {}, context?: ErrorContext): Promise<ApiResponse<T>> {
    return this.enhancedFetch<T>(endpoint, { ...config, method: 'POST', body: data }, context);
  }

  // PUT request
  async put<T>(endpoint: string, data: any, config: ApiRequestConfig = {}, context?: ErrorContext): Promise<ApiResponse<T>> {
    return this.enhancedFetch<T>(endpoint, { ...config, method: 'PUT', body: data }, context);
  }

  // DELETE request
  async delete<T>(endpoint: string, config: ApiRequestConfig = {}, context?: ErrorContext): Promise<ApiResponse<T>> {
    return this.enhancedFetch<T>(endpoint, { ...config, method: 'DELETE' }, context);
  }

  // PATCH request
  async patch<T>(endpoint: string, data: any, config: ApiRequestConfig = {}, context?: ErrorContext): Promise<ApiResponse<T>> {
    return this.enhancedFetch<T>(endpoint, { ...config, method: 'PATCH', body: data }, context);
  }

  // Transaction-specific methods
  async createTransaction(transactionData: any, context?: ErrorContext): Promise<TransactionResponse> {
    try {
      const response = await fetchWithErrorHandling('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData)
      }, context);

      return response;
    } catch (error) {
      return await errorHandlingService.handleTransactionError(error, context);
    }
  }

  async getTransaction(transactionId: string, context?: ErrorContext): Promise<ApiResponse<any>> {
    return this.get(`/transactions/${transactionId}`, {}, context);
  }

  async getTransactions(userId: string, context?: ErrorContext): Promise<ApiResponse<any[]>> {
    return this.get(`/transactions?userId=${userId}`, {}, context);
  }

  // Payment methods
  async processPayment(paymentData: any, context?: ErrorContext): Promise<TransactionResponse> {
    try {
      const response = await fetchWithErrorHandling('/api/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      }, context);

      return response;
    } catch (error) {
      return await errorHandlingService.handleTransactionError(error, context);
    }
  }

  // SOV Token operations
  async getSOVBalance(userId: string, context?: ErrorContext): Promise<ApiResponse<number>> {
    return this.get(`/sov-tokens/balance/${userId}`, {}, context);
  }

  async transferSOVTokens(transferData: any, context?: ErrorContext): Promise<TransactionResponse> {
    try {
      const response = await fetchWithErrorHandling('/api/sov-tokens/transfer', {
        method: 'POST',
        body: JSON.stringify(transferData)
      }, context);

      return response;
    } catch (error) {
      return await errorHandlingService.handleTransactionError(error, context);
    }
  }

  // Banking operations
  async getBankingProducts(serviceType: string, context?: ErrorContext): Promise<ApiResponse<any[]>> {
    return this.get(`/banking/products/${serviceType}`, {}, context);
  }

  async applyForBankingProduct(applicationData: any, context?: ErrorContext): Promise<TransactionResponse> {
    try {
      const response = await fetchWithErrorHandling('/api/banking/apply', {
        method: 'POST',
        body: JSON.stringify(applicationData)
      }, context);

      return response;
    } catch (error) {
      return await errorHandlingService.handleTransactionError(error, context);
    }
  }

  // Flight operations
  async searchFlights(searchParams: any, context?: ErrorContext): Promise<ApiResponse<any[]>> {
    return this.post('/flights/search', searchParams, {}, context);
  }

  async bookFlight(bookingData: any, context?: ErrorContext): Promise<TransactionResponse> {
    try {
      const response = await fetchWithErrorHandling('/api/flights/book', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      }, context);

      return response;
    } catch (error) {
      return await errorHandlingService.handleTransactionError(error, context);
    }
  }

  // User operations
  async getUserProfile(userId: string, context?: ErrorContext): Promise<ApiResponse<any>> {
    return this.get(`/users/${userId}`, {}, context);
  }

  async updateUserProfile(userId: string, profileData: any, context?: ErrorContext): Promise<ApiResponse<any>> {
    return this.put(`/users/${userId}`, profileData, {}, context);
  }

  // Wallet operations
  async getWalletBalance(userId: string, context?: ErrorContext): Promise<ApiResponse<any>> {
    return this.get(`/wallet/balance/${userId}`, {}, context);
  }

  async addFundsToWallet(fundData: any, context?: ErrorContext): Promise<TransactionResponse> {
    try {
      const response = await fetchWithErrorHandling('/api/wallet/add-funds', {
        method: 'POST',
        body: JSON.stringify(fundData)
      }, context);

      return response;
    } catch (error) {
      return await errorHandlingService.handleTransactionError(error, context);
    }
  }

  // Admin operations
  async getAdminStats(context?: ErrorContext): Promise<ApiResponse<any>> {
    return this.get('/admin/stats', {}, context);
  }

  async getAdminUsers(context?: ErrorContext): Promise<ApiResponse<any[]>> {
    return this.get('/admin/users', {}, context);
  }

  // Utility methods
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/health', { timeout: 5000 });
  }

  async getServiceStatus(): Promise<ApiResponse<any>> {
    return this.get('/status', { timeout: 10000 });
  }

  // Batch operations
  async batchRequest<T>(requests: Array<() => Promise<ApiResponse<T>>>): Promise<ApiResponse<T[]>> {
    try {
      const results = await Promise.allSettled(requests.map(request => request()));
      
      const successful = results
        .filter((result): result is PromiseFulfilledResult<ApiResponse<T>> => result.status === 'fulfilled')
        .map(result => result.value.data)
        .filter(Boolean);

      const failed = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      if (failed.length > 0) {
        console.warn(`${failed.length} requests failed in batch operation`);
      }

      return {
        success: true,
        data: successful
      };
    } catch (error) {
      return {
        success: false,
        error: error
      };
    }
  }

  // Upload file
  async uploadFile(file: File, endpoint: string, context?: ErrorContext): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      const processedError = await errorHandlingService.handleApiError(error, context);
      return {
        success: false,
        error: processedError
      };
    }
  }

  // Download file
  async downloadFile(endpoint: string, filename: string, context?: ErrorContext): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        data: blob
      };
    } catch (error) {
      const processedError = await errorHandlingService.handleApiError(error, context);
      return {
        success: false,
        error: processedError
      };
    }
  }
}

// Export singleton instance
export const enhancedApiService = new EnhancedApiService();

// Export utility functions
export const createApiContext = (userId?: string, operation?: string, serviceType?: string): ErrorContext => ({
  userId,
  operation,
  serviceType,
  timestamp: new Date().toISOString()
});

export const handleApiResponse = <T>(response: ApiResponse<T>): T | null => {
  if (response.success) {
    return response.data || null;
  }
  return null;
};

export const handleApiError = (response: ApiResponse<any>): any => {
  if (!response.success) {
    return response.error;
  }
  return null;
};
