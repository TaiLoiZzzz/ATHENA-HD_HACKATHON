'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WalletIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  GiftIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/lib/api';
import { sovTokenService, SOVWallet, MembershipTier } from '@/services/sovTokenService';
import toast from 'react-hot-toast';

interface EnhancedSOVWalletProps {
  onPayment?: (amount: number) => void;
  requiredAmount?: number;
  showFullInterface?: boolean;
}

const EnhancedSOVWallet: React.FC<EnhancedSOVWalletProps> = ({ 
  onPayment, 
  requiredAmount = 0,
  showFullInterface = true 
}) => {
  const [wallet, setWallet] = useState<SOVWallet | null>(null);
  const [walletStats, setWalletStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [stakingAmount, setStakingAmount] = useState('');
  const [stakingDuration, setStakingDuration] = useState(30);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [walletData, stats] = await Promise.all([
        apiService.getSOVWallet(),
        apiService.getSOVWalletStats()
      ]);
      
      setWallet(walletData);
      setWalletStats(stats);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!stakingAmount || parseFloat(stakingAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const amount = parseFloat(stakingAmount);
      await apiService.stakeSOVTokens(amount, stakingDuration);
      toast.success(`Staked ${amount} SOV tokens for ${stakingDuration} days`);
      setShowStakingModal(false);
      setStakingAmount('');
      loadWalletData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to stake tokens');
    }
  };

  const handleUnstake = async () => {
    if (!wallet || wallet.lockedBalance <= 0) {
      toast.error('No staked tokens to unstake');
      return;
    }

    try {
      await apiService.unstakeSOVTokens(wallet.lockedBalance);
      toast.success(`Unstaked ${wallet.lockedBalance} SOV tokens`);
      loadWalletData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unstake tokens');
    }
  };

  const handlePayment = () => {
    if (onPayment && wallet) {
      onPayment(wallet.balance);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!wallet || !walletStats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-500">Failed to load wallet data</p>
      </div>
    );
  }

  const membershipTier = walletStats.membershipTier;
  const canPay = wallet.balance >= requiredAmount;

  return (
    <div className="space-y-6">
      {/* Main Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <WalletIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">SOV Wallet</h3>
              <p className="text-white/80 text-sm">ATHENA Token Balance</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{wallet.balance.toLocaleString()}</span>
              <span className="text-lg font-medium">SOV</span>
            </div>
            <p className="text-white/80 text-sm">Available Balance</p>
          </div>
        </div>

        {/* Membership Tier Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{membershipTier.icon}</span>
            <div>
              <p className="font-semibold">{membershipTier.name} Member</p>
              <p className="text-white/80 text-sm">{membershipTier.bonusMultiplier}x earning bonus</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Total Value</p>
            <p className="text-lg font-semibold">{(wallet.balance + wallet.lockedBalance).toLocaleString()} SOV</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-300" />
              <span className="text-sm text-white/80">Total Earned</span>
            </div>
            <p className="text-lg font-semibold">{wallet.totalEarned.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-300" />
              <span className="text-sm text-white/80">Total Spent</span>
            </div>
            <p className="text-lg font-semibold">{wallet.totalSpent.toLocaleString()}</p>
          </div>
        </div>

        {/* Staking Info */}
        {wallet.lockedBalance > 0 && (
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <LockClosedIcon className="h-4 w-4 text-yellow-300" />
                <span className="text-sm text-white/80">Staked Amount</span>
              </div>
              <span className="font-semibold">{wallet.lockedBalance.toLocaleString()} SOV</span>
            </div>
            {wallet.stakingRewards > 0 && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-white/80">Staking Rewards</span>
                <span className="font-semibold text-green-300">+{wallet.stakingRewards.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Payment Button */}
        {requiredAmount > 0 && (
          <div className="mt-4">
            {canPay ? (
              <button
                onClick={handlePayment}
                className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
              >
                Pay {requiredAmount.toLocaleString()} SOV
              </button>
            ) : (
              <div className="w-full bg-red-500/20 text-red-200 py-3 px-4 rounded-lg text-center">
                Insufficient Balance (Need {requiredAmount.toLocaleString()} SOV)
              </div>
            )}
          </div>
        )}
      </motion.div>

      {showFullInterface && (
        <>
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowStakingModal(true)}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Stake</span>
            </button>
            <button
              onClick={handleUnstake}
              disabled={wallet.lockedBalance <= 0}
              className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              <MinusIcon className="h-5 w-5" />
              <span>Unstake</span>
            </button>
          </div>

          {/* Membership Benefits */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <StarIcon className="h-5 w-5 text-yellow-500" />
              <span>{membershipTier.name} Benefits</span>
            </h4>
            <div className="space-y-2">
              {membershipTier.benefits.map((benefit: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-600">Staking Bonus</p>
                <p className="font-semibold text-green-600">+{(membershipTier.stakingBonus * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-600">Fee Discount</p>
                <p className="font-semibold text-blue-600">-{(membershipTier.transactionFeeDiscount * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Staking Modal */}
      <AnimatePresence>
        {showStakingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowStakingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Stake SOV Tokens</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Stake</label>
                  <input
                    type="number"
                    value={stakingAmount}
                    onChange={(e) => setStakingAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter amount"
                    max={wallet.balance}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Available: {wallet.balance.toLocaleString()} SOV
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                  <select
                    value={stakingDuration}
                    onChange={(e) => setStakingDuration(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={180}>180 days</option>
                    <option value={365}>365 days</option>
                  </select>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Expected Rewards:</strong> {stakingAmount ? (parseFloat(stakingAmount) * 0.12 / 365 * stakingDuration).toFixed(2) : '0'} SOV
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Based on 12% APY</p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowStakingModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStake}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Stake Tokens
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSOVWallet;

