'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  StarIcon,
  GiftIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface UserTier {
  name: string;
  level: number;
  icon: string;
  color: string;
  bonusMultiplier: number;
  benefits: string[];
  minPoints: number;
  maxPoints?: number;
  stakingBonus: number;
  transactionFeeDiscount: number;
}

interface BonusHighlightsProps {
  userTier: UserTier;
  totalPoints: number;
  nextTierPoints?: number;
}

const BonusHighlights: React.FC<BonusHighlightsProps> = ({ 
  userTier, 
  totalPoints, 
  nextTierPoints 
}) => {
  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Diamond': return '💎';
      case 'Gold': return '🥇';
      case 'Silver': return '🥈';
      case 'Bronze': return '🥉';
      default: return '⭐';
    }
  };

  const getTierGradient = (tierName: string) => {
    switch (tierName) {
      case 'Diamond': return 'from-blue-400 via-purple-500 to-pink-500';
      case 'Gold': return 'from-yellow-400 via-yellow-500 to-yellow-600';
      case 'Silver': return 'from-gray-300 via-gray-400 to-gray-500';
      case 'Bronze': return 'from-orange-400 via-orange-500 to-orange-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getTierBenefits = (tier: UserTier) => {
    const benefits = [
      {
        icon: CurrencyDollarIcon,
        title: 'Token Earning Bonus',
        description: `${Math.round((tier.bonusMultiplier - 1) * 100)}% bonus on all token earnings`,
        value: `${tier.bonusMultiplier}x`,
        color: 'text-green-600'
      },
      {
        icon: ShieldCheckIcon,
        title: 'Transaction Fee Discount',
        description: `${Math.round(tier.transactionFeeDiscount * 100)}% discount on transaction fees`,
        value: `-${Math.round(tier.transactionFeeDiscount * 100)}%`,
        color: 'text-blue-600'
      },
      {
        icon: SparklesIcon,
        title: 'Staking Bonus',
        description: `Earn ${Math.round(tier.stakingBonus * 100)}% extra from staking rewards`,
        value: `+${Math.round(tier.stakingBonus * 100)}%`,
        color: 'text-purple-600'
      }
    ];

    // Add tier-specific benefits
    if (tier.name === 'Diamond') {
      benefits.push({
        icon: UserGroupIcon,
        title: 'Concierge Service',
        description: 'Personal concierge for all your needs',
        value: 'VIP',
        color: 'text-pink-600'
      });
    }

    if (tier.name === 'Gold' || tier.name === 'Diamond') {
      benefits.push({
        icon: ClockIcon,
        title: 'Priority Processing',
        description: 'Faster transaction processing',
        value: 'Fast',
        color: 'text-orange-600'
      });
    }

    return benefits;
  };

  const benefits = getTierBenefits(userTier);
  const progressPercentage = nextTierPoints 
    ? Math.min((totalPoints / nextTierPoints) * 100, 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Tier Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${getTierGradient(userTier.name)} rounded-2xl p-6 text-white shadow-xl`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{getTierIcon(userTier.name)}</div>
            <div>
              <h2 className="text-2xl font-bold">{userTier.name} Member</h2>
              <p className="text-white/80">Level {userTier.level} • {totalPoints.toLocaleString()} points</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{userTier.bonusMultiplier}x</div>
            <p className="text-white/80">Earning Bonus</p>
          </div>
        </div>

        {/* Progress to next tier */}
        {nextTierPoints && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Progress to next tier</span>
              <span>{totalPoints.toLocaleString()} / {nextTierPoints.toLocaleString()} points</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-white rounded-full h-2"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Active Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg bg-gray-50`}>
                <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                  <span className={`text-lg font-bold ${benefit.color}`}>
                    {benefit.value}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tier Benefits List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <GiftIcon className="w-5 h-5 text-purple-600 mr-2" />
          {userTier.name} Member Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {userTier.benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Special Promotions */}
      {userTier.name === 'Diamond' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center space-x-3 mb-4">
            <TrophyIcon className="w-6 h-6" />
            <h3 className="text-xl font-bold">Diamond Exclusive</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FireIcon className="w-5 h-5 text-orange-300" />
                <span className="font-semibold">Hot Deals</span>
              </div>
              <p className="text-sm text-white/80">Exclusive access to limited-time offers</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BoltIcon className="w-5 h-5 text-yellow-300" />
                <span className="font-semibold">Lightning Fast</span>
              </div>
              <p className="text-sm text-white/80">Priority processing for all transactions</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Next Tier Preview */}
      {nextTierPoints && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <StarIcon className="w-5 h-5 text-yellow-500 mr-2" />
            Unlock Next Tier
          </h3>
          <p className="text-gray-600 mb-4">
            Earn {(nextTierPoints - totalPoints).toLocaleString()} more points to unlock the next tier and get even better benefits!
          </p>
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Current Progress</span>
              <span>{totalPoints.toLocaleString()} / {nextTierPoints.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BonusHighlights;
