import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { useTankStore } from '../store/tankStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { Tank } from '../store/types';

type TankType = 'reef' | 'fowlr' | 'freshwater';

const TANK_TYPES: { id: TankType; label: string; emoji: string; desc: string }[] = [
  { id: 'reef', label: 'Reef', emoji: '🪸', desc: 'Corals, SPS, LPS, invertebrates' },
  { id: 'fowlr', label: 'FOWLR', emoji: '🐠', desc: 'Fish only with live rock' },
  { id: 'freshwater', label: 'Freshwater', emoji: '🌿', desc: 'Planted or community tank' },
];

export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [tankName, setTankName] = useState('');
  const [volume, setVolume] = useState('');
  const [tankType, setTankType] = useState<TankType>('reef');

  const addTank = useTankStore((s) => s.addTank);
  const completeOnboarding = useTankStore((s) => s.completeOnboarding);
  const startTrial = useSubscriptionStore((s) => s.startTrial);

  const handleFinish = () => {
    const tank: Tank = {
      id: `tank-${Date.now()}`,
      name: tankName.trim() || 'My Reef',
      volumeGallons: parseFloat(volume) || 0,
      type: tankType,
      createdAt: new Date().toISOString().split('T')[0],
    };
    addTank(tank);
    startTrial();
    completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress */}
          <View style={styles.progress}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[styles.progressDot, i <= step && styles.progressDotActive]}
              />
            ))}
          </View>

          {step === 0 && <StepWelcome onNext={() => setStep(1)} />}
          {step === 1 && (
            <StepTankInfo
              name={tankName}
              onNameChange={setTankName}
              volume={volume}
              onVolumeChange={setVolume}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepTankType
              selected={tankType}
              onSelect={setTankType}
              onFinish={handleFinish}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.step}>
      <Text style={styles.emoji}>🪸</Text>
      <Text style={styles.heroTitle}>Welcome to ReefLog</Text>
      <Text style={styles.heroSubtitle}>
        Track your tank parameters, never miss a dose, and catch drift before it crashes your reef.
      </Text>
      <View style={styles.bullets}>
        {[
          '💧 Log water tests in seconds',
          '⏰ Daily dosing reminders',
          '📈 30-day parameter trends',
        ].map((b) => (
          <Text key={b} style={styles.bullet}>{b}</Text>
        ))}
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext} activeOpacity={0.85}>
        <LinearGradient
          colors={[Colors.ocean, Colors.oceanLight]}
          style={styles.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.primaryButtonText}>Set Up My Tank →</Text>
        </LinearGradient>
      </TouchableOpacity>
      <Text style={styles.trialNote}>14-day free Pro trial included</Text>
    </View>
  );
}

function StepTankInfo({
  name,
  onNameChange,
  volume,
  onVolumeChange,
  onNext,
}: {
  name: string;
  onNameChange: (v: string) => void;
  volume: string;
  onVolumeChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Name Your Tank</Text>
      <Text style={styles.stepSubtitle}>
        You can rename it anytime in settings.
      </Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Tank Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={onNameChange}
          placeholder="e.g. Display Reef, Frag Tank"
          placeholderTextColor={Colors.textMuted}
          returnKeyType="next"
          maxLength={32}
        />

        <Text style={styles.fieldLabel}>Volume (gallons)</Text>
        <TextInput
          style={styles.input}
          value={volume}
          onChangeText={onVolumeChange}
          placeholder="e.g. 120"
          placeholderTextColor={Colors.textMuted}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onNext} activeOpacity={0.85}>
        <LinearGradient
          colors={[Colors.ocean, Colors.oceanLight]}
          style={styles.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.primaryButtonText}>Continue →</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function StepTankType({
  selected,
  onSelect,
  onFinish,
}: {
  selected: TankType;
  onSelect: (t: TankType) => void;
  onFinish: () => void;
}) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Tank Type</Text>
      <Text style={styles.stepSubtitle}>
        We'll pre-load the right parameter targets for you.
      </Text>

      <View style={styles.typeGrid}>
        {TANK_TYPES.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.typeCard, selected === t.id && styles.typeCardSelected]}
            onPress={() => onSelect(t.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.typeEmoji}>{t.emoji}</Text>
            <Text style={styles.typeLabel}>{t.label}</Text>
            <Text style={styles.typeDesc}>{t.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onFinish} activeOpacity={0.85}>
        <LinearGradient
          colors={[Colors.ocean, Colors.oceanLight]}
          style={styles.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.primaryButtonText}>Start Tracking 🪸</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
  progress: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  progressDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.bgCardElevated,
  },
  progressDotActive: {
    backgroundColor: Colors.ocean,
  },
  step: {
    gap: Spacing.xl,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
    marginTop: Spacing.xxl,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bullets: {
    gap: Spacing.sm,
    alignSelf: 'stretch',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
  },
  bullet: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.xxl,
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fieldGroup: {
    gap: Spacing.sm,
    alignSelf: 'stretch',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  primaryButton: {
    alignSelf: 'stretch',
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  primaryGradient: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  trialNote: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  typeGrid: {
    gap: Spacing.md,
    alignSelf: 'stretch',
  },
  typeCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  typeCardSelected: {
    borderColor: Colors.ocean,
    backgroundColor: Colors.oceanMuted,
  },
  typeEmoji: {
    fontSize: 28,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  typeDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
});
