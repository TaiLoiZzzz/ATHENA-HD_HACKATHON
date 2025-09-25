// Personalization Service for ATHENA Platform
// Handles user preferences, recommendations, and insights

import { mockPersonalization, simulateApiDelay, generateId } from '@/lib/mockData';

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  dashboard: {
    layout: 'grid' | 'list' | 'compact';
    widgets: string[];
  };
}

export interface Recommendation {
  id: string;
  type: 'flight' | 'banking' | 'resort' | 'insurance';
  title: string;
  description: string;
  price?: number;
  savings?: number;
  interestRate?: number;
  currentRate?: number;
  discount?: number;
  priority: 'high' | 'medium' | 'low';
  expiresAt?: string;
  metadata?: any;
}

export interface Insight {
  id: string;
  type: 'spending' | 'earning' | 'saving' | 'trend';
  title: string;
  description: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
}

export interface PersonalizationData {
  preferences: UserPreferences;
  recommendations: Recommendation[];
  insights: Insight[];
  lastUpdated: string;
}

class PersonalizationService {
  private storageKey = 'athena_personalization';

  // Get user personalization data
  async getPersonalizationData(): Promise<PersonalizationData> {
    try {
      await simulateApiDelay(400);
      
      // Try to get from localStorage first
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      }
      
      // Return mock data as fallback
      return mockPersonalization;
    } catch (error) {
      console.error('Failed to get personalization data:', error);
      return mockPersonalization;
    }
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      await simulateApiDelay(300);
      
      const currentData = await this.getPersonalizationData();
      const updatedPreferences = {
        ...currentData.preferences,
        ...preferences
      };
      
      // Update stored data
      const updatedData = {
        ...currentData,
        preferences: updatedPreferences,
        lastUpdated: new Date().toISOString()
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
      }
      
      return updatedPreferences;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }

  // Get personalized recommendations
  async getRecommendations(limit: number = 5): Promise<Recommendation[]> {
    try {
      await simulateApiDelay(500);
      
      const data = await this.getPersonalizationData();
      return data.recommendations.slice(0, limit);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
    }
  }

  // Get user insights
  async getInsights(limit: number = 3): Promise<Insight[]> {
    try {
      await simulateApiDelay(400);
      
      const data = await this.getPersonalizationData();
      return data.insights.slice(0, limit);
    } catch (error) {
      console.error('Failed to get insights:', error);
      return [];
    }
  }

  // Add new recommendation
  async addRecommendation(recommendation: Omit<Recommendation, 'id'>): Promise<Recommendation> {
    try {
      await simulateApiDelay(300);
      
      const newRecommendation: Recommendation = {
        id: generateId('rec'),
        ...recommendation
      };
      
      const currentData = await this.getPersonalizationData();
      const updatedData = {
        ...currentData,
        recommendations: [newRecommendation, ...currentData.recommendations],
        lastUpdated: new Date().toISOString()
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
      }
      
      return newRecommendation;
    } catch (error) {
      console.error('Failed to add recommendation:', error);
      throw error;
    }
  }

  // Dismiss recommendation
  async dismissRecommendation(recommendationId: string): Promise<boolean> {
    try {
      await simulateApiDelay(200);
      
      const currentData = await this.getPersonalizationData();
      const updatedRecommendations = currentData.recommendations.filter(
        rec => rec.id !== recommendationId
      );
      
      const updatedData = {
        ...currentData,
        recommendations: updatedRecommendations,
        lastUpdated: new Date().toISOString()
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to dismiss recommendation:', error);
      return false;
    }
  }

  // Get personalized dashboard layout
  async getDashboardLayout(): Promise<{
    layout: string;
    widgets: string[];
    customizations: any;
  }> {
    try {
      await simulateApiDelay(300);
      
      const data = await this.getPersonalizationData();
      return {
        layout: data.preferences.dashboard.layout,
        widgets: data.preferences.dashboard.widgets,
        customizations: {
          theme: data.preferences.theme,
          language: data.preferences.language,
          currency: data.preferences.currency
        }
      };
    } catch (error) {
      console.error('Failed to get dashboard layout:', error);
      return {
        layout: 'grid',
        widgets: ['portfolio', 'transactions', 'ranking'],
        customizations: {
          theme: 'dark',
          language: 'vi',
          currency: 'VND'
        }
      };
    }
  }

  // Update dashboard layout
  async updateDashboardLayout(layout: string, widgets: string[]): Promise<boolean> {
    try {
      await simulateApiDelay(300);
      
      const currentData = await this.getPersonalizationData();
      const updatedData = {
        ...currentData,
        preferences: {
          ...currentData.preferences,
          dashboard: {
            layout: layout as 'grid' | 'list' | 'compact',
            widgets
          }
        },
        lastUpdated: new Date().toISOString()
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(updatedData));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update dashboard layout:', error);
      return false;
    }
  }

  // Get user behavior insights
  async getBehaviorInsights(): Promise<{
    spendingPattern: string;
    preferredServices: string[];
    activityLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  }> {
    try {
      await simulateApiDelay(600);
      
      // Simulate AI-powered insights based on user data
      return {
        spendingPattern: 'Consistent monthly spending with occasional spikes',
        preferredServices: ['Flight Booking', 'Banking Services', 'Resort Booking'],
        activityLevel: 'high',
        recommendations: [
          'Consider upgrading to ATHENA Prime for better rewards',
          'Try our new insurance products for comprehensive coverage',
        ]
      };
    } catch (error) {
      console.error('Failed to get behavior insights:', error);
      return {
        spendingPattern: 'Regular user',
        preferredServices: ['Flight Booking'],
        activityLevel: 'medium',
        recommendations: ['Explore more services to maximize your rewards']
      };
    }
  }

  // Clear all personalization data
  async clearPersonalizationData(): Promise<boolean> {
    try {
      await simulateApiDelay(200);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.storageKey);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear personalization data:', error);
      return false;
    }
  }

  // Export personalization data
  async exportPersonalizationData(): Promise<string> {
    try {
      await simulateApiDelay(300);
      
      const data = await this.getPersonalizationData();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export personalization data:', error);
      throw error;
    }
  }

  // Import personalization data
  async importPersonalizationData(dataString: string): Promise<boolean> {
    try {
      await simulateApiDelay(400);
      
      const data = JSON.parse(dataString);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import personalization data:', error);
      return false;
    }
  }
}

export const personalizationService = new PersonalizationService();
export default personalizationService;

