import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { COLORS, SPACING } from '../../styles';

export function NutritionCard() {
  const nutritionData = [
    ['Calories', '1,847 cal', 75, COLORS.primary],
    ['Protein', '128g', 82, COLORS.secondary],
    ['Carbs', '203g', 68, COLORS.accent],
    ['Fats', '72g', 90, COLORS.warning],
  ];
  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <Typography.H2>Nutrition</Typography.H2>
        <View style={styles.logButton}><Typography.Caption style={styles.logButtonText}>Log Food</Typography.Caption></View>
      </View>
      <Card style={styles.nutritionCard}>
        {nutritionData.map(([label, val, percent, color], idx) => (
          <View key={idx} style={{ marginBottom: SPACING.md }}>
            <View style={styles.rowBetween}><Typography.Body>{label}</Typography.Body><Typography.Body style={styles.nutritionValue}>{val}</Typography.Body></View>
            <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${percent}%` as any, backgroundColor: color as string }]} /></View>
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: SPACING.xl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  logButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16 },
  logButtonText: { color: '#fff', fontWeight: '500', fontSize: 14 },
  nutritionCard: {},
  nutritionValue: { fontWeight: '600' },
  progressBar: { backgroundColor: COLORS.background.card, height: 10, borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: 10, borderRadius: 10 },
}); 