'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EyeIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
}

const PaymentTutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: 'Kiểm tra số dư SOV',
      description: 'Xem số dư SOV tokens trong ví của bạn',
      icon: CurrencyDollarIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">SOV Wallet</h4>
                <p className="text-white/80">Số dư hiện tại</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">10,000</div>
                <div className="text-sm text-white/80">SOV Tokens</div>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>• Số dư SOV tokens: 10,000</p>
            <p>• Tổng đã chi: 0 SOV</p>
            <p>• Tổng đã nhận: 10,000 SOV</p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Chọn dịch vụ',
      description: 'Chọn dịch vụ bạn muốn thanh toán',
      icon: CreditCardIcon,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Vietjet Air', icon: '✈️', color: 'bg-blue-100 text-blue-800' },
              { name: 'HD Bank', icon: '🏦', color: 'bg-green-100 text-green-800' },
              { name: 'Sovico Resort', icon: '🏨', color: 'bg-purple-100 text-purple-800' },
              { name: 'Bảo hiểm', icon: '🛡️', color: 'bg-orange-100 text-orange-800' }
            ].map((service, index) => (
              <div key={index} className={`p-3 rounded-lg border-2 border-dashed ${service.color}`}>
                <div className="text-center">
                  <div className="text-2xl mb-1">{service.icon}</div>
                  <div className="text-sm font-medium">{service.name}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            <p>• Chọn dịch vụ từ danh sách</p>
            <p>• Mỗi dịch vụ có bonus khác nhau</p>
            <p>• Tích lũy điểm loyalty</p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Nhập số tiền',
      description: 'Nhập số SOV tokens muốn chi tiêu',
      icon: CurrencyDollarIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Nhập số SOV tokens"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="100"
                />
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>• Nhập số tiền muốn chi tiêu</p>
            <p>• Hệ thống kiểm tra số dư</p>
            <p>• Hiển thị preview thanh toán</p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Xác nhận thanh toán',
      description: 'Xem lại thông tin và xác nhận thanh toán',
      icon: CheckCircleIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Xác nhận thanh toán</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Dịch vụ:</span>
                <span className="font-medium">Vietjet Air</span>
              </div>
              <div className="flex justify-between">
                <span>Số tiền:</span>
                <span className="font-medium">100 SOV</span>
              </div>
              <div className="flex justify-between">
                <span>Phí giao dịch:</span>
                <span className="font-medium">0 SOV</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Tổng cộng:</span>
                <span className="font-bold text-green-600">100 SOV</span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>• Kiểm tra thông tin thanh toán</p>
            <p>• Xác nhận số tiền</p>
            <p>• Nhấn "Thanh toán" để hoàn tất</p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Xem lịch sử giao dịch',
      description: 'Xem tất cả giao dịch đã thực hiện',
      icon: DocumentTextIcon,
      content: (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h4 className="font-semibold text-gray-900">Lịch sử giao dịch</h4>
            </div>
            <div className="divide-y divide-gray-200">
              {[
                { desc: 'Vietjet Air booking', amount: -100, status: 'completed', time: '2 phút trước' },
                { desc: 'Welcome bonus', amount: +10000, status: 'completed', time: '1 giờ trước' },
                { desc: 'HD Bank service', amount: -50, status: 'completed', time: '2 giờ trước' }
              ].map((tx, index) => (
                <div key={index} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.desc}</p>
                      <p className="text-xs text-gray-500">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} SOV
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>• Xem tất cả giao dịch</p>
            <p>• Lọc theo loại và thời gian</p>
            <p>• Xuất báo cáo</p>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: 'Thống kê và phân tích',
      description: 'Xem thống kê chi tiêu và nhận token',
      icon: EyeIcon,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600">+</span>
                </div>
                <div>
                  <p className="text-sm text-green-600">Tổng nhận</p>
                  <p className="text-lg font-bold text-green-800">10,000 SOV</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-red-600">-</span>
                </div>
                <div>
                  <p className="text-sm text-red-600">Tổng chi</p>
                  <p className="text-lg font-bold text-red-800">150 SOV</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>• Thống kê tổng quan</p>
            <p>• Phân tích chi tiêu</p>
            <p>• Theo dõi xu hướng</p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startTutorial = () => {
    setIsPlaying(true);
    setCurrentStep(0);
  };

  const stopTutorial = () => {
    setIsPlaying(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Hướng dẫn Thanh toán SOV Tokens
        </h1>
        <p className="text-gray-600 text-lg">
          Học cách sử dụng hệ thống thanh toán và xem lịch sử giao dịch
        </p>
      </div>

      {/* Tutorial Controls */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={isPlaying ? stopTutorial : startTutorial}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isPlaying ? (
              <>
                <PauseIcon className="w-4 h-4 mr-2" />
                Dừng
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4 mr-2" />
                Bắt đầu
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Bước {currentStep + 1} / {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <steps[currentStep].icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600">
                {steps[currentStep].description}
              </p>
            </div>
          </div>

          <div className="mb-8">
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Trước
            </button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Summary */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Tóm tắt
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-2">Thanh toán:</h4>
            <ul className="space-y-1">
              <li>• Kiểm tra số dư SOV</li>
              <li>• Chọn dịch vụ</li>
              <li>• Nhập số tiền</li>
              <li>• Xác nhận thanh toán</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Lịch sử:</h4>
            <ul className="space-y-1">
              <li>• Xem tất cả giao dịch</li>
              <li>• Lọc và tìm kiếm</li>
              <li>• Thống kê chi tiêu</li>
              <li>• Xuất báo cáo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTutorial;
