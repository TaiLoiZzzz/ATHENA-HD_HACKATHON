'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GiftIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import FlightPayment from './FlightPayment';
import toast from 'react-hot-toast';

interface FlightBookingPaymentProps {
  selectedOutbound: any;
  selectedReturn: any;
  passengers: any[];
  bonusTokenPercentage: number;
  setBonusTokenPercentage: (value: number) => void;
  calculateTotalPrice: () => number;
  calculateTotalTokens: () => number;
  sovTokenAmount: number;
  setCurrentStep: (step: string) => void;
  onBookingSuccess: () => void;
}

const FlightBookingPayment: React.FC<FlightBookingPaymentProps> = ({
  selectedOutbound,
  selectedReturn,
  passengers,
  bonusTokenPercentage,
  setBonusTokenPercentage,
  calculateTotalPrice,
  calculateTotalTokens,
  sovTokenAmount,
  setCurrentStep,
  onBookingSuccess
}) => {
  const getBonusTokenOptions = () => [
    { value: 0, label: 'No Bonus', description: 'Standard token earning' },
    { value: 25, label: '25% Bonus', description: '+25% more tokens earned', cost: Math.floor(calculateTotalPrice() * 0.05) },
    { value: 50, label: '50% Bonus', description: '+50% more tokens earned', cost: Math.floor(calculateTotalPrice() * 0.1) },
    { value: 100, label: '100% Bonus', description: 'Double tokens earned!', cost: Math.floor(calculateTotalPrice() * 0.2) }
  ];

  return (
    <div className="space-y-6">
      {/* Bonus Token Selection */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bonus Tokens</h2>
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <GiftIcon className="h-6 w-6 text-purple-600 mr-2" />
            Bonus Token Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getBonusTokenOptions().map((option) => (
              <div
                key={option.value}
                onClick={() => setBonusTokenPercentage(option.value)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  bonusTokenPercentage === option.value
                    ? 'border-purple-500 bg-purple-100'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-center">
                  <h4 className="font-medium text-gray-900">{option.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  {option.cost && (
                    <p className="text-sm font-medium text-purple-600 mt-2">
                      +{option.cost.toLocaleString()} VND
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flight Payment Component */}
      <FlightPayment
        flightDetails={selectedOutbound}
        passengers={passengers}
        totalPrice={calculateTotalPrice()}
        sovTokenAmount={calculateTotalPrice() > 0 ? Math.ceil(calculateTotalPrice() / 10000) : 0}
        onPaymentSuccess={(result) => {
          toast.success('Flight booked successfully!');
          onBookingSuccess();
        }}
        onPaymentError={(error) => {
          toast.error(error);
        }}
      />

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep('passengers')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Passengers</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightBookingPayment;
