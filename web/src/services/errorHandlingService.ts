// Enhanced error handling service for frontend
import { transactionErrorHandler, TransactionError, TransactionResponse } from '@/utils/transactionErrorHandler';
import toast from 'react-hot-toast';

export interface ErrorHandlingConfig {
  showToast?: boolean;
  showModal?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  logErrors?: boolean;
}

export interface ErrorContext {
  userId?: string;
  operation?: string;
  serviceType?: string;
  amount?: number;
  transactionId?: string;
  url?: string;
  method?: string;
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorHistory: Map<string, TransactionError[]> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private config: ErrorHandlingConfig = {
    showToast: true,
    showModal: true,
    autoRetry: false,
    maxRetries: 3,
    retryDelay: 1000,
    logErrors: true
  };

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  // Configure error handling
  configure(config: Partial<ErrorHandlingConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Handle API errors
  async handleApiError(error: any, context?: ErrorContext): Promise<TransactionError> {
    const processedError = transactionErrorHandler.processError(error, context);
    
    if (this.config.logErrors) {
      this.logError(processedError, context);
    }

    if (this.config.showToast) {
      this.showToast(processedError);
    }

    return processedError;
  }

  // Handle transaction errors
  async handleTransactionError(error: any, context?: ErrorContext): Promise<TransactionResponse> {
    const processedError = await this.handleApiError(error, context);
    
    return {
      success: false,
      error: processedError
    };
  }

  // Handle insufficient balance specifically
  handleInsufficientBalance(currentAmount: number, availableBalance: number, context?: ErrorContext) {
    const error = transactionErrorHandler.processError({
      type: 'INSUFFICIENT_BALANCE',
      message: `Insufficient balance. Required: ${currentAmount}, Available: ${availableBalance}`,
      code: 'INSUFFICIENT_BALANCE'
    }, context);

    if (this.config.showToast) {
      toast.error('Số dư không đủ', {
        duration: 5000,
        position: 'top-center',
        icon: '💰'
      });
    }

    return error;
  }

  // Handle network errors
  handleNetworkError(error: any, context?: ErrorContext) {
    const processedError = transactionErrorHandler.processError({
      type: 'NETWORK_ERROR',
      message: 'Network connection failed',
      code: 'NETWORK_ERROR'
    }, context);

    if (this.config.showToast) {
      toast.error('Lỗi kết nối mạng', {
        duration: 3000,
        position: 'top-center',
        icon: '🌐'
      });
    }

    return processedError;
  }

  // Handle validation errors
  handleValidationError(errors: string[], context?: ErrorContext) {
    const processedError = transactionErrorHandler.processError({
      type: 'VALIDATION_ERROR',
      message: `Validation failed: ${errors.join(', ')}`,
      code: 'VALIDATION_ERROR'
    }, context);

    if (this.config.showToast) {
      toast.error('Thông tin không hợp lệ', {
        duration: 4000,
        position: 'top-center',
        icon: '⚠️'
      });
    }

    return processedError;
  }

  // Handle timeout errors
  handleTimeoutError(operation: string, context?: ErrorContext) {
    const processedError = transactionErrorHandler.processError({
      type: 'TIMEOUT',
      message: `Operation ${operation} timed out`,
      code: 'TIMEOUT'
    }, context);

    if (this.config.showToast) {
      toast.error('Giao dịch hết thời gian chờ', {
        duration: 4000,
        position: 'top-center',
        icon: '⏰'
      });
    }

    return processedError;
  }

  // Show toast notification
  private showToast(error: TransactionError) {
    const toastOptions = {
      duration: this.getToastDuration(error.severity),
      position: 'top-center' as const,
      icon: this.getToastIcon(error.type)
    };

    switch (error.severity) {
      case 'LOW':
        toast.error(error.userMessage.title, toastOptions);
        break;
      case 'MEDIUM':
        toast.error(error.userMessage.title, toastOptions);
        break;
      case 'HIGH':
        toast.error(error.userMessage.title, toastOptions);
        break;
      case 'CRITICAL':
        toast.error(error.userMessage.title, toastOptions);
        break;
      default:
        toast.error(error.userMessage.title, toastOptions);
    }
  }

  // Get toast duration based on severity
  private getToastDuration(severity: string): number {
    switch (severity) {
      case 'LOW': return 3000;
      case 'MEDIUM': return 4000;
      case 'HIGH': return 5000;
      case 'CRITICAL': return 6000;
      default: return 4000;
    }
  }

  // Get toast icon based on error type
  private getToastIcon(errorType: string): string {
    switch (errorType) {
      case 'INSUFFICIENT_BALANCE': return '💰';
      case 'NETWORK_ERROR': return '🌐';
      case 'VALIDATION_ERROR': return '⚠️';
      case 'TIMEOUT': return '⏰';
      case 'BLOCKCHAIN_FAILURE': return '⛓️';
      case 'SERVICE_UNAVAILABLE': return '🔧';
      default: return '❌';
    }
  }

  // Log error
  private logError(error: TransactionError, context?: ErrorContext) {
    if (context?.userId) {
      const userErrors = this.errorHistory.get(context.userId) || [];
      userErrors.push(error);
      this.errorHistory.set(context.userId, userErrors.slice(-20)); // Keep last 20 errors
    }

    console.error('Transaction Error:', {
      error,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Get error history for user
  getErrorHistory(userId: string): TransactionError[] {
    return this.errorHistory.get(userId) || [];
  }

  // Clear error history for user
  clearErrorHistory(userId: string): void {
    this.errorHistory.delete(userId);
  }

  // Get retry status for user
  getRetryStatus(userId: string): Array<{ operation: string; attempts: number; maxRetries: number }> {
    const userRetries = [];
    for (const [key, attempts] of this.retryAttempts.entries()) {
      if (key.startsWith(`${userId}_`)) {
        const operation = key.split('_').slice(1).join('_');
        userRetries.push({ operation, attempts, maxRetries: this.config.maxRetries || 3 });
      }
    }
    return userRetries;
  }

  // Clear retry attempts for user
  clearRetryAttempts(userId: string): void {
    for (const [key] of this.retryAttempts.entries()) {
      if (key.startsWith(`${userId}_`)) {
        this.retryAttempts.delete(key);
      }
    }
  }

  // Enhanced retry logic
  async retryOperation<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    maxAttempts?: number
  ): Promise<{ success: boolean; result?: T; error?: TransactionError }> {
    const retryKey = `${context.userId}_${context.operation}`;
    const currentAttempts = this.retryAttempts.get(retryKey) || 0;
    const maxRetries = maxAttempts || this.config.maxRetries || 3;

    if (currentAttempts >= maxRetries) {
      this.retryAttempts.delete(retryKey);
      return {
        success: false,
        error: transactionErrorHandler.processError({
          message: 'Max retry attempts exceeded',
          code: 'MAX_RETRIES_EXCEEDED'
        }, context)
      };
    }

    try {
      const result = await operation();
      this.retryAttempts.delete(retryKey);
      return { success: true, result };
    } catch (error) {
      const processedError = transactionErrorHandler.processError(error, context);
      
      if (transactionErrorHandler.isRetryable(processedError.type) && currentAttempts < maxRetries - 1) {
        const delay = this.config.retryDelay || 1000;
        this.retryAttempts.set(retryKey, currentAttempts + 1);
        
        console.log(`Retrying operation in ${delay}ms (attempt ${currentAttempts + 1})`);
        
        return new Promise((resolve) => {
          setTimeout(async () => {
            const retryResult = await this.retryOperation(operation, context, maxRetries);
            resolve(retryResult);
          }, delay);
        });
      } else {
        this.retryAttempts.delete(retryKey);
        return { success: false, error: processedError };
      }
    }
  }

  // Handle offline/online status
  handleOfflineStatus() {
    toast.error('Không có kết nối internet', {
      duration: 3000,
      position: 'top-center',
      icon: '📡'
    });
  }

  handleOnlineStatus() {
    toast.success('Đã kết nối lại internet', {
      duration: 2000,
      position: 'top-center',
      icon: '✅'
    });
  }

  // Handle service unavailable
  handleServiceUnavailable(serviceName: string, context?: ErrorContext) {
    const processedError = transactionErrorHandler.processError({
      type: 'SERVICE_UNAVAILABLE',
      message: `Service ${serviceName} is currently unavailable`,
      code: 'SERVICE_UNAVAILABLE'
    }, context);

    if (this.config.showToast) {
      toast.error(`${serviceName} tạm thời không khả dụng`, {
        duration: 4000,
        position: 'top-center',
        icon: '🔧'
      });
    }

    return processedError;
  }

  // Handle blockchain errors
  handleBlockchainError(error: any, context?: ErrorContext) {
    const processedError = transactionErrorHandler.processError({
      type: 'BLOCKCHAIN_FAILURE',
      message: `Blockchain error: ${error.message}`,
      code: 'BLOCKCHAIN_FAILURE'
    }, context);

    if (this.config.showToast) {
      toast.error('Lỗi blockchain', {
        duration: 5000,
        position: 'top-center',
        icon: '⛓️'
      });
    }

    return processedError;
  }

  // Handle concurrent modification
  handleConcurrentModification(context?: ErrorContext) {
    const processedError = transactionErrorHandler.processError({
      type: 'CONCURRENT_MODIFICATION',
      message: 'Another transaction is being processed',
      code: 'CONCURRENT_MODIFICATION'
    }, context);

    if (this.config.showToast) {
      toast.error('Có giao dịch khác đang được xử lý', {
        duration: 3000,
        position: 'top-center',
        icon: '🔄'
      });
    }

    return processedError;
  }

  // Get error statistics
  getErrorStatistics(userId: string) {
    const errors = this.getErrorHistory(userId);
    const stats = {
      total: errors.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      recent: errors.slice(-5)
    };

    errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const errorHandlingService = ErrorHandlingService.getInstance();

// Export utility functions
export const handleApiError = (error: any, context?: ErrorContext) => 
  errorHandlingService.handleApiError(error, context);

export const handleTransactionError = (error: any, context?: ErrorContext) => 
  errorHandlingService.handleTransactionError(error, context);

export const handleInsufficientBalance = (currentAmount: number, availableBalance: number, context?: ErrorContext) => 
  errorHandlingService.handleInsufficientBalance(currentAmount, availableBalance, context);

export const handleNetworkError = (error: any, context?: ErrorContext) => 
  errorHandlingService.handleNetworkError(error, context);

export const handleValidationError = (errors: string[], context?: ErrorContext) => 
  errorHandlingService.handleValidationError(errors, context);

export const handleTimeoutError = (operation: string, context?: ErrorContext) => 
  errorHandlingService.handleTimeoutError(operation, context);

export const handleServiceUnavailable = (serviceName: string, context?: ErrorContext) => 
  errorHandlingService.handleServiceUnavailable(serviceName, context);

export const handleBlockchainError = (error: any, context?: ErrorContext) => 
  errorHandlingService.handleBlockchainError(error, context);

export const handleConcurrentModification = (context?: ErrorContext) => 
  errorHandlingService.handleConcurrentModification(context);
