'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FireIcon,
  ClockIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

interface FomoNotificationProps {
  onClose?: () => void;
}

export default function FomoNotification({ onClose }: FomoNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [recentPurchases, setRecentPurchases] = useState([
    { name: 'VietJet Premium Flight', user: 'Nguyễn Văn A', time: '2 phút trước' },
    { name: 'HDBank Premium Banking', user: 'Trần Thị B', time: '5 phút trước' },
    { name: 'Sovico Premium Service', user: 'Lê Văn C', time: '8 phút trước' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-4 left-4 right-4 z-50 max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FireIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">🔥 VOUCHER VAULT HOT!</h3>
                  <p className="text-sm opacity-90">
                    Số lượng voucher đang giảm nhanh chóng!
                  </p>
                </div>
              </div>

              {/* Time Left */}
              <div className="bg-white/20 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ClockIcon className="w-5 h-5" />
                  <span className="font-semibold">Thời gian còn lại:</span>
                </div>
                <div className="text-3xl font-bold text-yellow-300">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm opacity-90">
                  Một số voucher sẽ hết hạn sau thời gian này!
                </div>
              </div>

              {/* Recent Purchases */}
              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <UsersIcon className="w-5 h-5" />
                  <span className="font-semibold">Mua gần đây:</span>
                </div>
                <div className="space-y-2">
                  {recentPurchases.map((purchase, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="opacity-90">
                        <strong>{purchase.user}</strong> vừa mua <strong>{purchase.name}</strong>
                      </span>
                      <span className="opacity-75">{purchase.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="ml-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
