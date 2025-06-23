import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '@rneui/themed';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { COLORS, SPACING } from '../../styles';

interface Habit {
  id: number;
  icon: string;
  color: string;
  bg: string;
  title: string;
  subtitle: string;
  completed: boolean;
}

export function DailyHabits() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: 1, icon: 'mobile-alt', color: COLORS.error, bg: '#fee2e2', title: 'Digital sunset', subtitle: '30 mins before bed', completed: false },
    { id: 2, icon: 'walking', color: COLORS.secondary, bg: '#dbeafe', title: 'Movement breaks', subtitle: '2 × 5 minutes today', completed: false }
  ]);

  const toggleHabit = (id: number) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  return (
    <View style={styles.section}>
      <Typography.H2>Daily Habits</Typography.H2>
      {habits.map((habit) => (
        <Card style={styles.habitCard} key={habit.id}>
          <View style={styles.cardContentRow}>
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, { backgroundColor: habit.bg }]}> 
                <Icon name={habit.icon} type="font-awesome-5" color={habit.color} size={18} />
              </View>
              <View>
                <Typography.Body style={styles.cardTitle}>{habit.title}</Typography.Body>
                <Typography.Subtext>{habit.subtitle}</Typography.Subtext>
              </View>
            </View>
            <TouchableOpacity onPress={() => toggleHabit(habit.id)}>
              <View style={[styles.checkCircle, habit.completed && styles.checkCircleFilled]}>
                {habit.completed && <Icon name="check" type="font-awesome-5" color="#fff" size={12} />}
              </View>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.xl,
  },
  habitCard: {
    marginBottom: SPACING.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardTitle: {
    fontWeight: '500',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleFilled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}); 