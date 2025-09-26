// Enhanced transaction error handling for frontend
export interface TransactionError {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userMessage: {
    title: string;
    message: string;
    action: string;
  };
  technical: {
    message: string;
    code?: string;
    timestamp: string;
  };
  context?: {
    userId?: string;
    transactionId?: string;
    serviceType?: string;
    amount?: number;
    operation?: string;
  };
}

export interface TransactionErrorResponse {
  success: false;
  error: TransactionError;
}

export interface TransactionSuccessResponse {
  success: true;
  data: any;
  transactionId?: string;
}

export type TransactionResponse = TransactionSuccessResponse | TransactionErrorResponse;

// Error types for better categorization
export const TRANSACTION_ERROR_TYPES = {
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  DATABASE_CONNECTION: 'DATABASE_CONNECTION',
  BLOCKCHAIN_FAILURE: 'BLOCKCHAIN_FAILURE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONCURRENT_MODIFICATION: 'CONCURRENT_MODIFICATION',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  ROLLBACK_FAILED: 'ROLLBACK_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN: 'UNKNOWN'
} as const;

export type TransactionErrorType = typeof TRANSACTION_ERROR_TYPES[keyof typeof TRANSACTION_ERROR_TYPES];

// Enhanced transaction error handler class
export class TransactionErrorHandler {
  private static instance: TransactionErrorHandler;
  private errorHistory: Map<string, TransactionError[]> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;

  static getInstance(): TransactionErrorHandler {
    if (!TransactionErrorHandler.instance) {
      TransactionErrorHandler.instance = new TransactionErrorHandler();
    }
    return TransactionErrorHandler.instance;
  }

  // Classify error type from response
  classifyError(error: any): TransactionErrorType {
    if (error?.type) {
      return error.type as TransactionErrorType;
    }

    if (error?.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('insufficient') || message.includes('not enough')) {
        return TRANSACTION_ERROR_TYPES.INSUFFICIENT_BALANCE;
      }
      
      if (message.includes('network') || message.includes('fetch')) {
        return TRANSACTION_ERROR_TYPES.NETWORK_ERROR;
      }
      
      if (message.includes('timeout')) {
        return TRANSACTION_ERROR_TYPES.TIMEOUT;
      }
      
      if (message.includes('validation') || message.includes('invalid')) {
        return TRANSACTION_ERROR_TYPES.VALIDATION_ERROR;
      }
      
      if (message.includes('concurrent') || message.includes('conflict')) {
        return TRANSACTION_ERROR_TYPES.CONCURRENT_MODIFICATION;
      }
      
      if (message.includes('blockchain') || message.includes('web3')) {
        return TRANSACTION_ERROR_TYPES.BLOCKCHAIN_FAILURE;
      }
    }

    if (error?.code) {
      switch (error.code) {
        case 'ECONNREFUSED':
        case 'ENOTFOUND':
        case 'ECONNRESET':
          return TRANSACTION_ERROR_TYPES.DATABASE_CONNECTION;
        case 'ETIMEDOUT':
          return TRANSACTION_ERROR_TYPES.TIMEOUT;
        default:
          return TRANSACTION_ERROR_TYPES.UNKNOWN;
      }
    }

