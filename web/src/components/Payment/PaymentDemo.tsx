'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/lib/api';
import { sovTokenService } from '@/services/sovTokenService';
import toast from 'react-hot-toast';

interface PaymentDemoProps {
  className?: string;
}

const PaymentDemo: React.FC<PaymentDemoProps> = ({ className = '' }) => {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState('vietjet');
  const [amount, setAmount] = useState(1000);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  useEffect(() => {
    loadWalletData();
    loadTransactions();
  }, []);

  const loadWalletData = async () => {
    try {
      const walletData = await apiService.getSOVWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await apiService.getTokenTransactions(1, 10);
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const simulatePayment = async () => {
    if (!wallet || wallet.balance < amount) {
      toast.error('Số dư không đủ để thanh toán');
      return;
    }

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const payment = sovTokenService.processPayment(
        amount,
        selectedService,
        `demo_${Date.now()}`,
        `Demo payment for ${selectedService}`
      );

      setPaymentHistory(prev => [payment, ...prev]);
      await loadWalletData();
      await loadTransactions();
      
      toast.success(`Thanh toán thành công! Đã trừ ${amount} SOV tokens`);
    } catch (error: any) {
      toast.error('Thanh toán thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (serviceType: string) => {
    const names = {
      'vietjet': 'Vietjet Air',
      'hdbank': 'HD Bank',
      'sovico': 'Sovico Resort',
      'insurance': 'Bảo hiểm',
    };
    return names[serviceType as keyof typeof names] || serviceType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Demo Hệ thống Thanh toán
        </h2>
        <p className="text-gray-600">
          Hướng dẫn sử dụng thanh toán SOV tokens và xem lịch sử giao dịch
        </p>
      </div>

      {/* Wallet Info */}
      {wallet && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">SOV Wallet</h3>
              <p className="text-white/80">Số dư hiện tại</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{wallet.balance.toLocaleString()}</div>
              <div className="text-sm text-white/80">SOV Tokens</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payment Demo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCardIcon className="w-5 h-5 mr-2" />
          Demo Thanh toán
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn dịch vụ
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="vietjet">Vietjet Air</option>
              <option value="hdbank">HD Bank</option>
              <option value="sovico">Sovico Resort</option>
              <option value="insurance">Bảo hiểm</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền (SOV tokens)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              min="1"
              max={wallet?.balance || 1000}
            />
          </div>

          <button
            onClick={simulatePayment}
            disabled={loading || !wallet || wallet.balance < amount}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                Thanh toán {amount} SOV
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DocumentTextIcon className="w-5 h-5 mr-2" />
          Lịch sử Giao dịch
        </h3>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(transaction.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'earn' ? '+' : '-'}
                    {Math.abs(transaction.amount).toLocaleString()} SOV
                  </p>
                  {transaction.serviceType && (
                    <p className="text-xs text-gray-500">
                      {getServiceName(transaction.serviceType)}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <EyeIcon className="w-5 h-5 mr-2" />
            Lịch sử Thanh toán Demo
          </h3>
          
          <div className="space-y-3">
            {paymentHistory.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    -{payment.amount.toLocaleString()} SOV
                  </p>
                  <p className="text-xs text-gray-500">
                    {getServiceName(payment.serviceType)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 rounded-xl p-6 border border-blue-200"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Hướng dẫn sử dụng
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Chọn dịch vụ:</strong> Chọn dịch vụ bạn muốn thanh toán</p>
          <p>• <strong>Nhập số tiền:</strong> Nhập số SOV tokens muốn chi tiêu</p>
          <p>• <strong>Thanh toán:</strong> Nhấn nút để thực hiện thanh toán</p>
          <p>• <strong>Xem lịch sử:</strong> Tất cả giao dịch được lưu trong localStorage</p>
          <p>• <strong>Thống kê:</strong> Xem tổng quan chi tiêu và nhận token</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentDemo;
