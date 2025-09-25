import { DefaultTheme } from 'react-native-paper';

// ATHENA Platform Brand Colors
export const colors = {
  // Primary brand colors
  primary: '#1B365D', // Deep blue - represents trust and stability
  primaryLight: '#2A4B73',
  primaryDark: '#0F2442',
  
  // Secondary/accent colors
  secondary: '#FF6B35', // Orange - represents energy and innovation
  secondaryLight: '#FF8A5C',
  secondaryDark: '#E5501C',
  
  // SOV-Token colors
  token: '#FFD700', // Gold - represents value and premium
  tokenLight: '#FFDC33',
  tokenDark: '#E6C200',
  
  // Status colors
  success: '#4CAF50',
  successLight: '#66BB6A',
  successDark: '#388E3C',
  
  warning: '#FF9800',
  warningLight: '#FFB74D',
  warningDark: '#F57C00',
  
  error: '#F44336',
  errorLight: '#EF5350',
  errorDark: '#D32F2F',
  
  info: '#2196F3',
  infoLight: '#42A5F5',
  infoDark: '#1976D2',
  
  // Neutral colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  
  // Service-specific colors
  vietjet: '#E31837', // Vietjet brand red
  hdbank: '#003366', // HDBank brand blue
  resort: '#4CAF50', // Green for hospitality
  insurance: '#9C27B0', // Purple for insurance
  
  // Marketplace colors
  buy: '#4CAF50', // Green for buy orders
  sell: '#F44336', // Red for sell orders
  
  // Gradients
  gradientPrimary: ['#1B365D', '#2A4B73'],
  gradientSecondary: ['#FF6B35', '#FF8A5C'],
  gradientToken: ['#FFD700', '#FFDC33'],
  gradientSuccess: ['#4CAF50', '#66BB6A'],
};

// Typography
export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Component styles
export const componentStyles = {
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.lg,
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.lg,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.lg,
    },
  },
  
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
  },
  
  header: {
    backgroundColor: colors.primary,
    height: 56,
    paddingHorizontal: spacing.md,
  },
};

// React Native Paper theme customization
export const athenaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    placeholder: colors.textLight,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    onSurface: colors.text,
    notification: colors.error,
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: typography.fontFamily.regular,
      fontWeight: typography.fontWeight.normal,
    },
    medium: {
      fontFamily: typography.fontFamily.medium,
      fontWeight: typography.fontWeight.medium,
    },
    light: {
      fontFamily: typography.fontFamily.regular,
      fontWeight: typography.fontWeight.normal,
    },
    thin: {
      fontFamily: typography.fontFamily.regular,
      fontWeight: typography.fontWeight.normal,
    },
  },
  roundness: borderRadius.md,
};

// Service-specific themes
export const serviceThemes = {
  vietjet: {
    primary: colors.vietjet,
    secondary: colors.vietjetLight || colors.secondary,
    background: colors.background,
  },
  hdbank: {
    primary: colors.hdbank,
    secondary: colors.hdbankLight || colors.secondary,
    background: colors.background,
  },
  resort: {
    primary: colors.resort,
    secondary: colors.resortLight || colors.secondary,
    background: colors.background,
  },
  insurance: {
    primary: colors.insurance,
    secondary: colors.insuranceLight || colors.secondary,
    background: colors.background,
  },
};

// Utility functions
export const getServiceColor = (serviceType) => {
  switch (serviceType) {
    case 'vietjet':
      return colors.vietjet;
    case 'hdbank':
      return colors.hdbank;
    case 'resort':
      return colors.resort;
    case 'insurance':
      return colors.insurance;
    default:
      return colors.primary;
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
    case 'confirmed':
    case 'active':
      return colors.success;
    case 'pending':
    case 'processing':
      return colors.warning;
    case 'failed':
    case 'cancelled':
    case 'expired':
      return colors.error;
    default:
      return colors.textSecondary;
  }
};

export const formatCurrency = (amount, currency = 'VND') => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
  return `${amount.toLocaleString()} ${currency}`;
};

export const formatTokens = (amount) => {
  return `${amount.toLocaleString()} SOV`;
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  componentStyles,
  athenaTheme,
  serviceThemes,
  getServiceColor,
  getStatusColor,
  formatCurrency,
  formatTokens,
};
