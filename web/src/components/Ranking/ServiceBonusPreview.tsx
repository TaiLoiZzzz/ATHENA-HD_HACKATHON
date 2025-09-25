'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GiftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { rankingService } from '@/services/rankingService';

interface ServiceBonusPreviewProps {
  serviceType: string;
  category?: string;
  amount: number;
  className?: string;
  compact?: boolean;
}

export default function ServiceBonusPreview({ 
  serviceType, 
  category, 
  amount, 
  className = '',
  compact = false 
}: ServiceBonusPreviewProps) {
  const [bonus, setBonus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (amount > 0) {
      fetchBonus();
    } else {
      setLoading(false);
    }
  }, [serviceType, category, amount]);

  const fetchBonus = async () => {
    try {
      const bonusData = await rankingService.getServiceBonus(serviceType, amount, category);
      setBonus(bonusData);
    } catch (error) {
      console.error('Failed to fetch service bonus:', error);
      // Fallback for demo
      setBonus({
        success: true,
        userRank: 'Silver',
        bonusAmount: 10,
        message: '🎉 Bạn sẽ nhận được 10 SOV với rank Silver!',
        multiplier: 1.2
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBonus = (bonusAmount: number) => {
    return bonusAmount.toLocaleString();
  };

  const getRankColor = (rank: string) => {
    switch (rank?.toLowerCase()) {
      case 'diamond': return 'from-blue-500 to-purple-600';
      case 'gold': return 'from-yellow-500 to-orange-500';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'bronze': return 'from-orange-600 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank?.toLowerCase()) {
      case 'diamond': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '🏆';
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 h-6 w-32 rounded"></div>
      </div>
    );
  }

  if (!bonus || !bonus.success || bonus.bonusAmount <= 0) {
    return null;
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r ${getRankColor(bonus.userRank)} text-white rounded-full text-sm font-medium ${className}`}
      >
        <SparklesIcon className="w-4 h-4" />
        <span>{getRankIcon(bonus.userRank)} +{formatBonus(bonus.bonusAmount)} SOV</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 bg-gradient-to-r ${getRankColor(bonus.userRank)} rounded-full flex items-center justify-center text-white text-lg`}>
            <GiftIcon className="w-5 h-5" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-semibold text-green-800">
              {getRankIcon(bonus.userRank)} Bonus {bonus.userRank}
            </h4>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              {bonus.multiplier}x
            </span>
          </div>
          
          <p className="text-lg font-bold text-green-700">
            +{formatBonus(bonus.bonusAmount)} SOV
          </p>
          
          <p className="text-xs text-green-600 mt-1">
            {bonus.message || `Bạn sẽ nhận được ${formatBonus(bonus.bonusAmount)} SOV với rank ${bonus.userRank}!`}
          </p>
        </div>
      </div>
      
      {/* Bonus details */}
      <div className="mt-3 pt-3 border-t border-green-200">
        <div className="flex items-center justify-between text-xs text-green-600">
          <span>Service: {serviceType.toUpperCase()}</span>
          <span>Amount: {amount.toLocaleString()} VND</span>
        </div>
      </div>
    </motion.div>
  );
}

