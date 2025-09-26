'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface PurchaseFailedProps {
  voucherName: string;
  errorType: 'insufficient_balance' | 'network_error' | 'timeout' | 'sold_out' | 'expired';
  errorMessage: string;
  tokenPrice: number;
  userBalance: number;
  onClose?: () => void;
  onRetry?: () => void;
  onAddFunds?: () => void;
}

export default function PurchaseFailed({
  voucherName,
  errorType,
  errorMessage,
  tokenPrice,
  userBalance,
  onClose,
  onRetry,
  onAddFunds
}: PurchaseFailedProps) {
  const [isVisible, setIsVisible] = useState(true);

  const getErrorConfig = () => {
    switch (errorType) {
      case 'insufficient_balance':
        return {
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          icon: CurrencyDollarIcon,
          title: 'Không đủ token!',
          description: 'Bạn cần thêm ATHENA token để mua voucher này',
          actionText: 'Nạp thêm token'
        };
      case 'network_error':
        return {
          bgColor: 'bg-orange-500',
          textColor: 'text-white',
          icon: ExclamationTriangleIcon,
          title: 'Lỗi kết nối!',
          description: 'Không thể kết nối đến server. Vui lòng thử lại',
          actionText: 'Thử lại'
        };
      case 'timeout':
        return {
          bgColor: 'bg-yellow-500',
          textColor: 'text-white',
          icon: ExclamationTriangleIcon,
          title: 'Hết thời gian chờ!',
          description: 'Giao dịch quá lâu. Vui lòng thử lại',
          actionText: 'Thử lại'
        };
      case 'sold_out':
        return {
          bgColor: 'bg-purple-500',
          textColor: 'text-white',
          icon: XCircleIcon,
          title: 'Hết hàng!',
          description: 'Voucher này đã được bán hết. Hãy chọn voucher khác',
          actionText: 'Xem voucher khác'
        };
      case 'expired':
        return {
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
          icon: XCircleIcon,
          title: 'Hết hạn!',
          description: 'Voucher này đã hết hạn. Hãy chọn voucher khác',
          actionText: 'Xem voucher khác'
        };
      default:
        return {
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          icon: ExclamationTriangleIcon,
          title: 'Lỗi!',
          description: 'Đã xảy ra lỗi không xác định',
          actionText: 'Thử lại'
        };
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(num);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleRetry = () => {
    onRetry?.();
  };

  const handleAddFunds = () => {
    onAddFunds?.();
  };

  if (!isVisible) return null;

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Error Icon */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 10
              }}
              className={`w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <Icon className="w-10 h-10 text-white" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {config.title}
            </h3>
            <p className="text-gray-600">
              {config.description}
            </p>
          </div>

          {/* Error Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Voucher:</span>
                <span className="font-semibold text-gray-900">{voucherName}</span>
              </div>
              
              {errorType === 'insufficient_balance' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Giá voucher:</span>
                    <span className="font-semibold text-purple-600">
                      {tokenPrice.toLocaleString()} ATHENA
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Token của bạn:</span>
                    <span className="font-semibold text-gray-900">
                      {userBalance.toLocaleString()} ATHENA
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Còn thiếu:</span>
                    <span className="font-semibold text-red-600">
                      {(tokenPrice - userBalance).toLocaleString()} ATHENA
                    </span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lỗi:</span>
                <span className="text-sm text-gray-900">{errorMessage}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {errorType === 'insufficient_balance' && (
              <button
                onClick={handleAddFunds}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="font-medium">Nạp thêm token</span>
              </button>
            )}
            
            {(errorType === 'network_error' || errorType === 'timeout') && (
              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5" />
                <span className="font-medium">Thử lại</span>
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Đóng
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              {errorType === 'insufficient_balance' && (
                <p>Bạn có thể mua ATHENA token từ các sàn giao dịch hoặc tham gia các hoạt động để kiếm token</p>
              )}
              {errorType === 'network_error' && (
                <p>Vui lòng kiểm tra kết nối internet và thử lại</p>
              )}
              {errorType === 'timeout' && (
                <p>Giao dịch đang được xử lý. Vui lòng đợi và thử lại sau</p>
              )}
              {errorType === 'sold_out' && (
                <p>Voucher này đã được bán hết. Hãy chọn voucher khác hoặc đợi voucher mới</p>
              )}
              {errorType === 'expired' && (
                <p>Voucher này đã hết hạn. Hãy chọn voucher khác</p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
