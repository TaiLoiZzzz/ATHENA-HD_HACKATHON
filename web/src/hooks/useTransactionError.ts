'use client';

import { useState, useCallback, useEffect } from 'react';
import { TransactionError, TransactionResponse, transactionErrorHandler, TransactionErrorType } from '@/utils/transactionErrorHandler';
import toast from 'react-hot-toast';

interface UseTransactionErrorOptions {
  onRetry?: () => Promise<void>;
  onAddFunds?: () => void;
  onReduceAmount?: (newAmount: number) => void;
  showToast?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
}

interface UseTransactionErrorReturn {
  error: TransactionError | null;
  isRetrying: boolean;
  retryCount: number;
  showErrorModal: boolean;
  handleError: (error: TransactionError) => void;
  handleSuccess: () => void;
  retry: () => Promise<void>;
  clearError: () => void;
  showError: (error: TransactionError) => void;
  hideError: () => void;
  onAddFunds?: () => void;
}

export function useTransactionError(options: UseTransactionErrorOptions = {}): UseTransactionErrorReturn {
  const {
    onRetry,
    onAddFunds,
    onReduceAmount,
    showToast = true,
    autoRetry = false,
    maxRetries = 3
  } = options;

  const [error, setError] = useState<TransactionError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Handle error display
  const handleError = useCallback((error: TransactionError) => {
    setError(error);
    setShowErrorModal(true);
    
    if (showToast) {
      toast.error(error.userMessage.title, {
        duration: 5000,
        position: 'top-center'
      });
    }

    // Auto retry for certain error types
    if (autoRetry && transactionErrorHandler.isRetryable(error.type as TransactionErrorType) && retryCount < maxRetries) {
      setTimeout(() => {
        retry();
      }, 2000);
    }
  }, [showToast, autoRetry, retryCount, maxRetries]);

  // Handle successful transaction
  const handleSuccess = useCallback(() => {
    setError(null);
    setShowErrorModal(false);
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  // Retry logic
  const retry = useCallback(async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await onRetry();
      handleSuccess();
    } catch (retryError) {
      const processedError = transactionErrorHandler.processError(retryError);
      handleError(processedError);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, isRetrying, handleSuccess, handleError]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setShowErrorModal(false);
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  // Show error modal
  const showError = useCallback((error: TransactionError) => {
    setError(error);
    setShowErrorModal(true);
  }, []);

  // Hide error modal
  const hideError = useCallback(() => {
    setShowErrorModal(false);
  }, []);

  // Handle add funds
  const handleAddFunds = useCallback(() => {
    if (onAddFunds) {
      onAddFunds();
    }
    hideError();
  }, [onAddFunds, hideError]);

  // Handle reduce amount
  const handleReduceAmount = useCallback((newAmount: number) => {
    if (onReduceAmount) {
      onReduceAmount(newAmount);
    }
    hideError();
  }, [onReduceAmount, hideError]);

  // Auto-clear error after timeout for certain types
  useEffect(() => {
    if (error && error.type === 'NETWORK_ERROR') {
      const timeout = setTimeout(() => {
        clearError();
      }, 10000); // Auto-clear after 10 seconds

      return () => clearTimeout(timeout);
    }
  }, [error, clearError]);

  return {
    error,
    isRetrying,
    retryCount,
    showErrorModal,
    handleError,
    handleSuccess,
    retry,
    clearError,
    showError,
    hideError,
    onAddFunds: handleAddFunds
  };
}

// Enhanced transaction hook with error handling
export function useTransaction<T>(
  transactionFunction: () => Promise<TransactionResponse>,
  options: UseTransactionErrorOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const errorHandler = useTransactionError(options);

  const execute = useCallback(async () => {
    setIsLoading(true);
    errorHandler.clearError();

    try {
      const response = await transactionFunction();
      
      if (response.success) {
        setData(response.data);
        errorHandler.handleSuccess();
        return response;
      } else {
        errorHandler.handleError(response.error);
        return response;
      }
    } catch (error) {
      const processedError = transactionErrorHandler.processError(error);
      errorHandler.handleError(processedError);
      return { success: false, error: processedError };
    } finally {
      setIsLoading(false);
    }
  }, [transactionFunction, errorHandler]);

  const retry = useCallback(async () => {
    if (errorHandler.retryCount >= (options.maxRetries || 3)) {
      toast.error('Đã vượt quá số lần thử lại cho phép');
      return;
    }

    await execute();
  }, [execute, errorHandler.retryCount, options.maxRetries]);

  return {
    ...errorHandler,
    isLoading,
    data,
    execute,
    retry
  };
}

// Hook for handling insufficient balance specifically
export function useInsufficientBalance(
  currentAmount: number,
  availableBalance: number,
  options: {
    onAddFunds?: () => void;
    onReduceAmount?: (newAmount: number) => void;
    minAmount?: number;
    maxAmount?: number;
  } = {}
) {
  const [adjustedAmount, setAdjustedAmount] = useState(currentAmount);
  const [showModal, setShowModal] = useState(false);

  const handleInsufficientBalance = useCallback(() => {
    setShowModal(true);
    setAdjustedAmount(Math.min(currentAmount, availableBalance));
  }, [currentAmount, availableBalance]);

  const handleAddFunds = useCallback(() => {
    if (options.onAddFunds) {
      options.onAddFunds();
    }
    setShowModal(false);
  }, [options.onAddFunds]);

  const handleReduceAmount = useCallback(() => {
    if (options.onReduceAmount) {
      options.onReduceAmount(adjustedAmount);
    }
    setShowModal(false);
  }, [options.onReduceAmount, adjustedAmount]);

  const adjustAmount = useCallback((newAmount: number) => {
    const minAmount = options.minAmount || 0;
    const maxAmount = options.maxAmount || availableBalance;
    setAdjustedAmount(Math.max(minAmount, Math.min(newAmount, maxAmount)));
  }, [options.minAmount, options.maxAmount, availableBalance]);

  return {
    showModal,
    adjustedAmount,
    handleInsufficientBalance,
    handleAddFunds,
    handleReduceAmount,
    adjustAmount,
    hideModal: () => setShowModal(false)
  };
}

// Hook for network error handling
export function useNetworkError() {
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleNetworkError = useCallback((error: any) => {
    setLastError(new Date());
    setRetryCount(prev => prev + 1);
    
    if (!isOnline) {
      toast.error('Không có kết nối internet. Vui lòng kiểm tra kết nối và thử lại.');
    } else {
      toast.error('Lỗi kết nối mạng. Vui lòng thử lại.');
    }
  }, [isOnline]);

  const resetRetryCount = useCallback(() => {
    setRetryCount(0);
    setLastError(null);
  }, []);

  return {
    isOnline,
    retryCount,
    lastError,
    handleNetworkError,
    resetRetryCount
  };
}
