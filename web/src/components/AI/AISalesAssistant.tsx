'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  GiftIcon,
  StarIcon,
  BoltIcon,
  HeartIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { aiPersonalizationService } from '@/services/aiPersonalizationService';
import { sovTokenService } from '@/services/sovTokenService';

interface AISalesMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  metadata?: {
    productId?: string;
    confidence?: number;
    urgency?: string;
    tokens?: number;
  };
}

interface AISalesAssistantProps {
  className?: string;
  onProductSelect?: (productId: string) => void;
}

const AISalesAssistant: React.FC<AISalesAssistantProps> = ({ 
  className = '',
  onProductSelect 
}) => {
  const [messages, setMessages] = useState<AISalesMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
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
        transactionHistory: []
      };
      setUserProfile(userProfile);

      // Get AI recommendations
      const [news, products] = await Promise.all([
        aiPersonalizationService.getNewsAnalysis(),
        aiPersonalizationService.getAvailableProducts()
      ]);

      const aiRecommendations = await aiPersonalizationService.getPersonalizedRecommendations(
        userProfile,
        news,
        products
      );
      
      setRecommendations(aiRecommendations);

      // Start conversation
      const welcomeMessage: AISalesMessage = {
        id: 'welcome',
        type: 'ai',
        content: `Xin chào! Tôi là AI Sales Assistant của ATHENA-HD. Tôi thấy bạn đang ở rank ${userProfile.rank} với ${wallet.balance} SOV tokens. Tôi có một số lời khuyên tối ưu để giúp bạn kiếm thêm tokens và tận dụng tối đa lợi ích của rank ${userProfile.rank}!`,
        timestamp: new Date(),
        metadata: {
          confidence: 0.95,
          urgency: 'medium'
        }
      };

      setMessages([welcomeMessage]);
      
      // Auto-send first recommendation
      setTimeout(() => {
        sendAIRecommendation(aiRecommendations[0]);
      }, 2000);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const sendAIRecommendation = (recommendation: any) => {
    if (!recommendation) return;

    setIsTyping(true);
    
    setTimeout(() => {
      const aiMessage: AISalesMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: `🎯 **${recommendation.product.name}**\n\n💰 **Tại sao tôi khuyên bạn:**\n${recommendation.reason}\n\n🚀 **Lợi ích token:**\n${recommendation.tokenOptimization}\n\n💎 **Lời khuyên cá nhân:**\n${recommendation.personalizedMessage}\n\n📊 **Dự kiến nhận:** ${recommendation.expectedTokens} SOV tokens\n📈 **ROI:** ${Math.round(recommendation.roi * 100)}%\n\nBạn có muốn tôi giải thích thêm về sản phẩm này không?`,
        timestamp: new Date(),
        metadata: {
          productId: recommendation.product.id,
          confidence: recommendation.confidence,
          urgency: recommendation.urgency,
          tokens: recommendation.expectedTokens
        }
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const sendUserMessage = (content: string) => {
    const userMessage: AISalesMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(content);
      const aiMessage: AISalesMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('giá') || input.includes('price')) {
      return `💰 **Về giá cả:**\n\nTôi hiểu bạn quan tâm đến giá cả. Với rank ${userProfile?.rank} của bạn, bạn sẽ nhận được:\n\n• **Giảm giá đặc biệt** cho rank ${userProfile?.rank}\n• **Bonus tokens** cao hơn người dùng thường\n• **Ưu tiên** trong các chương trình khuyến mãi\n\nBạn có muốn tôi tính toán chi tiết lợi ích tài chính không?`;
    }
    
    if (input.includes('token') || input.includes('sov')) {
      return `🚀 **Về SOV Tokens:**\n\nVới rank ${userProfile?.rank}, bạn có thể kiếm được:\n\n• **${userProfile?.membershipTier.bonusMultiplier}x** bonus tokens\n• **Ưu tiên** trong các chương trình thưởng\n• **Staking rewards** cao hơn\n• **Governance power** trong hệ thống\n\nBạn muốn tôi giải thích cách tối ưu hóa token earnings không?`;
    }
    
    if (input.includes('tại sao') || input.includes('why')) {
      return `🎯 **Tại sao tôi khuyên bạn:**\n\n1. **Phù hợp với rank:** Sản phẩm này được tối ưu cho rank ${userProfile?.rank}\n2. **ROI cao:** Dự kiến lợi nhuận ${Math.round(recommendations[0]?.roi * 100)}%\n3. **Xu hướng:** Phù hợp với thị trường hiện tại\n4. **Lịch sử:** Dựa trên giao dịch trước đây của bạn\n\nBạn có muốn tôi phân tích chi tiết hơn không?`;
    }
    
    if (input.includes('có') || input.includes('yes') || input.includes('ok')) {
      return `🎉 **Tuyệt vời!**\n\nTôi sẽ hướng dẫn bạn từng bước:\n\n1. **Xem chi tiết** sản phẩm\n2. **Tính toán** lợi ích token\n3. **So sánh** với các lựa chọn khác\n4. **Đặt hàng** với ưu đãi đặc biệt\n\nBạn muốn bắt đầu với bước nào?`;
    }
    
    return `🤖 **Tôi hiểu bạn đang hỏi về:** "${userInput}"\n\nVới rank ${userProfile?.rank} của bạn, tôi khuyên bạn nên:\n\n• **Tập trung** vào các sản phẩm có ROI cao\n• **Tận dụng** bonus multiplier của rank\n• **Theo dõi** xu hướng thị trường\n• **Đa dạng hóa** danh mục đầu tư\n\nBạn có câu hỏi cụ thể nào không?`;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <FireIcon className="w-4 h-4" />;
      case 'medium': return <ClockIcon className="w-4 h-4" />;
      case 'low': return <CheckCircleIcon className="w-4 h-4" />;
      default: return <StarIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Sales Assistant</h3>
              <p className="text-sm text-purple-100">
                Rank {userProfile?.rank} • {userProfile?.currentBalance} SOV
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5" />
            <span className="text-sm font-medium">AI Powered</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${message.type === 'user' ? 'ml-12' : 'mr-12'}`}>
                <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {message.type === 'user' ? (
                      <UserIcon className="w-5 h-5 text-white" />
                    ) : (
                      <SparklesIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="text-sm whitespace-pre-line">{message.content}</div>
                    {message.metadata && (
                      <div className="mt-2 flex items-center space-x-2">
                        {message.metadata.urgency && (
                          <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(message.metadata.urgency)}`}>
                            {getUrgencyIcon(message.metadata.urgency)}
                            <span className="ml-1 capitalize">{message.metadata.urgency}</span>
                          </span>
                        )}
                        {message.metadata.tokens && (
                          <span className="text-xs text-green-600 font-medium">
                            +{message.metadata.tokens} SOV
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-xs lg:max-w-md mr-12">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="border-t p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => sendUserMessage('Tôi muốn biết về giá cả')}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            💰 Giá cả
          </button>
          <button
            onClick={() => sendUserMessage('Lợi ích token như thế nào?')}
            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
          >
            🚀 Tokens
          </button>
          <button
            onClick={() => sendUserMessage('Tại sao khuyên tôi?')}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
          >
            🎯 Lý do
          </button>
          <button
            onClick={() => sendUserMessage('Tôi đồng ý')}
            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200 transition-colors"
          >
            ✅ Đồng ý
          </button>
        </div>

        {/* Input */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                if (input.value.trim()) {
                  sendUserMessage(input.value.trim());
                  input.value = '';
                }
              }
            }}
          />
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISalesAssistant;
