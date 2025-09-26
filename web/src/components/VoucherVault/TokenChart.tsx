'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface TokenChartProps {
  initialPrice: number;
  priceChange: number;
}

interface PricePoint {
  time: string;
  price: number;
  change: number;
}

export default function TokenChart({ initialPrice, priceChange }: TokenChartProps) {
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [isPositive, setIsPositive] = useState(priceChange >= 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize price data
  useEffect(() => {
    const now = new Date();
    const initialData: PricePoint[] = [];
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const basePrice = initialPrice * (0.95 + Math.random() * 0.1);
      const change = (Math.random() - 0.5) * 0.1;
      
      initialData.push({
        time: time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        price: basePrice,
        change: change
      });
    }
    
    setPriceData(initialData);
  }, [initialPrice]);

  // Real-time price updates - CỰC NHANH VÀ TĂNG GIÁ
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.2) * 0.08; // Bias towards positive (0.8 chance of increase)
      const newPrice = currentPrice * (1 + change);
      const priceChange = (newPrice - currentPrice) / currentPrice;
      
      setCurrentPrice(newPrice);
      setIsPositive(priceChange >= 0);
      setIsAnimating(true);
      
      // Add new data point
      const now = new Date();
      const newDataPoint: PricePoint = {
        time: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        price: newPrice,
        change: priceChange
      };
      
      setPriceData(prev => [...prev.slice(-23), newDataPoint]);
      
      // Reset animation
      setTimeout(() => setIsAnimating(false), 1000);
    }, 800 + Math.random() * 1200); // Random between 0.8-2 seconds - CỰC NHANH

    return () => clearInterval(interval);
  }, [currentPrice]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getPriceChange = () => {
    if (priceData.length < 2) return 0;
    const latest = priceData[priceData.length - 1];
    const previous = priceData[priceData.length - 2];
    return ((latest.price - previous.price) / previous.price) * 100;
  };

  const getMinMaxPrice = () => {
    if (priceData.length === 0) return { min: 0, max: 0 };
    const prices = priceData.map(d => d.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  const { min, max } = getMinMaxPrice();
  const range = max - min;
  const padding = range * 0.1;

  const getPathData = () => {
    if (priceData.length === 0) return '';
    
    const width = 300;
    const height = 150;
    
    return priceData.map((point, index) => {
      const x = (index / (priceData.length - 1)) * width;
      const y = height - ((point.price - (min - padding)) / (range + padding * 2)) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getGradientId = () => 'gradient-' + Math.random().toString(36).substr(2, 9);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">ATHENA Token Chart</h3>
        <div className="flex items-center space-x-2">
          <FireIcon className="w-6 h-6 text-orange-500" />
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      {/* Current Price */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
            <span className="text-lg font-semibold text-gray-900">Giá hiện tại</span>
          </div>
          <div className={`flex items-center space-x-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <ArrowTrendingUpIcon className="w-5 h-5" />
            ) : (
              <ArrowTrendingDownIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(getPriceChange()).toFixed(2)}%
            </span>
          </div>
        </div>
        
        <motion.div
          key={currentPrice}
          initial={{ scale: 1 }}
          animate={{ scale: isAnimating ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold text-gray-900"
        >
          {formatPrice(currentPrice)}
        </motion.div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          ref={svgRef}
          width="100%"
          height="200"
          viewBox="0 0 300 150"
          className="w-full h-48"
        >
          <defs>
            <linearGradient id={getGradientId()} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <line
              key={index}
              x1="0"
              y1={ratio * 150}
              x2="300"
              y2={ratio * 150}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Price line */}
          <motion.path
            d={getPathData()}
            fill="none"
            stroke={isPositive ? "#10B981" : "#EF4444"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          
          {/* Area under curve */}
          <motion.path
            d={`${getPathData()} L 300 150 L 0 150 Z`}
            fill={`url(#${getGradientId()})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          
          {/* Data points */}
          {priceData.map((point, index) => {
            const x = (index / (priceData.length - 1)) * 300;
            const y = 150 - ((point.price - (min - padding)) / (range + padding * 2)) * 150;
            
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={isPositive ? "#10B981" : "#EF4444"}
                initial={{ scale: 0 }}
                animate={{ scale: index === priceData.length - 1 ? 1.5 : 1 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </svg>
        
        {/* Price labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{formatPrice(min)}</span>
          <span>{formatPrice(max)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(min)}
          </div>
          <div className="text-sm text-gray-600">Thấp nhất</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(max)}
          </div>
          <div className="text-sm text-gray-600">Cao nhất</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{getPriceChange().toFixed(2)}%
          </div>
          <div className="text-sm text-gray-600">Thay đổi</div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="mt-4 flex items-center justify-center space-x-2">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-2 h-2 bg-green-500 rounded-full"
        />
        <span className="text-sm text-gray-600">Đang cập nhật real-time</span>
      </div>
    </div>
  );
}
