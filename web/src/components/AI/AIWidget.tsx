'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ArrowRightIcon,
  GiftIcon,
  StarIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import AISalesAssistant from './AISalesAssistant';

interface AIWidgetProps {
  className?: string;
}

const AIWidget: React.FC<AIWidgetProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSalesAssistant, setShowSalesAssistant] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setShowSalesAssistant(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowSalesAssistant(false);
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed bottom-6 right-6 z-50 ${className}`}
      >
        <button
          onClick={handleOpen}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
        >
          <div className="flex items-center space-x-2">
            <CpuChipIcon className="w-6 h-6" />
            <span className="hidden sm:block font-medium">AI Assistant</span>
          </div>
          
          {/* Floating notification */}
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            <SparklesIcon className="w-3 h-3" />
          </div>
        </button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-6 right-6 z-50 w-96 max-w-sm"
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CpuChipIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">AI Assistant</h3>
                  <p className="text-sm text-purple-100">Smart consultation</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="h-96">
            {showSalesAssistant ? (
              <AISalesAssistant className="h-full" />
            ) : (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  AI Personalization
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  I can help you optimize tokens and provide personalized recommendations
                </p>
                <button
                  onClick={() => setShowSalesAssistant(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
                >
                  <span>Start conversation</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIWidget;
