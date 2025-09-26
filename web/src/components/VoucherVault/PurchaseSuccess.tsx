'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  GiftIcon,
  SparklesIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface PurchaseSuccessProps {
  voucherName: string;
  voucherCode: string;
  tokenPrice: number;
  onClose?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
}

export default function PurchaseSuccess({
  voucherName,
  voucherCode,
  tokenPrice,
  onClose,
  onShare,
  onDownload
}: PurchaseSuccessProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(num);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Tôi vừa mua voucher trên ATHENA HD!',
        text: `Tôi vừa mua voucher "${voucherName}" trên ATHENA HD!`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `Tôi vừa mua voucher "${voucherName}" trên ATHENA HD!`;
      navigator.clipboard.writeText(text);
      alert('Đã sao chép vào clipboard!');
    }
    onShare?.();
  };

  const handleDownload = () => {
    // Create a simple text file with voucher details
    const content = `VOUCHER ATHENA HD
================

Tên voucher: ${voucherName}
Mã voucher: ${voucherCode}
Giá: ${tokenPrice.toLocaleString()} ATHENA Token
Ngày mua: ${new Date().toLocaleDateString('vi-VN')}

Cảm ơn bạn đã sử dụng dịch vụ ATHENA HD!
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voucher-${voucherCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    onDownload?.();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden"
        >
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * window.innerWidth,
                    y: -10,
                    rotate: 0
                  }}
                  animate={{ 
                    y: window.innerHeight + 10,
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 3,
                    delay: Math.random() * 2,
                    ease: "easeOut"
                  }}
                  className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    background: `hsl(${Math.random() * 360}, 70%, 50%)`
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative z-10">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 10
                }}
                className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircleIcon className="w-10 h-10 text-white" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Mua thành công!
              </h3>
              <p className="text-gray-600">
                Chúc mừng bạn đã mua voucher thành công!
              </p>
            </div>

            {/* Voucher Details */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <GiftIcon className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-gray-900">{voucherName}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mã voucher:</span>
                  <code className="bg-white border border-gray-300 rounded px-2 py-1 text-sm font-mono">
                    {voucherCode}
                  </code>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Đã thanh toán:</span>
                  <span className="font-semibold text-purple-600">
                    {tokenPrice.toLocaleString()} ATHENA
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span className="font-medium">Tải voucher</span>
              </button>
              
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span className="font-medium">Chia sẻ</span>
              </button>
              
              <button
                onClick={handleClose}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors font-medium"
              >
                Hoàn thành
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <TrophyIcon className="w-4 h-4" />
                <span>Voucher đã được lưu vào tài khoản của bạn</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}