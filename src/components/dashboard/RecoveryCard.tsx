import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { COLORS, SPACING } from '../../styles';
import { Icon } from '@rneui/themed';

export function RecoveryCard() {
  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <Typography.H2>Recovery</Typography.H2>
        <Typography.Subtext style={styles.viewAll}>View All</Typography.Subtext>
      </View>
      <Card>
        <View style={styles.recoveryGrid}>
          <View style={styles.recoveryItem}>
            <View style={[styles.recoveryIcon, { backgroundColor: '#fee2e2' }]}>
              <Icon name="heartbeat" type="font-awesome-5" color={COLORS.error} size={20} />
            </View>
            <Typography.H1 style={styles.recoveryValue}>{"72"}</Typography.H1>
            <Typography.Caption style={styles.recoveryLabel}>{"Heart Rate"}</Typography.Caption>
            <Typography.Caption style={StyleSheet.flatten([styles.recoveryBadge, styles.optimalBadge])}>{"Optimal"}</Typography.Caption>
          </View>
          <View style={styles.recoveryItem}>
            <View style={[styles.recoveryIcon, { backgroundColor: '#dbeafe' }]}>
              <Icon name="wave-square" type="font-awesome-5" color={COLORS.secondary} size={20} />
            </View>
            <Typography.H1 style={styles.recoveryValue}>{"42ms"}</Typography.H1>
            <Typography.Caption style={styles.recoveryLabel}>{"HRV"}</Typography.Caption>
            <Typography.Caption style={StyleSheet.flatten([styles.recoveryBadge, styles.goodBadge])}>{"Good"}</Typography.Caption>
          </View>
          <View style={styles.recoveryItem}>
            <View style={[styles.recoveryIcon, { backgroundColor: '#f3e8ff' }]}>
              <Icon name="lungs" type="font-awesome-5" color={COLORS.accent} size={20} />
            </View>
            <Typography.H1 style={styles.recoveryValue}>{"48.2"}</Typography.H1>
            <Typography.Caption style={styles.recoveryLabel}>{"VO2 Max"}</Typography.Caption>
            <Typography.Caption style={StyleSheet.flatten([styles.recoveryBadge, styles.eliteBadge])}>{"Elite"}</Typography.Caption>
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
  recoveryGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  recoveryItem: { flex: 1, alignItems: 'center' },
  recoveryIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  recoveryValue: { fontSize: 24, fontWeight: '600', color: COLORS.text.primary },
  recoveryLabel: { fontSize: 12, color: COLORS.text.light, marginTop: 4 },
  recoveryBadge: { fontSize: 12, fontWeight: '500', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  optimalBadge: { backgroundColor: COLORS.status.optimal, color: COLORS.success },
  goodBadge: { backgroundColor: COLORS.status.optimal, color: COLORS.success },
  eliteBadge: { backgroundColor: COLORS.status.elite, color: COLORS.primary },
}); 