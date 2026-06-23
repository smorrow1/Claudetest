import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { ParameterTarget } from '../data/defaultParameters';

interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  target: ParameterTarget;
  unit: string;
  decimalPlaces: number;
  height?: number;
}

const CHART_HEIGHT = 120;
const POINT_RADIUS = 4;

export function SimpleLineChart({ data, target, unit, decimalPlaces, height = CHART_HEIGHT }: Props) {
  const sorted = useMemo(
    () => [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [data],
  );

  if (sorted.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>No data yet</Text>
      </View>
    );
  }

  const allValues = sorted.map((d) => d.value);
  const minVal = Math.min(...allValues, target.min * 0.95);
  const maxVal = Math.max(...allValues, target.max * 1.05);
  const range = maxVal - minVal || 1;

  const toY = (v: number) => height - ((v - minVal) / range) * height;
  const targetMinY = toY(target.min);
  const targetMaxY = toY(target.max);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.chart, { height }]}>
        {/* Target range band */}
        <View
          style={[
            styles.rangeBand,
            {
              top: Math.min(targetMinY, targetMaxY),
              height: Math.abs(targetMaxY - targetMinY),
            },
          ]}
        />

        {/* Data points and lines */}
        {sorted.map((point, i) => {
          const x = sorted.length === 1 ? 0.5 : i / (sorted.length - 1);
          const y = toY(point.value);
          const isInRange = point.value >= target.min && point.value <= target.max;

          return (
            <View
              key={point.date}
              style={[
                styles.point,
                {
                  left: `${x * 100}%` as any,
                  top: y - POINT_RADIUS,
                  backgroundColor: isInRange ? Colors.good : Colors.warn,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Y axis labels */}
      <View style={styles.yLabels}>
        <Text style={styles.yLabel}>
          {maxVal.toFixed(decimalPlaces)} {unit}
        </Text>
        <Text style={styles.yLabelMid}>
          {((maxVal + minVal) / 2).toFixed(decimalPlaces)}
        </Text>
        <Text style={styles.yLabel}>
          {minVal.toFixed(decimalPlaces)}
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={[styles.legendDot, { backgroundColor: Colors.teal + '44' }]} />
        <Text style={styles.legendText}>Target range</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  chart: {
    position: 'relative',
    backgroundColor: Colors.bgInput,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rangeBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: Colors.teal + '22',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.teal + '55',
  },
  point: {
    position: 'absolute',
    width: POINT_RADIUS * 2,
    height: POINT_RADIUS * 2,
    borderRadius: POINT_RADIUS,
    marginLeft: -POINT_RADIUS,
  },
  yLabels: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingRight: Spacing.xs,
  },
  yLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  yLabelMid: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  empty: {
    backgroundColor: Colors.bgInput,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
