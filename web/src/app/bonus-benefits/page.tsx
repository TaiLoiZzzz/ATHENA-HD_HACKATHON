'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import BonusHighlights from '@/components/UserTier/BonusHighlights';
import ServiceBonusCard from '@/components/UserTier/ServiceBonusCard';
import InlineBonusDisplay from '@/components/UserTier/InlineBonusDisplay';
import { sovTokenService } from '@/services/sovTokenService';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  TrophyIcon,
  GiftIcon,
  StarIcon,
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

export default function BonusBenefits() {
  const [userTier, setUserTier] = useState<UserTier | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isAthenaPrime, setIsAthenaPrime] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const wallet = sovTokenService.getWallet();
      const stats = sovTokenService.getWalletStats();
      
      setUserTier(stats.membershipTier);
      setTotalPoints(wallet.totalEarned);
      setIsAthenaPrime(true); // Mock data - in real app this would come from user profile
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setLoading(false);
    }
  };

  const getNextTierPoints = () => {
    if (!userTier) return null;
    
    switch (userTier.name) {
      case 'Bronze': return 1000;
      case 'Silver': return 5000;
      case 'Gold': return 10000;
      case 'Diamond': return null; // Already at highest tier
      default: return null;
    }
  };

  const mockServices = [
    {
      type: 'flight' as const,
      amount: 1500000,
      name: 'VietJet Air Flight'
    },
    {
      type: 'banking' as const,
      amount: 500000,
      name: 'HDBank Premium Account'
    },
    {
      type: 'resort' as const,
      amount: 2500000,
      name: 'Sovico Resort Booking'
    },
    {
      type: 'insurance' as const,
      amount: 2000000,
      name: 'Travel Insurance'
    },
    {
      type: 'marketplace' as const,
      amount: 800000,
      name: 'Electronics Purchase'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!userTier) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to load user data</h1>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4">Your Bonus Benefits</h1>
              <p className="text-xl text-blue-100">
                Discover all the amazing benefits and bonuses you get as a {userTier.name} member
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Bonus Display */}
          <InlineBonusDisplay
            serviceType="bonus-benefits"
            amount={2000000}
            category="benefits"
            position="top"
            size="large"
          />
          
          {/* Main Bonus Highlights */}
          <BonusHighlights 
            userTier={userTier}
            totalPoints={totalPoints}
            nextTierPoints={getNextTierPoints()}
          />

          {/* Service Bonus Examples */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Token Rewards by Service</h2>
              <p className="text-gray-600">
                See how much you can earn with different services as a {userTier.name} member
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockServices.map((service, index) => (
                <motion.div
                  key={service.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <ServiceBonusCard
                    serviceType={service.type}
                    baseAmount={service.amount}
                    userTier={userTier}
                    isAthenaPrime={isAthenaPrime}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tier Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tier Comparison</h2>
              <p className="text-gray-600">
                Compare benefits across all membership tiers
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tier</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Earning Bonus</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fee Discount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Staking Bonus</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Min Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { name: 'Bronze', level: 1, bonus: 1.0, feeDiscount: 0.1, staking: 0.08, minPoints: 0 },
                      { name: 'Silver', level: 2, bonus: 1.2, feeDiscount: 0.2, staking: 0.10, minPoints: 1000 },
                      { name: 'Gold', level: 3, bonus: 1.5, feeDiscount: 0.3, staking: 0.12, minPoints: 5000 },
                      { name: 'Diamond', level: 4, bonus: 2.0, feeDiscount: 0.5, staking: 0.15, minPoints: 10000 }
                    ].map((tier, index) => (
                      <tr key={tier.name} className={tier.name === userTier.name ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{tier.name === 'Diamond' ? '💎' : tier.name === 'Gold' ? '🥇' : tier.name === 'Silver' ? '🥈' : '🥉'}</span>
                            <span className={`font-semibold ${tier.name === userTier.name ? 'text-blue-600' : 'text-gray-900'}`}>
                              {tier.name}
                            </span>
                            {tier.name === userTier.name && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{Math.round((tier.bonus - 1) * 100)}%</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{Math.round(tier.feeDiscount * 100)}%</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{Math.round(tier.staking * 100)}%</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{tier.minPoints.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Maximize Your Benefits?</h3>
              <p className="text-blue-100 mb-6">
                Start using our services to earn more tokens and unlock even better benefits!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/vietjet'}
                  className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Book a Flight
                </button>
                <button
                  onClick={() => window.location.href = '/sovico'}
                  className="bg-white/10 text-white font-semibold py-3 px-6 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Explore Services
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
