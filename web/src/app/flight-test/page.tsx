'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import FlightTestData from '@/components/Flight/FlightTestData';
import InlineBonusDisplay from '@/components/UserTier/InlineBonusDisplay';
import { motion } from 'framer-motion';

export default function FlightTestPage() {
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  const handleSelectFlight = (flight: any) => {
    setSelectedFlight(flight);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bonus Display */}
          <InlineBonusDisplay
            serviceType="flight-test"
            amount={800000}
            category="testing"
            position="top"
            size="large"
          />
          
          <FlightTestData 
            onSelectFlight={handleSelectFlight}
          />
          
          {/* Selected Flight Details */}
          {selectedFlight && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chuyến bay đã chọn
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Thông tin chuyến bay</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số hiệu:</span>
                      <span className="font-medium">{selectedFlight.flightNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tuyến:</span>
                      <span className="font-medium">
                        {selectedFlight.departure.airport.code} → {selectedFlight.arrival.airport.code}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="font-medium">{selectedFlight.departure.time} - {selectedFlight.arrival.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày:</span>
                      <span className="font-medium">{selectedFlight.departure.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian bay:</span>
                      <span className="font-medium">{selectedFlight.duration}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Giá và SOV Tokens</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá cơ bản:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(selectedFlight.price.base)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SOV Standard:</span>
                      <span className="font-medium text-blue-600">{selectedFlight.sovTokens.standard} SOV</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SOV Prime:</span>
                      <span className="font-medium text-purple-600">{selectedFlight.sovTokens.prime} SOV</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SOV Diamond:</span>
                      <span className="font-medium text-green-600">
                        {Math.round(selectedFlight.sovTokens.standard * 2)} SOV
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Bạn có thể test thanh toán với chuyến bay này
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Sử dụng SOV tokens để thanh toán và xem lịch sử giao dịch
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => window.location.href = '/vietjet'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Đặt vé
                    </button>
                    <button
                      onClick={() => window.location.href = '/demo-payment'}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Test thanh toán
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
