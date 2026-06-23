import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { useTankStore } from '../store/tankStore';
import { usePremium } from '../hooks/usePremium';
import {
  requestNotificationPermission,
  scheduleDailyDosingReminder,
  cancelAllReminders,
} from '../hooks/useNotifications';

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { isPro, hasAccess, isTrialActive, trialDaysRemaining } = usePremium();
  const tank = useTankStore((s) => s.getActiveTank());
  const updateTank = useTankStore((s) => s.updateTank);

  const [tankName, setTankName] = useState(tank?.name ?? '');
  const [volume, setVolume] = useState(String(tank?.volumeGallons ?? ''));
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleSaveTank = () => {
    if (!tank) return;
    updateTank(tank.id, {
      name: tankName.trim() || tank.name,
      volumeGallons: parseFloat(volume) || tank.volumeGallons,
    });
    Alert.alert('Saved', 'Tank info updated.');
  };

  const handleToggleNotifications = async (val: boolean) => {
    if (val) {
      if (!hasAccess) {
        Alert.alert('Pro Feature', 'Dosing reminders require ReefLog Pro.', [
          { text: 'Not Now', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Paywall') },
        ]);
        return;
      }
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Permission Denied', 'Enable notifications in your device settings.');
        return;
      }
      await scheduleDailyDosingReminder();
      setNotificationsEnabled(true);
    } else {
      await cancelAllReminders();
      setNotificationsEnabled(false);
    }
  };

  const handleFeedback = () => {
    // TODO: replace with your actual feedback URL or email
    Linking.openURL('mailto:feedback@reeflog.app?subject=ReefLog%20Feedback');
  };

  const handlePrivacy = () => {
    // TODO: replace with real privacy policy URL
    Linking.openURL('https://reeflog.app/privacy');
  };

  const handleTerms = () => {
    // TODO: replace with real terms URL
    Linking.openURL('https://reeflog.app/terms');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Subscription status */}
        <View style={styles.subCard}>
          {isPro ? (
            <>
              <Text style={styles.subBadge}>✦ PRO</Text>
              <Text style={styles.subTitle}>ReefLog Pro — Unlocked</Text>
              <Text style={styles.subSub}>Thank you for supporting indie development.</Text>
            </>
          ) : isTrialActive ? (
            <>
              <Text style={[styles.subBadge, { color: Colors.gold }]}>FREE TRIAL</Text>
              <Text style={styles.subTitle}>{trialDaysRemaining} days remaining</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Paywall')}>
                <Text style={styles.upgradeLink}>Unlock Pro for $9.99 →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.subBadge}>FREE</Text>
              <Text style={styles.subTitle}>Limited features</Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => navigation.navigate('Paywall')}
                activeOpacity={0.85}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Pro – $9.99</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Tank settings */}
        <SettingsSection title="Tank Info">
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Tank Name</Text>
            <TextInput
              style={styles.input}
              value={tankName}
              onChangeText={setTankName}
              placeholder="My Reef"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.fieldLabel}>Volume (gallons)</Text>
            <TextInput
              style={styles.input}
              value={volume}
              onChangeText={setVolume}
              keyboardType="decimal-pad"
              placeholder="120"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveTank}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsRow
            label="Daily Dosing Reminder"
            sub={hasAccess ? 'Reminds you to dose at 9:00 AM' : '✦ Pro feature'}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: Colors.bgCardElevated, true: Colors.ocean }}
                thumbColor={Colors.textPrimary}
              />
            }
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          <SettingsRow label="Send Feedback" onPress={handleFeedback} chevron />
          <SettingsRow label="Privacy Policy" onPress={handlePrivacy} chevron />
          <SettingsRow label="Terms of Service" onPress={handleTerms} chevron />
        </SettingsSection>

        {/* App info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>ReefLog v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with ❤️ for reef keepers</Text>
          {/* TODO: add App Store review link */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SettingsRow({
  label,
  sub,
  onPress,
  chevron,
  right,
}: {
  label: string;
  sub?: string;
  onPress?: () => void;
  chevron?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {right ?? (chevron ? <Text style={styles.chevron}>›</Text> : null)}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: Spacing.section },
  screenTitle: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
  subCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gold + '33',
    alignItems: 'center',
  },
  subBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.ocean,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  subTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  subSub: { fontSize: 13, color: Colors.textSecondary },
  upgradeLink: { fontSize: 14, color: Colors.ocean, fontWeight: '600' },
  upgradeButton: {
    backgroundColor: Colors.ocean,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  upgradeButtonText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldGroup: { padding: Spacing.lg, gap: Spacing.sm },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  saveButton: {
    backgroundColor: Colors.ocean,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveButtonText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLeft: { flex: 1 },
  rowLabel: { fontSize: 15, color: Colors.textPrimary },
  rowSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 20, color: Colors.textMuted },
  appInfo: { alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.lg },
  appInfoText: { fontSize: 12, color: Colors.textMuted },
});
