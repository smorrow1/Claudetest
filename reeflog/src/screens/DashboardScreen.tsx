import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { useTankStore } from '../store/tankStore';
import { useTestStore } from '../store/testStore';
import { useDosingStore } from '../store/dosingStore';
import { usePremium } from '../hooks/usePremium';
import { ParameterStatusPill } from '../components/ParameterStatusPill';
import { DosingCard } from '../components/DosingCard';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState } from '../components/EmptyState';
import { PARAMETERS } from '../data/defaultParameters';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { hasAccess, trialDaysRemaining, isTrialActive } = usePremium();

  const tank = useTankStore((s) => s.getActiveTank());
  const getTargets = useTankStore((s) => s.getTargets);

  const getLatestLog = useTestStore((s) => s.getLatestLog);
  const latestLog = tank ? getLatestLog(tank.id) : null;

  const getChemicalsForTank = useDosingStore((s) => s.getChemicalsForTank);
  const getTodayLog = useDosingStore((s) => s.getTodayLog);
  const isDueToday = useDosingStore((s) => s.isDueToday);
  const getLastDosed = useDosingStore((s) => s.getLastDosed);
  const toggleDoseComplete = useDosingStore((s) => s.toggleDoseComplete);

  const chemicals = tank ? getChemicalsForTank(tank.id) : [];
  const targets = tank ? getTargets(tank.id) : [];
  const dueChemicals = chemicals.filter((c) => isDueToday(c));

  const lastTestLabel = latestLog
    ? formatDistanceToNow(new Date(latestLog.date), { addSuffix: true })
    : null;

  const outOfRange = latestLog
    ? latestLog.readings.filter((r) => {
        const target = targets.find((t) => t.parameterId === r.parameterId);
        return target && (r.value < target.min || r.value > target.max);
      }).length
    : 0;

  const allDosed = dueChemicals.every((c) => getTodayLog(c.id)?.completed);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.tankName}>{tank?.name ?? 'My Tank'}</Text>
            <Text style={styles.tankSub}>
              {tank?.volumeGallons ? `${tank.volumeGallons} gal · ` : ''}
              {tank?.type?.toUpperCase() ?? 'REEF'}
            </Text>
          </View>
          {isTrialActive && (
            <View style={styles.trialBadge}>
              <Text style={styles.trialBadgeText}>
                Trial: {trialDaysRemaining}d left
              </Text>
            </View>
          )}
        </View>

        {/* Status Cards */}
        <View style={styles.statusRow}>
          <StatusCard
            icon={outOfRange === 0 && latestLog ? '✓' : latestLog ? '⚠' : '—'}
            label="Parameters"
            value={
              latestLog
                ? outOfRange === 0
                  ? 'All in range'
                  : `${outOfRange} off target`
                : 'No tests yet'
            }
            accent={outOfRange === 0 && latestLog ? Colors.good : latestLog ? Colors.warn : Colors.textMuted}
          />
          <StatusCard
            icon={allDosed && dueChemicals.length > 0 ? '✓' : '💧'}
            label="Dosing"
            value={
              chemicals.length === 0
                ? 'No chemicals'
                : dueChemicals.length === 0
                ? 'Nothing due'
                : allDosed
                ? 'All dosed'
                : `${dueChemicals.filter((c) => !getTodayLog(c.id)?.completed).length} remaining`
            }
            accent={allDosed && dueChemicals.length > 0 ? Colors.good : Colors.ocean}
          />
        </View>

        {lastTestLabel && (
          <Text style={styles.lastTestLabel}>Last test: {lastTestLabel}</Text>
        )}

        {/* Parameters */}
        <SectionHeader
          title="Parameters"
          action="Log Test"
          onAction={() => navigation.navigate('LogTest')}
        />

        {latestLog ? (
          <View style={styles.pillGrid}>
            {PARAMETERS.slice(0, 6).map((param) => {
              const reading = latestLog.readings.find(
                (r) => r.parameterId === param.id,
              );
              const target = targets.find((t) => t.parameterId === param.id) ?? {
                parameterId: param.id,
                min: param.defaultMin,
                max: param.defaultMax,
              };
              return (
                <ParameterStatusPill
                  key={param.id}
                  definition={param}
                  value={reading?.value}
                  target={target}
                  onPress={() => navigation.navigate('History', { parameterId: param.id })}
                />
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon="🧪"
            title="No tests logged yet"
            subtitle="Log your first water test to see parameter status here."
            actionLabel="Log First Test"
            onAction={() => navigation.navigate('LogTest')}
          />
        )}

        {/* Dosing today */}
        {chemicals.length > 0 && (
          <>
            <SectionHeader
              title="Dosing Today"
              action="Manage"
              onAction={() => navigation.navigate('Dosing')}
            />
            <View style={styles.dosingList}>
              {dueChemicals.length === 0 ? (
                <View style={styles.dosingAllDone}>
                  <Text style={styles.dosingAllDoneText}>
                    ✓ All doses complete for today
                  </Text>
                </View>
              ) : (
                dueChemicals.map((chem) => (
                  <DosingCard
                    key={chem.id}
                    chemical={chem}
                    todayLog={getTodayLog(chem.id)}
                    lastDosed={getLastDosed(chem.id)}
                    isDue={isDueToday(chem)}
                    onToggle={() =>
                      toggleDoseComplete(
                        chem.id,
                        new Date().toISOString().split('T')[0],
                      )
                    }
                  />
                ))
              )}
            </View>
          </>
        )}

        {/* Log test FAB equivalent at bottom */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('LogTest')}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>+ Log Water Test</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={[styles.statusCard, { borderLeftColor: accent }]}>
      <Text style={styles.statusIcon}>{icon}</Text>
      <View>
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={[styles.statusValue, { color: accent }]}>{value}</Text>
      </View>
    </View>
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
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  tankName: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  tankSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  trialBadge: {
    backgroundColor: Colors.goldBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.gold + '44',
  },
  trialBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gold,
  },
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  statusCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusIcon: {
    fontSize: 20,
  },
  statusLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  lastTestLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: -Spacing.sm,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  dosingList: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  dosingAllDone: {
    backgroundColor: Colors.goodBg,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  dosingAllDoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.good,
  },
  fab: {
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.ocean,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