    return TRANSACTION_ERROR_TYPES.UNKNOWN;
  }

  // Get user-friendly error message
  getUserMessage(errorType: TransactionErrorType, originalError?: any): TransactionError['userMessage'] {
    const messages = {
      [TRANSACTION_ERROR_TYPES.INSUFFICIENT_BALANCE]: {
        title: 'Số dư không đủ',
        message: 'Số dư SOV token của bạn không đủ để thực hiện giao dịch này.',
        action: 'Vui lòng nạp thêm token vào ví hoặc giảm số tiền giao dịch.'
      },
      [TRANSACTION_ERROR_TYPES.DATABASE_CONNECTION]: {
        title: 'Dịch vụ tạm thời không khả dụng',
        message: 'Chúng tôi đang gặp sự cố kỹ thuật.',
        action: 'Vui lòng thử lại sau vài phút. Nếu vấn đề vẫn tiếp diễn, hãy liên hệ hỗ trợ.'
      },
      [TRANSACTION_ERROR_TYPES.BLOCKCHAIN_FAILURE]: {
        title: 'Lỗi dịch vụ Blockchain',
        message: 'Không thể xử lý giao dịch blockchain.',
        action: 'Giao dịch của bạn đang được xử lý. Vui lòng kiểm tra ví sau vài phút.'
      },
      [TRANSACTION_ERROR_TYPES.VALIDATION_ERROR]: {
        title: 'Dữ liệu giao dịch không hợp lệ',
        message: 'Vui lòng kiểm tra thông tin giao dịch và thử lại.',
        action: 'Đảm bảo tất cả các trường bắt buộc đã được điền đúng.'
      },
      [TRANSACTION_ERROR_TYPES.CONCURRENT_MODIFICATION]: {
        title: 'Xung đột giao dịch',
        message: 'Có một giao dịch khác đang được xử lý.',
        action: 'Vui lòng chờ một chút và thử lại.'
      },
      [TRANSACTION_ERROR_TYPES.SERVICE_UNAVAILABLE]: {
        title: 'Dịch vụ không khả dụng',
        message: 'Dịch vụ yêu cầu tạm thời không khả dụng.',
        action: 'Vui lòng thử lại sau hoặc liên hệ hỗ trợ.'
      },
      [TRANSACTION_ERROR_TYPES.TIMEOUT]: {
        title: 'Giao dịch hết thời gian chờ',
        message: 'Giao dịch mất quá nhiều thời gian để xử lý.',
        action: 'Vui lòng thử lại. Nếu vấn đề vẫn tiếp diễn, hãy liên hệ hỗ trợ.'
      },
      [TRANSACTION_ERROR_TYPES.NETWORK_ERROR]: {
        title: 'Lỗi kết nối mạng',
        message: 'Không thể kết nối đến máy chủ.',
        action: 'Vui lòng kiểm tra kết nối internet và thử lại.'
      },
      [TRANSACTION_ERROR_TYPES.ROLLBACK_FAILED]: {
        title: 'Lỗi nghiêm trọng',
        message: 'Đã xảy ra lỗi nghiêm trọng trong quá trình xử lý giao dịch.',
        action: 'Vui lòng liên hệ hỗ trợ ngay lập tức với mã giao dịch của bạn.'
      },
      [TRANSACTION_ERROR_TYPES.UNKNOWN]: {
        title: 'Lỗi không xác định',
        message: 'Đã xảy ra lỗi không mong muốn.',
        action: 'Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.'
      }
    };

    return messages[errorType] || messages[TRANSACTION_ERROR_TYPES.UNKNOWN];
  }

  // Get severity level for error type
  getSeverityLevel(errorType: TransactionErrorType): TransactionError['severity'] {
    const severityLevels = {
      [TRANSACTION_ERROR_TYPES.INSUFFICIENT_BALANCE]: 'MEDIUM',
      [TRANSACTION_ERROR_TYPES.VALIDATION_ERROR]: 'LOW',
      [TRANSACTION_ERROR_TYPES.DATABASE_CONNECTION]: 'CRITICAL',
      [TRANSACTION_ERROR_TYPES.BLOCKCHAIN_FAILURE]: 'HIGH',
      [TRANSACTION_ERROR_TYPES.CONCURRENT_MODIFICATION]: 'MEDIUM',
      [TRANSACTION_ERROR_TYPES.SERVICE_UNAVAILABLE]: 'HIGH',
      [TRANSACTION_ERROR_TYPES.TIMEOUT]: 'HIGH',
      [TRANSACTION_ERROR_TYPES.NETWORK_ERROR]: 'MEDIUM',
      [TRANSACTION_ERROR_TYPES.ROLLBACK_FAILED]: 'CRITICAL',
      [TRANSACTION_ERROR_TYPES.UNKNOWN]: 'HIGH'
    };
    return severityLevels[errorType] as TransactionError['severity'];
  }

  // Process transaction error
  processError(error: any, context?: any): TransactionError {
    const errorType = this.classifyError(error);
    const userMessage = this.getUserMessage(errorType, error);
    const severity = this.getSeverityLevel(errorType);
    
    const transactionError: TransactionError = {
      id: this.generateErrorId(),
      type: errorType,
      severity,
      userMessage,
      technical: {
        message: error?.message || 'Unknown error',
        code: error?.code,
        timestamp: new Date().toISOString()
      },
      context
    };

    // Store error in history
    if (context?.userId) {
      const userErrors = this.errorHistory.get(context.userId) || [];
      userErrors.push(transactionError);
      this.errorHistory.set(context.userId, userErrors.slice(-10)); // Keep last 10 errors
    }

    return transactionError;
  }

  // Generate unique error ID
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if error is retryable
  isRetryable(errorType: TransactionErrorType): boolean {
    const retryableTypes: TransactionErrorType[] = [
      TRANSACTION_ERROR_TYPES.DATABASE_CONNECTION,
      TRANSACTION_ERROR_TYPES.BLOCKCHAIN_FAILURE,
      TRANSACTION_ERROR_TYPES.TIMEOUT,
      TRANSACTION_ERROR_TYPES.SERVICE_UNAVAILABLE,
      TRANSACTION_ERROR_TYPES.NETWORK_ERROR,
      TRANSACTION_ERROR_TYPES.CONCURRENT_MODIFICATION
    ];
    return retryableTypes.includes(errorType);
  }

  // Get retry delay based on attempt number
  getRetryDelay(attemptNumber: number): number {
    const delays = [1000, 2000, 4000]; // Exponential backoff in ms
    return delays[Math.min(attemptNumber, delays.length - 1)];
  }

  // Handle retry logic
  async handleRetry<T>(
    operation: () => Promise<T>,
    context: any,
    maxAttempts: number = this.maxRetries
  ): Promise<{ success: boolean; result?: T; error?: TransactionError }> {
    const retryKey = `${context.userId}_${context.operation}`;
    const currentAttempts = this.retryAttempts.get(retryKey) || 0;

    if (currentAttempts >= maxAttempts) {
      this.retryAttempts.delete(retryKey);
      return { success: false, error: this.processError({ message: 'Max retry attempts exceeded' }, context) };
    }

    try {
      const result = await operation();
      this.retryAttempts.delete(retryKey);
      return { success: true, result };
    } catch (error) {
      const errorType = this.classifyError(error);
      
      if (this.isRetryable(errorType) && currentAttempts < maxAttempts - 1) {
        const delay = this.getRetryDelay(currentAttempts);
        this.retryAttempts.set(retryKey, currentAttempts + 1);
        
        console.log(`Retrying operation in ${delay}ms (attempt ${currentAttempts + 1})`);
        
        return new Promise((resolve) => {
          setTimeout(async () => {
            const retryResult = await this.handleRetry(operation, context, maxAttempts);
            resolve(retryResult);
          }, delay);
        });
      } else {
        this.retryAttempts.delete(retryKey);
        return { success: false, error: this.processError(error, context) };
      }
    }
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
    const userRetries: Array<{ operation: string; attempts: number; maxRetries: number }> = [];
    this.retryAttempts.forEach((attempts, key) => {
      if (key.startsWith(`${userId}_`)) {
        const operation = key.split('_').slice(1).join('_');
        userRetries.push({ operation, attempts, maxRetries: this.maxRetries });
      }
    });
    return userRetries;
  }

  // Clear retry attempts for user
  clearRetryAttempts(userId: string): void {
    this.retryAttempts.forEach((_, key) => {
      if (key.startsWith(`${userId}_`)) {
        this.retryAttempts.delete(key);
      }
    });
  }
}

