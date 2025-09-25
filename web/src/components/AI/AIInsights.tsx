'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  StarIcon,
  GiftIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  BoltIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { aiPersonalizationService } from '@/services/aiPersonalizationService';
import { sovTokenService } from '@/services/sovTokenService';

interface AIInsightsProps {
  className?: string;
  compact?: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ className = '', compact = false }) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const wallet = sovTokenService.getWallet();
      const stats = sovTokenService.getWalletStats();
      const userProfile = {
        rank: stats.membershipTier.name,
        totalPoints: wallet.totalEarned,
        totalEarned: wallet.totalEarned,
        totalSpent: wallet.totalSpent,
        currentBalance: wallet.balance,
        membershipTier: stats.membershipTier.name,
        isAthenaPrime: true,
        preferences: ['travel', 'banking', 'resort'],
        transactionHistory: []
      };
      setUserProfile(userProfile);

      // Mock insights data
      const mockInsights = [
        {
          id: '1',
          type: 'trend',
          title: 'Xu hướng thị trường',
          description: 'Thị trường du lịch đang tăng mạnh, phù hợp với rank Diamond của bạn',
          confidence: 0.92,
          urgency: 'high',
          impact: 'positive',
          tokens: 500,
          icon: ArrowTrendingUpIcon,
          color: 'green'
        },
        {
          id: '2',
          type: 'opportunity',
          title: 'Cơ hội vàng',
          description: 'VietJet Air có chương trình khuyến mãi đặc biệt cho rank Diamond',
          confidence: 0.88,
          urgency: 'medium',
          impact: 'positive',
          tokens: 300,
          icon: GiftIcon,
          color: 'blue'
        },
        {
          id: '3',
          type: 'optimization',
          title: 'Tối ưu hóa',
          description: 'Bạn có thể tăng 25% token earnings bằng cách đa dạng hóa danh mục',
          confidence: 0.85,
          urgency: 'low',
          impact: 'positive',
          tokens: 200,
          icon: BoltIcon,
          color: 'purple'
        },
        {
          id: '4',
          type: 'prediction',
          title: 'Dự đoán AI',
          description: 'AI dự đoán bạn sẽ kiếm thêm 2,500 SOV trong tháng tới',
          confidence: 0.90,
          urgency: 'medium',
          impact: 'positive',
          tokens: 2500,
          icon: CpuChipIcon,
          color: 'orange'
        }
      ];

      setInsights(mockInsights);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <FireIcon className="w-4 h-4" />;
      case 'medium': return <ClockIcon className="w-4 h-4" />;
      case 'low': return <CheckCircleIcon className="w-4 h-4" />;
      default: return <StarIcon className="w-4 h-4" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'from-green-500 to-emerald-500';
      case 'blue': return 'from-blue-500 to-cyan-500';
      case 'purple': return 'from-purple-500 to-pink-500';
      case 'orange': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <CpuChipIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            <p className="text-sm text-gray-600">Phân tích thông minh</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {insights.slice(0, 2).map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
            >
              <div className={`w-6 h-6 bg-gradient-to-r ${getColorClasses(insight.color)} rounded-full flex items-center justify-center`}>
                <insight.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                <p className="text-xs text-gray-600">{insight.description}</p>
              </div>
              <span className="text-xs text-green-600 font-medium">
                +{insight.tokens} SOV
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <CpuChipIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Insights</h3>
            <p className="text-sm text-gray-600">
              Phân tích thông minh cho rank {userProfile?.rank}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-5 h-5 text-purple-500" />
          <span className="text-sm font-medium text-purple-600">AI Powered</span>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${getColorClasses(insight.color)} rounded-lg flex items-center justify-center`}>
                <insight.icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(insight.urgency)}`}>
                      {getUrgencyIcon(insight.urgency)}
                      <span className="ml-1 capitalize">{insight.urgency}</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        +{insight.tokens} SOV
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        {insight.impact === 'positive' ? 'Tích cực' : 'Tiêu cực'}
                      </span>
                    </div>
                  </div>
                  
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1">
                    <span>Xem chi tiết</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Summary */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <CpuChipIcon className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-gray-900">Tóm tắt AI</span>
        </div>
        <p className="text-sm text-gray-700">
          Dựa trên phân tích, rank {userProfile?.rank} của bạn có thể tối ưu hóa token earnings 
          bằng cách tập trung vào các dịch vụ phù hợp và tận dụng các cơ hội thị trường hiện tại.
        </p>
      </div>
    </div>
  );
};

export default AIInsights;
