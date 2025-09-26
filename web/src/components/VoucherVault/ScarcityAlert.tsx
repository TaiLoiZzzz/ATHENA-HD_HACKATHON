'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  FireIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

interface ScarcityAlertProps {
  voucherName: string;
  remainingSupply: number;
  totalSupply: number;
  timeLeft: number;
  onClose?: () => void;
}

export default function ScarcityAlert({
  voucherName,
  remainingSupply,
  totalSupply,
  timeLeft,
  onClose
}: ScarcityAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('low');

  useEffect(() => {
    const percentage = (remainingSupply / totalSupply) * 100;
    
    if (percentage <= 5) {
      setUrgency('critical');
    } else if (percentage <= 15) {
      setUrgency('high');
    } else if (percentage <= 30) {
      setUrgency('medium');
    } else {
      setUrgency('low');
    }
  }, [remainingSupply, totalSupply]);

  const getUrgencyConfig = () => {
    switch (urgency) {
      case 'critical':
        return {
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          icon: ExclamationTriangleIcon,
          message: 'SẮP HẾT HÀNG!',
          description: 'Chỉ còn vài voucher cuối cùng!'
        };
      case 'high':
        return {
          bgColor: 'bg-orange-500',
          textColor: 'text-white',
          icon: FireIcon,
          message: 'SỐ LƯỢNG CÓ HẠN!',
          description: 'Voucher đang được mua nhanh chóng!'
        };
      case 'medium':
        return {
          bgColor: 'bg-yellow-500',
          textColor: 'text-white',
          icon: ClockIcon,
          message: 'SỐ LƯỢNG GIẢM!',
          description: 'Nhanh tay kẻo hết!'
        };
      default:
        return {
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          icon: GiftIcon,
          message: 'VOUCHER HOT!',
          description: 'Đang được nhiều người quan tâm!'
        };
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSupplyPercentage = () => {
    return (remainingSupply / totalSupply) * 100;
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const config = getUrgencyConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className={`fixed bottom-4 right-4 z-50 max-w-sm ${config.bgColor} rounded-2xl shadow-2xl p-4 ${config.textColor}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Icon className="w-5 h-5" />
              <span className="font-bold text-sm">{config.message}</span>
            </div>
            
            <h4 className="font-semibold mb-1">{voucherName}</h4>
            <p className="text-sm opacity-90 mb-3">{config.description}</p>

            {/* Supply Info */}
            <div className="bg-white/20 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Số lượng còn lại:</span>
                <span className="font-bold">{remainingSupply}/{totalSupply}</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getSupplyPercentage()}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-white h-2 rounded-full"
                />
              </div>
              <div className="text-xs opacity-90 mt-1">
                {getSupplyPercentage().toFixed(1)}% còn lại
              </div>
            </div>

            {/* Time Left */}
            {timeLeft > 0 && (
              <div className="bg-white/20 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2 mb-1">
                  <ClockIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Thời gian còn lại:</span>
                </div>
                <div className="text-lg font-bold">
                  {formatTime(timeLeft)}
                </div>
              </div>
            )}

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
                  // Scroll to voucher
                  const element = document.getElementById(`voucher-${voucherName.toLowerCase().replace(/\s+/g, '-')}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex-1 py-2 px-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
