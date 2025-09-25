'use client';

import { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { aiPersonalizationService } from '@/services/aiPersonalizationService';
import { sovTokenService } from '@/services/sovTokenService';

export default function AITest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<any>(null);

  const runAITest = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Load user profile
      const wallet = sovTokenService.getWallet();
      const stats = sovTokenService.getWalletStats();
      const userProfile = {
        rank: stats.membershipTier.name,
        totalPoints: wallet.totalEarned,
        totalEarned: wallet.totalEarned,
        totalSpent: wallet.totalSpent,
        currentBalance: wallet.balance,
        membershipTier: stats.membershipTier.name,
        isAthenaPrime: true,
        preferences: ['travel', 'banking', 'resort'],
        transactionHistory: [
          { type: 'earn', amount: 100, description: 'Flight booking reward', serviceType: 'vietjet' },
          { type: 'spend', amount: -50, description: 'Banking service fee', serviceType: 'hdbank' },
          { type: 'earn', amount: 200, description: 'Resort booking bonus', serviceType: 'sovico' }
        ]
      };

      // Get news and products
      const [news, products] = await Promise.all([
        aiPersonalizationService.getNewsAnalysis(),
        aiPersonalizationService.getAvailableProducts()
      ]);

      setTestData({
        userProfile,
        news,
        products
      });

      console.log('Test Data:', { userProfile, news, products });

      // Call AI API
      const recommendations = await aiPersonalizationService.getPersonalizedRecommendations(
        userProfile,
        news,
        products
      );

      setResult({
        recommendations,
        userProfile,
        news,
        products
      });

      console.log('AI Test Result:', recommendations);
    } catch (err: any) {
      console.error('AI Test Error:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center space-x-3 mb-4">
                <CpuChipIcon className="w-12 h-12" />
                <h1 className="text-4xl font-bold">AI Test Dashboard</h1>
              </div>
              <p className="text-xl text-purple-100">
                Test Gemini 2.5 Flash API với dữ liệu thực tế
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Test Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <button
              onClick={runAITest}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Đang test AI...</span>
                </>
              ) : (
                <>
                  <CpuChipIcon className="w-6 h-6" />
                  <span>Test Gemini API</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <h3 className="text-lg font-semibold text-gray-900">Đang gọi Gemini API...</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Đang tải dữ liệu user...</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Đang tải tin tức thị trường...</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Đang tải danh sách sản phẩm...</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Đang gọi Gemini 2.5 Flash API...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <XCircleIcon className="w-8 h-8 text-red-500" />
                <h3 className="text-lg font-semibold text-red-900">Lỗi API</h3>
              </div>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="bg-red-100 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>Gợi ý khắc phục:</strong>
                </p>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• Kiểm tra API key có đúng không</li>
                  <li>• Kiểm tra kết nối internet</li>
                  <li>• Kiểm tra console để xem chi tiết lỗi</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Success Header */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                  <h3 className="text-lg font-semibold text-green-900">Test thành công!</h3>
                </div>
                <p className="text-green-700">
                  Gemini API đã trả về {result.recommendations?.length || 0} lời khuyên cá nhân hóa
                </p>
              </div>

              {/* AI Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">AI Recommendations</h3>
                  <div className="space-y-4">
                    {result.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{rec.product?.name}</h4>
                          <span className="text-sm text-gray-500">
                            Confidence: {Math.round((rec.confidence || 0) * 100)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                        <p className="text-sm text-blue-600 mb-2">{rec.personalizedMessage}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-green-600 font-medium">
                            +{rec.expectedTokens} SOV
                          </span>
                          <span className="text-blue-600 font-medium">
                            ROI: {Math.round((rec.roi || 0) * 100)}%
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            rec.urgency === 'high' ? 'bg-red-100 text-red-600' :
                            rec.urgency === 'medium' ? 'bg-orange-100 text-orange-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {rec.urgency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Data */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Test Data</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">User Profile</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-xs text-gray-700 overflow-auto">
                        {JSON.stringify(result.userProfile, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">News Items</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-xs text-gray-700 overflow-auto">
                        {JSON.stringify(result.news, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw API Response */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Raw API Response</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <pre className="text-xs text-gray-700 overflow-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Hướng dẫn Test</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>1. API Key:</strong> AIzaSyBHHB33PBHt8B4c8AkQCqQBCdTLUuKemWs</p>
              <p><strong>2. Model:</strong> Gemini 2.5 Flash Experimental</p>
              <p><strong>3. Endpoint:</strong> https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent</p>
              <p><strong>4. Dữ liệu test:</strong> User profile, tin tức thị trường, danh sách sản phẩm</p>
              <p><strong>5. Kết quả mong đợi:</strong> AI sẽ phân tích và đưa ra lời khuyên cá nhân hóa</p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
