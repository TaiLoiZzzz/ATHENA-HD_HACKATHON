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
       - Name: ${product.name}
       - Price: ${product.price} VND
       - Service Type: ${product.serviceType}
       - Category: ${product.category}
       - Token reward: ${product.tokenReward} SOV
       - Discount: ${product.discount || 0}%
       - Features: ${product.features.join(', ')}
       - Description: ${product.description}`
    ).join('\n\n');

    const transactionHistory = userProfile.transactionHistory?.slice(0, 5).map(tx => 
      `- ${tx.type}: ${tx.amount} SOV - ${tx.description} (${tx.serviceType})`
    ).join('\n') || 'No transaction history';

    return `
You are a professional AI Sales Assistant for the ATHENA-HD system - an integrated multi-service blockchain platform. Your task is to deeply analyze user information and provide product purchase recommendations to optimize tokens based on real data.

=== DETAILED USER INFORMATION ===
- Current Rank: ${userProfile.rank} (${userProfile.membershipTier})
- Total accumulated points: ${userProfile.totalPoints} points
- Tokens earned: ${userProfile.totalEarned} SOV
- Tokens spent: ${userProfile.totalSpent} SOV  
- Current balance: ${userProfile.currentBalance} SOV
- ATHENA Prime member: ${userProfile.isAthenaPrime ? 'Yes' : 'No'}
- Personal preferences: ${userProfile.preferences.join(', ')}
- Recent transaction history:
${transactionHistory}

=== CURRENT MARKET NEWS ===
${newsContext}

=== AVAILABLE PRODUCTS ===
${productsContext}

=== AI SALES TASKS ===
1. DEEP ANALYSIS: Read user information, rank, transaction history and preferences carefully
2. MARKET ANALYSIS: Consider current news to provide recommendations that align with trends
3. TOKEN CALCULATION: Based on rank ${userProfile.rank}, calculate token rewards and multipliers
4. SELECTION: Choose 3-5 optimal products for this user
5. PERSONALIZATION: Provide specific, persuasive and useful recommendations

=== OUTPUT REQUIREMENTS (JSON) ===
Return JSON with exact format:
{
  "recommendations": [
    {
      "productId": "string",
      "reason": "Specific reason why you recommend this product for this user",
      "tokenOptimization": "Description of how to optimize tokens with rank ${userProfile.rank}",
      "urgency": "low|medium|high",
      "confidence": 0.0-1.0,
      "personalizedMessage": "Personalized, friendly and persuasive recommendation",
      "expectedTokens": number,
      "roi": number
    }
  ]
}

=== SALES GUIDELINES ===
- Act as a professional salesperson, knowledgeable about blockchain and tokenomics
- Use friendly, professional and persuasive language
- Provide specific analysis based on rank ${userProfile.rank} and user history
- Give practical, actionable recommendations
- Calculate token rewards accurately based on rank multiplier
- Consider market trends from news to provide appropriate recommendations

