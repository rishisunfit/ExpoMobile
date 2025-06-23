import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { COLORS, SPACING } from '../../styles';
import { Icon } from '@rneui/themed';

export function ReadinessCard() {
  return (
    <View style={styles.section}>
      <Typography.H2>Readiness Assessment</Typography.H2>
      <Card style={styles.readinessCard}>
        <View style={styles.row}>
          <View style={styles.boltIcon}><Icon name="bolt" type="font-awesome-5" color={COLORS.primary} size={18} /></View>
          <View style={{ flex: 1 }}>
            <Typography.Body style={styles.readinessTitle}>Ready to perform</Typography.Body>
            <Typography.Subtext>
              Your recovery metrics indicate optimal readiness. Sleep quality and HRV are both in excellent ranges. Today's upper body session can be performed at full intensity with confidence.
            </Typography.Subtext>
            <View style={styles.performanceBadge}><Typography.Caption style={styles.performanceText}>High Performance</Typography.Caption></View>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: SPACING.xl },
  readinessCard: { padding: SPACING.lg },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  boltIcon: { width: 48, height: 48, backgroundColor: COLORS.status.elite, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  readinessTitle: { fontWeight: '600', marginBottom: 12 },
  performanceBadge: { backgroundColor: COLORS.status.elite, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 12 },
  performanceText: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
}); 