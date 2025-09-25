'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GiftIcon, 
  CurrencyDollarIcon, 
  StarIcon,
  XMarkIcon,
  SparklesIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import { sovTokenService } from '@/services/sovTokenService';
import { useAuth } from '@/contexts/AuthContext';
import { SessionStorageManager, SessionStorageKeys } from '@/utils/sessionStorage';

const SOVTokenBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [membershipTier, setMembershipTier] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const wallet = sovTokenService.getWallet();
      const stats = sovTokenService.getWalletStats();
      
      setWalletBalance(wallet.balance);
      setMembershipTier(stats.membershipTier);
      
      // Show banner if user has good balance and not dismissed
      if (wallet.balance > 1000 && SessionStorageManager.shouldShow(SessionStorageKeys.SOV_TOKEN_BANNER_DISMISSED)) {
        setIsVisible(true);
      }
    }
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    SessionStorageManager.markAsShown(SessionStorageKeys.SOV_TOKEN_BANNER_DISMISSED);
  };

  if (!isVisible || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
        className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white mb-6 rounded-xl shadow-lg overflow-hidden"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-pulse" />
        
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <GiftIcon className="h-7 w-7 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold">SOV Tokens Ready!</h3>
                  <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    <StarIcon className="h-4 w-4 text-yellow-300" />
                    <span>{membershipTier?.name} Member</span>
                  </div>
                </div>
                
                <p className="text-white/90 text-sm mb-3">
                  You have <strong>{walletBalance.toLocaleString()} SOV tokens</strong> available for payments, 
                  staking, and earning rewards across all ATHENA services.
                </p>

                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <WalletIcon className="h-4 w-4 text-white/80" />
                    <span className="text-white/80">Available: {walletBalance.toLocaleString()} SOV</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="h-4 w-4 text-white/80" />
                    <span className="text-white/80">≈ {(walletBalance * 10).toLocaleString()} VND</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="h-4 w-4 text-yellow-300" />
                    <span className="text-yellow-200">{membershipTier?.bonusMultiplier}x earning bonus</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-2xl font-bold">{walletBalance.toLocaleString()}</div>
                <div className="text-sm text-white/80">SOV Tokens</div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                aria-label="Dismiss banner"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Benefits section */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="border-t border-white/20 pt-4 mt-4"
          >
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">💎</span>
              </div>
              <div className="text-sm text-white/80">
                <p className="mb-2">
                  <strong>What you can do with SOV tokens:</strong>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Pay for flights, banking, resorts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Stake tokens for 12% APY</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Earn bonus rewards</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: `${15 + i * 12}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SOVTokenBanner;