// Export singleton instance
export const transactionErrorHandler = TransactionErrorHandler.getInstance();

// Utility functions for common error scenarios
export const handleInsufficientBalance = (error: TransactionError, onAddFunds?: () => void) => {
  return {
    showAddFundsButton: true,
    showReduceAmountButton: true,
    onAddFunds,
    onReduceAmount: () => {
      // Logic to reduce transaction amount
      console.log('Reducing transaction amount...');
    }
  };
};

export const handleNetworkError = (error: TransactionError, onRetry?: () => void) => {
  return {
    showRetryButton: true,
    showOfflineMessage: true,
    onRetry,
    retryAfter: 5000 // 5 seconds
  };
};

export const handleValidationError = (error: TransactionError) => {
  return {
    showFormErrors: true,
    highlightInvalidFields: true,
    showValidationHelp: true
  };
};

// Enhanced API response handler
export const handleTransactionResponse = async <T>(
  response: Response,
  context?: any
): Promise<TransactionResponse> => {
  try {
    const data = await response.json();
    
    if (response.ok && data.success !== false) {
      return {
        success: true,
        data: data.data || data,
        transactionId: data.transactionId
      };
    } else {
      const error = transactionErrorHandler.processError(data.error || data, context);
      return {
        success: false,
        error
      };
    }
  } catch (parseError) {
    const error = transactionErrorHandler.processError({
      message: 'Failed to parse response',
      code: 'PARSE_ERROR'
    }, context);
    return {
      success: false,
      error
    };
  }
};

// Enhanced fetch wrapper with error handling
export const fetchWithErrorHandling = async <T>(
  url: string,
  options: RequestInit = {},
  context?: any
): Promise<TransactionResponse> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    return await handleTransactionResponse<T>(response, context);
  } catch (error) {
    const processedError = transactionErrorHandler.processError(error, context);
    return {
      success: false,
      error: processedError
    };
  }
};
