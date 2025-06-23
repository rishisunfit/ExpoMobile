// DashboardScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';

export default function DashboardScreen() {
  const [habits, setHabits] = useState([
    { id: 1, icon: 'mobile-alt', color: '#ef4444', bg: '#fee2e2', title: 'Digital sunset', subtitle: '30 mins before bed', completed: false },
    { id: 2, icon: 'walking', color: '#3b82f6', bg: '#dbeafe', title: 'Movement breaks', subtitle: '2 × 5 minutes today', completed: false }
  ]);

  const toggleHabit = (id: number) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Welcome Banner */}
        <View style={[styles.card, styles.welcomeBanner]}>
          <Text style={styles.welcomeTitle}>Welcome back, Sarah</Text>
          <Text style={styles.welcomeSubtitle}>Monday, June 4</Text>
        </View>

        {/* Daily Habits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Habits</Text>
          {habits.map((habit) => (
            <TouchableOpacity 
              key={habit.id} 
              style={styles.card}
              onPress={() => toggleHabit(habit.id)}
            >
              <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: habit.bg }]}> 
                  <Icon name={habit.icon} type="font-awesome-5" color={habit.color} size={18} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>{habit.title}</Text>
                  <Text style={styles.cardSubtext}>{habit.subtitle}</Text>
                </View>
              </View>
              <View style={[styles.checkCircle, habit.completed && styles.checkCircleFilled]}>
                {habit.completed && <Icon name="check" type="font-awesome-5" color="#fff" size={12} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Workout Section */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Today's Session</Text>
            <Text style={styles.viewAll}>View All</Text>
          </View>
          <View style={styles.workoutCard}>
            <Image source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/38b6e7e777-5a1a01fd5c7775c8014c.png' }} style={styles.workoutImage} />
            <View style={styles.durationBadge}><Text style={styles.durationText}>45 min</Text></View>
            <View style={styles.workoutContent}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.workoutTitle}>Upper Body Strength</Text>
                  <Text style={styles.cardSubtext}>Focus on form and control</Text>
                </View>
                <Text style={styles.difficultyBadge}>Intermediate</Text>
              </View>
              <TouchableOpacity style={styles.startButton}>
                <Icon name="play" type="font-awesome-5" color="#fff" size={14} style={{ marginRight: 8 }} />
                <Text style={styles.startText}>Start Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Nutrition Section */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Nutrition</Text>
            <TouchableOpacity style={styles.logButton}><Text style={styles.logButtonText}>Log Food</Text></TouchableOpacity>
          </View>
          <View style={styles.nutritionCard}>
            {[['Calories', '1,847 cal', 75, '#10b981'], ['Protein', '128g', 82, '#3b82f6'], ['Carbs', '203g', 68, '#8b5cf6'], ['Fats', '72g', 90, '#f97316']].map(([label, val, percent, color], idx) => (
              <View key={idx} style={{ marginBottom: 16 }}>
                <View style={styles.rowBetween}><Text style={styles.nutritionLabel}>{label}</Text><Text style={styles.nutritionValue}>{val}</Text></View>
                <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${percent}%` as any, backgroundColor: color as string }]} /></View>
              </View>
            ))}
          </View>
        </View>

        {/* Daily Steps */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Daily Steps</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <View style={styles.stepsContainer}>
              <View style={styles.stepsInfo}>
                <Text style={styles.stepsNumber}>8,432</Text>
                <Text style={styles.stepsLabel}>steps today</Text>
                <View style={styles.stepsProgress}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '84%', backgroundColor: '#10b981' }]} />
                  </View>
                  <Text style={styles.progressText}>84% of daily goal</Text>
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
          </View>
        </View>

        {/* Sleep */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Sleep</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <View style={styles.sleepContainer}>
              <View style={styles.sleepInfo}>
                <Text style={styles.sleepTime}>7h 32m</Text>
                <Text style={styles.sleepLabel}>last night</Text>
                <View style={styles.sleepQuality}>
                  <Icon name="star" type="font-awesome-5" color="#fbbf24" size={16} />
                  <Text style={styles.sleepQualityText}>Good quality sleep</Text>
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
          </View>
        </View>

        {/* Recovery */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Recovery</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <View style={styles.recoveryGrid}>
              <View style={styles.recoveryItem}>
                <View style={[styles.recoveryIcon, { backgroundColor: '#fee2e2' }]}>
                  <Icon name="heartbeat" type="font-awesome-5" color="#ef4444" size={20} />
                </View>
                <Text style={styles.recoveryValue}>72</Text>
                <Text style={styles.recoveryLabel}>Heart Rate</Text>
                <Text style={[styles.recoveryBadge, styles.optimalBadge]}>Optimal</Text>
              </View>

              <View style={styles.recoveryItem}>
                <View style={[styles.recoveryIcon, { backgroundColor: '#dbeafe' }]}>
                  <Icon name="wave-square" type="font-awesome-5" color="#3b82f6" size={20} />
                </View>
                <Text style={styles.recoveryValue}>42ms</Text>
                <Text style={styles.recoveryLabel}>HRV</Text>
                <Text style={[styles.recoveryBadge, styles.goodBadge]}>Good</Text>
              </View>

              <View style={styles.recoveryItem}>
                <View style={[styles.recoveryIcon, { backgroundColor: '#f3e8ff' }]}>
                  <Icon name="lungs" type="font-awesome-5" color="#8b5cf6" size={20} />
                </View>
                <Text style={styles.recoveryValue}>48.2</Text>
                <Text style={styles.recoveryLabel}>VO2 Max</Text>
                <Text style={[styles.recoveryBadge, styles.eliteBadge]}>Elite</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Readiness Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Readiness Assessment</Text>
          <View style={styles.readinessCard}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={styles.boltIcon}><Icon name="bolt" type="font-awesome-5" color="#10b981" size={18} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.readinessTitle}>Ready to perform</Text>
                <Text style={styles.cardSubtext}>
                  Your recovery metrics indicate optimal readiness. Sleep quality and HRV are both in excellent ranges. Today's upper body session can be performed at full intensity with confidence.
                </Text>
                <View style={styles.performanceBadge}><Text style={styles.performanceText}>High Performance</Text></View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 24, paddingBottom: 100 },
  welcomeBanner: { 
    marginBottom: 32,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  welcomeTitle: { fontSize: 28, fontWeight: '300', color: '#1f2937' },
  welcomeSubtitle: { color: '#64748b', fontSize: 16, marginTop: 4 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 16 },
  card: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardTitle: { fontSize: 16, fontWeight: '500', color: '#1f2937' },
  cardSubtext: { fontSize: 14, color: '#64748b', marginTop: 4 },
  checkCircle: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  checkCircleFilled: { backgroundColor: '#10b981', borderColor: '#10b981' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAll: { fontSize: 14, color: '#10b981', fontWeight: '500' },
  workoutCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' },
  workoutImage: { height: 180, width: '100%', objectFit: 'cover' },
  durationBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  durationText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  workoutContent: { padding: 24 },
  workoutTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  difficultyBadge: { backgroundColor: '#ffedd5', color: '#ea580c', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, overflow: 'hidden', fontWeight: '500' },
  startButton: { backgroundColor: '#10b981', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  startText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logButton: { backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16 },
  logButtonText: { color: '#fff', fontWeight: '500', fontSize: 14 },
  nutritionCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  nutritionLabel: { fontSize: 16, color: '#1f2937', fontWeight: '500' },
  nutritionValue: { fontSize: 16, color: '#1f2937', fontWeight: '600' },
  progressBar: { backgroundColor: '#e5e7eb', height: 10, borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: 10, borderRadius: 10 },
  readinessCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  boltIcon: { width: 48, height: 48, backgroundColor: '#d1fae5', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  readinessTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  performanceBadge: { backgroundColor: '#d1fae5', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 12 },
  performanceText: { color: '#10b981', fontSize: 14, fontWeight: '500' },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepsInfo: {
    flex: 1,
  },
  stepsNumber: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1f2937',
  },
  stepsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  stepsProgress: {
    marginTop: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  stepsChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    gap: 4,
  },
  chartBar: {
    width: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    height: 20,
  },
  sleepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sleepInfo: {
    flex: 1,
  },
  sleepTime: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1f2937',
  },
  sleepLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  sleepQuality: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  sleepQualityText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  sleepChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    gap: 4,
  },
  sleepBar: {
    width: 4,
    backgroundColor: '#10b981',
    borderRadius: 2,
    height: 20,
  },
  recoveryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  recoveryItem: {
    flex: 1,
    alignItems: 'center',
  },
  recoveryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  recoveryValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
  },
  recoveryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  recoveryBadge: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  optimalBadge: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  goodBadge: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  eliteBadge: {
    backgroundColor: '#d1fae5',
    color: '#10b981',
  },
});
