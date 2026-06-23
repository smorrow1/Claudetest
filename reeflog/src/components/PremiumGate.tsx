import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';

interface Props {
  title: string;
  description: string;
  onUpgrade: () => void;
  children?: React.ReactNode; // blurred background preview
}

export function PremiumGate({ title, description, onUpgrade, children }: Props) {
  return (
    <View style={styles.container}>
      {children && (
        <View style={styles.preview} pointerEvents="none">
          {children}
        </View>
      )}
      <LinearGradient
        colors={[Colors.bg + '00', Colors.bg + 'EE', Colors.bg]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.4, 1]}
      />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✦ PRO</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <TouchableOpacity style={styles.button} onPress={onUpgrade} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.goldGrad1, Colors.goldGrad2]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Unlock Pro – $9.99</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.trialNote}>14-day free trial · No credit card needed</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    minHeight: 200,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.goldBg,
  },
  preview: {
    opacity: 0.15,
  },
  content: {
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  badge: {
    backgroundColor: Colors.goldBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.gold + '55',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gold,
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 280,
    marginTop: Spacing.sm,
  },
  buttonGradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  trialNote: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
