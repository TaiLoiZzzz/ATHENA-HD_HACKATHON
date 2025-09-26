'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface PurchaseRecord {
  id: string;
  voucherName: string;
  voucherImage: string;
  purchaseDate: string;
  tokenPrice: number;
  status: 'active' | 'used' | 'expired';
  expiryDate: string;
  voucherCode: string;
  category: string;
  benefits: string[];
}

interface PurchaseHistoryProps {
  purchases: PurchaseRecord[];
}

export default function PurchaseHistory({ purchases }: PurchaseHistoryProps) {
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircleIcon,
          text: 'Đang hoạt động'
        };
      case 'used':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: CheckCircleIcon,
          text: 'Đã sử dụng'
        };
      case 'expired':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: ExclamationTriangleIcon,
          text: 'Đã hết hạn'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: ClockIcon,
          text: 'Không xác định'
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã sao chép vào clipboard!');
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Lịch sử mua voucher</h3>
        <div className="text-sm text-gray-600">
          {purchases.length} voucher đã mua
        </div>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <GiftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có voucher nào
          </h4>
          <p className="text-gray-600 mb-4">
            Hãy khám phá Voucher Vault để mua voucher đầu tiên!
          </p>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors">
            Khám phá ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase, index) => {
            const statusConfig = getStatusConfig(purchase.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  {/* Voucher Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img
                      src={purchase.voucherImage}
                      alt={purchase.voucherName}
                      className="w-12 h-12 object-contain"
                    />
                  </div>

                  {/* Purchase Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {purchase.voucherName}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Mua ngày: {formatDate(purchase.purchaseDate)}
                        </p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <CurrencyDollarIcon className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {purchase.tokenPrice.toLocaleString()} ATHENA
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Hết hạn: {formatDate(purchase.expiryDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
                        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                        <span className={`text-sm font-medium ${statusConfig.color}`}>
                          {statusConfig.text}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3 mt-4">
                      <button
                        onClick={() => {
                          setSelectedPurchase(purchase);
                          setShowDetails(true);
                        }}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Xem chi tiết</span>
                      </button>

                      {purchase.status === 'active' && (
                      <button
                        onClick={() => copyToClipboard(purchase.voucherCode)}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Sao chép mã</span>
                      </button>
                      )}

                      <button
                        onClick={() => copyToClipboard(`Tôi vừa mua voucher ${purchase.voucherName} trên ATHENA HD!`)}
                        className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <ShareIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Chia sẻ</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Purchase Details Modal */}
      {showDetails && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Chi tiết voucher
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Voucher Info */}
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img
                    src={selectedPurchase.voucherImage}
                    alt={selectedPurchase.voucherName}
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedPurchase.voucherName}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Danh mục: {selectedPurchase.category}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Mua ngày:</span>
                      <p className="font-medium">{formatDate(selectedPurchase.purchaseDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Hết hạn:</span>
                      <p className="font-medium">{formatDate(selectedPurchase.expiryDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voucher Code */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Mã voucher:</h5>
                <div className="flex items-center space-x-3">
                  <code className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 font-mono text-lg">
                    {selectedPurchase.voucherCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(selectedPurchase.voucherCode)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Sao chép
                  </button>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Lợi ích:</h5>
                <ul className="space-y-2">
                  {selectedPurchase.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Purchase Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Tóm tắt giao dịch:</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Đã thanh toán:</span>
                    <p className="font-bold text-purple-600">
                      {selectedPurchase.tokenPrice.toLocaleString()} ATHENA
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <p className="font-medium">
                      {getStatusConfig(selectedPurchase.status).text}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              {selectedPurchase.status === 'active' && (
                <button
                  onClick={() => copyToClipboard(selectedPurchase.voucherCode)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  Sử dụng voucher
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
