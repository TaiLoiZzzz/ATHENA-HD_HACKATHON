'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  FireIcon,
  SparklesIcon,
  XMarkIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface TokenPriceAlertProps {
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  onClose?: () => void;
}

export default function TokenPriceAlert({
  currentPrice,
  previousPrice,
  priceChange,
  onClose
}: TokenPriceAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPositive, setIsPositive] = useState(priceChange >= 0);

  useEffect(() => {
    setIsPositive(priceChange >= 0);
  }, [priceChange]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(num);
  };

  const getPriceChangeConfig = () => {
    if (priceChange >= 10) {
      return {
        bgColor: 'bg-green-500',
        textColor: 'text-white',
        icon: ArrowTrendingUpIcon,
        message: 'TĂNG MẠNH!',
        description: 'ATHENA Token đang tăng giá mạnh!'
      };
    } else if (priceChange >= 5) {
      return {
        bgColor: 'bg-blue-500',
        textColor: 'text-white',
        icon: ChartBarIcon,
        message: 'TĂNG GIÁ!',
        description: 'ATHENA Token đang tăng giá!'
      };
    } else if (priceChange >= 0) {
      return {
        bgColor: 'bg-purple-500',
        textColor: 'text-white',
        icon: SparklesIcon,
        message: 'TĂNG NHẸ!',
        description: 'ATHENA Token đang tăng giá nhẹ!'
      };
    } else {
      return {
        bgColor: 'bg-red-500',
        textColor: 'text-white',
        icon: FireIcon,
        message: 'GIẢM GIÁ!',
        description: 'ATHENA Token đang giảm giá!'
      };
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const config = getPriceChangeConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: 20 }}
        className={`fixed top-4 right-4 z-50 max-w-sm ${config.bgColor} rounded-2xl shadow-2xl p-4 ${config.textColor}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Icon className="w-5 h-5" />
              <span className="font-bold text-sm">{config.message}</span>
            </div>
            
            <h4 className="font-semibold mb-1">ATHENA Token</h4>
            <p className="text-sm opacity-90 mb-3">{config.description}</p>

            {/* Price Info */}
            <div className="bg-white/20 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Giá hiện tại:</span>
                <span className="font-bold text-lg">{formatCurrency(currentPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Giá trước đó:</span>
                <span className="text-sm opacity-90">{formatCurrency(previousPrice)}</span>
              </div>
            </div>

            {/* Price Change */}
            <div className="bg-white/20 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <ArrowTrendingUpIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Thay đổi:</span>
              </div>
              <div className={`text-lg font-bold ${
                isPositive ? 'text-green-200' : 'text-red-200'
              }`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleClose}
                className="flex-1 py-2 px-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  // Scroll to token stats
                  const element = document.getElementById('token-stats');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex-1 py-2 px-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
