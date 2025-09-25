'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/lib/api';
import { sovTokenService } from '@/services/sovTokenService';
import toast from 'react-hot-toast';

interface VikkibankPaymentProps {
  serviceId?: string;
  serviceName?: string;
  amount?: number;
  description?: string;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
  className?: string;
}

const VikkibankPayment: React.FC<VikkibankPaymentProps> = ({
  serviceId,
  serviceName = 'Vikkibank Service',
  amount = 0,
  description = '',
  onPaymentSuccess,
  onPaymentError,
  className = ''
}) => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'sov' | 'mixed'>('sov');
  const [sovAmount, setSovAmount] = useState(0);
  const [fiatAmount, setFiatAmount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  useEffect(() => {
    if (amount > 0) {
      // Calculate SOV tokens needed (1 SOV = 10,000 VND)
      const sovNeeded = Math.ceil(amount / 10000);
      setSovAmount(sovNeeded);
      setFiatAmount(amount);
    }
  }, [amount]);

  const loadWalletData = async () => {
    try {
      const walletData = await apiService.getSOVWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const calculateSOVTokens = (vndAmount: number) => {
    // 1 SOV = 10,000 VND
    return Math.ceil(vndAmount / 10000);
  };

  const calculateVNDAmount = (sovAmount: number) => {
    // 1 SOV = 10,000 VND
    return sovAmount * 10000;
  };

  const handleSOVAmountChange = (sov: number) => {
    setSovAmount(sov);
    setFiatAmount(calculateVNDAmount(sov));
  };

  const handleFiatAmountChange = (vnd: number) => {
    setFiatAmount(vnd);
    setSovAmount(calculateSOVTokens(vnd));
  };

  const processPayment = async () => {
    if (!wallet || wallet.balance < sovAmount) {
      toast.error('Insufficient SOV token balance');
      return;
    }

    setProcessing(true);
    try {
      const paymentData = {
        serviceId: serviceId || 'vikkibank_service',
        serviceName,
        amount: fiatAmount,
        sovTokens: sovAmount,
        description: description || `Payment for ${serviceName}`
      };

      const result = await apiService.processVikkibankPayment(paymentData);
      
      toast.success('Payment successful!');
      setShowPreview(false);
      
      if (onPaymentSuccess) {
        onPaymentSuccess(result);
      }
      
      // Reload wallet data
      await loadWalletData();
    } catch (error: any) {
      const errorMessage = error.message || 'Payment failed';
      toast.error(errorMessage);
      
      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
    } finally {
      setProcessing(false);
    }
  };

  const canPay = wallet && wallet.balance >= sovAmount;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Payment Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{serviceName}</h3>
            <p className="text-sm text-gray-600">Vikkibank service payment</p>
          </div>
        </div>

        {description && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">{description}</p>
          </div>
        )}
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setPaymentMethod('sov')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              paymentMethod === 'sov'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">SOV Tokens</div>
                <div className="text-sm text-gray-600">Pay with SOV tokens</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('mixed')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              paymentMethod === 'mixed'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CreditCardIcon className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Kết hợp</div>
                <div className="text-sm text-gray-600">SOV + VND</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Enter Amount</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (VND)
            </label>
            <div className="relative">
              <input
                type="number"
                value={fiatAmount}
                onChange={(e) => handleFiatAmountChange(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter VND amount"
              />
              <div className="absolute right-3 top-3 text-sm text-gray-500">VND</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SOV Tokens
            </label>
            <div className="relative">
              <input
                type="number"
                value={sovAmount}
                onChange={(e) => handleSOVAmountChange(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter SOV tokens"
              />
              <div className="absolute right-3 top-3 text-sm text-gray-500">SOV</div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tỷ giá:</span>
            <span className="font-medium">1 SOV = 10,000 VND</span>
          </div>
        </div>
      </div>

      {/* Wallet Balance */}
      {wallet && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Wallet Balance</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Available Balance</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {wallet.balance.toLocaleString()} SOV
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ChartBarIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Total Spent</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {wallet.totalSpent.toLocaleString()} SOV
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Total Earned</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {wallet.totalEarned.toLocaleString()} SOV
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Preview */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border-2 border-blue-200"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Confirmation</h4>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{fiatAmount.toLocaleString()} VND</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SOV Tokens:</span>
              <span className="font-medium text-blue-600">{sovAmount} SOV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction Fee:</span>
              <span className="font-medium text-green-600">0 SOV</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-blue-600">{sovAmount} SOV</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowPreview(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={processPayment}
              disabled={!canPay || processing}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Confirm Payment</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Payment Button */}
      {!showPreview && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            onClick={() => setShowPreview(true)}
            disabled={!canPay || sovAmount <= 0}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>Pay {sovAmount} SOV</span>
            <ArrowRightIcon className="w-5 h-5" />
          </button>
          
          {!canPay && (
            <p className="text-sm text-red-600 mt-2 text-center">
              Insufficient balance for payment
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VikkibankPayment;
