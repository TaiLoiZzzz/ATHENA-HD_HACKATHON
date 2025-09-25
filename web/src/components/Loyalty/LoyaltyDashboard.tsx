'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  StarIcon,
  GiftIcon,
  FireIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  SparklesIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface LoyaltyTier {
  name: string;
  level: string;
  points: number;
  multiplier: number;
  benefits: string[];
  pointsNeeded?: number;
}

interface LoyaltyStatus {
  currentTier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  stats: {
    totalUnifiedPayments: number;
    totalUnifiedAmount: number;
    totalCrossRewards: number;
    servicesUsed: string[];
    servicesUsedThisMonth: number;
    firstServiceDate: string;
    lastActivityDate: string;
  };
  availableBonuses: Array<{
    type: string;
    description: string;
    bonus: number;
    multiplier: number;
    eligible: boolean;
  }>;
  recentActivity: Array<{
    service: string;
    transactionCount: number;
    lastTransaction: string;
  }>;
}

interface LoyaltyDashboardProps {
  className?: string;
}

export default function LoyaltyDashboard({ className = '' }: LoyaltyDashboardProps) {
  const { user, hasAthenaPrime } = useAuth();
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingBonus, setClaimingBonus] = useState<string | null>(null);

  useEffect(() => {
    fetchLoyaltyStatus();
  }, []);

  const fetchLoyaltyStatus = async () => {
    try {
      const response = await api.getLoyaltyStatus();
      setLoyaltyStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch loyalty status:', error);
      toast.error('Failed to load loyalty information');
    } finally {
      setLoading(false);
    }
  };

  const claimBonus = async (bonusType: string) => {
    try {
      setClaimingBonus(bonusType);
      const response = await api.post('/loyalty/claim-bonus', { bonusType });
      
      toast.success(
        `Bonus claimed! +${response.data.reward.amount} SOV tokens`,
        { duration: 5000 }
      );

      if (response.data.tierUpgrade) {
        toast.success(
          `🎉 Tier upgraded to ${response.data.tierUpgrade.to.toUpperCase()}!`,
          { duration: 8000 }
        );
      }

      // Refresh status
      await fetchLoyaltyStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to claim bonus');
    } finally {
      setClaimingBonus(null);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'silver': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'platinum': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return TrophyIcon;
      case 'silver': return StarIcon;
      case 'gold': return FireIcon;
      case 'platinum': return SparklesIcon;
      default: return TrophyIcon;
    }
  };

  const getServiceName = (service: string) => {
    switch (service) {
      case 'hdbank': return 'HDBank';
      case 'vietjet': return 'Vietjet';
      case 'marketplace': return 'Marketplace';
      case 'sovico': return 'Sovico';
      default: return service;
    }
  };

  if (loading) {
    return (
      <div className={clsx('animate-pulse space-y-6', className)}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (!loyaltyStatus) {
    return (
      <div className={clsx('text-center py-8', className)}>
        <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Unable to load loyalty information</p>
      </div>
    );
  }

  const { currentTier, nextTier, stats, availableBonuses, recentActivity } = loyaltyStatus;
  const TierIcon = getTierIcon(currentTier.level);
  const progressPercentage = nextTier && nextTier.pointsNeeded
    ? Math.min(100, (currentTier.points / (currentTier.points + nextTier.pointsNeeded)) * 100)
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('space-y-6', className)}
    >
      {/* Current Tier Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className={clsx('p-6 border-l-4', getTierColor(currentTier.level))}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={clsx('w-12 h-12 rounded-lg flex items-center justify-center', getTierColor(currentTier.level))}>
                <TierIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{currentTier.name} Member</h3>
                <p className="text-sm text-gray-600">
                  {currentTier.multiplier}x rewards multiplier
                </p>
              </div>
            </div>
            {hasAthenaPrime() && (
              <div className="flex items-center space-x-1 bg-token-100 text-token-800 px-3 py-1 rounded-full text-sm font-medium">
                <SparklesIcon className="w-4 h-4" />
                <span>Prime</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{currentTier.points.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Loyalty Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">{stats.servicesUsed.length}</p>
              <p className="text-sm text-gray-500">Services Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-token-600">{stats.totalCrossRewards.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Bonus SOV Earned</p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress to {nextTier.name}</span>
                <span className="font-medium">{nextTier.pointsNeeded?.toLocaleString()} points needed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Current Tier Benefits */}
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Your Benefits</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentTier.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Available Bonuses */}
      {availableBonuses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <GiftIcon className="w-6 h-6 text-token-600" />
            <h3 className="text-lg font-semibold text-gray-900">Available Bonuses</h3>
          </div>
          
          <div className="grid gap-4">
            {availableBonuses.map((bonus) => (
              <motion.div
                key={bonus.type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-token-200 rounded-lg p-4 bg-token-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{bonus.description}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>+{bonus.bonus} SOV</span>
                      <span>{bonus.multiplier}x multiplier</span>
                    </div>
                  </div>
                  <button
                    onClick={() => claimBonus(bonus.type)}
                    disabled={!bonus.eligible || claimingBonus === bonus.type}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {claimingBonus === bonus.type ? 'Claiming...' : 'Claim Bonus'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ChartBarIcon className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>

        <div className="grid gap-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{getServiceName(activity.service)}</p>
                  <p className="text-sm text-gray-600">
                    {activity.transactionCount} transaction{activity.transactionCount !== 1 ? 's' : ''} this month
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Last: {new Date(activity.lastTransaction).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400">Start using Sovico services to earn rewards!</p>
            </div>
          )}
        </div>
      </div>

      {/* Cross-Service Incentives */}
      <div className="bg-gradient-to-r from-token-500 to-primary-600 rounded-xl text-white p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FireIcon className="w-8 h-8" />
          <h3 className="text-xl font-bold">Maximize Your Rewards</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">This Month's Goals</h4>
            <ul className="space-y-1 text-sm opacity-90">
              <li className="flex items-center space-x-2">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  stats.servicesUsedThisMonth >= 2 ? 'bg-green-300' : 'bg-white/50'
                )}></div>
                <span>Use 2+ services (+50 SOV bonus)</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  stats.servicesUsedThisMonth >= 3 ? 'bg-green-300' : 'bg-white/50'
                )}></div>
                <span>Use all 3 services (+150 SOV bonus)</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  hasAthenaPrime() ? 'bg-green-300' : 'bg-white/50'
                )}></div>
                <span>ATHENA Prime member (+200 SOV bonus)</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Quick Tips</h4>
            <ul className="space-y-1 text-sm opacity-90">
              <li>• Use unified payments for 15% bonus</li>
              <li>• Higher tiers = better multipliers</li>
              <li>• Cross-service usage = extra rewards</li>
              <li>• Prime membership = 1.5x everything</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
