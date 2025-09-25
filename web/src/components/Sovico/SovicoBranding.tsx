'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingLibraryIcon,
  PaperAirplaneIcon,
  ShoppingCartIcon,
  SparklesIcon,
  StarIcon,
  GiftIcon,
  TrophyIcon,
  HeartIcon,
  BoltIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { clsx } from 'clsx';

interface SovicoBenefit {
  icon: any;
  title: string;
  description: string;
  color: string;
}

interface SovicoPromotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  services: string[];
  cta: string;
  href: string;
  featured: boolean;
}

const sovicoBenefits: SovicoBenefit[] = [
  {
    icon: BoltIcon,
    title: 'Instant Cross-Service Payments',
    description: 'Pay with SOV tokens across HDBank, Vietjet, and all Sovico services instantly',
    color: 'text-yellow-600 bg-yellow-50',
  },
  {
    icon: GiftIcon,
    title: 'Unified Rewards System',
    description: 'Earn SOV tokens from every service and spend them anywhere in the ecosystem',
    color: 'text-green-600 bg-green-50',
  },
  {
    icon: TrophyIcon,
    title: 'Cross-Service Bonuses',
    description: 'Get extra rewards when using multiple services - up to 150% bonus',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    icon: HeartIcon,
    title: 'VIP Treatment Everywhere',
    description: 'ATHENA Prime status gives you priority service across all platforms',
    color: 'text-red-600 bg-red-50',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Guaranteed Best Rates',
    description: 'SOV token users always get the best exchange rates and lowest fees',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: SparklesIcon,
    title: 'Exclusive Access',
    description: 'Early access to new services, products, and investment opportunities',
    color: 'text-indigo-600 bg-indigo-50',
  },
];

const sovicoPromotions: SovicoPromotion[] = [
  {
    id: 'grand-opening',
    title: 'Sovico Grand Opening',
    description: 'Celebrate the launch of unified payments with exclusive rewards',
    discount: '50% OFF',
    validUntil: '2024-12-31',
    services: ['HDBank', 'Vietjet', 'Vikkibank'],
    cta: 'Claim Now',
    href: '/sovico',
    featured: true,
  },
  {
    id: 'cross-service-challenge',
    title: 'Cross-Service Challenge',
    description: 'Use all 3 services this month and win 500 SOV tokens',
    discount: '500 SOV',
    validUntil: '2024-11-30',
    services: ['Challenge'],
    cta: 'Join Challenge',
    href: '/sovico',
    featured: false,
  },
  {
    id: 'prime-upgrade',
    title: 'ATHENA Prime Flash Sale',
    description: 'Upgrade to Prime with 30% discount - limited time offer',
    discount: '30% OFF',
    validUntil: '2024-10-15',
    services: ['Prime'],
    cta: 'Upgrade Now',
    href: '/sovico',
    featured: false,
  },
];

interface SovicoBrandingProps {
  className?: string;
  showPromotions?: boolean;
  compact?: boolean;
}

export default function SovicoBranding({ 
  className = '', 
  showPromotions = true, 
  compact = false 
}: SovicoBrandingProps) {
  const [currentPromotion, setCurrentPromotion] = useState(0);

  useEffect(() => {
    if (showPromotions && sovicoPromotions.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromotion((prev) => (prev + 1) % sovicoPromotions.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showPromotions]);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={clsx('bg-gradient-to-r from-token-50 to-primary-50 rounded-xl border border-token-200 p-4', className)}
      >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Sovico Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Sovico Ecosystem</h4>
              <p className="text-sm text-gray-600">One token, all services</p>
            </div>
          </div>
      </motion.div>
    );
  }

  return (
    <div className={clsx('space-y-8', className)}>
      {/* Hero Branding Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-600 via-token-500 to-purple-600 rounded-2xl text-white p-8 overflow-hidden relative"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24"></div>
        </div>
        
        <div className="relative">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-white/20 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4"
            >
              <img 
                src="/logo.png" 
                alt="Sovico Logo" 
                className="h-12 w-12 object-contain"
              />
            </motion.div>
            <h2 className="text-3xl font-bold mb-3">Welcome to Sovico Ecosystem</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              The future of integrated financial services - where HDBank, Vietjet, and more work as one
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <BuildingLibraryIcon className="w-12 h-12 mx-auto text-blue-300" />
              <h3 className="text-lg font-semibold">HDBank Services</h3>
              <p className="text-sm opacity-80">Banking, loans, investments with SOV rewards</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <PaperAirplaneIcon className="w-12 h-12 mx-auto text-orange-300" />
              <h3 className="text-lg font-semibold">Vietjet Air</h3>
              <p className="text-sm opacity-80">Flights and travel with token discounts</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <ShoppingCartIcon className="w-12 h-12 mx-auto text-purple-300" />
              <h3 className="text-lg font-semibold">SOV Ecosystem</h3>
              <p className="text-sm opacity-80">Trade tokens and exclusive products</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Benefits Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Why Choose Sovico Ecosystem?</h3>
          <p className="text-gray-600">Experience the power of unified financial services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sovicoBenefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className={clsx('w-12 h-12 rounded-lg flex items-center justify-center mb-4', benefit.color)}>
                <benefit.icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h4>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Promotions Section */}
      {showPromotions && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Exclusive Offers</h3>
            <div className="flex items-center space-x-2">
              {sovicoPromotions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPromotion(index)}
                  className={clsx(
                    'w-2 h-2 rounded-full transition-colors',
                    index === currentPromotion ? 'bg-primary-600' : 'bg-gray-300'
                  )}
                />
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl">
            {sovicoPromotions.map((promotion, index) => (
              <motion.div
                key={promotion.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ 
                  opacity: index === currentPromotion ? 1 : 0,
                  x: index === currentPromotion ? 0 : 100 
                }}
                transition={{ duration: 0.5 }}
                className={clsx(
                  'absolute inset-0',
                  index === currentPromotion ? 'relative' : 'absolute'
                )}
              >
                <div className={clsx(
                  'rounded-xl p-6 text-white',
                  promotion.featured 
                    ? 'bg-gradient-to-r from-token-600 to-primary-700' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700'
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {promotion.featured && <StarIcon className="w-5 h-5 text-yellow-300" />}
                        <h4 className="text-xl font-bold">{promotion.title}</h4>
                      </div>
                      <p className="opacity-90 mb-3">{promotion.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="bg-white/20 px-2 py-1 rounded">
                          Valid until {new Date(promotion.validUntil).toLocaleDateString('vi-VN')}
                        </span>
                        <div className="flex items-center space-x-1">
                          {promotion.services.map((service) => (
                            <span key={service} className="bg-white/20 px-2 py-1 rounded text-xs">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold mb-2">{promotion.discount}</div>
                      <Link
                        href={promotion.href}
                        className="inline-flex items-center space-x-2 bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                      >
                        <span>{promotion.cta}</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-token-600 rounded-xl text-white p-8 text-center"
      >
        <h3 className="text-2xl font-bold mb-3">Ready to Experience Sovico?</h3>
        <p className="text-lg opacity-90 mb-6">
          Join millions of users who trust Sovico for their financial needs
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Link href="/sovico" className="btn btn-white">
            Explore Ecosystem
          </Link>
          <Link href="/auth/register" className="btn btn-outline-white">
            Get Started
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
