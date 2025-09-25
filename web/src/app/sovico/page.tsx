'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  BuildingLibraryIcon,
  PaperAirplaneIcon,
  ShoppingCartIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  GiftIcon,
  TrophyIcon,
  BoltIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout/Layout';
import SOVWallet from '@/components/SOVWallet/SOVWallet';
import LoyaltyDashboard from '@/components/Loyalty/LoyaltyDashboard';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  icon: any;
  description: string;
  href: string;
  color: string;
  bgColor: string;
  features: string[];
  sovBenefits: string[];
}

interface UnifiedOffer {
  id: string;
  title: string;
  description: string;
  services: string[];
  originalPrice: number;
  sovPrice: number;
  discount: number;
  validUntil: string;
  features: string[];
}

const services: Service[] = [
  {
    id: 'hdbank',
    name: 'HDBank Services',
    icon: BuildingLibraryIcon,
    description: 'Banking, loans, credit cards, investments',
    href: '/hdbank',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: ['Personal Loans', 'Credit Cards', 'Savings', 'Investments'],
    sovBenefits: ['5% SOV cashback', 'Reduced processing fees', 'Priority support'],
  },
  {
    id: 'vietjet',
    name: 'Vietjet Air',
    icon: PaperAirplaneIcon,
    description: 'Flight bookings, travel packages',
    href: '/vietjet',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    features: ['Domestic Flights', 'International', 'Travel Insurance', 'Seat Selection'],
    sovBenefits: ['10% SOV discount', 'Free baggage upgrade', 'Lounge access'],
  },
  {
    id: 'marketplace',
    name: 'SOV Marketplace',
    icon: ShoppingCartIcon,
    description: 'Trade SOV tokens, exclusive deals',
    href: '/marketplace',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: ['Token Trading', 'P2P Exchange', 'Exclusive Products', 'NFT Marketplace'],
    sovBenefits: ['Zero trading fees', 'Early access', 'VIP deals'],
  },
];

const unifiedOffers: UnifiedOffer[] = [
  {
    id: 'travel-banking-combo',
    title: 'Travel + Banking Combo',
    description: 'Book flight and get instant credit card approval with SOV rewards',
    services: ['Vietjet', 'HDBank'],
    originalPrice: 5000000,
    sovPrice: 450,
    discount: 15,
    validUntil: '2024-12-31',
    features: [
      'Round-trip flight booking',
      'HDBank credit card with 50M limit',
      'Free travel insurance',
      '3x SOV rewards on all purchases',
    ],
  },
  {
    id: 'prime-ecosystem',
    title: 'ATHENA Prime Ecosystem',
    description: 'Unlock premium benefits across all Sovico services',
    services: ['HDBank', 'Vietjet', 'Marketplace'],
    originalPrice: 2000000,
    sovPrice: 180,
    discount: 10,
    validUntil: '2024-12-31',
    features: [
      '1.5x SOV earning rate',
      'Priority customer service',
      'Exclusive deals and offers',
      'Monthly bonus tokens',
    ],
  },
];

