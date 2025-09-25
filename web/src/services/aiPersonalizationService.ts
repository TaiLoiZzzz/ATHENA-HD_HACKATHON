'use client';

interface UserProfile {
  rank: string;
  totalPoints: number;
  totalEarned: number;
  totalSpent: number;
  currentBalance: number;
  membershipTier: string;
  isAthenaPrime: boolean;
  preferences: string[];
  transactionHistory: any[];
}

interface NewsItem {
  title: string;
  content: string;
  category: string;
  publishedAt: string;
  relevance: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  serviceType: string;
  tokenReward: number;
  discount?: number;
  features: string[];
  description: string;
}

interface AIRecommendation {
  product: Product;
  reason: string;
  tokenOptimization: string;
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
  personalizedMessage: string;
  expectedTokens: number;
  roi: number;
}

class AIPersonalizationService {
  private apiKey = 'AIzaSyBHHB33PBHt8B4c8AkQCqQBCdTLUuKemWs';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  async getPersonalizedRecommendations(
    userProfile: UserProfile,
    newsItems: NewsItem[],
    availableProducts: Product[]
  ): Promise<AIRecommendation[]> {
    try {
      const prompt = this.buildPersonalizationPrompt(userProfile, newsItems, availableProducts);
      
      console.log('Calling Gemini API with prompt:', prompt);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Gemini API Response:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response structure');
      }
      
      const aiResponse = data.candidates[0].content.parts[0].text;
      console.log('AI Response Text:', aiResponse);
      
      return this.parseAIResponse(aiResponse, availableProducts);
    } catch (error) {
      console.error('AI Personalization Error:', error);
      return this.getFallbackRecommendations(userProfile, availableProducts);
    }
  }

  private buildPersonalizationPrompt(
    userProfile: UserProfile,
    newsItems: NewsItem[],
    availableProducts: Product[]
  ): string {
    const newsContext = newsItems.map(item => 
      `- ${item.title}: ${item.content.substring(0, 200)}... (Relevance: ${item.relevance})`
    ).join('\n');

    const productsContext = availableProducts.map(product => 
      `- ID: ${product.id}
       - Tên: ${product.name}
       - Giá: ${product.price} VND
       - Loại dịch vụ: ${product.serviceType}
       - Danh mục: ${product.category}
       - Token reward: ${product.tokenReward} SOV
       - Giảm giá: ${product.discount || 0}%
       - Tính năng: ${product.features.join(', ')}
       - Mô tả: ${product.description}`
    ).join('\n\n');

    const transactionHistory = userProfile.transactionHistory?.slice(0, 5).map(tx => 
      `- ${tx.type}: ${tx.amount} SOV - ${tx.description} (${tx.serviceType})`
    ).join('\n') || 'Chưa có lịch sử giao dịch';

    return `
Bạn là một AI Sales chuyên nghiệp cho hệ thống ATHENA-HD - một nền tảng blockchain tích hợp đa dịch vụ. Nhiệm vụ của bạn là phân tích sâu thông tin user và đưa ra lời khuyên mua sản phẩm tối ưu hóa token dựa trên dữ liệu thực tế.

=== THÔNG TIN USER CHI TIẾT ===
- Rank hiện tại: ${userProfile.rank} (${userProfile.membershipTier})
- Tổng điểm tích lũy: ${userProfile.totalPoints} points
- Token đã kiếm được: ${userProfile.totalEarned} SOV
- Token đã chi tiêu: ${userProfile.totalSpent} SOV  
- Số dư hiện tại: ${userProfile.currentBalance} SOV
- ATHENA Prime member: ${userProfile.isAthenaPrime ? 'Có' : 'Không'}
- Sở thích cá nhân: ${userProfile.preferences.join(', ')}
- Lịch sử giao dịch gần đây:
${transactionHistory}

=== TIN TỨC THỊ TRƯỜNG HIỆN TẠI ===
${newsContext}

=== DANH SÁCH SẢN PHẨM CÓ SẴN ===
${productsContext}

=== NHIỆM VỤ AI SALES ===
1. PHÂN TÍCH SÂU: Đọc kỹ thông tin user, rank, lịch sử giao dịch và sở thích
2. PHÂN TÍCH THỊ TRƯỜNG: Xem xét tin tức hiện tại để đưa ra lời khuyên phù hợp với xu hướng
3. TÍNH TOÁN TOKEN: Dựa trên rank ${userProfile.rank}, tính toán token reward và multiplier
4. CHỌN LỌC: Chọn 3-5 sản phẩm tối ưu nhất cho user này
5. CÁ NHÂN HÓA: Đưa ra lời khuyên cụ thể, thuyết phục và hữu ích

=== YÊU CẦU ĐẦU RA (JSON) ===
Trả về JSON với format chính xác:
{
  "recommendations": [
    {
      "productId": "string",
      "reason": "Lý do cụ thể tại sao khuyên sản phẩm này cho user này",
      "tokenOptimization": "Mô tả cách tối ưu hóa token với rank ${userProfile.rank}",
      "urgency": "low|medium|high",
      "confidence": 0.0-1.0,
      "personalizedMessage": "Lời khuyên cá nhân hóa, thân thiện và thuyết phục",
      "expectedTokens": number,
      "roi": number
    }
  ]
}

=== HƯỚNG DẪN SALES ===
- Đóng vai một sales chuyên nghiệp, am hiểu về blockchain và tokenomics
- Sử dụng ngôn ngữ thân thiện, chuyên nghiệp và thuyết phục
- Phân tích cụ thể dựa trên rank ${userProfile.rank} và lịch sử của user
- Đưa ra lời khuyên thực tế, có thể thực hiện được
- Tính toán chính xác token reward dựa trên rank multiplier
- Xem xét xu hướng thị trường từ tin tức để đưa ra lời khuyên phù hợp

Hãy phân tích kỹ và đưa ra lời khuyên tốt nhất cho user này!
    `;
  }

  private parseAIResponse(aiResponse: string, availableProducts: Product[]): AIRecommendation[] {
    try {
      console.log('Parsing AI response:', aiResponse);
      
      // Try to extract JSON from AI response
      let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      // If no JSON found, try to find JSON array
      if (!jsonMatch) {
        jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      }
      
      // If still no JSON found, try to extract from markdown code blocks
      if (!jsonMatch) {
        const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (codeBlockMatch) {
          jsonMatch = [codeBlockMatch[1]];
        }
      }
      
      if (!jsonMatch) {
        console.error('No JSON found in AI response:', aiResponse);
        throw new Error('No JSON found in AI response');
      }

      const jsonString = jsonMatch[0];
      console.log('Extracted JSON string:', jsonString);
      
      const parsed = JSON.parse(jsonString);
      console.log('Parsed JSON:', parsed);
      
      const recommendations = parsed.recommendations || [];
      console.log('Recommendations array:', recommendations);

      return recommendations.map((rec: any) => {
        const product = availableProducts.find(p => p.id === rec.productId);
        if (!product) {
          console.warn(`Product not found for ID: ${rec.productId}`);
          return null;
        }

        return {
          product,
          reason: rec.reason || 'AI recommendation',
          tokenOptimization: rec.tokenOptimization || 'Optimized for your tier',
          urgency: rec.urgency || 'medium',
          confidence: rec.confidence || 0.8,
          personalizedMessage: rec.personalizedMessage || 'Recommended for you',
          expectedTokens: rec.expectedTokens || product.tokenReward,
          roi: rec.roi || 0.15
        };
      }).filter(Boolean);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('AI Response was:', aiResponse);
      return [];
    }
  }

  private getFallbackRecommendations(
    userProfile: UserProfile,
    availableProducts: Product[]
  ): AIRecommendation[] {
    // Fallback logic based on user tier and preferences
    const tierMultiplier = this.getTierMultiplier(userProfile.membershipTier);
    
    return availableProducts
      .filter(product => product.tokenReward > 0)
      .sort((a, b) => (b.tokenReward * tierMultiplier) - (a.tokenReward * tierMultiplier))
      .slice(0, 3)
      .map(product => ({
        product,
        reason: `Tối ưu cho rank ${userProfile.rank}`,
        tokenOptimization: `Nhận ${product.tokenReward * tierMultiplier} SOV tokens`,
        urgency: 'medium' as const,
        confidence: 0.7,
        personalizedMessage: `Phù hợp với rank ${userProfile.rank} của bạn`,
        expectedTokens: product.tokenReward * tierMultiplier,
        roi: 0.12
      }));
  }

  private getTierMultiplier(tier: string): number {
    switch (tier.toLowerCase()) {
      case 'diamond': return 2.0;
      case 'gold': return 1.5;
      case 'silver': return 1.2;
      case 'bronze': return 1.0;
      default: return 1.0;
    }
  }

  async getNewsAnalysis(): Promise<NewsItem[]> {
    try {
      // Try to fetch real news data from a news API
      // For now, we'll use enhanced mock data that's more realistic
      const currentDate = new Date();
      const yesterday = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      
      return [
        {
          title: "VietJet Air mở rộng đường bay quốc tế, tăng cơ hội du lịch",
          content: "VietJet Air vừa công bố mở thêm 5 đường bay quốc tế mới đến các điểm đến phổ biến như Singapore, Bangkok, Tokyo. Điều này tạo ra cơ hội lớn cho du lịch và kinh doanh, đặc biệt phù hợp với xu hướng du lịch hậu COVID-19. Các chuyến bay mới sẽ có giá ưu đãi đặc biệt cho khách hàng thân thiết.",
          category: "travel",
          publishedAt: yesterday.toISOString(),
          relevance: 0.95
        },
        {
          title: "HDBank ra mắt gói tài khoản premium với lãi suất cao",
          content: "HDBank chính thức ra mắt gói tài khoản premium mới với lãi suất lên đến 8.5%/năm, cao hơn 2% so với thị trường. Gói này dành riêng cho khách hàng VIP với số dư tối thiểu 500 triệu VND. Khách hàng còn được hưởng nhiều ưu đãi đặc biệt như miễn phí chuyển khoản, ưu tiên giao dịch và tư vấn tài chính cá nhân.",
          category: "banking",
          publishedAt: yesterday.toISOString(),
          relevance: 0.88
        },
        {
          title: "Sovico Resort khuyến mãi mùa hè với giá ưu đãi đặc biệt",
          content: "Sovico Resort tung ra chương trình khuyến mãi mùa hè 'Summer Paradise 2024' với giá giảm đến 30% cho tất cả các gói nghỉ dưỡng. Chương trình bao gồm các hoạt động thể thao dưới nước, spa trị liệu và ẩm thực đặc sản. Đặc biệt, khách hàng đặt phòng trong tháng này sẽ được tặng kèm voucher ăn uống trị giá 500,000 VND.",
          category: "resort",
          publishedAt: yesterday.toISOString(),
          relevance: 0.82
        },
        {
          title: "Thị trường blockchain Việt Nam tăng trưởng mạnh",
          content: "Theo báo cáo mới nhất, thị trường blockchain và cryptocurrency tại Việt Nam đã tăng trưởng 45% trong quý 2/2024. Xu hướng này được thúc đẩy bởi việc chấp nhận thanh toán crypto rộng rãi hơn và các dự án DeFi mới. Nhiều doanh nghiệp lớn đã bắt đầu tích hợp blockchain vào hoạt động kinh doanh.",
          category: "blockchain",
          publishedAt: yesterday.toISOString(),
          relevance: 0.90
        },
        {
          title: "Vikkibank ra mắt dịch vụ ngân hàng số thế hệ mới",
          content: "Vikkibank vừa ra mắt nền tảng ngân hàng số thế hệ mới với AI và machine learning tích hợp. Hệ thống mới cho phép khách hàng quản lý tài chính thông minh hơn với các tính năng như dự đoán chi tiêu, tư vấn đầu tư tự động và bảo mật sinh trắc học nâng cao.",
          category: "banking",
          publishedAt: yesterday.toISOString(),
          relevance: 0.85
        }
      ];
    } catch (error) {
      console.error('Failed to fetch news data:', error);
      // Return basic fallback data
      return [
        {
          title: "Thị trường tài chính ổn định",
          content: "Thị trường tài chính trong nước và quốc tế đang có dấu hiệu ổn định tích cực",
          category: "finance",
          publishedAt: new Date().toISOString(),
          relevance: 0.7
        }
      ];
    }
  }

  async getAvailableProducts(): Promise<Product[]> {
    // Enhanced mock products data with more realistic information
    return [
      {
        id: "vietjet-flight-001",
        name: "VietJet Air - Hà Nội đến TP.HCM (Khứ hồi)",
        price: 1500000,
        category: "flight",
        serviceType: "vietjet",
        tokenReward: 150,
        discount: 10,
        features: ["Baggage 20kg", "Meal service", "Priority boarding", "Free cancellation"],
        description: "Chuyến bay nội địa khứ hồi với nhiều ưu đãi đặc biệt cho khách hàng thân thiết"
      },
      {
        id: "vietjet-flight-002",
        name: "VietJet Air - Hà Nội đến Singapore",
        price: 3200000,
        category: "flight",
        serviceType: "vietjet",
        tokenReward: 320,
        discount: 15,
        features: ["International flight", "Baggage 30kg", "Meal service", "Entertainment"],
        description: "Chuyến bay quốc tế đến Singapore với giá ưu đãi đặc biệt"
      },
      {
        id: "hdbank-premium-001",
        name: "HDBank Premium Account - VIP",
        price: 500000,
        category: "banking",
        serviceType: "hdbank",
        tokenReward: 50,
        features: ["Lãi suất 8.5%/năm", "Miễn phí chuyển khoản", "Ưu tiên giao dịch", "Tư vấn tài chính"],
        description: "Tài khoản premium VIP với lãi suất cao và nhiều ưu đãi đặc biệt"
      },
      {
        id: "hdbank-premium-002",
        name: "HDBank Business Account",
        price: 1000000,
        category: "banking",
        serviceType: "hdbank",
        tokenReward: 100,
        discount: 5,
        features: ["Business support", "High transaction limit", "Multi-currency", "24/7 support"],
        description: "Tài khoản doanh nghiệp với hỗ trợ kinh doanh toàn diện"
      },
      {
        id: "sovico-resort-001",
        name: "Sovico Resort - Phú Quốc (3 ngày 2 đêm)",
        price: 2500000,
        category: "resort",
        serviceType: "sovico",
        tokenReward: 250,
        discount: 15,
        features: ["Beach view room", "Spa service", "All inclusive", "Airport transfer"],
        description: "Gói nghỉ dưỡng cao cấp tại Phú Quốc với view biển tuyệt đẹp"
      },
      {
        id: "sovico-resort-002",
        name: "Sovico Resort - Đà Nẵng (2 ngày 1 đêm)",
        price: 1800000,
        category: "resort",
        serviceType: "sovico",
        tokenReward: 180,
        discount: 20,
        features: ["Mountain view", "Golf course", "Fine dining", "Cultural tour"],
        description: "Gói nghỉ dưỡng tại Đà Nẵng với trải nghiệm văn hóa đặc sắc"
      },
      {
        id: "vikkibank-digital-001",
        name: "Vikkibank Digital Banking Pro",
        price: 300000,
        category: "banking",
        serviceType: "vikkibank",
        tokenReward: 30,
        features: ["AI assistant", "Smart budgeting", "Investment advice", "Biometric security"],
        description: "Dịch vụ ngân hàng số thế hệ mới với AI và machine learning"
      },
      {
        id: "marketplace-electronics-001",
        name: "iPhone 15 Pro Max 256GB",
        price: 35000000,
        category: "electronics",
        serviceType: "marketplace",
        tokenReward: 3500,
        discount: 8,
        features: ["Latest model", "256GB storage", "Pro camera", "5G support"],
        description: "Điện thoại thông minh cao cấp với camera chuyên nghiệp"
      },
      {
        id: "marketplace-electronics-002",
        name: "MacBook Pro M3 14-inch",
        price: 45000000,
        category: "electronics",
        serviceType: "marketplace",
        tokenReward: 4500,
        discount: 12,
        features: ["M3 chip", "14-inch display", "16GB RAM", "512GB SSD"],
        description: "Laptop chuyên nghiệp với chip M3 mới nhất"
      }
    ];
  }
}

export const aiPersonalizationService = new AIPersonalizationService();
