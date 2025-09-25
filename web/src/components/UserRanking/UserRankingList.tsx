'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrophyIcon, 
  StarIcon, 
  UserIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { mockUsers } from '@/lib/mockData';
import { sovTokenService, MembershipTier } from '@/services/sovTokenService';

interface UserWithRanking {
  id: string;
  email: string;
  fullName: string;
  balance: number | undefined;
  tier: MembershipTier;
  totalPoints: number;
  rank: number;
}

const UserRankingList: React.FC = () => {
  const [users, setUsers] = useState<UserWithRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>('all');

  useEffect(() => {
    loadUsersWithRanking();
  }, []);

  const loadUsersWithRanking = () => {
    const usersWithRanking = mockUsers.map((user, index) => {
      // Calculate points based on balance and activity
      const basePoints = Math.floor((user.balance || 0) / 100);
      const activityBonus = user.athenaPrime ? 2000 : 1000;
      const totalPoints = basePoints + activityBonus;

      // Determine tier based on points
      let tier: MembershipTier;
      if (totalPoints >= 10000) {
        tier = {
          name: 'Diamond',
          level: 4,
          icon: '💎',
          color: '#8B5CF6',
          bonusMultiplier: 2.0,
          benefits: ['Exclusive events', 'Priority support', '2x earning bonus', '15% staking bonus'],
          minPoints: 10000,
          maxPoints: 99999,
          stakingBonus: 0.15,
          transactionFeeDiscount: 0.5
        };
      } else if (totalPoints >= 5000) {
        tier = {
          name: 'Gold',
          level: 3,
          icon: '🥇',
          color: '#F59E0B',
          bonusMultiplier: 1.5,
          benefits: ['Priority booking', 'Gold support', '1.5x earning bonus', '12% staking bonus'],
          minPoints: 5000,
          maxPoints: 9999,
          stakingBonus: 0.12,
          transactionFeeDiscount: 0.3
        };
      } else if (totalPoints >= 1000) {
        tier = {
          name: 'Silver',
          level: 2,
          icon: '🥈',
          color: '#6B7280',
          bonusMultiplier: 1.2,
          benefits: ['Silver support', '1.2x earning bonus', '10% staking bonus'],
          minPoints: 1000,
          maxPoints: 4999,
          stakingBonus: 0.10,
          transactionFeeDiscount: 0.2
        };
      } else {
        tier = {
          name: 'Bronze',
          level: 1,
          icon: '🥉',
          color: '#F97316',
          bonusMultiplier: 1.0,
          benefits: ['Basic support', 'Welcome bonus'],
          minPoints: 0,
          maxPoints: 999,
          stakingBonus: 0.08,
          transactionFeeDiscount: 0.1
        };
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        balance: user.balance,
        tier,
        totalPoints,
        rank: index + 1
      };
    });

    // Sort by total points descending
    usersWithRanking.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Update ranks
    usersWithRanking.forEach((user, index) => {
      user.rank = index + 1;
    });

    setUsers(usersWithRanking);
    setLoading(false);
  };

  const filteredUsers = selectedTier === 'all' 
    ? users 
    : users.filter(user => user.tier.name.toLowerCase() === selectedTier.toLowerCase());

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Diamond': return TrophyIcon;
      case 'Gold': return TrophyIcon;
      case 'Silver': return StarIcon;
      case 'Bronze': return ShieldCheckIcon;
      default: return UserIcon;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'Diamond': return 'from-purple-600 to-purple-800';
      case 'Gold': return 'from-yellow-500 to-yellow-700';
      case 'Silver': return 'from-gray-400 to-gray-600';
      case 'Bronze': return 'from-orange-500 to-orange-700';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTier('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTier === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Users ({users.length})
        </button>
        <button
          onClick={() => setSelectedTier('diamond')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTier === 'diamond' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          💎 Diamond ({users.filter(u => u.tier.name === 'Diamond').length})
        </button>
        <button
          onClick={() => setSelectedTier('gold')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTier === 'gold' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🥇 Gold ({users.filter(u => u.tier.name === 'Gold').length})
        </button>
        <button
          onClick={() => setSelectedTier('silver')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTier === 'silver' 
              ? 'bg-gray-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🥈 Silver ({users.filter(u => u.tier.name === 'Silver').length})
        </button>
        <button
          onClick={() => setSelectedTier('bronze')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedTier === 'bronze' 
              ? 'bg-orange-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🥉 Bronze ({users.filter(u => u.tier.name === 'Bronze').length})
        </button>
      </div>

      {/* User List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredUsers.map((user, index) => {
            const TierIcon = getTierIcon(user.tier.name);
            const tierColor = getTierColor(user.tier.name);
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      {user.rank <= 3 ? (
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${tierColor} flex items-center justify-center text-white font-bold text-lg`}>
                          {user.rank === 1 ? '👑' : user.rank === 2 ? '🥈' : '🥉'}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg">
                          {user.rank}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${tierColor} text-white`}>
                          <TierIcon className="h-4 w-4" />
                          <span>{user.tier.name}</span>
                        </div>
                        {user.rank <= 3 && (
                          <div className="flex items-center space-x-1 text-yellow-600">
                            <SparklesIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">Top {user.rank}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CurrencyDollarIcon className="h-4 w-4" />
                          <span>{(user.balance || 0).toLocaleString()} SOV</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ChartBarIcon className="h-4 w-4" />
                          <span>{user.totalPoints.toLocaleString()} points</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tier Benefits */}
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Benefits</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">
                        {user.tier.bonusMultiplier}x
                      </span>
                      <span className="text-sm text-gray-600">earning</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      +{(user.tier.stakingBonus * 100).toFixed(0)}% staking
                    </div>
                  </div>
                </div>

                {/* Tier Benefits List */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {user.tier.benefits.map((benefit, benefitIndex) => (
                      <span
                        key={benefitIndex}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.tier.name === 'Diamond').length}
            </div>
            <div className="text-sm text-gray-600">Diamond Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.tier.name === 'Gold').length}
            </div>
            <div className="text-sm text-gray-600">Gold Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {users.filter(u => u.tier.name === 'Silver').length}
            </div>
            <div className="text-sm text-gray-600">Silver Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {users.filter(u => u.tier.name === 'Bronze').length}
            </div>
            <div className="text-sm text-gray-600">Bronze Members</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRankingList;

