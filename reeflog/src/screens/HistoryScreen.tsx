import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { useTankStore } from '../store/tankStore';
import { useTestStore } from '../store/testStore';
import { usePremium } from '../hooks/usePremium';
import { SimpleLineChart } from '../components/SimpleLineChart';
import { PremiumGate } from '../components/PremiumGate';
import { EmptyState } from '../components/EmptyState';
import { PARAMETERS, ParameterId } from '../data/defaultParameters';

const PERIOD_OPTIONS = [
  { days: 7, label: '7d', free: true },
  { days: 30, label: '30d', free: false },
  { days: 90, label: '90d', free: false },
];

export function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [selectedParam, setSelectedParam] = useState<ParameterId>('alk');
  const [selectedDays, setSelectedDays] = useState(7);

  const { hasAccess, canViewHistory } = usePremium();
  const tank = useTankStore((s) => s.getActiveTank());
  const getTargets = useTankStore((s) => s.getTargets);
  const getLogsForTank = useTestStore((s) => s.getLogsForTank);
  const getReadingsForParameter = useTestStore((s) => s.getReadingsForParameter);

  const targets = tank ? getTargets(tank.id) : [];
  const allLogs = tank ? getLogsForTank(tank.id) : [];

  const paramDef = PARAMETERS.find((p) => p.id === selectedParam)!;
  const target = targets.find((t) => t.parameterId === selectedParam) ?? {
    parameterId: selectedParam,
    min: paramDef.defaultMin,
    max: paramDef.defaultMax,
  };

  const readings = tank
    ? getReadingsForParameter(tank.id, selectedParam, selectedDays)
    : [];

  const isPeriodLocked = !canViewHistory(selectedDays);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>History</Text>

        {/* Parameter selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paramScroll}>
          <View style={styles.paramRow}>
            {PARAMETERS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.paramChip,
                  selectedParam === p.id && styles.paramChipActive,
                ]}
                onPress={() => setSelectedParam(p.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.paramChipText,
                    selectedParam === p.id && styles.paramChipTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Period selector */}
        <View style={styles.periodRow}>
          {PERIOD_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.days}
              style={[
                styles.periodChip,
                selectedDays === opt.days && styles.periodChipActive,
                !canViewHistory(opt.days) && styles.periodChipLocked,
              ]}
              onPress={() => {
                if (!canViewHistory(opt.days)) {
                  navigation.navigate('Paywall');
                  return;
                }
                setSelectedDays(opt.days);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.periodChipText,
                  selectedDays === opt.days && styles.periodChipTextActive,
                ]}
              >
                {!canViewHistory(opt.days) ? `✦ ${opt.label}` : opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart area */}
        {allLogs.length === 0 ? (
          <EmptyState
            icon="📈"
            title="No test data yet"
            subtitle="Log your first water test to start tracking trends."
            actionLabel="Log a Test"
            onAction={() => navigation.navigate('LogTest')}
          />
        ) : isPeriodLocked ? (
          <PremiumGate
            title="30-day trends require Pro"
            description="See parameter drift over a full month. Catch problems before they become crashes."
            onUpgrade={() => navigation.navigate('Paywall')}
          />
        ) : (
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartParamName}>{paramDef.label}</Text>
              <Text style={styles.chartUnit}>
                Target: {target.min}–{target.max} {paramDef.unit}
              </Text>
            </View>
            <SimpleLineChart
              data={readings}
              target={target}
              unit={paramDef.unit}
              decimalPlaces={paramDef.decimalPlaces}
              height={140}
            />
            <Text style={styles.chartHint}>
              {readings.length} readings in last {selectedDays} days
            </Text>
          </View>
        )}

        {/* Recent Logs */}
        {allLogs.length > 0 && (
          <View style={styles.logsSection}>
            <Text style={styles.logsSectionTitle}>Recent Tests</Text>
            {allLogs.slice(0, 5).map((log) => {
              const reading = log.readings.find((r) => r.parameterId === selectedParam);
              const isInRange = reading
                ? reading.value >= target.min && reading.value <= target.max
                : null;
              return (
                <View key={log.id} style={styles.logRow}>
                  <View
                    style={[
                      styles.logStatusDot,
                      {
                        backgroundColor:
                          isInRange === null
                            ? Colors.textMuted
                            : isInRange
                            ? Colors.good
                            : Colors.warn,
                      },
                    ]}
                  />
                  <Text style={styles.logDate}>{log.date}</Text>
                  <Text style={styles.logValue}>
                    {reading
                      ? `${reading.value.toFixed(paramDef.decimalPlaces)} ${paramDef.unit}`
                      : 'Not tested'}
                  </Text>
                  {log.notes && (
                    <Text style={styles.logNotes} numberOfLines={1}>
                      {log.notes}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  screenTitle: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },
  paramScroll: { marginHorizontal: -Spacing.xl },
  paramRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xs,
  },
  paramChip: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paramChipActive: {
    backgroundColor: Colors.ocean,
    borderColor: Colors.ocean,
  },
  paramChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  paramChipTextActive: { color: Colors.textPrimary, fontWeight: '700' },
  periodRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.xs,
  },
  periodChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  periodChipActive: { backgroundColor: Colors.bgCardElevated },
  periodChipLocked: { opacity: 0.6 },
  periodChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  periodChipTextActive: { color: Colors.textPrimary, fontWeight: '700' },
  chartSection: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartParamName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  chartUnit: { fontSize: 12, color: Colors.textMuted },
  chartHint: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
  logsSection: { gap: Spacing.sm },
  logsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  logStatusDot: { width: 8, height: 8, borderRadius: 4 },
  logDate: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  logValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  logNotes: { fontSize: 12, color: Colors.textMuted, flex: 1 },
});
