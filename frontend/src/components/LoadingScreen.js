import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ message = 'Loading ATHENA...' }) => {
  return (
    <LinearGradient
      colors={colors.gradientPrimary}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* ATHENA Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>ATHENA</Text>
          <Text style={styles.tagline}>Super-App Ecosystem</Text>
        </View>

        {/* Loading Animation */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={colors.token}
            style={styles.spinner}
          />
          <Text style={styles.loadingText}>{message}</Text>
        </View>

        {/* SOV-Token Animation */}
        <View style={styles.tokenContainer}>
          <View style={styles.tokenIcon}>
            <Text style={styles.tokenText}>SOV</Text>
          </View>
          <Text style={styles.tokenLabel}>Powered by SOV-Tokens</Text>
        </View>
      </View>

      {/* Bottom branding */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Sovico Group</Text>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoText: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.surface,
    letterSpacing: 2,
    textAlign: 'center',
  },
  tagline: {
    fontSize: typography.fontSize.md,
    color: colors.surface,
    opacity: 0.9,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  spinner: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.surface,
    opacity: 0.8,
    textAlign: 'center',
  },
  tokenContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  tokenIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.token,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tokenText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  tokenLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.surface,
    opacity: 0.7,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.md,
    color: colors.surface,
    opacity: 0.6,
    fontWeight: typography.fontWeight.medium,
  },
  versionText: {
    fontSize: typography.fontSize.sm,
    color: colors.surface,
    opacity: 0.4,
    marginTop: spacing.xs,
  },
});

export default LoadingScreen;
