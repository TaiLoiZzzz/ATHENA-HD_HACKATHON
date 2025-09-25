'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface TierBadgeProps {
  tier: {
    name: string;
    level: number;
    color: string;
    bonusMultiplier: number;
  };
  points: number;
  compact?: boolean;
  showBonus?: boolean;
}

const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  points,
  compact = false,
  showBonus = true
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

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r ${getTierGradient(tier.name)} text-white rounded-full text-sm font-medium shadow-lg`}
      >
        <span className="text-lg">{getTierIcon(tier.name)}</span>
        <span>{tier.name}</span>
        {showBonus && (
          <span className="text-xs opacity-80">({tier.bonusMultiplier}x)</span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${getTierGradient(tier.name)} rounded-xl p-4 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTierIcon(tier.name)}</span>
          <div>
            <h3 className="text-lg font-bold">{tier.name} Member</h3>
            <p className="text-sm opacity-80">Level {tier.level} • {points.toLocaleString()} points</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5" />
            <span className="text-xl font-bold">{tier.bonusMultiplier}x</span>
          </div>
          <p className="text-xs opacity-80">Earning Bonus</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TierBadge;
