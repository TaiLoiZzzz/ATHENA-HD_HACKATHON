'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StarIcon,
  TrophyIcon,
  SparklesIcon,
  GiftIcon,
  ChartBarIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/solid';
import {
  UserIcon,
  TrophyIcon as TrophyOutlineIcon
} from '@heroicons/react/24/outline';

interface TierInfo {
  name: string;
  level: number;
  bonusMultiplier: number;
  tokenBonusPercentage: number;
  color: string;
  icon: string;
  specialPerks: any;
  nextTier: string;
  progressToNext: number;
}

interface MemberStats {
  memberSince: string;
  daysAsMember: number;
  totalSpent: number;
  totalTransactions: number;
  totalBonusEarned: number;
}

interface LoyaltyData {
  currentTier: TierInfo;
  nextTier: any;
  memberStats: MemberStats;
  recentBenefits: any[];
  achievementProgress: any;
}

interface LoyaltyTierDisplayProps {
  onTierUpdate?: (tierInfo: TierInfo) => void;
}

const TierIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  const iconMap = {
    'user': UserIcon,
    'medal': TrophyOutlineIcon,
    'award': TrophyIcon,
    'star': StarIcon,
    'crown': TrophyIcon,
    'gem': SparklesIcon
  };
  
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || StarIcon;
  return <IconComponent className={className} />;
};

export default function LoyaltyTierDisplay({ onTierUpdate }: LoyaltyTierDisplayProps) {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const token = document.cookie.split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch('/api/enhanced-payments/loyalty/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLoyaltyData(data.dashboard);
        if (onTierUpdate) {
          onTierUpdate(data.dashboard.currentTier);
        }
      }
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatTokens = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-16 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <p className="text-gray-500">Không thể tải thông tin hạng thành viên</p>
      </div>
    );
  }

  const { currentTier, nextTier, memberStats, recentBenefits, achievementProgress } = loyaltyData;

  return (
    <div className="space-y-6">
      {/* Current Tier Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${currentTier.color}20 0%, ${currentTier.color}40 100%)`
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <TierIcon iconName={currentTier.icon} className="w-full h-full" />
        </div>
        
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: currentTier.color }}
              >
                <TierIcon iconName={currentTier.icon} className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{currentTier.name}</h3>
                <p className="text-gray-600">Hạng thành viên hiện tại</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-colors"
            >
              {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
            </button>
          </div>

          {/* Tier Benefits Highlight */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <BoltIcon className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">Bonus Token</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: currentTier.color }}>
                +{currentTier.tokenBonusPercentage}%
              </p>
              <p className="text-sm text-gray-600">Khi mua dịch vụ</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5 text-purple-500" />
                <span className="font-semibold">Hệ số nhân</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: currentTier.color }}>
                x{currentTier.bonusMultiplier}
              </p>
              <p className="text-sm text-gray-600">Điểm tích lũy</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <GiftIcon className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Ưu đãi</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: currentTier.color }}>
                {currentTier.level - 1}%
              </p>
              <p className="text-sm text-gray-600">Giảm giá theo hạng</p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier.name !== 'Tối đa' && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Tiến độ lên hạng {nextTier.name}
                </span>
                <span className="text-sm font-bold" style={{ color: currentTier.color }}>
                  {nextTier.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${nextTier.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-3 rounded-full"
                  style={{ backgroundColor: currentTier.color }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Detailed Information */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Member Statistics */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-2 text-blue-500" />
                Thống kê thành viên
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">{memberStats.daysAsMember}</p>
                  <p className="text-sm text-gray-600">Ngày tham gia</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(memberStats.totalSpent)}
                  </p>
                  <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">{memberStats.totalTransactions}</p>
                  <p className="text-sm text-gray-600">Giao dịch</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-orange-600">
                    {formatTokens(memberStats.totalBonusEarned)} SOV
                  </p>
                  <p className="text-sm text-gray-600">Bonus nhận được</p>
                </div>
              </div>
            </div>

            {/* Recent Benefits */}
            {recentBenefits.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FireIcon className="w-6 h-6 mr-2 text-red-500" />
                  Ưu đãi gần đây
                </h4>
                
                <div className="space-y-3">
                  {recentBenefits.slice(0, 5).map((benefit, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{benefit.service?.toUpperCase()}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(benefit.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        {benefit.bonus_tokens > 0 && (
                          <p className="text-green-600 font-bold">
                            +{formatTokens(benefit.bonus_tokens)} SOV
                          </p>
                        )}
                        {benefit.discount > 0 && (
                          <p className="text-blue-600 font-bold">
                            -{formatCurrency(benefit.discount)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TrophyIcon className="w-6 h-6 mr-2 text-yellow-500" />
                Thành tích
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(achievementProgress).map(([key, achieved]) => (
                  <div 
                    key={key}
                    className={`p-4 rounded-xl border-2 ${
                      achieved ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      achieved ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <TrophyIcon className="w-5 h-5 text-white" />
                    </div>
                    <p className={`text-sm text-center font-medium ${
                      achieved ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {key === 'loyalty_champion' && 'Nhà vô địch'}
                      {key === 'early_adopter' && 'Người tiên phong'}
                      {key === 'big_spender' && 'Khách VIP'}
                      {key === 'frequent_user' && 'Người dùng tích cực'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


