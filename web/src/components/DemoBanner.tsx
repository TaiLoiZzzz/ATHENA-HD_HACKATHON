'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BeakerIcon, 
  XMarkIcon, 
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface DemoBannerProps {
  onDismiss?: () => void;
}

const DemoBanner: React.FC<DemoBannerProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
        className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-pulse" />
        
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <BeakerIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="h-5 w-5 text-yellow-300" />
                    <h3 className="text-lg font-semibold">
                      Demo Mode Active
                    </h3>
                    <div className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                      Frontend Only
                    </div>
                  </div>
                  
                  <p className="text-sm text-white/90 mt-1">
                    This application is now running in demo mode with mock data. 
                    All features are fully functional but use simulated data instead of real backend connections.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDismiss}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                  aria-label="Dismiss banner"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Additional info section */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="border-t border-white/20 pt-4 pb-2"
            >
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="h-5 w-5 text-blue-200 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-white/80">
                  <p className="mb-2">
                    <strong>Demo Features:</strong> All user interactions, transactions, and data are simulated for demonstration purposes.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Mock Authentication</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Simulated Transactions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>Personalized Data</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
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

export default DemoBanner;

