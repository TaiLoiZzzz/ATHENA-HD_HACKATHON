import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing, shadows } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <LinearGradient
        colors={colors.gradientPrimary}
        style={styles.background}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>ATHENA</Text>
            <Text style={styles.tagline}>Super-App Ecosystem</Text>
          </View>
          
          <Text style={styles.subtitle}>
            Transform your rewards into tradable SOV-Tokens
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>🎯</Text>
            </View>
            <Text style={styles.featureTitle}>Unified Experience</Text>
            <Text style={styles.featureDescription}>
              Book flights, hotels, banking services, and insurance in one app
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>💰</Text>
            </View>
            <Text style={styles.featureTitle}>Earn SOV-Tokens</Text>
            <Text style={styles.featureDescription}>
              Get 1 SOV-Token for every 10,000 VND spent across all services
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>📈</Text>
            </View>
            <Text style={styles.featureTitle}>Trade & Earn</Text>
            <Text style={styles.featureDescription}>
              Buy, sell, and trade SOV-Tokens in our secure marketplace
            </Text>
          </View>
        </View>

        {/* SOV-Token Highlight */}
        <View style={styles.tokenHighlight}>
          <View style={styles.tokenIcon}>
            <Text style={styles.tokenText}>SOV</Text>
          </View>
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenTitle}>SOV-Token</Text>
            <Text style={styles.tokenSubtitle}>
              Blockchain-powered rewards that you can actually use
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Sovico Group</Text>
          <Text style={styles.footerSubtext}>
            Vietjet • HDBank • Resorts • Insurance
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.surface,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: typography.fontSize.md,
    color: colors.surface,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.surface,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
  },
  featuresContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.surface,
    marginBottom: spacing.xs,
    flex: 1,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.surface,
    opacity: 0.8,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    flex: 1,
  },
  tokenHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 16,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  tokenIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.token,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.md,
  },
  tokenText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  tokenSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.surface,
    opacity: 0.8,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.surface,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.surface,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.surface,
    opacity: 0.6,
    fontWeight: typography.fontWeight.medium,
  },
  footerSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.surface,
    opacity: 0.4,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default WelcomeScreen;

