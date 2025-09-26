'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

interface VikkibankDashboardProps {
  className?: string;
}

const VikkibankDashboard: React.FC<VikkibankDashboardProps> = ({ className = '' }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [myServices, setMyServices] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, servicesData, transactionsData, myServicesData] = await Promise.all([
        apiService.getVikkibankProducts(),
        apiService.getVikkibankServices(),
        apiService.getVikkibankTransactions(1, 5),
        apiService.getVikkibankMyServices()
      ]);
      
      setProducts(productsData.products);
      setServices(servicesData.services);
      setTransactions(transactionsData.transactions);
      setMyServices(myServicesData);
    } catch (error) {
      console.error('Failed to load Vikkibank data:', error);
      toast.error('Failed to load Vikkibank data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />;
      case 'withdrawal':
        return <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />;
      case 'transfer':
        return <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />;
      case 'payment':
        return <CreditCardIcon className="w-5 h-5 text-purple-600" />;
      case 'investment':
        return <ChartBarIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />;
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-green-50 rounded-2xl p-4 shadow-lg mr-6">
            <img 
              src="/VikkiBank.jpg" 
              alt="Vikkibank Logo" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <h2 className="text-4xl font-bold text-gray-900">
            Vikkibank Digital Banking
          </h2>
        </div>
        <p className="text-gray-600">
          Smart digital banking with SOV token integration
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'products', label: 'Products', icon: BuildingOfficeIcon },
            { id: 'services', label: 'Services', icon: CreditCardIcon },
            { id: 'transactions', label: 'Transactions', icon: CurrencyDollarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                selectedTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* My Services Summary */}
          {myServices && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Accounts</p>
                    <p className="text-2xl font-bold text-gray-900">{myServices.summary.totalAccounts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(myServices.summary.totalBalance)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCardIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Credit Cards</p>
                    <p className="text-2xl font-bold text-gray-900">{myServices.summary.activeCreditCards}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Investments</p>
                    <p className="text-2xl font-bold text-gray-900">{myServices.summary.activeInvestments}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-blue-600">
                        +{transaction.sovTokens} SOV
                      </p>
                    </div>
                    {getStatusIcon(transaction.status)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Products Tab */}
      {selectedTab === 'products' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-50 rounded-lg p-2 mt-1">
                    <img 
                      src="/VikkiBank.jpg" 
                      alt="Vikkibank" 
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {product.interestRate?.annual || product.applicableRate?.annual}%
                  </div>
                  <div className="text-xs text-gray-500">Lãi suất</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SOV Token Rate:</span>
                  <span className="font-medium text-blue-600">
                    {product.interestRate?.sovToken || product.applicableRate?.sovToken}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Min Deposit:</span>
                  <span className="font-medium">
                    {formatCurrency(product.minDeposit || product.minAmount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-900">Tính năng:</h4>
                <div className="flex flex-wrap gap-1">
                  {product.features.slice(0, 3).map((feature: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <span>  join</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Services Tab */}
      {selectedTab === 'services' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-50 rounded-lg p-2 mt-1">
                    <img 
                      src="/VikkiBank.jpg" 
                      alt="Vikkibank" 
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(service.fee.fiat)}
                  </div>
                  <div className="text-xs text-gray-500">Phí dịch vụ</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SOV Token Fee:</span>
                  <span className="font-medium text-blue-600">
                    {service.fee.sovToken} SOV
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thời gian xử lý:</span>
                  <span className="font-medium">{service.processingTime}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-900">Tính năng:</h4>
                <div className="flex flex-wrap gap-1">
                  {service.features.map((feature: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <span>Use</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Transactions Tab */}
      {selectedTab === 'transactions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-blue-600">
                      +{transaction.sovTokens} SOV
                    </p>
                  </div>
                  {getStatusIcon(transaction.status)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VikkibankDashboard;
