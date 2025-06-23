import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { COLORS, SPACING } from '../../styles';
import { Icon } from '@rneui/themed';

export function WorkoutCard() {
  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <Typography.H2>Today's Session</Typography.H2>
        <Typography.Subtext style={styles.viewAll}>View All</Typography.Subtext>
      </View>
      <Card style={styles.workoutCard}>
        <Image source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/38b6e7e777-5a1a01fd5c7775c8014c.png' }} style={styles.workoutImage} />
        <View style={styles.durationBadge}><Typography.Caption style={styles.durationText}>45 min</Typography.Caption></View>
        <View style={styles.workoutContent}>
          <View style={styles.rowBetween}>
            <View>
              <Typography.Body style={styles.workoutTitle}>Upper Body Strength</Typography.Body>
              <Typography.Subtext>Focus on form and control</Typography.Subtext>
            </View>
            <Typography.Caption style={styles.difficultyBadge}>Intermediate</Typography.Caption>
          </View>
          <TouchableOpacity style={styles.startButton}>
            <Icon name="play" type="font-awesome-5" color="#fff" size={14} style={{ marginRight: 8 }} />
            <Typography.Body style={styles.startText}>Start Session</Typography.Body>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: SPACING.xl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  viewAll: { color: COLORS.primary, fontWeight: '500' },
  workoutCard: { padding: 0, overflow: 'hidden' },
  workoutImage: { height: 180, width: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  durationBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  durationText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  workoutContent: { padding: SPACING.lg },
  workoutTitle: { fontWeight: '600', marginBottom: 4 },
  difficultyBadge: { backgroundColor: '#ffedd5', color: '#ea580c', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, overflow: 'hidden', fontWeight: '500' },
  startButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  startText: { color: '#fff', fontWeight: '600' },
}); 