import { 
  mockRankingData, 
  mockLeaderboard, 
  mockServiceBonus, 
  simulateApiDelay 
} from '@/lib/mockData';

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
  // Mock implementation - no need for auth tokens

  async getUserRanking(): Promise<UserRanking> {
    try {
      await simulateApiDelay(400);
      return mockRankingData;
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
      await simulateApiDelay(300);
      
      // Return mock service bonus with dynamic amount
      const bonus = {
        ...mockServiceBonus,
        amount: Math.floor(amount * 0.1), // 10% bonus
        transactionAmount: amount
      };
      
      return bonus;
    } catch (error) {
      console.error('Failed to fetch service bonus:', error);
      return null;
    }
  }

  async getAllRanks(): Promise<UserRank[]> {
    try {
      await simulateApiDelay(300);
      
      // Return mock ranks
      return [
        {
          name: 'Bronze',
          level: 1,
          icon: '🥉',
          color: '#CD7F32',
          bonusMultiplier: 1.0,
          benefits: ['Welcome bonus', 'Basic support'],
          minPoints: 0,
          maxPoints: 999
        },
        {
          name: 'Silver',
          level: 2,
          icon: '🥈',
          color: '#C0C0C0',
          bonusMultiplier: 1.2,
          benefits: ['Priority support', 'Exclusive offers'],
          minPoints: 1000,
          maxPoints: 4999
        },
        {
          name: 'Gold',
          level: 3,
          icon: '🥇',
          color: '#FFD700',
          bonusMultiplier: 1.5,
          benefits: ['VIP support', 'Higher earning rates', 'Exclusive rewards'],
          minPoints: 5000,
          maxPoints: 9999
        },
        {
          name: 'Diamond',
          level: 4,
          icon: '💎',
          color: '#B9F2FF',
          bonusMultiplier: 2.0,
          benefits: ['Concierge service', 'Maximum earning rates', 'Premium rewards'],
          minPoints: 10000
        }
      ];
    } catch (error) {
      console.error('Failed to fetch ranks:', error);
      return [];
    }
  }

  async getLeaderboard(limit: number = 10, offset: number = 0): Promise<LeaderboardEntry[]> {
    try {
      await simulateApiDelay(400);
      
      const paginatedLeaderboard = mockLeaderboard.slice(offset, offset + limit);
      return paginatedLeaderboard;
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }

  async getUserHistory(limit: number = 20): Promise<RankingHistory[]> {
    try {
      await simulateApiDelay(500);
      
      // Return mock ranking history
      return [
        {
          id: 'hist_001',
          activityType: 'rank_up',
          pointsEarned: 1000,
          serviceType: 'flight',
          oldRank: { name: 'Silver', icon: '🥈' },
          newRank: { name: 'Gold', icon: '🥇' },
          transaction: { description: 'Flight booking reward', amount: 500 },
          metadata: { airline: 'VietJet Air' },
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 'hist_002',
          activityType: 'points_earned',
          pointsEarned: 300,
          serviceType: 'banking',
          transaction: { description: 'Banking service reward', amount: 300 },
          metadata: { bank: 'HDBank' },
          createdAt: '2024-01-14T14:20:00Z'
        },
        {
          id: 'hist_003',
          activityType: 'achievement_unlocked',
          pointsEarned: 200,
          serviceType: 'marketplace',
          transaction: { description: 'First marketplace purchase', amount: 200 },
          metadata: { achievement: 'Marketplace Explorer' },
          createdAt: '2024-01-13T09:15:00Z'
        }
      ].slice(0, limit);
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

