'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import LoyaltyTierDisplay from '@/components/Loyalty/LoyaltyTierDisplay';
import { useAuth } from '@/contexts/AuthContext';
import {
  StarIcon,
  TrophyIcon,
  GiftIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';
import {
  UserIcon,
  TrophyIcon as TrophyOutlineIcon
} from '@heroicons/react/24/outline';

interface LoyaltyTier {
  name: string;
  level: number;
  requirements: {
    minDaysMember: number;
    minTotalSpent: number;
    minTransactions: number;
  };
  benefits: {
    bonusMultiplier: number;
    tokenBonusPercentage: number;
    specialPerks: any;
  };
  design: {
    color: string;
    icon: string;
  };
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

export default function LoyaltyPage() {
  const { user, isAuthenticated } = useAuth();
  const [allTiers, setAllTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTierInfo, setCurrentTierInfo] = useState<any>(null);

  useEffect(() => {
    fetchLoyaltyTiers();
  }, []);

  const fetchLoyaltyTiers = async () => {
    try {
      const response = await fetch('/api/enhanced-payments/loyalty/tiers');
      
      if (response.ok) {
        const data = await response.json();
        setAllTiers(data.tiers || []);
      }
    } catch (error) {
      console.error('Failed to fetch loyalty tiers:', error);
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

  const formatDays = (days: number) => {
    if (days < 30) return `${days} ngày`;
    if (days < 365) return `${Math.round(days / 30)} tháng`;
    return `${Math.round(days / 365)} năm`;
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Đăng nhập để xem chương trình thành viên</h1>
            <a href="/auth/login" className="text-blue-600 hover:text-blue-800">
              Đăng nhập ngay
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-6"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <TrophyIcon className="w-16 h-16 text-white" />
                </div>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Chương trình Thành viên ATHENA
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/90 mb-8 max-w-3xl mx-auto"
              >
                Từ Thành viên mới đến Kim Cương - Hành trình với những ưu đãi đặc biệt và bonus token hấp dẫn
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-4 text-white/90"
              >
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <GiftIcon className="w-5 h-5 mr-2" />
                  <span>Bonus token lên đến 15%</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  <span>Hệ số nhân 1.5x</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  <span>Giảm giá lên đến 5%</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Current User Tier */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hạng thành viên của bạn</h2>
            <LoyaltyTierDisplay onTierUpdate={setCurrentTierInfo} />
          </div>

          {/* All Tiers Overview */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tất cả hạng thành viên</h2>
            <p className="text-gray-600 mb-8">
              Khám phá các hạng thành viên và ưu đãi tương ứng trong hệ sinh thái ATHENA
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTiers.map((tier, index) => (
                <motion.div
                  key={tier.level}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl overflow-hidden shadow-xl ${
                    currentTierInfo?.level === tier.level 
                      ? 'ring-4 ring-blue-500 ring-opacity-50' 
                      : ''
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${tier.design.color}20 0%, ${tier.design.color}40 100%)`
                  }}
                >
                  {/* Current Tier Badge */}
                  {currentTierInfo?.level === tier.level && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Hạng hiện tại
                      </span>
                    </div>
                  )}

                  {/* Tier Icon Background */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                    <TierIcon iconName={tier.design.icon} className="w-full h-full" />
                  </div>

                  <div className="relative p-6">
                    {/* Tier Header */}
                    <div className="flex items-center mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: tier.design.color }}
                      >
                        <TierIcon iconName={tier.design.icon} className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                        <p className="text-gray-600">Hạng {tier.level}</p>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Yêu cầu:</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>• Thành viên: {formatDays(tier.requirements.minDaysMember)}</p>
                        <p>• Chi tiêu: {formatCurrency(tier.requirements.minTotalSpent)}</p>
                        <p>• Giao dịch: {tier.requirements.minTransactions} lần</p>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Ưu đãi:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center">
                          <p className="text-lg font-bold" style={{ color: tier.design.color }}>
                            +{tier.benefits.tokenBonusPercentage}%
                          </p>
                          <p className="text-xs text-gray-600">Bonus token</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center">
                          <p className="text-lg font-bold" style={{ color: tier.design.color }}>
                            x{tier.benefits.bonusMultiplier}
                          </p>
                          <p className="text-xs text-gray-600">Hệ số nhân</p>
                        </div>
                      </div>
                    </div>

                    {/* Special Perks */}
                    {tier.benefits.specialPerks && Object.keys(tier.benefits.specialPerks).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Đặc quyền:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(tier.benefits.specialPerks).map(([key, value]) => {
                            if (value === true) {
                              const perkNames = {
                                'welcome_bonus': 'Bonus chào mừng',
                                'priority_support': 'Hỗ trợ ưu tiên',
                                'early_access': 'Truy cập sớm',
                                'exclusive_deals': 'Ưu đãi độc quyền',
                                'personal_advisor': 'Tư vấn cá nhân',
                                'vip_lounge': 'VIP Lounge',
                                'concierge_service': 'Concierge'
                              };
                              return (
                                <span
                                  key={key}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/60 text-gray-700"
                                >
                                  {perkNames[key as keyof typeof perkNames] || key}
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Cách thức hoạt động</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Tham gia hệ sinh thái</h3>
                <p className="text-gray-600">
                  Đăng ký tài khoản và bắt đầu sử dụng các dịch vụ trong hệ sinh thái Sovico
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Tích lũy điểm</h3>
                <p className="text-gray-600">
                  Thực hiện giao dịch, chi tiêu và tích lũy điểm để nâng cấp hạng thành viên
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <GiftIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Nhận ưu đãi</h3>
                <p className="text-gray-600">
                  Tận hưởng bonus token, giảm giá và các đặc quyền độc quyền theo hạng
                </p>
              </motion.div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white"
            >
              <h2 className="text-2xl font-bold mb-4">Bắt đầu hành trình ngay hôm nay!</h2>
              <p className="text-lg mb-6 opacity-90">
                Mỗi giao dịch đều mang bạn đến gần hơn với hạng thành viên cao hơn
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/vietjet"
                  className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Đặt vé máy bay
                </a>
                <a
                  href="/hdbank"
                  className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Sản phẩm ngân hàng
                </a>
                <a
                  href="/marketplace"
                  className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Token Marketplace
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
