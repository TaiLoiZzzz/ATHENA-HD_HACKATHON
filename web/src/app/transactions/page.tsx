'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import InlineBonusDisplay from '@/components/UserTier/InlineBonusDisplay';
import { apiService } from '@/lib/api';
import { sovTokenService } from '@/services/sovTokenService';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  serviceType?: string;
  serviceReferenceId?: string;
  status: string;
  metadata?: any;
  createdAt: string;
}

interface TransactionAnalytics {
  totalEarned: number;
  totalSpent: number;
  netGain: number;
  transactionCount: number;
  averageTransaction: number;
  topServiceType: string;
}

export default function TransactionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<TransactionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all',
    period: '30',
    status: 'all',
    serviceType: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
      fetchAnalytics();
    }
  }, [isAuthenticated, filter, pagination.page]);

  const fetchTransactions = async () => {
    try {
      // Get transactions from localStorage using sovTokenService
      const allTransactions = sovTokenService.getTransactions();
      
      // Filter transactions based on current filters
      let filteredTransactions = allTransactions;
      
      if (filter.type !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === filter.type);
      }
      
      if (filter.status !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.status === filter.status);
      }
      
      if (filter.serviceType !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.serviceType === filter.serviceType);
      }
      
      // Sort by date (newest first)
      filteredTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setTransactions(filteredTransactions);
      setPagination(prev => ({
        ...prev,
        total: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / pagination.limit)
      }));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Get transactions from localStorage using sovTokenService
      const allTransactions = sovTokenService.getTransactions();
      
      const totalEarned = allTransactions
        .filter(t => t.type === 'earn' && t.status === 'completed')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
      const totalSpent = allTransactions
        .filter(t => t.type === 'spend' && t.status === 'completed')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
      const netGain = totalEarned - totalSpent;
      const transactionCount = allTransactions.length;
      const averageTransaction = transactionCount > 0 ? (totalEarned + totalSpent) / transactionCount : 0;
      
      // Find most common service type
      const serviceCounts = allTransactions.reduce((acc, t) => {
        if (t.serviceType) {
          acc[t.serviceType] = (acc[t.serviceType] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const topServiceType = Object.keys(serviceCounts).reduce((a, b) => 
        serviceCounts[a] > serviceCounts[b] ? a : b, 'general'
      );
      
      setAnalytics({
        totalEarned,
        totalSpent,
        netGain,
        transactionCount,
        averageTransaction,
        topServiceType
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatTokens = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <ArrowDownIcon className="w-5 h-5 text-green-600" />;
      case 'spend':
        return <ArrowUpIcon className="w-5 h-5 text-red-600" />;
      case 'transfer':
        return <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
        return 'text-green-600';
      case 'spend':
        return 'text-red-600';
      case 'transfer':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getServiceDisplayName = (serviceType: string) => {
    const names = {
      'vietjet': 'Vietjet Air',
      'hdbank': 'HD Bank',
      'resort': 'Resort',
      'insurance': 'Bảo hiểm',
    };
    return names[serviceType as keyof typeof names] || serviceType;
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Đăng nhập để xem lịch sử giao dịch</h1>
            <a href="/auth/login" className="text-blue-600 hover:text-blue-800">
              Đăng nhập ngay
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-8 h-8 mr-3" />
              Transaction History
            </h1>
            <p className="text-gray-600 mt-2">Track all your SOV token transactions</p>
            
            {/* Bonus Display */}
            <InlineBonusDisplay
              serviceType="transactions"
              amount={500000}
              category="history"
              position="top"
              size="medium"
            />
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center">
                  <ArrowDownIcon className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tổng nhận</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatTokens(analytics.totalEarned)} SOV
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center">
                  <ArrowUpIcon className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tổng chi</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatTokens(analytics.totalSpent)} SOV
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Lãi/lỗ</p>
                    <p className={`text-2xl font-bold ${
                      analytics.netGain >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {analytics.netGain >= 0 ? '+' : ''}{formatTokens(analytics.netGain)} SOV
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Số giao dịch</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.transactionCount}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Trung bình</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTokens(analytics.averageTransaction)} SOV
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center mb-4">
              <FunnelIcon className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại giao dịch</label>
                <select
                  value={filter.type}
                  onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="earn">Nhận token</option>
                  <option value="spend">Chi tiêu</option>
                  <option value="transfer">Chuyển khoản</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian</label>
                <select
                  value={filter.period}
                  onChange={(e) => setFilter(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7">7 ngày qua</option>
                  <option value="30">30 ngày qua</option>
                  <option value="90">90 ngày qua</option>
                  <option value="365">1 năm qua</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="pending">Đang xử lý</option>
                  <option value="failed">Thất bại</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dịch vụ</label>
                <select
                  value={filter.serviceType}
                  onChange={(e) => setFilter(prev => ({ ...prev, serviceType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="vietjet">Vietjet Air</option>
                  <option value="hdbank">HD Bank</option>
                  <option value="resort">Resort</option>
                  <option value="insurance">Bảo hiểm</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Giao dịch ({pagination.total})
              </h3>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có giao dịch</h3>
                <p className="text-gray-600">Giao dịch của bạn sẽ hiển thị ở đây</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            {transaction.serviceType && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getServiceDisplayName(transaction.serviceType)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-500">
                              {formatDate(transaction.createdAt)}
                            </p>
                            {transaction.serviceReferenceId && (
                              <p className="text-xs text-gray-400">
                                Ref: {transaction.serviceReferenceId}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === 'earn' ? '+' : '-'}
                            {formatTokens(Math.abs(transaction.amount))} SOV
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0">
                          {getStatusIcon(transaction.status)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
                
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Hiển thị <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> đến{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      trong <span className="font-medium">{pagination.total}</span> giao dịch
                    </p>
                  </div>
                  
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Trước
                      </button>
                      
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setPagination(prev => ({ ...prev, page }))}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pagination.page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


