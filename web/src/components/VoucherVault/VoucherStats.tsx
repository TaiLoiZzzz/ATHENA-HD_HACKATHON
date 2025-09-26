'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GiftIcon,
  FireIcon,
  ClockIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface VoucherStatsProps {
  totalVouchers: number;
  soldVouchers: number;
  remainingVouchers: number;
  totalRevenue: number;
  averagePrice: number;
  priceChange: number;
  popularCategories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    action: string;
    user: string;
    voucher: string;
    time: string;
  }>;
}

export default function VoucherStats({
  totalVouchers,
  soldVouchers: initialSoldVouchers,
  remainingVouchers: initialRemainingVouchers,
  totalRevenue: initialTotalRevenue,
  averagePrice,
  priceChange,
  popularCategories,
  recentActivity: initialRecentActivity
}: VoucherStatsProps) {
  const [isPositive, setIsPositive] = useState(priceChange >= 0);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity);
  const [soldVouchers, setSoldVouchers] = useState(initialSoldVouchers);
  const [remainingVouchers, setRemainingVouchers] = useState(initialRemainingVouchers);
  const [totalRevenue, setTotalRevenue] = useState(initialTotalRevenue);

  useEffect(() => {
    setIsPositive(priceChange >= 0);
  }, [priceChange]);

  // Real-time activity updates - CỰC NHANH VÀ ĐỒNG BỘ
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        action: 'đã mua',
        user: `Người dùng ${Math.floor(Math.random() * 1000) + 1}`,
        voucher: ['VietJet Premium Flight', 'HDBank Premium Banking', 'Sovico Premium Service', 'Voucher Vault Exclusive', 'Premium Travel Package', 'Banking VIP Service'][Math.floor(Math.random() * 6)],
        time: 'Vừa xong'
      };
      
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
      
      // ĐỒNG BỘ: Cập nhật số lượng voucher khi có người mua
      const soldCount = Math.floor(Math.random() * 3) + 1; // 1-3 voucher được bán
      setSoldVouchers(prev => prev + soldCount);
      setRemainingVouchers(prev => Math.max(0, prev - soldCount));
      setTotalRevenue(prev => prev + (soldCount * averagePrice));
    }, 400 + Math.random() * 600); // Random between 0.4-1 seconds - CỰC NHANH

    return () => clearInterval(interval);
  }, [averagePrice]);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(0);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(num);
  };

  const getSalesPercentage = () => {
    return (soldVouchers / totalVouchers) * 100;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Thống kê Voucher Vault</h3>
        <div className="flex items-center space-x-2">
          <FireIcon className="w-6 h-6 text-orange-500" />
          <span className="text-sm text-gray-600">Real-time</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Vouchers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <GiftIcon className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-600">Tổng voucher</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatNumber(totalVouchers)}
          </div>
          <div className="text-sm text-gray-600">
            {formatNumber(remainingVouchers)} còn lại
          </div>
        </motion.div>

        {/* Sold Vouchers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <UsersIcon className="w-6 h-6 text-green-600" />
            <span className="text-sm text-gray-600">Đã bán</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatNumber(soldVouchers)}
          </div>
          <div className="text-sm text-gray-600">
            {getSalesPercentage().toFixed(1)}% tổng số
          </div>
        </motion.div>

        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
            <span className="text-sm text-gray-600">Doanh thu</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-sm text-gray-600">
            ATHENA Token
          </div>
        </motion.div>

        {/* Average Price */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <ArrowTrendingUpIcon className="w-6 h-6 text-orange-600" />
            <span className="text-sm text-gray-600">Giá trung bình</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatNumber(averagePrice)}
          </div>
          <div className={`flex items-center space-x-1 text-sm ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <ArrowTrendingUpIcon className="w-4 h-4" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4" />
            )}
            <span>{Math.abs(priceChange).toFixed(1)}%</span>
          </div>
        </motion.div>
      </div>

      {/* Sales Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Tiến độ bán hàng</h4>
          <span className="text-sm text-gray-600">
            {getSalesPercentage().toFixed(1)}% hoàn thành
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getSalesPercentage()}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full"
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>0</span>
          <span>{formatNumber(totalVouchers)}</span>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Danh mục phổ biến</h4>
        <div className="space-y-3">
          {popularCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{category.count} voucher</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {category.percentage}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h4>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <strong>{activity.user}</strong> {activity.action} <strong>{activity.voucher}</strong>
                </p>
                <p className="text-xs text-gray-600">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
