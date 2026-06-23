import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { usePremium } from '../hooks/usePremium';

const FEATURES = [
  { icon: '📊', title: 'Unlimited test logs', sub: 'Free plan: 30 entries' },
  { icon: '💊', title: 'Unlimited chemicals', sub: 'Free plan: 2 chemicals' },
  { icon: '📈', title: '30 & 90-day trends', sub: 'Free plan: 7 days' },
  { icon: '⏰', title: 'Dosing reminders', sub: 'Daily push notifications' },
  { icon: '🪣', title: 'Multiple tanks', sub: 'Manage frag + display tanks' },
  { icon: '🎯', title: 'Custom parameter targets', sub: 'Per-tank target ranges' },
];

export function PaywallScreen() {
  const navigation = useNavigation<any>();
  const { isPro, hasAccess, isTrialActive, trialDaysRemaining, startTrial, unlockPro } =
    usePremium();

  const handleStartTrial = () => {
    startTrial();
    Alert.alert(
      'Trial Started! 🪸',
      'You have 14 days of free Pro access. No credit card required.',
      [{ text: 'Start Tracking', onPress: () => navigation.goBack() }],
    );
  };

  const handlePurchase = () => {
    // TODO: integrate expo-in-app-purchases here
    // For now, simulate unlock for testing
    Alert.alert(
      'Purchase',
      'TODO: Wire up expo-in-app-purchases for production. For now, this will simulate a purchase.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Purchase',
          onPress: () => {
            unlockPro();
            Alert.alert('Welcome to Pro! 🪸', 'Unlimited tracking unlocked.', [
              { text: 'Done', onPress: () => navigation.goBack() },
            ]);
          },
        },
      ],
    );
  };

  const handleRestore = () => {
    // TODO: implement restore purchases via IAP
    Alert.alert('Restore Purchases', 'TODO: implement restore via expo-in-app-purchases');
  };

  if (isPro) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.alreadyPro}>
          <Text style={styles.alreadyProIcon}>🪸</Text>
          <Text style={styles.alreadyProTitle}>You're on Pro!</Text>
          <Text style={styles.alreadyProSub}>
            All features unlocked. Thank you for supporting ReefLog.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back to App</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={[Colors.oceanMuted, Colors.bg]}
          style={styles.heroGrad}
        />

        <Text style={styles.badge}>✦ REEFLOG PRO</Text>
        <Text style={styles.heroTitle}>
          Keep your reef{'\n'}alive and thriving
        </Text>
        <Text style={styles.heroSub}>
          One-time unlock. No subscription. Yours forever.
        </Text>

        {/* Features */}
        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
              <Text style={styles.featureCheck}>✓</Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>One-time unlock</Text>
          <Text style={styles.price}>$9.99</Text>
          <Text style={styles.priceSub}>
            Less than a bottle of two-part supplement.{'\n'}Unlimited tanks, logs, and trends forever.
          </Text>
        </View>

        {/* CTA */}
        {isTrialActive ? (
          <View style={styles.trialActiveBox}>
            <Text style={styles.trialActiveText}>
              ✓ Trial active · {trialDaysRemaining} days remaining
            </Text>
          </View>
        ) : !hasAccess ? (
          <TouchableOpacity style={styles.trialButton} onPress={handleStartTrial} activeOpacity={0.9}>
            <Text style={styles.trialButtonText}>Start 14-Day Free Trial</Text>
            <Text style={styles.trialButtonSub}>No credit card required</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.goldGrad1, Colors.goldGrad2]}
            style={styles.purchaseGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.purchaseText}>Unlock Pro – $9.99</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestore} activeOpacity={0.7}>
          <Text style={styles.restoreText}>Restore previous purchase</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          {/* TODO: replace with real privacy/terms links */}
          Payment processed by Apple/Google. No recurring charges.{'\n'}
          By purchasing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: {
    padding: Spacing.xl,
    gap: Spacing.xl,
    paddingBottom: Spacing.section,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 14, color: Colors.textSecondary },
  heroGrad: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gold,
    letterSpacing: 1.5,
    backgroundColor: Colors.goldBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  heroSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  featureList: {
    alignSelf: 'stretch',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  featureIcon: { fontSize: 20, width: 28 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  featureSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  featureCheck: { fontSize: 16, color: Colors.good, fontWeight: '700' },
  priceCard: {
    alignSelf: 'stretch',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gold + '33',
  },
  priceLabel: { fontSize: 12, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  price: { fontSize: 42, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1 },
  priceSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  trialActiveBox: {
    alignSelf: 'stretch',
    backgroundColor: Colors.goodBg,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  trialActiveText: { fontSize: 15, fontWeight: '600', color: Colors.good },
  trialButton: {
    alignSelf: 'stretch',
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.full,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trialButtonText: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  trialButtonSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  purchaseButton: {
    alignSelf: 'stretch',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  purchaseGradient: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  purchaseText: { fontSize: 17, fontWeight: '800', color: '#000' },
  restoreText: { fontSize: 13, color: Colors.ocean },
  alreadyPro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, padding: Spacing.xl },
  alreadyProIcon: { fontSize: 56 },
  alreadyProTitle: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
  alreadyProSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' },
  backButton: {
    backgroundColor: Colors.ocean,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md,
  },
  backButtonText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  legalText: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 16 },
});
