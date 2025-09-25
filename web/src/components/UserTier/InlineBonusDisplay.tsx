'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ServiceBonusPreview from '@/components/Ranking/ServiceBonusPreview';

interface InlineBonusDisplayProps {
  serviceType: string;
  amount: number;
  category?: string;
  position?: 'top' | 'bottom' | 'inline';
  size?: 'small' | 'medium' | 'large';
}

const InlineBonusDisplay: React.FC<InlineBonusDisplayProps> = ({
  serviceType,
  amount,
  category,
  position = 'inline',
  size = 'medium'
}) => {
  if (amount <= 0) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'mb-4';
      case 'bottom':
        return 'mt-4';
      case 'inline':
      default:
        return 'my-4';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      case 'medium':
      default:
        return 'text-base';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className={`${getPositionClasses()} ${getSizeClasses()}`}
    >
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🎁</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Token Rewards Available</p>
              <p className="text-sm text-gray-600">Earn SOV tokens with this purchase</p>
            </div>
          </div>
          <div className="text-right">
            <ServiceBonusPreview
              serviceType={serviceType}
              amount={amount}
              category={category}
              compact={true}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InlineBonusDisplay;