Please analyze carefully and provide the best recommendations for this user!
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
        reason: `Optimized for rank ${userProfile.rank}`,
        tokenOptimization: `Earn ${product.tokenReward * tierMultiplier} SOV tokens`,
        urgency: 'medium' as const,
        confidence: 0.7,
        personalizedMessage: `Perfect for your ${userProfile.rank} rank`,
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
          title: "VietJet Air expands international routes, increasing travel opportunities",
          content: "VietJet Air has announced 5 new international routes to popular destinations like Singapore, Bangkok, Tokyo. This creates great opportunities for travel and business, especially suitable for post-COVID-19 travel trends. New flights will have special prices for loyal customers.",
          category: "travel",
          publishedAt: yesterday.toISOString(),
          relevance: 0.95
        },
        {
          title: "HDBank launches premium account package with high interest rates",
          content: "HDBank officially launches new premium account package with interest rates up to 8.5%/year, 2% higher than market. This package is exclusively for VIP customers with minimum balance of 500 million VND. Customers also enjoy many special benefits like free transfers, priority transactions and personal financial consulting.",
          category: "banking",
          publishedAt: yesterday.toISOString(),
          relevance: 0.88
        },
        {
          title: "Sovico Resort summer promotion with special discounted prices",
          content: "Sovico Resort launches 'Summer Paradise 2024' promotion with up to 30% discount on all resort packages. The program includes water sports activities, spa treatments and specialty cuisine. Especially, customers booking this month will receive complimentary dining vouchers worth 500,000 VND.",
          category: "resort",
          publishedAt: yesterday.toISOString(),
          relevance: 0.82
        },
        {
          title: "Vietnam blockchain market shows strong growth",
          content: "According to the latest report, Vietnam's blockchain and cryptocurrency market has grown 45% in Q2 2024. This trend is driven by wider crypto payment adoption and new DeFi projects. Many large enterprises have started integrating blockchain into their business operations.",
          category: "blockchain",
          publishedAt: yesterday.toISOString(),
          relevance: 0.90
        },
        {
          title: "Vikkibank launches next-generation digital banking services",
          content: "Vikkibank has launched a new generation digital banking platform with integrated AI and machine learning. The new system allows customers to manage finances more intelligently with features like spending prediction, automated investment advice and advanced biometric security.",
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
          title: "Financial market shows stability",
          content: "Domestic and international financial markets are showing positive signs of stability",
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
        name: "VietJet Air - Hanoi to Ho Chi Minh City (Round trip)",
        price: 1500000,
        category: "flight",
        serviceType: "vietjet",
        tokenReward: 150,
        discount: 10,
        features: ["Baggage 20kg", "Meal service", "Priority boarding", "Free cancellation"],
        description: "Domestic round-trip flight with many special offers for loyal customers"
      },
      {
        id: "vietjet-flight-002",
        name: "VietJet Air - Hanoi to Singapore",
        price: 3200000,
        category: "flight",
        serviceType: "vietjet",
        tokenReward: 320,
        discount: 15,
        features: ["International flight", "Baggage 30kg", "Meal service", "Entertainment"],
        description: "International flight to Singapore with special discounted prices"
      },
      {
        id: "hdbank-premium-001",
        name: "HDBank Premium Account - VIP",
        price: 500000,
        category: "banking",
        serviceType: "hdbank",
        tokenReward: 50,
        features: ["8.5% annual interest", "Free transfers", "Priority transactions", "Financial consulting"],
        description: "VIP premium account with high interest rates and many special benefits"
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
        description: "Business account with comprehensive business support"
      },
      {
        id: "sovico-resort-001",
        name: "Sovico Resort - Phu Quoc (3 days 2 nights)",
        price: 2500000,
        category: "resort",
        serviceType: "sovico",
        tokenReward: 250,
        discount: 15,
        features: ["Beach view room", "Spa service", "All inclusive", "Airport transfer"],
        description: "Premium resort package in Phu Quoc with beautiful sea view"
      },
      {
        id: "sovico-resort-002",
        name: "Sovico Resort - Da Nang (2 days 1 night)",
        price: 1800000,
        category: "resort",
        serviceType: "sovico",
        tokenReward: 180,
        discount: 20,
        features: ["Mountain view", "Golf course", "Fine dining", "Cultural tour"],
        description: "Resort package in Da Nang with unique cultural experiences"
      },
      {
        id: "vikkibank-digital-001",
        name: "Vikkibank Digital Banking Pro",
        price: 300000,
        category: "banking",
        serviceType: "vikkibank",
        tokenReward: 30,
        features: ["AI assistant", "Smart budgeting", "Investment advice", "Biometric security"],
        description: "Next-generation digital banking service with AI and machine learning"
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
        description: "Premium smartphone with professional camera"
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
        description: "Professional laptop with latest M3 chip"
      }
    ];
  }
}

export const aiPersonalizationService = new AIPersonalizationService();
