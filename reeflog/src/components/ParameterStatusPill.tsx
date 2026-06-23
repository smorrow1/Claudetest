import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { ParameterDefinition, ParameterTarget } from '../data/defaultParameters';

interface Props {
  definition: ParameterDefinition;
  value?: number;
  target: ParameterTarget;
  onPress?: () => void;
}

type Status = 'good' | 'warn' | 'no-data';

function getStatus(value: number | undefined, target: ParameterTarget): Status {
  if (value === undefined) return 'no-data';
  if (value >= target.min && value <= target.max) return 'good';
  return 'warn';
}

const statusConfig = {
  good: { bg: Colors.goodBg, dot: Colors.good, text: Colors.good },
  warn: { bg: Colors.warnBg, dot: Colors.warn, text: Colors.warn },
  'no-data': { bg: Colors.bgCardElevated, dot: Colors.textMuted, text: Colors.textMuted },
};

export function ParameterStatusPill({ definition, value, target, onPress }: Props) {
  const status = getStatus(value, target);
  const config = statusConfig[status];

  const displayValue =
    value !== undefined
      ? value.toFixed(definition.decimalPlaces)
      : '—';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: config.bg }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <View style={styles.content}>
        <Text style={styles.label}>{definition.label}</Text>
        <Text style={[styles.value, { color: config.text }]}>
          {displayValue}
          {value !== undefined ? (
            <Text style={styles.unit}> {definition.unit}</Text>
          ) : null}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
    minWidth: 140,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textMuted,
  },
});
