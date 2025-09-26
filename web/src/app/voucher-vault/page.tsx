'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GiftIcon,
  ClockIcon,
  FireIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  TrophyIcon,
  StarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import SOVWallet from '@/components/SOVWallet/SOVWallet';
import TransactionErrorModal from '@/components/ErrorHandling/TransactionErrorModal';
import { useTransactionError } from '@/hooks/useTransactionError';
import PurchaseHistory from '@/components/VoucherVault/PurchaseHistory';
import FomoNotification from '@/components/VoucherVault/FomoNotification';
import VoucherStats from '@/components/VoucherVault/VoucherStats';
import TokenChart from '@/components/VoucherVault/TokenChart';
import LiveActivityFeed from '@/components/VoucherVault/LiveActivityFeed';
import Layout from '@/components/Layout/Layout';

// Voucher types and rarity
interface Voucher {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discountPercent: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  expiryDate: string;
  totalSupply: number;
  remainingSupply: number;
  tokenPrice: number;
  image: string;
  benefits: string[];
  isLimited: boolean;
  timeLeft?: number;
}

// Mock data for vouchers
const mockVouchers: Voucher[] = [
  {
    id: '1',
    name: 'VietJet Premium Flight',
    description: 'Chuyến bay hạng thương gia VietJet Air',
    originalPrice: 5000000,
    discountPrice: 2500000,
    discountPercent: 50,
    rarity: 'legendary',
    category: 'Travel',
    expiryDate: '2024-12-31',
    totalSupply: 100,
    remainingSupply: 23,
    tokenPrice: 5000,
    image: '/VietJet_Air-Logo.wine.png',
    benefits: ['Hạng thương gia', 'Ưu tiên check-in', 'Lounge access', 'Extra baggage'],
    isLimited: true,
    timeLeft: 86400 // 24 hours
  },
  {
    id: '2',
    name: 'HDBank Premium Banking',
    description: 'Gói dịch vụ ngân hàng cao cấp',
    originalPrice: 2000000,
    discountPrice: 800000,
    discountPercent: 60,
    rarity: 'epic',
    category: 'Banking',
    expiryDate: '2024-12-31',
    totalSupply: 500,
    remainingSupply: 156,
    tokenPrice: 2000,
    image: '/logo-hd-bank-file-vector-02.jpg',
    benefits: ['Miễn phí chuyển khoản', 'Lãi suất cao', 'Tư vấn tài chính', 'Bảo hiểm miễn phí'],
    isLimited: true,
    timeLeft: 172800 // 48 hours
  },
  {
    id: '3',
    name: 'Sovico Premium Service',
    description: 'Dịch vụ cao cấp từ Sovico Group',
    originalPrice: 1000000,
    discountPrice: 400000,
    discountPercent: 60,
    rarity: 'rare',
    category: 'Services',
    expiryDate: '2024-12-31',
    totalSupply: 1000,
    remainingSupply: 423,
    tokenPrice: 1000,
    image: '/VikkiBank.jpg',
    benefits: ['Dịch vụ ưu tiên', 'Hỗ trợ 24/7', 'Giảm giá đặc biệt', 'Quà tặng độc quyền'],
    isLimited: true,
    timeLeft: 259200 // 72 hours
  }
];

