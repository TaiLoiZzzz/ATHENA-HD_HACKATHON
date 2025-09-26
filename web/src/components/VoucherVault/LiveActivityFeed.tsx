'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersIcon,
  GiftIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface LiveActivity {
  id: string;
  user: string;
  voucher: string;
  time: string;
  amount: number;
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Generate initial activities
  useEffect(() => {
    const initialActivities: LiveActivity[] = [];
    for (let i = 0; i < 5; i++) {
      initialActivities.push({
        id: `initial-${i}`,
        user: `Người dùng ${Math.floor(Math.random() * 1000) + 1}`,
        voucher: ['VietJet Premium Flight', 'HDBank Premium Banking', 'Sovico Premium Service', 'Voucher Vault Exclusive'][Math.floor(Math.random() * 4)],
        time: 'Vừa xong',
        amount: Math.floor(Math.random() * 5000) + 1000
      });
    }
    setActivities(initialActivities);
  }, []);

  // CỰC NHANH activity updates - ĐỒNG BỘ VỚI VOUCHER SUPPLY
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity: LiveActivity = {
        id: `activity-${Date.now()}`,
        user: `Người dùng ${Math.floor(Math.random() * 1000) + 1}`,
        voucher: ['VietJet Premium Flight', 'HDBank Premium Banking', 'Sovico Premium Service', 'Voucher Vault Exclusive', 'Premium Travel Package', 'Banking VIP Service', 'Luxury Hotel Package'][Math.floor(Math.random() * 7)],
        time: 'Vừa xong',
        amount: Math.floor(Math.random() * 8000) + 2000
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 8)]);
      
      // ĐỒNG BỘ: Trigger custom event để các component khác biết có người mua
      window.dispatchEvent(new CustomEvent('voucher-purchased', {
        detail: {
          user: newActivity.user,
          voucher: newActivity.voucher,
          amount: newActivity.amount
        }
      }));
    }, 200 + Math.random() * 400); // Random between 0.2-0.6 seconds - CỰC NHANH

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-40 max-w-sm">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FireIcon className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-gray-900">Hoạt động live</span>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <GiftIcon className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {activity.user}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-1">
                      đã mua <strong>{activity.voucher}</strong>
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-600 font-medium">
                        {activity.amount.toLocaleString()} ATHENA
                      </span>
                      <SparklesIcon className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-green-500 rounded-full"
            />
            <span>Đang cập nhật real-time</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
