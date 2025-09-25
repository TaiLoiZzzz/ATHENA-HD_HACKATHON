'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon,
  SparklesIcon,
  GiftIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  fetchPaymentPreview as safeFetchPaymentPreview, 
  processPayment as safeProcessPayment,
  formatCurrency,
  formatTokens,
  isValidAmount,
  isValidServiceType,
  debounce
} from '@/utils/paymentHelpers';

interface PaymentPreview {
  originalTokenCost: number;
  finalTokenCost: number;
  bonusTokensEarned: number;
  loyaltyDiscountVnd: number;
  currentBalance: number;
  canAfford: boolean;
  savingsPercentage: number;
  tierInfo: {
    name: string;
    level: number;
    color: string;
    icon: string;
    bonusMultiplier: number;
    tokenBonusPercentage: number;
  };
}

interface EnhancedPaymentProps {
  serviceType: string;
  serviceName: string;
  baseAmount: number;
  tokenAmount: number;
  description: string;
  serviceReferenceId?: string;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
}

export default function EnhancedPayment({
  serviceType,
  serviceName,
  baseAmount,
  tokenAmount,
  description,
  serviceReferenceId,
  onPaymentSuccess,
  onPaymentError
}: EnhancedPaymentProps) {
  const { user } = useAuth();
  const [preview, setPreview] = useState<PaymentPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Debounced fetch to prevent excessive API calls
  const debouncedFetch = debounce(async () => {
    if (!user || !isValidAmount(baseAmount) || !isValidAmount(tokenAmount) || !isValidServiceType(serviceType)) {
      return;
    }
    
    setLoading(true);
    
    const result = await safeFetchPaymentPreview({
      serviceType,
      baseAmountVnd: baseAmount,
      tokenAmount,
      description
    });
    
    if (result && typeof result === 'object' && 'preview' in result) {
      setPreview((result as any).preview);
    }
    
    setLoading(false);
  }, 500);

  useEffect(() => {
    if (user) {
      debouncedFetch();
    }
  }, [user, baseAmount, tokenAmount, serviceType]);

  const processPayment = async () => {
    if (!preview || !preview.canAfford) {
      toast.error('Không đủ số dư để thanh toán');
      return;
    }

    setProcessing(true);
    
    const result = await safeProcessPayment({
      serviceType,
      baseAmountVnd: baseAmount,
      tokenAmount,
      description,
      serviceReferenceId
    });
    
    if (result && typeof result === 'object' && 'success' in result && (result as any).success) {
      toast.success((result as any).message || 'Thanh toán thành công!');
      if (onPaymentSuccess) {
        onPaymentSuccess((result as any).transaction);
      }
    } else if (onPaymentError) {
      onPaymentError((result as any)?.error || 'Thanh toán thất bại');
    }
    
    setProcessing(false);
  };


  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Không thể tải thông tin thanh toán</p>
        </div>
      </div>
    );
  }

  const hasLoyaltyBenefits = preview.bonusTokensEarned > 0 || preview.loyaltyDiscountVnd > 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header with Tier Info */}
      <div 
        className="p-6 text-white relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${preview.tierInfo.color} 0%, ${preview.tierInfo.color}cc 100%)` 
        }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
          <StarIcon className="w-full h-full" />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{serviceName}</h3>
            <p className="text-white/80">{preview.tierInfo.name} - Hạng {preview.tierInfo.level}</p>
          </div>
          
          {hasLoyaltyBenefits && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <div className="flex items-center space-x-1">
                <SparklesIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Có ưu đãi</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Payment Summary */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Giá gốc:</span>
            <span className="font-medium">{formatCurrency(baseAmount)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Token cần:</span>
            <div className="text-right">
              {preview.finalTokenCost !== preview.originalTokenCost && (
                <span className="text-sm text-gray-400 line-through">
                  {formatTokens(preview.originalTokenCost)} SOV
                </span>
              )}
              <p className="font-bold text-lg">{formatTokens(preview.finalTokenCost)} SOV</p>
            </div>
          </div>

          {/* Loyalty Benefits Highlight */}
          {hasLoyaltyBenefits && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200"
            >
              <div className="flex items-center space-x-2 mb-3">
                <GiftIcon className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Ưu đãi thành viên {preview.tierInfo.name}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {preview.loyaltyDiscountVnd > 0 && (
                  <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Giảm giá:</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      -{formatCurrency(preview.loyaltyDiscountVnd)}
                    </span>
                  </div>
                )}
                
                {preview.bonusTokensEarned > 0 && (
                  <div className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <BoltIcon className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Bonus token:</span>
                    </div>
                    <span className="font-bold text-orange-600">
                      +{formatTokens(preview.bonusTokensEarned)} SOV
                    </span>
                  </div>
                )}
              </div>
              
              {preview.savingsPercentage > 0 && (
                <div className="mt-3 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Tiết kiệm {preview.savingsPercentage.toFixed(1)}%
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Balance Check */}
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Số dư hiện tại:</span>
            <div className="text-right">
              <p className={`font-bold text-lg ${preview.canAfford ? 'text-green-600' : 'text-red-600'}`}>
                {formatTokens(preview.currentBalance)} SOV
              </p>
              {!preview.canAfford && (
                <p className="text-sm text-red-600">
                  Thiếu {formatTokens(preview.finalTokenCost - preview.currentBalance)} SOV
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Breakdown Toggle */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showBreakdown ? 'Ẩn chi tiết' : 'Xem chi tiết tính toán'}
        </button>

        <AnimatePresence>
          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm"
            >
              <div className="flex justify-between">
                <span>Token gốc:</span>
                <span>{formatTokens(preview.originalTokenCost)} SOV</span>
              </div>
              
              {preview.loyaltyDiscountVnd > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Giảm giá hạng {preview.tierInfo.level}:</span>
                  <span>-{formatTokens(preview.originalTokenCost - preview.finalTokenCost)} SOV</span>
                </div>
              )}
              
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Tổng thanh toán:</span>
                <span>{formatTokens(preview.finalTokenCost)} SOV</span>
              </div>
              
              {preview.bonusTokensEarned > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Bonus nhận được:</span>
                  <span>+{formatTokens(preview.bonusTokensEarned)} SOV</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Button */}
        <motion.button
          onClick={processPayment}
          disabled={!preview.canAfford || processing}
          whileHover={{ scale: preview.canAfford ? 1.02 : 1 }}
          whileTap={{ scale: preview.canAfford ? 0.98 : 1 }}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
            preview.canAfford
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {processing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Đang xử lý...</span>
            </div>
          ) : preview.canAfford ? (
            <div className="flex items-center justify-center space-x-2">
              <CreditCardIcon className="w-6 h-6" />
              <span>Thanh toán ngay</span>
              {hasLoyaltyBenefits && <SparklesIcon className="w-5 h-5" />}
            </div>
          ) : (
            'Số dư không đủ'
          )}
        </motion.button>

        {/* Success Message Preview */}
        {hasLoyaltyBenefits && preview.canAfford && (
          <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-700">
              🎉 Sau thanh toán, bạn sẽ nhận được các ưu đãi từ hạng {preview.tierInfo.name}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