// Rarity colors and effects
const rarityConfig = {
  common: { color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800', glow: 'shadow-gray-200' },
  rare: { color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800', glow: 'shadow-blue-200' },
  epic: { color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-800', glow: 'shadow-purple-200' },
  legendary: { color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', glow: 'shadow-yellow-200' }
};

export default function VoucherVaultPage() {
  const { user, isAuthenticated } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>(mockVouchers);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [userTokens, setUserTokens] = useState(10000); // Mock user token balance
  const [isLoading, setIsLoading] = useState(false);

  // Transaction error handling
  const transactionError = useTransactionError({
    onRetry: async () => {
      // Retry purchase logic
      console.log('Retrying purchase...');
    },
    onAddFunds: () => {
      // Redirect to token purchase
      console.log('Redirecting to add funds...');
    }
  });

  // Update remaining supply and time left - CỰC NHANH VÀ ĐỒNG BỘ
  useEffect(() => {
    const interval = setInterval(() => {
      setVouchers(prevVouchers => 
        prevVouchers.map(voucher => ({
          ...voucher,
          timeLeft: voucher.timeLeft ? Math.max(0, voucher.timeLeft - 1) : 0,
          // Simulate decreasing supply over time - CỰC NHANH VÀ ĐỒNG BỘ
          remainingSupply: Math.max(0, voucher.remainingSupply - Math.floor(Math.random() * 5) - 1) // Giảm 1-5 voucher mỗi lần
        }))
      );
    }, 800); // Update every 0.8 seconds - CỰC NHANH

    return () => clearInterval(interval);
  }, []);

  // Lắng nghe event từ LiveActivityFeed để đồng bộ
  useEffect(() => {
    const handleVoucherPurchased = (event: CustomEvent) => {
      const { user, voucher, amount } = event.detail;
      
      // Cập nhật số lượng voucher khi có người mua thật
      setVouchers(prevVouchers => 
        prevVouchers.map(v => {
          if (v.name === voucher || Math.random() < 0.3) { // 30% chance mỗi voucher
            return {
              ...v,
              remainingSupply: Math.max(0, v.remainingSupply - Math.floor(Math.random() * 2) - 1)
            };
          }
          return v;
        })
      );
    };

    window.addEventListener('voucher-purchased', handleVoucherPurchased as EventListener);
    return () => window.removeEventListener('voucher-purchased', handleVoucherPurchased as EventListener);
  }, []);

  const handlePurchase = async (voucher: Voucher) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để mua voucher');
      return;
    }

    if (userTokens < voucher.tokenPrice) {
      transactionError.handleError({
        id: `insufficient-balance-${Date.now()}`,
        type: 'INSUFFICIENT_BALANCE',
        severity: 'MEDIUM',
        userMessage: {
          title: 'Không đủ token',
          message: `Bạn cần ${voucher.tokenPrice.toLocaleString()} ATHENA token để mua voucher này`,
          action: 'Vui lòng nạp thêm token hoặc chọn voucher khác'
        },
        technical: {
          message: 'Insufficient ATHENA token balance for voucher purchase',
          code: 'INSUFFICIENT_BALANCE',
          timestamp: new Date().toISOString()
        },
        context: {
          userId: user?.id,
          amount: voucher.tokenPrice,
          operation: 'voucher_purchase'
        }
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate purchase API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update voucher supply
      setVouchers(prevVouchers =>
        prevVouchers.map(v =>
          v.id === voucher.id 
            ? { ...v, remainingSupply: Math.max(0, v.remainingSupply - 1) }
            : v
        )
      );

      // Update user token balance
      setUserTokens(prev => prev - voucher.tokenPrice);
      
      setShowPurchaseModal(false);
      alert(`Chúc mừng! Bạn đã mua thành công voucher "${voucher.name}"`);
    } catch (error) {
      transactionError.handleError({
        id: `purchase-error-${Date.now()}`,
        type: 'UNKNOWN',
        severity: 'HIGH',
        userMessage: {
          title: 'Lỗi mua voucher',
          message: 'Đã xảy ra lỗi khi mua voucher. Vui lòng thử lại.',
          action: 'Thử lại hoặc liên hệ hỗ trợ'
        },
        technical: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'PURCHASE_ERROR',
          timestamp: new Date().toISOString()
        },
        context: {
          userId: user?.id,
          amount: voucher.tokenPrice,
          operation: 'voucher_purchase'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRarityConfig = (rarity: string) => {
    return rarityConfig[rarity as keyof typeof rarityConfig] || rarityConfig.common;
  };

  const getSupplyPercentage = (remaining: number, total: number) => {
    return (remaining / total) * 100;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        {/* Live Activity Feed */}
        <LiveActivityFeed />
        
        {/* FOMO Notification */}
        <FomoNotification />
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center space-x-4 mb-6"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 shadow-lg">
                <GiftIcon className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Voucher Vault
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Kho voucher độc quyền - Chỉ có thể mua bằng ATHENA Token
                </p>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <FireIcon className="w-6 h-6 text-orange-500" />
                  <span className="text-2xl font-bold text-gray-900">Hot</span>
                </div>
                <p className="text-sm text-gray-600">Voucher đang được săn đón</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <ClockIcon className="w-6 h-6 text-blue-500" />
                  <span className="text-2xl font-bold text-gray-900">Limited</span>
                </div>
                <p className="text-sm text-gray-600">Số lượng có hạn</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
                  <span className="text-2xl font-bold text-gray-900">Token Only</span>
                </div>
                <p className="text-sm text-gray-600">Chỉ mua bằng ATHENA Token</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Token Balance */}
      {isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="w-6 h-6" />
                <span className="text-lg font-semibold">ATHENA Token Balance</span>
              </div>
              <div className="text-2xl font-bold">
                {userTokens.toLocaleString()} ATHENA
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Token Chart */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TokenChart
          initialPrice={15000}
          priceChange={12.5}
        />
      </div>

      {/* Voucher Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VoucherStats
          totalVouchers={1600}
          soldVouchers={602}
          remainingVouchers={998}
          totalRevenue={15050000}
          averagePrice={25000}
          priceChange={8.5}
          popularCategories={[
            { name: 'Travel', count: 250, percentage: 41.5 },
            { name: 'Banking', count: 180, percentage: 29.9 },
            { name: 'Services', count: 120, percentage: 19.9 },
            { name: 'Shopping', count: 52, percentage: 8.7 }
          ]}
          recentActivity={[
            { action: 'đã mua', user: 'Nguyễn Văn A', voucher: 'VietJet Premium Flight', time: '2 phút trước' },
            { action: 'đã mua', user: 'Trần Thị B', voucher: 'HDBank Premium Banking', time: '5 phút trước' },
            { action: 'đã mua', user: 'Lê Văn C', voucher: 'Sovico Premium Service', time: '8 phút trước' },
            { action: 'đã mua', user: 'Phạm Thị D', voucher: 'VietJet Premium Flight', time: '12 phút trước' }
          ]}
        />
      </div>

      {/* Vouchers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vouchers.map((voucher) => {
            const rarityConfig = getRarityConfig(voucher.rarity);
            const supplyPercentage = getSupplyPercentage(voucher.remainingSupply, voucher.totalSupply);
            
            return (
              <motion.div
                key={voucher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${rarityConfig.glow}`}
              >
                {/* Rarity Badge */}
                <div className={`absolute top-4 right-4 ${rarityConfig.bgColor} ${rarityConfig.textColor} px-3 py-1 rounded-full text-sm font-bold z-10`}>
                  {voucher.rarity.toUpperCase()}
                </div>

                {/* Limited Badge */}
                {voucher.isLimited && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10 flex items-center space-x-1">
                    <FireIcon className="w-4 h-4" />
                    <span>LIMITED</span>
                  </div>
                )}

                {/* Voucher Image */}
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <img
                    src={voucher.image}
                    alt={voucher.name}
                    className="w-16 h-16 object-contain"
                  />
                </div>

                {/* Voucher Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{voucher.name}</h3>
                  <p className="text-gray-600 mb-4">{voucher.description}</p>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      {voucher.discountPrice.toLocaleString()} VND
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {voucher.originalPrice.toLocaleString()} VND
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-bold">
                      -{voucher.discountPercent}%
                    </span>
                  </div>

                  {/* Token Price */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Giá bằng ATHENA Token:</span>
                      <span className="text-lg font-bold text-purple-600">
                        {voucher.tokenPrice.toLocaleString()} ATHENA
                      </span>
                    </div>
                  </div>

                  {/* Supply Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Số lượng còn lại:</span>
                      <span className="text-sm font-bold text-gray-900">
                        {voucher.remainingSupply}/{voucher.totalSupply}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${supplyPercentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {supplyPercentage.toFixed(1)}% còn lại
                    </div>
                  </div>

                  {/* Time Left */}
                  {voucher.timeLeft && voucher.timeLeft > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm text-yellow-800">Thời gian còn lại:</span>
                        <span className="text-lg font-bold text-yellow-900">
                          {formatTime(voucher.timeLeft)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Lợi ích:</h4>
                    <ul className="space-y-1">
                      {voucher.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => {
                      setSelectedVoucher(voucher);
                      setShowPurchaseModal(true);
                    }}
                    disabled={voucher.remainingSupply === 0 || userTokens < voucher.tokenPrice}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      voucher.remainingSupply === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : userTokens < voucher.tokenPrice
                        ? 'bg-red-300 text-red-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {voucher.remainingSupply === 0
                      ? 'Hết hàng'
                      : userTokens < voucher.tokenPrice
                      ? 'Không đủ token'
                      : `Mua ngay - ${voucher.tokenPrice.toLocaleString()} ATHENA`
                    }
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Purchase History */}
      {isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PurchaseHistory
            purchases={[
              {
                id: '1',
                voucherName: 'VietJet Premium Flight',
                voucherImage: '/VietJet_Air-Logo.wine.png',
                purchaseDate: '2024-01-15T10:30:00Z',
                tokenPrice: 5000,
                status: 'active',
                expiryDate: '2024-12-31T23:59:59Z',
                voucherCode: 'VJ-PREM-2024-ABC123',
                category: 'Travel',
                benefits: ['Hạng thương gia', 'Ưu tiên check-in', 'Lounge access']
              },
              {
                id: '2',
                voucherName: 'HDBank Premium Banking',
                voucherImage: '/logo-hd-bank-file-vector-02.jpg',
                purchaseDate: '2024-01-10T14:20:00Z',
                tokenPrice: 2000,
                status: 'used',
                expiryDate: '2024-06-30T23:59:59Z',
                voucherCode: 'HD-PREM-2024-XYZ789',
                category: 'Banking',
                benefits: ['Miễn phí chuyển khoản', 'Lãi suất cao', 'Tư vấn tài chính']
              }
            ]}
          />
        </div>
      )}

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && selectedVoucher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GiftIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Xác nhận mua voucher
                </h3>
                <p className="text-gray-600">
                  {selectedVoucher.name}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Giá gốc:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {selectedVoucher.originalPrice.toLocaleString()} VND
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Giá khuyến mãi:</span>
                  <span className="text-lg font-semibold text-green-600">
                    {selectedVoucher.discountPrice.toLocaleString()} VND
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-600">Thanh toán bằng:</span>
                  <span className="text-lg font-bold text-purple-600">
                    {selectedVoucher.tokenPrice.toLocaleString()} ATHENA
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Token của bạn:</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {userTokens.toLocaleString()} ATHENA
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handlePurchase(selectedVoucher)}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Đang xử lý...' : 'Xác nhận mua'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <TransactionErrorModal
        error={transactionError.error}
        isOpen={transactionError.showErrorModal}
        onClose={transactionError.hideError}
        onRetry={transactionError.retry}
        onAddFunds={transactionError.onAddFunds}
        showWallet={true}
      />
      </div>
    </Layout>
  );
}
