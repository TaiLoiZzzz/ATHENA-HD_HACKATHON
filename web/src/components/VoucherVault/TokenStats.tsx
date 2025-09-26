'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  FireIcon,
  UsersIcon,
  ClockIcon,
  TrophyIcon,
  SparklesIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

interface TokenStatsProps {
  currentPrice: number;
  priceChange: number;
  totalSupply: number;
  circulatingSupply: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  transactions24h: number;
}

export default function TokenStats({
  currentPrice: initialPrice,
  priceChange: initialPriceChange,
  totalSupply,
  circulatingSupply,
  marketCap: initialMarketCap,
  volume24h: initialVolume24h,
  holders: initialHolders,
  transactions24h: initialTransactions24h
}: TokenStatsProps) {
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [priceChange, setPriceChange] = useState(initialPriceChange);
  const [marketCap, setMarketCap] = useState(initialMarketCap);
  const [volume24h, setVolume24h] = useState(initialVolume24h);
  const [holders, setHolders] = useState(initialHolders);
  const [transactions24h, setTransactions24h] = useState(initialTransactions24h);
  const [isPositive, setIsPositive] = useState(initialPriceChange >= 0);

  // Real-time price updates - MUCH FASTER
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.3) * 0.05; // Bias towards positive (0.7 chance of increase)
      const newPrice = currentPrice * (1 + change);
      const newChange = ((newPrice - initialPrice) / initialPrice) * 100;
      
      setCurrentPrice(newPrice);
      setPriceChange(newChange);
      setIsPositive(newChange >= 0);
      
      // Update related metrics
      setMarketCap(newPrice * circulatingSupply);
      setVolume24h(volume24h * (0.95 + Math.random() * 0.1));
      setHolders(holders + Math.floor(Math.random() * 3));
      setTransactions24h(transactions24h + Math.floor(Math.random() * 5));
    }, 1000); // Update every 1 second

    return () => clearInterval(interval);
  }, [currentPrice, initialPrice, circulatingSupply, volume24h, holders, transactions24h]);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(num);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">ATHENA Token Stats</h3>
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-6 h-6 text-purple-500" />
          <span className="text-sm text-gray-600">Live Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Price */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-600">Giá hiện tại</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(currentPrice)}
          </div>
          <div className={`flex items-center space-x-1 text-sm ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <ArrowTrendingUpIcon className="w-4 h-4" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4" />
            )}
            <span>{Math.abs(priceChange).toFixed(2)}%</span>
          </div>
        </motion.div>

        {/* Market Cap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <TrophyIcon className="w-6 h-6 text-green-600" />
            <span className="text-sm text-gray-600">Vốn hóa thị trường</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(marketCap)}
          </div>
          <div className="text-sm text-gray-600">
            {formatNumber(circulatingSupply)} / {formatNumber(totalSupply)} tokens
          </div>
        </motion.div>

        {/* Volume 24h */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <FireIcon className="w-6 h-6 text-orange-600" />
            <span className="text-sm text-gray-600">Khối lượng 24h</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(volume24h)}
          </div>
          <div className="text-sm text-gray-600">
            {formatNumber(transactions24h)} giao dịch
          </div>
        </motion.div>

        {/* Holders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <UsersIcon className="w-6 h-6 text-purple-600" />
            <span className="text-sm text-gray-600">Người nắm giữ</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatNumber(holders)}
          </div>
          <div className="text-sm text-gray-600">
            {((holders / 1000000) * 100).toFixed(1)}% dân số VN
          </div>
        </motion.div>
      </div>

      {/* Price Chart Placeholder */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Biểu đồ giá 7 ngày</h4>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
              7D
            </button>
            <button className="px-3 py-1 text-gray-600 rounded-lg text-sm font-medium">
              30D
            </button>
            <button className="px-3 py-1 text-gray-600 rounded-lg text-sm font-medium">
              1Y
            </button>
          </div>
        </div>
        
        {/* Mock Chart */}
        <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <ArrowTrendingUpIcon className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-gray-600">Biểu đồ giá sẽ được tích hợp</p>
          </div>
        </div>
      </div>

      {/* Token Utility */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <GiftIcon className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Voucher Vault</span>
          </div>
          <p className="text-sm text-blue-700">
            Mua voucher độc quyền chỉ bằng ATHENA token
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrophyIcon className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Staking Rewards</span>
          </div>
          <p className="text-sm text-green-700">
            Stake token để nhận lãi suất cao
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <SparklesIcon className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Governance</span>
          </div>
          <p className="text-sm text-purple-700">
            Bỏ phiếu quyết định tương lai dự án
          </p>
        </div>
      </div>
    </div>
  );
}
