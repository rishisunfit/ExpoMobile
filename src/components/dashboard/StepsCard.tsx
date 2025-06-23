import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { COLORS, SPACING } from '../../styles';

export function StepsCard() {
  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <Typography.H2>Daily Steps</Typography.H2>
        <Typography.Subtext style={styles.viewAll}>View All</Typography.Subtext>
      </View>
      <Card>
        <View style={styles.stepsContainer}>
          <View style={styles.stepsInfo}>
            <Typography.H1 style={styles.stepsNumber}>8,432</Typography.H1>
            <Typography.Subtext style={styles.stepsLabel}>steps today</Typography.Subtext>
            <View style={styles.stepsProgress}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '84%', backgroundColor: COLORS.primary }]} />
              </View>
              <Typography.Caption style={styles.progressText}>84% of daily goal</Typography.Caption>
            </View>
          </View>
          <View style={styles.stepsChart}>
            <View style={styles.chartBar} />
            <View style={[styles.chartBar, { height: 40 }]} />
            <View style={[styles.chartBar, { height: 60 }]} />
            <View style={[styles.chartBar, { height: 30 }]} />
            <View style={[styles.chartBar, { height: 50 }]} />
            <View style={[styles.chartBar, { height: 45 }]} />
            <View style={[styles.chartBar, { height: 35 }]} />
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: SPACING.xl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  viewAll: { color: COLORS.primary, fontWeight: '500' },
  stepsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepsInfo: { flex: 1 },
  stepsNumber: { fontSize: 32, fontWeight: '600', color: COLORS.text.primary },
  stepsLabel: { fontSize: 14, color: COLORS.text.light, marginTop: 4 },
  stepsProgress: { marginTop: 12 },
  progressText: { fontSize: 12, color: COLORS.text.light, marginTop: 4 },
  progressBar: { backgroundColor: COLORS.background.card, height: 10, borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: 10, borderRadius: 10 },
  stepsChart: { flexDirection: 'row', alignItems: 'flex-end', height: 60, gap: 4 },
  chartBar: { width: 4, backgroundColor: COLORS.background.card, borderRadius: 2, height: 20 },
}); 