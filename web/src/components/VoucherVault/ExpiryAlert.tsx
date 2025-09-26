'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  XMarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface ExpiryAlertProps {
  voucherName: string;
  expiryDate: string;
  daysLeft: number;
  onClose?: () => void;
  onExtend?: () => void;
}

export default function ExpiryAlert({
  voucherName,
  expiryDate,
  daysLeft,
  onClose,
  onExtend
}: ExpiryAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('low');

  useEffect(() => {
    if (daysLeft <= 1) {
      setUrgency('critical');
    } else if (daysLeft <= 3) {
      setUrgency('high');
    } else if (daysLeft <= 7) {
      setUrgency('medium');
    } else {
      setUrgency('low');
    }
  }, [daysLeft]);

  const getUrgencyConfig = () => {
    switch (urgency) {
      case 'critical':
        return {
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          icon: ExclamationTriangleIcon,
          message: 'SẮP HẾT HẠN!',
          description: 'Voucher sẽ hết hạn trong vài giờ!'
        };
      case 'high':
        return {
          bgColor: 'bg-orange-500',
          textColor: 'text-white',
          icon: ClockIcon,
          message: 'SẮP HẾT HẠN!',
          description: 'Voucher sẽ hết hạn trong vài ngày!'
        };
      case 'medium':
        return {
          bgColor: 'bg-yellow-500',
          textColor: 'text-white',
          icon: ClockIcon,
          message: 'SẮP HẾT HẠN!',
          description: 'Voucher sẽ hết hạn trong tuần này!'
        };
      default:
        return {
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          icon: GiftIcon,
          message: 'NHẮC NHỞ!',
          description: 'Voucher sẽ hết hạn sớm!'
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleExtend = () => {
    onExtend?.();
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
        className={`fixed bottom-4 left-4 z-50 max-w-sm ${config.bgColor} rounded-2xl shadow-2xl p-4 ${config.textColor}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Icon className="w-5 h-5" />
              <span className="font-bold text-sm">{config.message}</span>
            </div>
            
            <h4 className="font-semibold mb-1">{voucherName}</h4>
            <p className="text-sm opacity-90 mb-3">{config.description}</p>

            {/* Expiry Info */}
            <div className="bg-white/20 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Ngày hết hạn:</span>
                <span className="font-bold">{formatDate(expiryDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Còn lại:</span>
                <span className="font-bold text-lg">
                  {daysLeft} {daysLeft === 1 ? 'ngày' : 'ngày'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-white/30 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, (daysLeft / 30) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-white h-2 rounded-full"
                />
              </div>
              <div className="text-xs opacity-90 mt-1">
                {Math.max(0, (daysLeft / 30) * 100).toFixed(1)}% thời gian còn lại
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
              {urgency !== 'critical' && (
                <button
                  onClick={handleExtend}
                  className="flex-1 py-2 px-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <span>Gia hạn</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
