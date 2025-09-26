'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  MinusIcon,
  WifiIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { TransactionError, TRANSACTION_ERROR_TYPES } from '@/utils/transactionErrorHandler';
import SOVWallet from '@/components/SOVWallet/SOVWallet';

interface TransactionErrorModalProps {
  error: TransactionError | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  onAddFunds?: () => void;
  onReduceAmount?: () => void;
  showWallet?: boolean;
  currentAmount?: number;
  minAmount?: number;
  maxAmount?: number;
}

export default function TransactionErrorModal({
  error,
  isOpen,
  onClose,
  onRetry,
  onAddFunds,
  onReduceAmount,
  showWallet = false,
  currentAmount = 0,
  minAmount = 0,
  maxAmount = 0
}: TransactionErrorModalProps) {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [adjustedAmount, setAdjustedAmount] = useState(currentAmount);

  if (!error) return null;

  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case TRANSACTION_ERROR_TYPES.INSUFFICIENT_BALANCE:
        return <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />;
      case TRANSACTION_ERROR_TYPES.NETWORK_ERROR:
        return <WifiIcon className="w-8 h-8 text-red-500" />;
      case TRANSACTION_ERROR_TYPES.VALIDATION_ERROR:
        return <ExclamationCircleIcon className="w-8 h-8 text-blue-500" />;
      case TRANSACTION_ERROR_TYPES.TIMEOUT:
        return <ArrowPathIcon className="w-8 h-8 text-orange-500" />;
      default:
        return <XCircleIcon className="w-8 h-8 text-red-500" />;
    }
  };

  const getErrorColor = (severity: string) => {
    switch (severity) {
      case 'LOW':
        return 'border-blue-200 bg-blue-50';
      case 'MEDIUM':
        return 'border-yellow-200 bg-yellow-50';
      case 'HIGH':
        return 'border-orange-200 bg-orange-50';
      case 'CRITICAL':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleAmountAdjustment = (type: 'increase' | 'decrease') => {
    const step = Math.max(1, Math.floor(currentAmount * 0.1)); // 10% step
    let newAmount = adjustedAmount;
    
    if (type === 'increase') {
      newAmount = Math.min(adjustedAmount + step, maxAmount || adjustedAmount * 2);
    } else {
      newAmount = Math.max(adjustedAmount - step, minAmount);
    }
    
    setAdjustedAmount(newAmount);
  };

  const handleConfirmAmount = () => {
    if (onReduceAmount) {
      onReduceAmount();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white rounded-xl shadow-xl max-w-md w-full border-2 ${getErrorColor(error.severity)}`}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {getErrorIcon(error.type)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {error.userMessage.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Mã lỗi: {error.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                {error.userMessage.message}
              </p>
              
              <p className="text-sm text-gray-600 mb-6">
                {error.userMessage.action}
              </p>

              {/* Insufficient Balance Specific Actions */}
              {error.type === TRANSACTION_ERROR_TYPES.INSUFFICIENT_BALANCE && (
                <div className="space-y-4">
                  {/* Current Balance Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Số dư hiện tại:</span>
                      <span className="font-medium text-gray-900">
                        {currentAmount.toLocaleString()} SOV
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600">Số tiền giao dịch:</span>
                      <span className="font-medium text-red-600">
                        {currentAmount.toLocaleString()} SOV
                      </span>
                    </div>
                  </div>

                  {/* Amount Adjustment */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Điều chỉnh số tiền giao dịch:
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleAmountAdjustment('decrease')}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={adjustedAmount <= minAmount}
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-lg font-medium">
                          {adjustedAmount.toLocaleString()} SOV
                        </span>
                      </div>
                      <button
                        onClick={() => handleAmountAdjustment('increase')}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={adjustedAmount >= maxAmount}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Phạm vi: {minAmount.toLocaleString()} - {maxAmount.toLocaleString()} SOV
                    </div>
                  </div>
                </div>
              )}

              {/* Network Error Specific Actions */}
              {error.type === TRANSACTION_ERROR_TYPES.NETWORK_ERROR && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <WifiIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-blue-700">
                      Kiểm tra kết nối internet của bạn
                    </span>
                  </div>
                </div>
              )}

              {/* Technical Details (Collapsible) */}
              <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Chi tiết kỹ thuật
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Loại lỗi:</strong> {error.type}</div>
                    <div><strong>Mức độ:</strong> {error.severity}</div>
                    <div><strong>Thời gian:</strong> {error.technical.timestamp}</div>
                    {error.technical.code && (
                      <div><strong>Mã lỗi:</strong> {error.technical.code}</div>
                    )}
                    <div><strong>Thông báo:</strong> {error.technical.message}</div>
                  </div>
                </div>
              </details>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                {/* Primary Actions */}
                <div className="flex space-x-3">
                  {error.type === TRANSACTION_ERROR_TYPES.INSUFFICIENT_BALANCE && (
                    <>
                      <button
                        onClick={() => setShowWalletModal(true)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Nạp thêm token
                      </button>
                      <button
                        onClick={handleConfirmAmount}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Sử dụng số tiền mới
                      </button>
                    </>
                  )}
                  
                  {error.type === TRANSACTION_ERROR_TYPES.NETWORK_ERROR && onRetry && (
                    <button
                      onClick={onRetry}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      <span>Thử lại</span>
                    </button>
                  )}
                  
                  {(error.type === TRANSACTION_ERROR_TYPES.TIMEOUT || 
                    error.type === TRANSACTION_ERROR_TYPES.SERVICE_UNAVAILABLE) && onRetry && (
                    <button
                      onClick={onRetry}
                      className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      <span>Thử lại</span>
                    </button>
                  )}
                </div>

                {/* Secondary Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Đóng
                  </button>
                  
                  {error.type === TRANSACTION_ERROR_TYPES.INSUFFICIENT_BALANCE && onAddFunds && (
                    <button
                      onClick={onAddFunds}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Mua thêm token
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* SOV Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Nạp SOV Token</h3>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              <SOVWallet showFullInterface={true} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
