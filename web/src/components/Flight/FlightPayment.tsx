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
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { sovTokenService } from '@/services/sovTokenService';
import toast from 'react-hot-toast';

interface FlightPaymentProps {
  flightDetails: any;
  passengers: any[];
  totalPrice: number;
  sovTokenAmount: number;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  className?: string;
}

const FlightPayment: React.FC<FlightPaymentProps> = ({
  flightDetails,
  passengers,
  totalPrice,
  sovTokenAmount,
  onPaymentSuccess,
  onPaymentError,
  className = ''
}) => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const walletData = await sovTokenService.getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const processPayment = async () => {
    if (!wallet || wallet.balance < actualTokenAmount) {
      toast.error('Insufficient SOV token balance');
      return;
    }

    setProcessing(true);
    try {
      // Process SOV token payment
      const payment = sovTokenService.processPayment(
        actualTokenAmount,
        'vietjet',
        `flight_${flightDetails?.flightNumber}_${Date.now()}`,
        `VietJet Air booking - ${flightDetails?.departure.airport.code} to ${flightDetails?.arrival.airport.code}`
      );

      // Save booking information to localStorage
      const bookingData = {
        id: payment.id,
        flightDetails: flightDetails,
        passengers: passengers,
        totalPrice: totalPrice,
        sovTokensUsed: actualTokenAmount,
        sovTokensEarned: flightDetails?.sovTokens?.standard || 0,
        bookingDate: new Date().toISOString(),
        status: 'confirmed',
        paymentMethod: 'sov_token',
        contactInfo: {
          email: 'user@example.com', // This should come from props or context
          phone: '+84 123 456 789'
        }
      };

      // Save to localStorage
      const existingBookings = JSON.parse(localStorage.getItem('flight_bookings') || '[]');
      existingBookings.unshift(bookingData);
      localStorage.setItem('flight_bookings', JSON.stringify(existingBookings));

      // Add transaction to history
      sovTokenService.addTransaction({
        type: 'spend',
        amount: -actualTokenAmount,
        description: `Flight booking: ${flightDetails?.airline} ${flightDetails?.flightNumber}`,
        serviceType: 'flight',
        serviceReferenceId: payment.id,
        status: 'completed',
        metadata: {
          flightNumber: flightDetails?.flightNumber,
          route: `${flightDetails?.departure.airport.code}-${flightDetails?.arrival.airport.code}`,
          passengers: passengers.length,
          bookingId: payment.id
        }
      });

      // Note: Token rewards should be given after service completion, not immediately after payment
      // This prevents Total Earned from inflating right after spending
      // Rewards will be given when the flight is actually taken or service is completed
      
      toast.success('Payment successful! Flight booked.');
      setShowPreview(false);
      
      if (onPaymentSuccess) {
        onPaymentSuccess({
          ...payment,
          bookingData
        });
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

  const actualTokenAmount = sovTokenAmount || Math.ceil(totalPrice / 10000);
  const canPay = wallet && wallet.balance >= actualTokenAmount;

  // Debug log
  console.log('FlightPayment Debug:', {
    totalPrice,
    sovTokenAmount,
    actualTokenAmount,
    walletBalance: wallet?.balance,
    canPay
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Flight Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Flight Summary</h3>
        
        {flightDetails && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{flightDetails.airline}</p>
                  <p className="text-sm text-gray-600">Flight {flightDetails.flightNumber}</p>
                </div>
              </div>
        <div className="text-right">
          <p className="text-lg font-bold text-blue-600">{formatCurrency(totalPrice)}</p>
          <p className="text-sm text-gray-500">{sovTokenAmount || Math.ceil(totalPrice / 10000)} SOV</p>
        </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Departure</p>
                <p className="font-medium">{flightDetails.departure.airport.code}</p>
                <p className="text-gray-600">{flightDetails.departure.time}</p>
                <p className="text-gray-600">{formatDate(flightDetails.departure.date)}</p>
              </div>
              <div>
                <p className="text-gray-600">Arrival</p>
                <p className="font-medium">{flightDetails.arrival.airport.code}</p>
                <p className="text-gray-600">{flightDetails.arrival.time}</p>
                <p className="text-gray-600">{formatDate(flightDetails.arrival.date)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Passengers:</span>
                <span className="font-medium">{passengers.length} passenger(s)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{flightDetails.duration}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h4>
        
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium text-blue-900">SOV Tokens</div>
              <div className="text-sm text-blue-700">Pay with your SOV token balance</div>
            </div>
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
                <SparklesIcon className="w-5 h-5 text-purple-600" />
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
              <span className="text-gray-600">Flight:</span>
              <span className="font-medium">{flightDetails?.airline} {flightDetails?.flightNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Route:</span>
              <span className="font-medium">{flightDetails?.departure.airport.code} → {flightDetails?.arrival.airport.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Passengers:</span>
              <span className="font-medium">{passengers.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Price:</span>
              <span className="font-medium">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SOV Tokens:</span>
              <span className="font-medium text-blue-600">{sovTokenAmount} SOV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction Fee:</span>
              <span className="font-medium text-green-600">0 SOV</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-blue-600">{sovTokenAmount} SOV</span>
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
            disabled={!canPay || actualTokenAmount <= 0}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>Pay {sovTokenAmount || Math.ceil(totalPrice / 10000)} SOV</span>
            <ArrowRightIcon className="w-5 h-5" />
          </button>
          
          {!canPay && sovTokenAmount > 0 && (
            <p className="text-sm text-red-600 mt-2 text-center">
              Insufficient balance for payment
            </p>
          )}
          
          {actualTokenAmount === 0 && (
            <p className="text-sm text-yellow-600 mt-2 text-center">
              ⚠️ No payment amount calculated. Please check flight selection.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightPayment;
