import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { DosingChemical, DosingLog } from '../store/types';

interface Props {
  chemical: DosingChemical;
  todayLog: DosingLog | null;
  lastDosed: string | null;
  isDue: boolean;
  onToggle: () => void;
  loading?: boolean;
}

export function DosingCard({
  chemical,
  todayLog,
  lastDosed,
  isDue,
  onToggle,
  loading,
}: Props) {
  const isDone = todayLog?.completed ?? false;

  return (
    <View style={[styles.container, isDone && styles.containerDone]}>
      <View style={styles.info}>
        <Text style={styles.name}>{chemical.name}</Text>
        <Text style={styles.dose}>
          {chemical.targetDose} {chemical.unit} ·{' '}
          {chemical.frequencyDays === 1 ? 'Daily' : `Every ${chemical.frequencyDays} days`}
        </Text>
        {lastDosed ? (
          <Text style={styles.lastDosed}>Last: {lastDosed}</Text>
        ) : (
          <Text style={styles.neverDosed}>Never dosed</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.checkButton,
          isDone ? styles.checkButtonDone : isDue ? styles.checkButtonDue : styles.checkButtonIdle,
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.textPrimary} />
        ) : (
          <Text style={styles.checkText}>{isDone ? '✓' : 'Dose'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  containerDone: {
    borderColor: Colors.goodBg,
    backgroundColor: Colors.goodBg,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dose: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  lastDosed: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  neverDosed: {
    fontSize: 12,
    color: Colors.warn,
  },
  checkButton: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minWidth: 64,
    alignItems: 'center',
  },
  checkButtonDone: {
    backgroundColor: Colors.good,
  },
  checkButtonDue: {
    backgroundColor: Colors.ocean,
  },
  checkButtonIdle: {
    backgroundColor: Colors.bgCardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
