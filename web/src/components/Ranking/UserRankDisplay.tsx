'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { UserRanking, rankingService } from '@/services/rankingService';
import RankBadge from './RankBadge';
import { useRankingTheme } from './ThemeProvider';
import { SessionStorageManager, SessionStorageKeys } from '@/utils/sessionStorage';
import toast from 'react-hot-toast';

interface UserRankDisplayProps {
  className?: string;
  compact?: boolean;
}

export default function UserRankDisplay({ className = '', compact = false }: UserRankDisplayProps) {
  const [ranking, setRanking] = useState<UserRanking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const { updateTheme, themeColors } = useRankingTheme();

  useEffect(() => {
    fetchUserRanking();
  }, []);

  const fetchUserRanking = async () => {
    try {
      const userRanking = await rankingService.getUserRanking();
      setRanking(userRanking);
      
      // Update global theme based on user rank
      if (userRanking) {
        updateTheme(userRanking);
        
        // Show rank notification with theme only once per session
        if (userRanking.rank?.name) {
          if (SessionStorageManager.shouldShow(SessionStorageKeys.WELCOME_NOTIFICATION_SHOWN)) {
            const rankEmoji = userRanking.rank.icon || 
              (userRanking.rank.name === 'Diamond' ? '💎' :
               userRanking.rank.name === 'Gold' ? '🥇' :
               userRanking.rank.name === 'Silver' ? '🥈' : '🥉');
            
            toast.success(
              `${rankEmoji} Welcome back, ${userRanking.rank.name} member!`,
              {
                style: {
                  background: themeColors.background,
                  border: `1px solid ${themeColors.border}`,
                  color: themeColors.text,
                },
                duration: 3000,
              }
            );
            
            SessionStorageManager.markAsShown(SessionStorageKeys.WELCOME_NOTIFICATION_SHOWN);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPoints = (points?: number) => {
    if (!points || points === 0) return '0';
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  };

  const formatCurrency = (amount?: number) => {
    if (!amount || amount === 0) return '0';
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  const calculateProgress = () => {
    if (!ranking || !ranking.nextRankPoints) return 100; // Max rank
    
    const progressPercentage = (ranking.totalPoints / ranking.nextRankPoints) * 100;
    return Math.min(Math.max(progressPercentage, 0), 100);
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 h-8 w-24 rounded"></div>
      </div>
    );
  }

  if (!ranking) {
    return null;
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <TrophyIcon className="w-4 h-4 text-gray-600" />
          <RankBadge rank={ranking.rank} size="sm" showLevel={false} animated={false} />
          <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 z-50 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4"
            >
              <div className="space-y-4">
                {/* Current Rank */}
                <div className="text-center">
                  <RankBadge rank={ranking.rank} size="lg" showBenefits={true} />
                  <p className="text-sm text-gray-600 mt-2">
                    Multiplier: {ranking.bonusMultiplier}x
                  </p>
                </div>

                {/* Progress Bar */}
                {ranking.nextRankPoints && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Points: {formatPoints(ranking.totalPoints)}</span>
                      <span className="text-gray-600">
                        Next: {formatPoints(ranking.nextRankPoints)}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateProgress()}%` }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-gray-900">{ranking.totalTransactions || 0}</p>
                    <p className="text-xs text-gray-600">Giao dịch</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(ranking.totalSpent)} VND
                    </p>
                    <p className="text-xs text-gray-600">Tổng chi</p>
                  </div>
                </div>

                {/* Achievements Preview */}
                {ranking.achievements && ranking.achievements.length > 0 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-800">Thành tựu</span>
                      <span className="text-lg">🏆</span>
                    </div>
                    <p className="text-yellow-700 text-sm">
                      {ranking.achievements.length} thành tựu đã đạt được
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full display version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrophyIcon className="w-5 h-5 mr-2" />
          Your Rank
        </h3>
        <RankBadge rank={ranking.rank} size="md" />
      </div>

      {/* Progress */}
      <div className="space-y-4">
        {ranking.nextRankPoints && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress to next rank</span>
              <span className="text-gray-600">
                {formatPoints(ranking.totalPoints)} / {formatPoints(ranking.nextRankPoints)} points
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress()}%` }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                transition={{ duration: 1 }}
              />
            </div>
            
            {ranking.nextRankPoints > ranking.totalPoints && (
              <p className="text-xs text-gray-500 mt-1">
                Còn {formatPoints(ranking.nextRankPoints - ranking.totalPoints)} điểm để thăng hạng
              </p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatPoints(ranking.totalPoints)}</p>
            <p className="text-xs text-gray-600">Điểm</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{ranking.totalTransactions || 0}</p>
            <p className="text-xs text-gray-600">Giao dịch</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {ranking.bonusMultiplier || 1}x
            </p>
            <p className="text-xs text-gray-600">Bonus</p>
          </div>
        </div>

        {/* Benefits */}
        {ranking.rank?.benefits && ranking.rank.benefits.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quyền lợi</h4>
            <div className="space-y-1">
              {ranking.rank.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Usage */}
        {ranking.servicesUsed && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sử dụng dịch vụ</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded">
                <p className="text-lg font-bold text-blue-600">{ranking.servicesUsed.vietjet || 0}</p>
                <p className="text-xs text-blue-700">Vietjet</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <p className="text-lg font-bold text-green-600">{ranking.servicesUsed.hdbank || 0}</p>
                <p className="text-xs text-green-700">HDBank</p>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <p className="text-lg font-bold text-purple-600">{ranking.servicesUsed.sovico || 0}</p>
                <p className="text-xs text-purple-700">Sovico</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}