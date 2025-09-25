import api from '@/lib/api';

export interface UserRank {
  name: string;
  level: number;
  icon: string;
  color: string;
  bonusMultiplier: number;
  benefits: string[];
  minPoints: number;
  maxPoints?: number;
}

export interface RankingProgress {
  totalPoints: number;
  totalSpent: number;
  totalTransactions: number;
  servicesUsed: Record<string, number>;
  pointsToNextRank: number;
}

export interface UserRanking {
  rank: UserRank;
  totalPoints: number;
  totalSpent: number;
  totalTransactions: number;
  servicesUsed: Record<string, number>;
  achievements: string[];
  nextRankPoints?: number;
  bonusMultiplier: number;
}

export interface ServiceBonus {
  eligible: boolean;
  amount: number;
  baseAmount: number;
  percentageBonus: number;
  maxBonus: number;
  minSpendingRequired: number;
  description: string;
  userRank: {
    name: string;
    color: string;
    icon: string;
    level: number;
    bonusMultiplier: number;
  };
  transactionAmount: number;
  message: string;
}

export interface RankingHistory {
  id: string;
  activityType: string;
  pointsEarned: number;
  serviceType?: string;
  oldRank?: {
    name: string;
    icon: string;
  };
  newRank?: {
    name: string;
    icon: string;
  };
  transaction?: {
    description: string;
    amount: number;
  };
  metadata?: any;
  createdAt: string;
}

export interface LeaderboardEntry {
  position: number;
  user: {
    name: string;
    email: string;
  };
  stats: {
    totalPoints: number;
    totalSpent: number;
    totalTransactions: number;
  };
  rank: {
    name: string;
    level: number;
    icon: string;
    color: string;
  };
}

class RankingService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1] || null;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`/api/ranking${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  async getUserRanking(): Promise<UserRanking> {
    try {
      const response = await this.makeRequest<{ ranking: UserRanking }>('/ranking/user-rank');
      return response.ranking;
    } catch (error) {
      console.error('Failed to fetch user ranking:', error);
      // Return default Bronze rank matching UserRanking interface
      return {
        rank: {
          name: 'Bronze',
          level: 1,
          icon: '🥉',
          color: '#F97316',
          bonusMultiplier: 1.0,
          benefits: ['Welcome bonus', 'Basic support'],
          minPoints: 0,
          maxPoints: 999
        },
        totalPoints: 0,
        totalSpent: 0,
        totalTransactions: 0,
        servicesUsed: {},
        achievements: [],
        nextRankPoints: 1000,
        bonusMultiplier: 1.0
      };
    }
  }

  async getServiceBonus(serviceType: string, amount: number = 0, category?: string): Promise<ServiceBonus | null> {
    try {
      const params = new URLSearchParams({
        amount: amount.toString()
      });
      
      if (category) {
        params.append('category', category);
      }

      const response = await this.makeRequest<any>(`/ranking/service-bonus/${serviceType}?${params}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch service bonus:', error);
      return null;
    }
  }

  async getAllRanks(): Promise<UserRank[]> {
    try {
      const response = await this.makeRequest<{ ranks: UserRank[] }>('/ranks');
      return response.ranks;
    } catch (error) {
      console.error('Failed to fetch ranks:', error);
      return [];
    }
  }

  async getLeaderboard(limit: number = 10, offset: number = 0): Promise<LeaderboardEntry[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await this.makeRequest<{ leaderboard: LeaderboardEntry[] }>(`/leaderboard?${params}`);
      return response.leaderboard;
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }

  async getUserHistory(limit: number = 20): Promise<RankingHistory[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });

      const response = await this.makeRequest<{ history: RankingHistory[] }>(`/history?${params}`);
      return response.history;
    } catch (error) {
      console.error('Failed to fetch user history:', error);
      return [];
    }
  }

  // Helper methods
  getRankIcon(rankName: string): string {
    const iconMap: Record<string, string> = {
      'Bronze': '🥉',
      'Silver': '🥈', 
      'Gold': '🥇',
      'Diamond': '💎'
    };
    return iconMap[rankName] || '🏅';
  }

  getRankColor(rankName: string): string {
    const colorMap: Record<string, string> = {
      'Bronze': '#CD7F32',
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Diamond': '#B9F2FF'
    };
    return colorMap[rankName] || '#6B7280';
  }

  formatPoints(points: number): string {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  }

  calculateRankProgress(currentPoints: number, minPoints: number, maxPoints?: number): number {
    if (!maxPoints) return 100; // Max rank
    
    const progress = ((currentPoints - minPoints) / (maxPoints - minPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }
}

export const rankingService = new RankingService();