export default function SovicoPage() {
  const { user, hasAthenaPrime } = useAuth();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [crossServiceStats, setCrossServiceStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrossServiceStats();
  }, []);

  const fetchCrossServiceStats = async () => {
    try {
      // Mock API call for cross-service statistics
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCrossServiceStats({
        totalSaved: 2500000,
        servicesUsed: 3,
        sovEarned: 1250,
        nextReward: 500,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnifiedPayment = async (offerId: string) => {
    try {
      toast.success('Unified payment initiated! Redirecting...');
      // Implement unified payment logic
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="container-athena py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-4xl font-bold text-gray-900">Sovico Ecosystem</h1>
              <SparklesIcon className="w-8 h-8 text-token-500" />
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              One platform, unlimited possibilities. Pay with SOV tokens across HDBank, Vietjet, and more.
            </p>
          </motion.div>

          {/* Sovico Benefits Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-token-500 to-primary-600 rounded-2xl text-white p-8 mx-auto max-w-4xl"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <TrophyIcon className="w-8 h-8" />
              <h2 className="text-2xl font-bold">The Power of Unity</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <BoltIcon className="w-8 h-8 mx-auto text-yellow-300" />
                <h3 className="font-semibold">Instant Payments</h3>
                <p className="text-sm opacity-90">Pay across all services with one token</p>
              </div>
              <div className="space-y-2">
                <GiftIcon className="w-8 h-8 mx-auto text-green-300" />
                <h3 className="font-semibold">Unified Rewards</h3>
                <p className="text-sm opacity-90">Earn and spend SOV everywhere</p>
              </div>
              <div className="space-y-2">
                <HeartIcon className="w-8 h-8 mx-auto text-red-300" />
                <h3 className="font-semibold">Premium Experience</h3>
                <p className="text-sm opacity-90">VIP treatment across the ecosystem</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Services */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cross-Service Stats */}
            {!loading && crossServiceStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Sovico Journey</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">
                      {crossServiceStats.totalSaved.toLocaleString('vi-VN')}
                    </p>
                    <p className="text-sm text-gray-500">VND Saved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success-600">
                      {crossServiceStats.servicesUsed}
                    </p>
                    <p className="text-sm text-gray-500">Services Used</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-token-600">
                      {crossServiceStats.sovEarned}
                    </p>
                    <p className="text-sm text-gray-500">SOV Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {crossServiceStats.nextReward}
                    </p>
                    <p className="text-sm text-gray-500">Next Milestone</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Unified Offers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <StarIcon className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-semibold text-gray-900">Exclusive Combo Deals</h3>
              </div>
              
              <div className="grid gap-4">
                {unifiedOffers.map((offer, index) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{offer.title}</h4>
                          <p className="text-gray-600 mb-3">{offer.description}</p>
                          <div className="flex items-center space-x-2 mb-3">
                            {offer.services.map((service) => (
                              <span
                                key={service}
                                className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 line-through">
                            {offer.originalPrice.toLocaleString('vi-VN')} VND
                          </div>
                          <div className="text-2xl font-bold text-token-600">
                            {offer.sovPrice} SOV
                          </div>
                          <div className="text-sm text-success-600 font-medium">
                            Save {offer.discount}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {offer.features.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <CheckCircleIcon className="w-4 h-4 text-success-500" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleUnifiedPayment(offer.id)}
                        className="w-full btn btn-primary"
                      >
                        Pay with SOV Tokens
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Services Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-gray-900">All Services</h3>
              <div className="grid gap-6">
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 ${service.bgColor} rounded-lg flex items-center justify-center`}>
                          <service.icon className={`w-6 h-6 ${service.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h4>
                          <p className="text-gray-600 mb-3">{service.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Features</h5>
                              <ul className="space-y-1">
                                {service.features.map((feature) => (
                                  <li key={feature} className="text-sm text-gray-600">• {feature}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-token-700 mb-2">SOV Benefits</h5>
                              <ul className="space-y-1">
                                {service.sovBenefits.map((benefit) => (
                                  <li key={benefit} className="text-sm text-token-600">★ {benefit}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <Link href={service.href} className="btn btn-outline inline-flex items-center space-x-2">
                            <span>Explore {service.name}</span>
                            <ArrowRightIcon className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - SOV Wallet & Loyalty */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <SOVWallet showFullInterface={true} />
            </motion.div>

            {/* Loyalty Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <LoyaltyDashboard />
            </motion.div>

            {/* Prime Upgrade CTA */}
            {!hasAthenaPrime() && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-br from-token-500 to-purple-600 rounded-xl text-white p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <SparklesIcon className="w-8 h-8" />
                  <h3 className="text-xl font-bold">Upgrade to ATHENA Prime</h3>
                </div>
                <ul className="space-y-2 mb-4 text-sm">
                  <li>• 1.5x SOV earning rate</li>
                  <li>• Exclusive deals & offers</li>
                  <li>• Priority customer support</li>
                  <li>• Monthly bonus rewards</li>
                </ul>
                <button className="w-full bg-white text-token-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  Upgrade Now - 100 SOV
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
