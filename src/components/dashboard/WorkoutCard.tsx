import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { COLORS, SPACING } from '../../styles';
import { Icon } from '@rneui/themed';
import { supabase } from '../../../lib/supabase';

export function WorkoutCard({ navigation }: { navigation?: any }) {
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<any>(null);
  const [image, setImage] = useState<string>('');

  useEffect(() => {
    const fetchWorkout = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user');
        const { data: dayData, error: dayError } = await supabase.rpc('get_current_program_day', { client_uuid: user.id });
        if (dayError || !dayData || !dayData[0]) throw new Error('No program day');
        const currentDay = dayData[0].day;
        const { data: workoutData, error: workoutError } = await supabase.rpc('get_day_workouts', { client_uuid: user.id, target_day: currentDay });
        if (workoutError || !workoutData || !workoutData[0]) throw new Error('No workout');
        const workout = workoutData[0];
        setWorkout(workout);
        let coverPhoto = '';
        // Fetch cover_photo from workouts table
        if (workout.workout_id) {
          const { data: workoutRow, error: workoutRowError } = await supabase
            .from('workouts')
            .select('cover_photo')
            .eq('id', workout.workout_id)
            .single();
          if (!workoutRowError && workoutRow && workoutRow.cover_photo) {
            coverPhoto = workoutRow.cover_photo;
          }
        }
        // Try to fetch an image for the first exercise in the workout
        let fallbackImage = '';
        const { data: exerciseData, error: exerciseError } = await supabase.rpc('get_workout_preview', { workout_uuid: workout.workout_id });
        if (!exerciseError && exerciseData && exerciseData.length > 0) {
          const firstExerciseId = exerciseData[0].exercise_id;
          const { data: imageRows } = await supabase
            .from('exercise_library')
            .select('id, image')
            .eq('id', firstExerciseId)
            .limit(1);
          if (imageRows && imageRows[0]?.image) {
            fallbackImage = imageRows[0].image;
          }
        }
        setImage(coverPhoto || fallbackImage);
      } catch {
        setWorkout(null);
        setImage('');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, []);

  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <Typography.H2>Today's Session</Typography.H2>
        <Typography.Subtext style={styles.viewAll}>View All</Typography.Subtext>
      </View>
      <Card style={styles.workoutCard}>
        {loading ? (
          <View style={{ height: 180, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : workout ? (
          <>
            <Image source={{ uri: image || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/38b6e7e777-5a1a01fd5c7775c8014c.png' }} style={styles.workoutImage} />
            <View style={styles.durationBadge}><Typography.Caption style={styles.durationText}>45 min</Typography.Caption></View>
            <View style={styles.workoutContent}>
              <View style={styles.rowBetween}>
                <View>
                  <Typography.Body style={styles.workoutTitle}>{workout.workout_name || 'Workout'}</Typography.Body>
                  <Typography.Subtext>{workout.notes || 'Focus on form and control'}</Typography.Subtext>
                </View>
                <Typography.Caption style={styles.difficultyBadge}>Intermediate</Typography.Caption>
              </View>
              <TouchableOpacity style={styles.startButton} onPress={() => navigation && navigation.navigate && navigation.navigate('Workouts', { screen: 'TodaysWorkout' })}>
                <Icon name="play" type="font-awesome-5" color="#fff" size={14} style={{ marginRight: 8 }} />
                <Typography.Body style={styles.startText}>Start Session</Typography.Body>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text>No workout found for today.</Text>
          </View>
        )}
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