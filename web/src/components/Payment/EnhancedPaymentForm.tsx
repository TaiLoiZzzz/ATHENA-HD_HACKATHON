'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { useTransaction, useInsufficientBalance, useNetworkError } from '@/hooks/useTransactionError';
import TransactionErrorModal from '@/components/ErrorHandling/TransactionErrorModal';
import { TransactionResponse, fetchWithErrorHandling } from '@/utils/transactionErrorHandler';
import toast from 'react-hot-toast';

interface PaymentFormData {
  amount: number;
  currency: 'VND' | 'SOV';
  paymentMethod: 'sov_token' | 'fiat' | 'hybrid';
  description?: string;
  recipientId?: string;
  serviceType?: string;
}

interface EnhancedPaymentFormProps {
  initialAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  availableBalance?: number;
  serviceType?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  showBalance?: boolean;
  showAmountAdjustment?: boolean;
  className?: string;
}

export default function EnhancedPaymentForm({
  initialAmount = 0,
  minAmount = 0,
  maxAmount = 1000000,
  availableBalance = 0,
  serviceType = 'general',
  onSuccess,
  onError,
  showBalance = true,
  showAmountAdjustment = true,
  className = ''
}: EnhancedPaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: initialAmount,
    currency: 'SOV',
    paymentMethod: 'sov_token',
    description: '',
    serviceType
  });

  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Network error handling
  const { isOnline, handleNetworkError, resetRetryCount } = useNetworkError();

  // Insufficient balance handling
  const insufficientBalance = useInsufficientBalance(formData.amount, availableBalance, {
    onAddFunds: () => {
      toast.success('Chuyển hướng đến trang nạp tiền...');
    },
    onReduceAmount: (newAmount) => {
      setFormData(prev => ({ ...prev, amount: newAmount }));
      toast.success(`Đã điều chỉnh số tiền thành ${newAmount.toLocaleString()} SOV`);
    },
    minAmount,
    maxAmount
  });

  // Transaction handling
  const transaction = useTransaction(
    async () => {
      const response = await fetchWithErrorHandling('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(formData)
      }, {
        userId: 'current-user', // This would come from auth context
        operation: 'payment',
        amount: formData.amount,
        serviceType
      });

      return response;
    },
    {
      onRetry: async () => {
        resetRetryCount();
        await transaction.execute();
      },
      onAddFunds: () => {
        insufficientBalance.handleAddFunds();
      },
      onReduceAmount: (newAmount) => {
        setFormData(prev => ({ ...prev, amount: newAmount }));
      },
      maxRetries: 3
    }
  );

  // Validate form
  const validateForm = useCallback(() => {
    const errors: string[] = [];

    if (formData.amount <= 0) {
      errors.push('Số tiền phải lớn hơn 0');
    }

    if (formData.amount < minAmount) {
      errors.push(`Số tiền tối thiểu là ${minAmount.toLocaleString()}`);
    }

    if (formData.amount > maxAmount) {
      errors.push(`Số tiền tối đa là ${maxAmount.toLocaleString()}`);
    }

    if (formData.paymentMethod === 'sov_token' && formData.amount > availableBalance) {
      errors.push('Số dư SOV token không đủ');
    }

    if (!formData.description?.trim()) {
      errors.push('Vui lòng nhập mô tả giao dịch');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [formData, minAmount, maxAmount, availableBalance]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOnline) {
      toast.error('Không có kết nối internet');
      return;
    }

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra thông tin giao dịch');
      return;
    }

    try {
      const result = await transaction.execute();
      
      if (result.success && 'data' in result) {
        onSuccess?.(result.data);
        toast.success('Giao dịch thành công!');
      } else if (!result.success && 'error' in result) {
        onError?.(result.error);
      }
    } catch (error) {
      handleNetworkError(error);
    }
  };

  // Handle amount adjustment
  const adjustAmount = (type: 'increase' | 'decrease') => {
    const step = Math.max(1, Math.floor(formData.amount * 0.1));
    let newAmount = formData.amount;
    
    if (type === 'increase') {
      newAmount = Math.min(formData.amount + step, maxAmount);
    } else {
      newAmount = Math.max(formData.amount - step, minAmount);
    }
    
    setFormData(prev => ({ ...prev, amount: newAmount }));
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'SOV') {
      return `${amount.toLocaleString()} SOV`;
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <CreditCardIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Thanh toán</h3>
            <p className="text-sm text-gray-600">Thực hiện giao dịch an toàn</p>
          </div>
        </div>

        {/* Balance Display */}
        {showBalance && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Số dư hiện tại:</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(availableBalance, 'SOV')}
              </span>
            </div>
            {formData.paymentMethod === 'sov_token' && formData.amount > availableBalance && (
              <div className="mt-2 text-sm text-red-600">
                <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                Số dư không đủ cho giao dịch này
              </div>
            )}
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Số tiền giao dịch
          </label>
          <div className="flex items-center space-x-3">
            {showAmountAdjustment && (
              <button
                type="button"
                onClick={() => adjustAmount('decrease')}
                disabled={formData.amount <= minAmount}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
            )}
            
            <div className="flex-1">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                min={minAmount}
                max={maxAmount}
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập số tiền"
              />
            </div>
            
            {showAmountAdjustment && (
              <button
                type="button"
                onClick={() => adjustAmount('increase')}
                disabled={formData.amount >= maxAmount}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            Phạm vi: {formatCurrency(minAmount, 'SOV')} - {formatCurrency(maxAmount, 'SOV')}
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Phương thức thanh toán
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              formData.paymentMethod === 'sov_token' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="sov_token"
                checked={formData.paymentMethod === 'sov_token'}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                className="sr-only"
              />
              <div className="text-center">
                <CurrencyDollarIcon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="font-medium">SOV Token</div>
                <div className="text-xs text-gray-600">Ưu đãi tốt nhất</div>
              </div>
            </label>

            <label className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              formData.paymentMethod === 'fiat' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="fiat"
                checked={formData.paymentMethod === 'fiat'}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                className="sr-only"
              />
              <div className="text-center">
                <CreditCardIcon className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="font-medium">VND</div>
                <div className="text-xs text-gray-600">Thanh toán truyền thống</div>
              </div>
            </label>

            <label className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              formData.paymentMethod === 'hybrid' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="hybrid"
                checked={formData.paymentMethod === 'hybrid'}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                className="sr-only"
              />
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                <div className="font-medium">Kết hợp</div>
                <div className="text-xs text-gray-600">Linh hoạt</div>
              </div>
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Mô tả giao dịch
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập mô tả giao dịch..."
            required
          />
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-800">Lỗi xác thực</span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Network Status */}
        {!isOnline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-yellow-800">
                Không có kết nối internet. Vui lòng kiểm tra kết nối và thử lại.
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={transaction.isLoading || !isOnline || validationErrors.length > 0}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {transaction.isLoading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                <span>Xác nhận thanh toán</span>
              </>
            )}
          </button>
        </div>

        {/* Transaction Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Tóm tắt giao dịch</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Số tiền:</span>
              <span className="font-medium">{formatCurrency(formData.amount, formData.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phương thức:</span>
              <span className="font-medium">
                {formData.paymentMethod === 'sov_token' ? 'SOV Token' : 
                 formData.paymentMethod === 'fiat' ? 'VND' : 'Kết hợp'}
              </span>
            </div>
            {formData.paymentMethod === 'sov_token' && (
              <div className="flex justify-between">
                <span>Số dư sau giao dịch:</span>
                <span className="font-medium">
                  {formatCurrency(availableBalance - formData.amount, 'SOV')}
                </span>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Error Modal */}
      <TransactionErrorModal
        error={transaction.error}
        isOpen={transaction.showErrorModal}
        onClose={transaction.hideError}
        onRetry={transaction.retry}
        onAddFunds={insufficientBalance.handleAddFunds}
        onReduceAmount={insufficientBalance.handleReduceAmount}
        showWallet={true}
        currentAmount={formData.amount}
        minAmount={minAmount}
        maxAmount={maxAmount}
      />
    </div>
  );
}
