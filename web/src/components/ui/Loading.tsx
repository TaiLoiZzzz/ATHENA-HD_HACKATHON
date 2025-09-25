'use client';

import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <motion.div
      className={`relative ${sizeClasses[size]}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-0 rounded-full border-4 border-purple-200/30"></div>
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500"></div>
    </motion.div>
  );
};

export const LoadingDots = () => {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
};

export const LoadingPulse = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.02, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl"></div>
        <div className="w-16 h-4 bg-white/20 rounded"></div>
      </div>
      <div className="space-y-3">
        <div className="w-20 h-4 bg-white/20 rounded"></div>
        <div className="w-32 h-8 bg-white/20 rounded"></div>
        <div className="w-24 h-3 bg-white/20 rounded"></div>
      </div>
    </div>
  );
};

export default function Loading({ text = 'Loading...', fullScreen = false, size = 'lg' }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Animated Logo */}
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <SparklesIcon className="h-10 w-10 text-white relative z-10" />
          
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"
            animate={{
              backgroundPosition: ['0%', '100%', '0%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% 100%'
            }}
          />
        </div>
        
        {/* Outer ring */}
        <motion.div
          className="absolute -inset-2 rounded-3xl border-2 border-purple-400/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: `${30 + Math.random() * 20}px 0px`
            }}
            animate={{
              rotate: 360,
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.25,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Loading Text */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-xl font-bold text-white mb-2">{text}</h3>
        <LoadingDots />
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        className="w-64 h-2 bg-white/20 rounded-full overflow-hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          animate={{
            x: [-256, 256],
            scaleX: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
        <div className="relative">
          {/* Background Effects */}
          <div className="absolute inset-0 -m-32">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 relative">
      {content}
    </div>
  );
}
