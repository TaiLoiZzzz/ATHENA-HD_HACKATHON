'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { safeSlice, formatCurrency, formatTokens } from '@/utils/paymentHelpers';

interface MarketplaceOrder {
  id: string;
  orderType: 'buy' | 'sell';
  amount: number;
  filledAmount: number;
  remainingAmount: number;
  pricePerToken: number;
  totalValue: number;
  status: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderBookData {
  buyOrders: MarketplaceOrder[];
  sellOrders: MarketplaceOrder[];
  recentTrades: any[];
  marketStats: {
    currentPrice: number;
    volume24h: number;
    priceChange24h: number;
    highestBid: number;
    lowestAsk: number;
  };
}

export default function MarketplacePage() {
  const { user, isAuthenticated } = useAuth();
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [myOrders, setMyOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({
    type: 'buy' as 'buy' | 'sell',
    amount: '',
    price: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchMarketplaceData();
      fetchMyOrders();
    }
  }, [isAuthenticated]);

  const fetchMarketplaceData = async () => {
    try {
      const token = document.cookie.split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch('/api/marketplace/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrderBook(data);
      }
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
      toast.error('Không thể tải dữ liệu marketplace');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const token = document.cookie.split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch('/api/marketplace/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch my orders:', error);
    }
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = document.cookie.split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderType: orderForm.type,
          amount: parseFloat(orderForm.amount),
          pricePerToken: parseFloat(orderForm.price)
        })
      });

      if (response.ok) {
        toast.success('Lệnh đã được tạo thành công');
        setShowCreateOrder(false);
        setOrderForm({ type: 'buy', amount: '', price: '' });
        fetchMarketplaceData();
        fetchMyOrders();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo lệnh');
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const token = document.cookie.split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch(`/api/marketplace/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Lệnh đã được hủy');
        fetchMarketplaceData();
        fetchMyOrders();
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (error) {
      toast.error('Không thể hủy lệnh');
    }
  };


  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Đăng nhập để truy cập Marketplace</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">SOV Token Marketplace</h1>
            <p className="text-gray-600 mt-2">Mua bán SOV Token với giá tốt nhất</p>
          </div>

          {/* Market Stats */}
          {orderBook?.marketStats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Giá hiện tại</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(orderBook.marketStats.currentPrice)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Khối lượng 24h</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatTokens(orderBook.marketStats.volume24h)} SOV
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  {orderBook.marketStats.priceChange24h >= 0 ? (
                    <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-8 w-8 text-red-500" />
                  )}
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Thay đổi 24h</p>
                    <p className={`text-2xl font-bold ${
                      orderBook.marketStats.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {orderBook.marketStats.priceChange24h >= 0 ? '+' : ''}
                      {orderBook.marketStats.priceChange24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Giá mua cao nhất</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(orderBook.marketStats.highestBid)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Giá bán thấp nhất</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(orderBook.marketStats.lowestAsk)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Book */}
            <div className="lg:col-span-2 space-y-6">
              {/* Buy Orders */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-green-500 mr-2" />
                    Lệnh Mua
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {safeSlice(orderBook?.buyOrders, 0, 10).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(order.pricePerToken)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTokens(order.remainingAmount)} SOV
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(order.remainingAmount * order.pricePerToken)}
                          </td>
                        </tr>
                      ))}
                      {safeSlice(orderBook?.buyOrders, 0, 10).length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                            Chưa có lệnh mua nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sell Orders */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ArrowTrendingDownIcon className="w-5 h-5 text-red-500 mr-2" />
                    Lệnh Bán
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {safeSlice(orderBook?.sellOrders, 0, 10).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                            {formatCurrency(order.pricePerToken)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTokens(order.remainingAmount)} SOV
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(order.remainingAmount * order.pricePerToken)}
                          </td>
                        </tr>
                      ))}
                      {safeSlice(orderBook?.sellOrders, 0, 10).length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                            Chưa có lệnh bán nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Trading Panel */}
            <div className="space-y-6">
              {/* Create Order */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo lệnh</h3>
                
                <form onSubmit={createOrder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại lệnh
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderForm(prev => ({ ...prev, type: 'buy' }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          orderForm.type === 'buy'
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                        }`}
                      >
                        Mua
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderForm(prev => ({ ...prev, type: 'sell' }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          orderForm.type === 'sell'
                            ? 'bg-red-100 text-red-800 border-2 border-red-300'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                        }`}
                      >
                        Bán
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng SOV
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={orderForm.amount}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá (VND/SOV)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={orderForm.price}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="8300.00"
                      required
                    />
                  </div>

                  {orderForm.amount && orderForm.price && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span>Tổng giá trị:</span>
                        <span className="font-semibold">
                          {formatCurrency(parseFloat(orderForm.amount) * parseFloat(orderForm.price))}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full py-2 px-4 rounded-lg font-medium ${
                      orderForm.type === 'buy'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {orderForm.type === 'buy' ? 'Đặt lệnh mua' : 'Đặt lệnh bán'}
                  </button>
                </form>
              </div>

              {/* My Orders */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Lệnh của tôi</h3>
                </div>
                <div className="p-6">
                  {myOrders.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Chưa có lệnh nào</p>
                  ) : (
                    <div className="space-y-3">
                      {myOrders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                order.orderType === 'buy' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {order.orderType === 'buy' ? 'MUA' : 'BÁN'}
                              </span>
                              <p className="text-sm mt-1">
                                {formatTokens(order.remainingAmount)} SOV @ {formatCurrency(order.pricePerToken)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.status}
                              </p>
                            </div>
                            {order.status === 'active' && (
                              <button
                                onClick={() => cancelOrder(order.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Hủy
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
