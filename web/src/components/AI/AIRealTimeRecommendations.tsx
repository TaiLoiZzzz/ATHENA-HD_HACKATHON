'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CpuChipIcon,
  SparklesIcon,
  TrendingUpIcon,
  FireIcon,
  StarIcon,
  GiftIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  BoltIcon,
  EyeIcon,
  RefreshIcon
} from '@heroicons/react/24/outline';
import { aiPersonalizationService } from '@/services/aiPersonalizationService';
import { sovTokenService } from '@/services/sovTokenService';

interface AIRealTimeRecommendationsProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const AIRealTimeRecommendations: React.FC<AIRealTimeRecommendationsProps> = ({ 
  className = '',
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadRecommendations();
    
    if (autoRefresh) {
      const interval = setInterval(loadRecommendations, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
        transactionHistory: [
          { type: 'earn', amount: 100, description: 'Flight booking reward', serviceType: 'vietjet' },
          { type: 'spend', amount: -50, description: 'Banking service fee', serviceType: 'hdbank' },
          { type: 'earn', amount: 200, description: 'Resort booking bonus', serviceType: 'sovico' }
        ]
      };
      setUserProfile(userProfile);

      // Get AI recommendations
      const [news, products] = await Promise.all([
        aiPersonalizationService.getNewsAnalysis(),
        aiPersonalizationService.getAvailableProducts()
      ]);

      const aiRecommendations = await aiPersonalizationService.getPersonalizedRecommendations(
        userProfile,
        news,
        products
      );
      
      setRecommendations(aiRecommendations);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Failed to load AI recommendations:', error);
      setError(error.message || 'Failed to load recommendations');
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

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'vietjet': return '✈️';
      case 'hdbank': return '🏦';
      case 'sovico': return '🏨';
      case 'vikkibank': return '🏪';
      case 'marketplace': return '🛒';
      default: return '💎';
    }
  };

  const getServiceColor = (serviceType: string) => {
    switch (serviceType) {
      case 'vietjet': return 'from-blue-500 to-cyan-500';
      case 'hdbank': return 'from-green-500 to-emerald-500';
      case 'sovico': return 'from-purple-500 to-pink-500';
      case 'vikkibank': return 'from-orange-500 to-red-500';
      case 'marketplace': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading && recommendations.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <CpuChipIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Real-time Recommendations</h3>
            <p className="text-sm text-gray-600">Đang phân tích dữ liệu...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
            <h3 className="text-xl font-bold text-gray-900">AI Real-time Recommendations</h3>
            <p className="text-sm text-gray-600">
              Lời khuyên thời gian thực cho rank {userProfile?.rank}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadRecommendations}
            disabled={loading}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshIcon className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-600">Live AI</span>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="bg-blue-50 rounded-lg p-3 mb-6">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Cập nhật lần cuối: {lastUpdated.toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <FireIcon className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-4">
        <AnimatePresence>
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.product?.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                {/* Service Icon */}
                <div className={`w-12 h-12 bg-gradient-to-r ${getServiceColor(rec.product?.serviceType)} rounded-lg flex items-center justify-center text-white text-xl`}>
                  {getServiceIcon(rec.product?.serviceType)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{rec.product?.name}</h4>
                      <p className="text-sm text-gray-600">{rec.product?.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(rec.urgency)}`}>
                        {getUrgencyIcon(rec.urgency)}
                        <span className="ml-1 capitalize">{rec.urgency}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round((rec.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-2">
                      <CpuChipIcon className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Lý do AI khuyên:</p>
                        <p className="text-sm text-blue-800">{rec.reason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Token Optimization */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          +{rec.expectedTokens} SOV
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUpIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">
                          ROI: {Math.round((rec.roi || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {rec.product?.price?.toLocaleString()} VND
                      </p>
                      {rec.product?.discount && (
                        <p className="text-sm text-green-600">
                          -{rec.product.discount}% discount
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Personalized Message */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-2">
                      <GiftIcon className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Lời khuyên cá nhân:</p>
                        <p className="text-sm text-green-800">{rec.personalizedMessage}</p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  {rec.product?.features && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rec.product.features.map((feature: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrophyIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">
                        Tối ưu cho rank {userProfile?.rank}
                      </span>
                    </div>
                    <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2">
                      <span>Xem chi tiết</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* AI Summary */}
      <div className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <CpuChipIcon className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-gray-900">AI Summary</span>
        </div>
        <p className="text-sm text-gray-700">
          Dựa trên phân tích thời gian thực, rank {userProfile?.rank} của bạn có thể tối ưu hóa token earnings 
          bằng cách tập trung vào các sản phẩm phù hợp và tận dụng các cơ hội thị trường hiện tại.
        </p>
      </div>
    </div>
  );
};

export default AIRealTimeRecommendations;
