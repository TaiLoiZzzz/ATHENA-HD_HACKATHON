'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  SparklesIcon,
  ChartBarIcon,
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
  HeartIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import AIRecommendations from './AIRecommendations';
import AIInsights from './AIInsights';
import { sovTokenService } from '@/services/sovTokenService';

interface AIDashboardProps {
  className?: string;
}

const AIDashboard: React.FC<AIDashboardProps> = ({ className = '' }) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
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
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <CpuChipIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">AI Dashboard</h3>
            <p className="text-sm text-gray-600">
              Trí tuệ nhân tạo siêu cá nhân hóa cho rank {userProfile?.rank}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-6 h-6 text-purple-500" />
          <span className="text-sm font-medium text-purple-600">AI Powered</span>
        </div>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">AI Confidence</p>
              <p className="text-2xl font-bold text-purple-600">95%</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CpuChipIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recommendations</p>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Token Optimization</p>
              <p className="text-2xl font-bold text-blue-600">+250%</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-orange-600">87%</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrophyIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <AIRecommendations limit={2} showHeader={false} />
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <AIInsights compact={true} />
        </motion.div>
      </div>

      {/* AI Features Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Tính năng AI</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <CpuChipIcon className="w-6 h-6 text-blue-600" />
              <h5 className="font-semibold text-gray-900">Phân tích thông minh</h5>
            </div>
            <p className="text-sm text-gray-700">
              AI đọc và phân tích rank, lịch sử giao dịch, tin tức để đưa ra lời khuyên tối ưu
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <CpuChipIcon className="w-6 h-6 text-green-600" />
              <h5 className="font-semibold text-gray-900">Sales Assistant</h5>
            </div>
            <p className="text-sm text-gray-700">
              AI đóng vai sales chuyên nghiệp, tư vấn và khuyên người dùng mua sản phẩm phù hợp
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <SparklesIcon className="w-6 h-6 text-purple-600" />
              <h5 className="font-semibold text-gray-900">Cá nhân hóa</h5>
            </div>
            <p className="text-sm text-gray-700">
              Mỗi lời khuyên được tùy chỉnh theo rank, sở thích và hành vi của từng người dùng
            </p>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <ArrowTrendingUpIcon className="w-6 h-6 text-orange-600" />
              <h5 className="font-semibold text-gray-900">Tối ưu token</h5>
            </div>
            <p className="text-sm text-gray-700">
              AI tính toán và đề xuất cách tối ưu hóa token earnings dựa trên rank và thị trường
            </p>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <FireIcon className="w-6 h-6 text-indigo-600" />
              <h5 className="font-semibold text-gray-900">Dự đoán xu hướng</h5>
            </div>
            <p className="text-sm text-gray-700">
              AI phân tích tin tức và thị trường để dự đoán xu hướng và cơ hội đầu tư
            </p>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <GiftIcon className="w-6 h-6 text-pink-600" />
              <h5 className="font-semibold text-gray-900">Ưu đãi thông minh</h5>
            </div>
            <p className="text-sm text-gray-700">
              AI tìm kiếm và đề xuất các ưu đãi phù hợp nhất với rank và nhu cầu của bạn
            </p>
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center"
      >
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <h4 className="text-xl font-bold mb-2">Khám phá AI Dashboard</h4>
          <p className="text-purple-100 mb-4">
            Trải nghiệm đầy đủ tính năng AI siêu cá nhân hóa với Gemini 2.5 Flash
          </p>
          <button
            onClick={() => window.location.href = '/ai-dashboard'}
            className="bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 mx-auto"
          >
            <span>Khám phá ngay</span>
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AIDashboard;
