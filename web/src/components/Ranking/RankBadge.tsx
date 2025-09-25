'use client';

import { motion } from 'framer-motion';
import { UserRank } from '@/services/rankingService';

interface RankBadgeProps {
  rank: UserRank;
  size?: 'sm' | 'md' | 'lg' | 'large';
  showLevel?: boolean;
  showBenefits?: boolean;
  showProgress?: boolean;
  currentPoints?: number;
  nextRankPoints?: number;
  animated?: boolean;
  className?: string;
}

export default function RankBadge({ 
  rank, 
  size = 'md', 
  showLevel = true, 
  showBenefits = false,
  showProgress = false,
  currentPoints = 0,
  nextRankPoints,
  animated = true,
  className = '' 
}: RankBadgeProps) {
  // Return early if rank is not provided
  if (!rank) {
    return (
      <div className={`inline-flex items-center px-3 py-2 bg-gray-200 text-gray-800 rounded-full ${className}`}>
        <span className="text-sm">No Rank</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const getRankEmoji = (rankName?: string) => {
    if (!rankName) return '🏆';
    const emojiMap: Record<string, string> = {
      'Bronze': '🥉',
      'Silver': '🥈',
      'Gold': '🥇', 
      'Diamond': '💎'
    };
    return emojiMap[rankName] || '🏅';
  };

  const getBadgeStyle = (rankName?: string) => {
    if (!rankName) return 'bg-gray-200 text-gray-800 border-gray-300';
    const styleMap: Record<string, string> = {
      'Bronze': 'bg-gradient-to-r from-amber-700 to-amber-600 text-white border-amber-500',
      'Silver': 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-400',
      'Gold': 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black border-yellow-400',
      'Diamond': 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-cyan-400'
    };
    return styleMap[rankName] || 'bg-gray-200 text-gray-800 border-gray-300';
  };

  const content = (
    <div className={`
      inline-flex items-center space-x-2 rounded-full border-2 font-semibold shadow-lg
      ${sizeClasses[size]} ${getBadgeStyle(rank?.name)} ${className}
    `}>
      <span className={iconSizes[size]}>{getRankEmoji(rank?.name)}</span>
      <span>{rank?.name || 'Unknown'}</span>
      {showLevel && rank?.level && (
        <span className="bg-black/20 rounded-full px-2 py-0.5 text-xs">
          L{rank.level}
        </span>
      )}
    </div>
  );

  if (!animated) {
    return (
      <div className="relative group">
        {content}
        {showBenefits && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            <div className="font-semibold mb-1">Rank Benefits:</div>
            <ul className="text-left">
              {rank.benefits.slice(0, 3).map((benefit, index) => (
                <li key={index}>• {benefit}</li>
              ))}
              {rank.benefits.length > 3 && (
                <li>• +{rank.benefits.length - 3} more...</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative group"
    >
      {content}
      
      {/* Progress Bar */}
      {showProgress && nextRankPoints && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 w-full"
        >
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Tiến độ thăng hạng</span>
            <span>{currentPoints.toLocaleString()} / {nextRankPoints.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((currentPoints / nextRankPoints) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            className={`h-2 rounded-full ${
              rank?.name === 'Diamond' ? 'bg-gradient-to-r from-blue-400 to-purple-600' :
              rank?.name === 'Gold' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
              rank?.name === 'Silver' ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
              'bg-gradient-to-r from-orange-400 to-red-500'
            }`}
            />
          </div>
          {nextRankPoints > currentPoints && (
            <div className="text-xs text-gray-500 mt-1">
              Còn {(nextRankPoints - currentPoints).toLocaleString()} điểm để thăng hạng
            </div>
          )}
        </motion.div>
      )}
      
      {showBenefits && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg whitespace-nowrap z-10 pointer-events-none"
        >
          <div className="font-semibold mb-1">Rank Benefits:</div>
          <ul className="text-left">
            {rank.benefits.slice(0, 3).map((benefit, index) => (
              <li key={index}>• {benefit}</li>
            ))}
            {rank.benefits.length > 3 && (
              <li>• +{rank.benefits.length - 3} more...</li>
            )}
          </ul>
          
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
        </motion.div>
      )}
    </motion.div>
  );
}
