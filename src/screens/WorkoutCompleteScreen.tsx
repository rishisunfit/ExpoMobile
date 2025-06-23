import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/common/Card';
import { Typography } from '../components/common/Typography';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS, SPACING } from '../styles';
import { supabase } from '../../lib/supabase';

export default function WorkoutCompleteScreen({ route, navigation }: any) {
  const { workoutId, workoutName, day, programId, setLogs } = route.params || {};
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  console.log('Set logs to insert:', setLogs);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    };
    getUser();
  }, []);

  const saveWorkoutCompletion = async () => {
    if (!user || !workoutId || !programId || !day) {
      Alert.alert('Error', 'Missing required data to save workout completion');
      return;
    }

    setLoading(true);
    try {
      const enrichedLogs = setLogs.map(log => ({
        ...log,
        client_id: user.id,
        workout_id: workoutId,
        program_id: programId,
        day: day,
        // exercise_id: log.exerciseId, // Make sure this is the UUID from your exercise library!
        // set_number: log.setNumber,
        // reps: log.reps,
        // weight: log.weight,
        // notes: log.notes,
      }));
      const { data, error } = await supabase
        .from('completed_workouts')
        .insert({
          client_id: user.id,
          workout_id: workoutId,
          program_id: programId,
          day: day,
          notes: notes.trim() || null
        });

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - already completed today
          Alert.alert(
            'Workout Already Completed',
            'You have already completed today\'s workout. Would you like to update your notes?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Update Notes', onPress: updateWorkoutNotes }
            ]
          );
        } else {
          Alert.alert('Error', `Failed to save workout completion: ${error.message}`);
        }
      } else {
        await supabase.from('completed_exercise_logs').insert(enrichedLogs);
        if (error) {
          console.error('Supabase insert error:', error);
          Alert.alert('Error', 'An unexpected error occurred while saving your workout');
        } else {
          Alert.alert(
            'Workout Completed!',
            'Great job! Your workout has been saved.',
            [
              { 
                text: 'Continue', 
                onPress: () => navigation.navigate('Home')
              }
            ]
          );
        }
      }
    } catch (err) {
      console.error('Error saving workout completion:', err);
      Alert.alert('Error', 'An unexpected error occurred while saving your workout');
    } finally {
      setLoading(false);
    }
  };

  const updateWorkoutNotes = async () => {
    if (!user || !workoutId || !programId || !day) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('completed_workouts')
        .update({ notes: notes.trim() || null })
        .eq('client_id', user.id)
        .eq('program_id', programId)
        .eq('day', day);

      if (error) {
        Alert.alert('Error', `Failed to update notes: ${error.message}`);
      } else {
        Alert.alert(
          'Notes Updated',
          'Your workout notes have been updated successfully.',
          [
            { 
              text: 'Continue', 
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      }
    } catch (err) {
      console.error('Error updating workout notes:', err);
      Alert.alert('Error', 'An unexpected error occurred while updating your notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Workout Completion',
      'Are you sure you want to skip saving this workout? Your progress will not be recorded.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => navigation.navigate('Home') }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.secondary }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Typography.H1 style={styles.headerTitle}>Workout Complete!</Typography.H1>
            <Typography.Subtext>Great job finishing your workout</Typography.Subtext>
          </View>
          <View style={styles.successIcon}>
            <Icon name="check-circle" size={48} color={COLORS.status.good} />
          </View>
        </View>

        {/* Workout Summary */}
        <Card style={styles.summaryCard}>
          <Typography.H2 style={styles.summaryTitle}>Workout Summary</Typography.H2>
          <View style={styles.summaryItem}>
            <Icon name="dumbbell" size={16} color={COLORS.text.secondary} />
            <Text style={styles.summaryText}>{workoutName || 'Today\'s Workout'}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="calendar" size={16} color={COLORS.text.secondary} />
            <Text style={styles.summaryText}>Day {day}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="clock" size={16} color={COLORS.text.secondary} />
            <Text style={styles.summaryText}>Completed at {new Date().toLocaleTimeString()}</Text>
          </View>
        </Card>

        {/* Notes Section */}
        <Card style={styles.notesCard}>
          <Typography.H2 style={styles.notesTitle}>Workout Notes (Optional)</Typography.H2>
          <Typography.Subtext style={styles.notesSubtitle}>
            How did this workout feel? Any observations or notes for next time?
          </Typography.Subtext>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., Felt strong today, need to work on form for squats..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.disabledButton]} 
            onPress={saveWorkoutCompletion}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="save" size={16} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Save Workout</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    marginBottom: SPACING.xs,
    color: COLORS.status.good,
  },
  successIcon: {
    marginLeft: SPACING.lg,
  },
  summaryCard: {
    margin: SPACING.lg,
    padding: SPACING.lg,
  },
  summaryTitle: {
    marginBottom: SPACING.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryText: {
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  notesCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  notesTitle: {
    marginBottom: SPACING.xs,
  },
  notesSubtitle: {
    marginBottom: SPACING.md,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text.primary,
    backgroundColor: '#fff',
    minHeight: 100,
  },
  actionButtons: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  skipButtonText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
}); 