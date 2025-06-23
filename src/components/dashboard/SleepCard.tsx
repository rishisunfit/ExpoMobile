import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { COLORS, SPACING } from '../../styles';
import { Icon } from '@rneui/themed';

export function SleepCard() {
  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <Typography.H2>Sleep</Typography.H2>
        <Typography.Subtext style={styles.viewAll}>View All</Typography.Subtext>
      </View>
      <Card>
        <View style={styles.sleepContainer}>
          <View style={styles.sleepInfo}>
            <Typography.H1 style={styles.sleepTime}>7h 32m</Typography.H1>
            <Typography.Subtext style={styles.sleepLabel}>last night</Typography.Subtext>
            <View style={styles.sleepQuality}>
              <Icon name="star" type="font-awesome-5" color="#fbbf24" size={16} />
              <Typography.Subtext style={styles.sleepQualityText}>Good quality sleep</Typography.Subtext>
            </View>
          </View>
          <View style={styles.sleepChart}>
            <View style={styles.sleepBar} />
            <View style={[styles.sleepBar, { height: 30 }]} />
            <View style={[styles.sleepBar, { height: 50 }]} />
            <View style={[styles.sleepBar, { height: 40 }]} />
            <View style={[styles.sleepBar, { height: 35 }]} />
            <View style={[styles.sleepBar, { height: 45 }]} />
            <View style={[styles.sleepBar, { height: 25 }]} />
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
  sleepContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sleepInfo: { flex: 1 },
  sleepTime: { fontSize: 32, fontWeight: '600', color: COLORS.text.primary },
  sleepLabel: { fontSize: 14, color: COLORS.text.light, marginTop: 4 },
  sleepQuality: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  sleepQualityText: { fontSize: 14, color: COLORS.text.light, marginLeft: 8 },
  sleepChart: { flexDirection: 'row', alignItems: 'flex-end', height: 60, gap: 4 },
  sleepBar: { width: 4, backgroundColor: COLORS.primary, borderRadius: 2, height: 20 },
}); 