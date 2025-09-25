'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  CreditCardIcon,
  TagIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import InlineBonusDisplay from '@/components/UserTier/InlineBonusDisplay';
import EnhancedPayment from '@/components/Payment/EnhancedPayment';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  serviceType: string;
  serviceItemId: string;
  quantity: number;
  price: number;
  subtotal: number;
  metadata?: any;
  estimatedTokens: number;
  addedAt: string;
}

interface CartSummary {
  totalItems: number;
  totalAmount: number;
  estimatedTokens: number;
  isAthenaPrime: boolean;
  currency: string;
}

export default function CartPage() {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const token = document.cookie.split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
        setCartSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      return removeItem(itemId);
    }

    try {
      const token = document.cookie.split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        fetchCart();
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const token = document.cookie.split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Đã xóa khỏi giỏ hàng');
        fetchCart();
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
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

  const getServiceIcon = (serviceType: string) => {
    const icons = {
      'vietjet': '✈️',
      'hdbank': '🏦',
      'resort': '🏨',
      'insurance': '🛡️'
    };
    return icons[serviceType as keyof typeof icons] || '🛍️';
  };

  const getServiceName = (serviceType: string) => {
    const names = {
      'vietjet': 'Vietjet Air',
      'hdbank': 'HD Bank',
      'resort': 'Resort Booking',
      'insurance': 'Insurance'
    };
    return names[serviceType as keyof typeof names] || serviceType;
  };

  const renderItemDetails = (item: CartItem) => {
    const metadata = item.metadata || {};
    
    switch (item.serviceType) {
      case 'vietjet':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span>{metadata.date || 'Ngày chưa xác định'}</span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span>{metadata.route || 'Tuyến bay chưa xác định'}</span>
            </div>
            <p>Hành khách: {metadata.passengers || 1}</p>
            <p>Hạng: {metadata.class || 'Economy'}</p>
          </div>
        );
      
      case 'resort':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span>Check-in: {metadata.checkin || 'Chưa xác định'}</span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span>{metadata.location || 'Địa điểm chưa xác định'}</span>
            </div>
            <p>Số đêm: {metadata.nights || 1}</p>
            <p>Số khách: {metadata.guests || 2}</p>
          </div>
        );
      
      case 'hdbank':
        return (
          <div className="text-sm text-gray-600">
            <p>Sản phẩm: {metadata.product || 'Sản phẩm ngân hàng'}</p>
            <p>Kỳ hạn: {metadata.term || 'Chưa xác định'}</p>
            {metadata.amount && <p>Số tiền: {formatCurrency(metadata.amount)}</p>}
          </div>
        );
      
      case 'insurance':
        return (
          <div className="text-sm text-gray-600">
            <p>Loại: {metadata.type || 'Bảo hiểm'}</p>
            <p>Thời hạn: {metadata.duration || 'Chưa xác định'}</p>
            <p>Bảo hiểm: {formatCurrency(metadata.coverage || 0)}</p>
          </div>
        );
      
      default:
        return <p className="text-sm text-gray-600">Chi tiết sản phẩm</p>;
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ShoppingCartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Đăng nhập để xem giỏ hàng</h1>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShoppingCartIcon className="w-8 h-8 mr-3" />
              Giỏ hàng của bạn
            </h1>
            {cartSummary && (
              <p className="text-gray-600 mt-2">
                {cartSummary.totalItems} sản phẩm - {formatCurrency(cartSummary.totalAmount)}
              </p>
            )}
            
            {/* Bonus Display */}
            <InlineBonusDisplay
              serviceType="cart"
              amount={cartSummary?.totalAmount || 0}
              category="shopping"
              position="top"
              size="medium"
            />
          </div>

          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-12 text-center"
            >
              <ShoppingCartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h2>
              <p className="text-gray-600 mb-6">Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/vietjet"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Đặt vé máy bay
                </a>
                <a
                  href="/hdbank"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Sản phẩm ngân hàng
                </a>
                <a
                  href="/sovico"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Dịch vụ du lịch
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{getServiceIcon(item.serviceType)}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getServiceName(item.serviceType)}
                          </h3>
                          {renderItemDetails(item)}
                          
                          <div className="mt-3 flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                              >
                                <MinusIcon className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                              >
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <TagIcon className="w-4 h-4" />
                              <span>Earn {formatTokens(item.estimatedTokens)} SOV</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(item.subtotal)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.price)} x {item.quantity}
                        </p>
                        
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowPayment(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Thanh toán ngay
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="space-y-6">
                {cartSummary && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl shadow-sm p-6 sticky top-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số sản phẩm:</span>
                        <span className="font-medium">{cartSummary.totalItems}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng tiền:</span>
                        <span className="font-bold text-lg">{formatCurrency(cartSummary.totalAmount)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Token sẽ nhận:</span>
                        <span className="font-medium text-green-600">
                          {formatTokens(cartSummary.estimatedTokens)} SOV
                        </span>
                      </div>
                      
                      {cartSummary.isAthenaPrime && (
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-sm text-purple-700 font-medium">
                            ⭐ ATHENA Prime: +50% bonus tokens
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <button
                        onClick={() => setShowPayment(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center"
                      >
                        <CreditCardIcon className="w-5 h-5 mr-2" />
                        Thanh toán tất cả
                      </button>
                      
                      <a
                        href="/vikkibank"
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors text-center block"
                      >
                        Tiếp tục mua sắm
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Payment Modal */}
          {showPayment && cartSummary && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Thanh toán</h2>
                    <button
                      onClick={() => {
                        setShowPayment(false);
                        setSelectedItem(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <EnhancedPayment
                    serviceType={selectedItem?.serviceType || 'cart'}
                    serviceName={selectedItem ? `${getServiceName(selectedItem.serviceType)}` : 'Giỏ hàng'}
                    baseAmount={selectedItem?.subtotal || cartSummary.totalAmount}
                    tokenAmount={selectedItem?.estimatedTokens || cartSummary.estimatedTokens}
                    description={selectedItem ? `Thanh toán ${getServiceName(selectedItem.serviceType)}` : 'Thanh toán giỏ hàng'}
                    serviceReferenceId={selectedItem?.id}
                    onPaymentSuccess={(result) => {
                      toast.success('Thanh toán thành công!');
                      setShowPayment(false);
                      setSelectedItem(null);
                      fetchCart();
                    }}
                    onPaymentError={(error) => {
                      toast.error(error);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}


