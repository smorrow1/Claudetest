import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { useTankStore } from '../store/tankStore';
import { useTestStore } from '../store/testStore';
import { usePremium } from '../hooks/usePremium';
import { PARAMETERS } from '../data/defaultParameters';
import { TestLog, ParameterReading } from '../store/types';

export function LogTestScreen() {
  const navigation = useNavigation<any>();
  const tank = useTankStore((s) => s.getActiveTank());
  const getTargets = useTankStore((s) => s.getTargets);
  const addLog = useTestStore((s) => s.addLog);
  const getLogsForTank = useTestStore((s) => s.getLogsForTank);
  const { canAddTestLog } = usePremium();

  const targets = tank ? getTargets(tank.id) : [];
  const logCount = tank ? getLogsForTank(tank.id).length : 0;

  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const setValue = (id: string, v: string) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const getStatus = (parameterId: string, rawValue: string) => {
    const num = parseFloat(rawValue);
    if (isNaN(num)) return 'empty';
    const target = targets.find((t) => t.parameterId === parameterId);
    if (!target) return 'good';
    if (num >= target.min && num <= target.max) return 'good';
    return 'warn';
  };

  const handleSave = () => {
    if (!tank) return;

    if (!canAddTestLog(logCount)) {
      Alert.alert(
        'Free Limit Reached',
        'You\'ve used all 30 free test log entries. Upgrade to Pro for unlimited history.',
        [
          { text: 'Not Now', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Paywall') },
        ],
      );
      return;
    }

    const readings: ParameterReading[] = PARAMETERS.flatMap((p) => {
      const raw = values[p.id];
      const num = parseFloat(raw);
      if (!raw || isNaN(num)) return [];
      return [{ parameterId: p.id, value: num }];
    });

    if (readings.length === 0) {
      Alert.alert('No Data', 'Enter at least one parameter value before saving.');
      return;
    }

    const log: TestLog = {
      id: `log-${Date.now()}`,
      tankId: tank.id,
      date: new Date().toISOString().split('T')[0],
      readings,
      notes: notes.trim() || undefined,
    };

    setSaving(true);
    addLog(log);
    setTimeout(() => {
      setSaving(false);
      navigation.goBack();
    }, 200);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.screenTitle}>Log Water Test</Text>
          <Text style={styles.screenSub}>
            Enter the values you measured. Skip any you didn't test.
          </Text>

          {PARAMETERS.map((param) => {
            const status = getStatus(param.id, values[param.id] ?? '');
            const target = targets.find((t) => t.parameterId === param.id);
            const rangeLabel = target
              ? `${target.min}–${target.max} ${param.unit}`
              : `${param.defaultMin}–${param.defaultMax} ${param.unit}`;

            return (
              <View key={param.id} style={styles.paramRow}>
                <View style={styles.paramInfo}>
                  <Text style={styles.paramLabel}>{param.label}</Text>
                  <Text style={styles.paramRange}>Target: {rangeLabel}</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      status === 'good' && styles.inputGood,
                      status === 'warn' && styles.inputWarn,
                    ]}
                    value={values[param.id] ?? ''}
                    onChangeText={(v) => setValue(param.id, v)}
                    placeholder="—"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                  />
                  {param.unit ? (
                    <Text style={styles.unit}>{param.unit}</Text>
                  ) : null}
                </View>
                {status === 'warn' && (
                  <Text style={styles.warnLabel}>Outside target range</Text>
                )}
              </View>
            );
          })}

          {/* Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Post water change, noticed coraline growth..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              returnKeyType="done"
            />
          </View>
        </ScrollView>

        {/* Save button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveText}>
              {saving ? 'Saving...' : 'Save Test Log'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  screenSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  paramRow: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  paramInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paramLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  paramRange: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  inputGood: {
    borderColor: Colors.good,
    backgroundColor: Colors.goodBg,
  },
  inputWarn: {
    borderColor: Colors.warn,
    backgroundColor: Colors.warnBg,
  },
  unit: {
    fontSize: 14,
    color: Colors.textSecondary,
    minWidth: 40,
  },
  warnLabel: {
    fontSize: 11,
    color: Colors.warn,
    textAlign: 'right',
  },
  notesSection: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  notesInput: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.ocean,
    borderRadius: Radius.full,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
