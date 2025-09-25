'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  CurrencyDollarIcon,
  GiftIcon,
  FireIcon,
  StarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface ServiceBonusCardProps {
  serviceType: 'flight' | 'banking' | 'resort' | 'insurance' | 'marketplace';
  baseAmount: number;
  userTier: {
    name: string;
    bonusMultiplier: number;
    color: string;
  };
  isAthenaPrime?: boolean;
  compact?: boolean;
}

const ServiceBonusCard: React.FC<ServiceBonusCardProps> = ({
  serviceType,
  baseAmount,
  userTier,
  isAthenaPrime = false,
  compact = false
}) => {
  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'flight': return '✈️';
      case 'banking': return '🏦';
      case 'resort': return '🏨';
      case 'insurance': return '🛡️';
      case 'marketplace': return '🛒';
      default: return '💎';
    }
  };

  const getServiceName = (type: string) => {
    switch (type) {
      case 'flight': return 'Flight Booking';
      case 'banking': return 'Banking Services';
      case 'resort': return 'Resort Booking';
      case 'insurance': return 'Insurance';
      case 'marketplace': return 'Marketplace';
      default: return 'Service';
    }
  };

  const calculateBonus = () => {
    const baseTokens = Math.floor(baseAmount / 10000); // 1 SOV = 10,000 VND
    const tierBonus = Math.floor(baseTokens * (userTier.bonusMultiplier - 1));
    const primeBonus = isAthenaPrime ? Math.floor(baseTokens * 0.5) : 0;
    const totalTokens = baseTokens + tierBonus + primeBonus;
    
    return {
      base: baseTokens,
      tierBonus,
      primeBonus,
      total: totalTokens
    };
  };

  const bonus = calculateBonus();

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'Diamond': return 'from-blue-400 to-purple-500';
      case 'Gold': return 'from-yellow-400 to-yellow-600';
      case 'Silver': return 'from-gray-300 to-gray-500';
      case 'Bronze': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-r ${getTierColor(userTier.name)} rounded-lg p-3 text-white shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getServiceIcon(serviceType)}</span>
            <div>
              <p className="text-sm font-medium">SOV Tokens</p>
              <p className="text-xs opacity-80">{getServiceName(serviceType)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{bonus.total}</p>
            <p className="text-xs opacity-80">tokens</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${getTierColor(userTier.name)} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getServiceIcon(serviceType)}</span>
            <div>
              <h3 className="text-lg font-bold">{getServiceName(serviceType)}</h3>
              <p className="text-sm opacity-80">Token Rewards</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{bonus.total}</div>
            <p className="text-sm opacity-80">SOV tokens</p>
          </div>
        </div>
      </div>

      {/* Bonus Breakdown */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Base Reward</span>
          </div>
          <span className="font-medium">{bonus.base} SOV</span>
        </div>

        {bonus.tierBonus > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StarIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">{userTier.name} Bonus</span>
            </div>
            <span className="font-medium text-green-600">+{bonus.tierBonus} SOV</span>
          </div>
        )}

        {bonus.primeBonus > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GiftIcon className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">ATHENA Prime</span>
            </div>
            <span className="font-medium text-purple-600">+{bonus.primeBonus} SOV</span>
          </div>
        )}

        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-gray-900">Total Earned</span>
            </div>
            <span className="text-lg font-bold text-blue-600">{bonus.total} SOV</span>
          </div>
        </div>
      </div>

      {/* Special Promotions */}
      {userTier.name === 'Diamond' && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-t">
          <div className="flex items-center space-x-2 mb-2">
            <FireIcon className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-gray-900">Diamond Exclusive</span>
          </div>
          <p className="text-xs text-gray-600">
            You're earning maximum rewards with your Diamond status!
          </p>
        </div>
      )}

      {isAthenaPrime && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-t">
          <div className="flex items-center space-x-2 mb-2">
            <BoltIcon className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-900">ATHENA Prime Active</span>
          </div>
          <p className="text-xs text-gray-600">
            Enjoying extra 50% bonus on all token earnings!
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ServiceBonusCard;
