'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRanking } from '@/services/rankingService';

interface ThemeContextType {
  currentRank: string;
  themeColors: {
    primary: string;
    secondary: string;
    gradient: string;
    background: string;
    border: string;
    text: string;
  };
  updateTheme: (ranking: UserRanking) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useRankingTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useRankingTheme must be used within a ThemeProvider');
  }
  return context;
};

const rankThemes = {
  Diamond: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    background: 'linear-gradient(135deg, #EBF4FF 0%, #F3E8FF 100%)',
    border: '#3B82F6',
    text: '#1E40AF',
  },
  Gold: {
    primary: '#F59E0B',
    secondary: '#F97316',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
    background: 'linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 100%)',
    border: '#F59E0B',
    text: '#92400E',
  },
  Silver: {
    primary: '#6B7280',
    secondary: '#9CA3AF',
    gradient: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
    background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
    border: '#6B7280',
    text: '#374151',
  },
  Bronze: {
    primary: '#F97316',
    secondary: '#EA580C',
    gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
    background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
    border: '#F97316',
    text: '#C2410C',
  }
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const RankingThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentRank, setCurrentRank] = useState<string>('Bronze');
  const [themeColors, setThemeColors] = useState(rankThemes.Bronze);

  const updateTheme = (ranking: UserRanking) => {
    const rankName = ranking?.rank?.name || 'Bronze';
    setCurrentRank(rankName);
    setThemeColors(rankThemes[rankName as keyof typeof rankThemes] || rankThemes.Bronze);
    
    // Apply CSS custom properties for dynamic theming
    const root = document.documentElement;
    const theme = rankThemes[rankName as keyof typeof rankThemes] || rankThemes.Bronze;
    
    root.style.setProperty('--current-rank-primary', theme.primary);
    root.style.setProperty('--current-rank-secondary', theme.secondary);
    root.style.setProperty('--current-rank-gradient', theme.gradient);
    root.style.setProperty('--current-rank-background', theme.background);
    root.style.setProperty('--current-rank-border', theme.border);
    root.style.setProperty('--current-rank-text', theme.text);
  };

  useEffect(() => {
    // Set default theme on mount
    updateTheme({
      rank: { name: 'Bronze', level: 1, icon: '🥉', color: '#F97316', benefits: [], minPoints: 0, bonusMultiplier: 1.0 },
      totalPoints: 0,
      totalSpent: 0,
      totalTransactions: 0,
      servicesUsed: {},
      achievements: [],
      bonusMultiplier: 1.0
    });
  }, []);

  const value = {
    currentRank,
    themeColors,
    updateTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
