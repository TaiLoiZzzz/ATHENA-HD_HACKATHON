'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import AIPersonalization from '@/components/AI/AIPersonalization';
import AISalesAssistant from '@/components/AI/AISalesAssistant';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  GiftIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CogIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function AIDashboard() {
  const [activeTab, setActiveTab] = useState<'personalization' | 'sales'>('personalization');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Mock user data - in real app, this would come from API
      const userProfile = {
        rank: 'Diamond',
        totalPoints: 15000,
        totalEarned: 25000,
        totalSpent: 10000,
        currentBalance: 15000,
        membershipTier: 'Diamond',
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

  const tabs = [
    {
      id: 'personalization',
      name: 'AI Personalization',
      icon: CpuChipIcon,
      description: 'Lời khuyên cá nhân hóa dựa trên AI'
    },
    {
      id: 'sales',
      name: 'AI Sales Assistant',
      icon: ChatBubbleLeftRightIcon,
      description: 'Trò chuyện với AI Sales chuyên nghiệp'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <img 
                    src="/LOGO CHÍNh của web.jpg" 
                    alt="ATHENA HD Logo" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <h1 className="text-5xl font-bold">AI Dashboard</h1>
              </div>
              <p className="text-xl text-purple-100">
                Trí tuệ nhân tạo siêu cá nhân hóa cho rank {userProfile?.rank}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* AI Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {tabs.map((tab, index) => (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:shadow-xl'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeTab === tab.id 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <tab.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{tab.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{tab.description}</p>
                {activeTab === tab.id && (
                  <div className="mt-3 flex items-center text-purple-600">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Đang hoạt động</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* AI Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Confidence</p>
                  <p className="text-2xl font-bold text-purple-600">95%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CpuChipIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recommendations</p>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Token Optimization</p>
                  <p className="text-2xl font-bold text-blue-600">+250%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-orange-600">87%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrophyIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* AI Personalization */}
            {activeTab === 'personalization' && (
              <div className="lg:col-span-2">
                <AIPersonalization />
              </div>
            )}

            {/* AI Sales Assistant */}
            {activeTab === 'sales' && (
              <div className="lg:col-span-2">
                <AISalesAssistant />
              </div>
            )}

          </motion.div>

          {/* AI Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tính năng AI</h2>
              <p className="text-gray-600">
                Hệ thống AI siêu cá nhân hóa với Gemini 2.5 Flash
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <CpuChipIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Phân tích thông minh</h3>
                <p className="text-sm text-gray-600">
                  AI đọc và phân tích rank, lịch sử giao dịch, tin tức để đưa ra lời khuyên tối ưu
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Trợ lý bán hàng</h3>
                <p className="text-sm text-gray-600">
                  AI đóng vai sales chuyên nghiệp, tư vấn và khuyên người dùng mua sản phẩm phù hợp
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cá nhân hóa</h3>
                <p className="text-sm text-gray-600">
                  Mỗi lời khuyên được tùy chỉnh theo rank, sở thích và hành vi của từng người dùng
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tối ưu token</h3>
                <p className="text-sm text-gray-600">
                  AI tính toán và đề xuất cách tối ưu hóa token earnings dựa trên rank và thị trường
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <FireIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dự đoán xu hướng</h3>
                <p className="text-sm text-gray-600">
                  AI phân tích tin tức và thị trường để dự đoán xu hướng và cơ hội đầu tư
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
                  <GiftIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ưu đãi thông minh</h3>
                <p className="text-sm text-gray-600">
                  AI tìm kiếm và đề xuất các ưu đãi phù hợp nhất với rank và nhu cầu của bạn
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
