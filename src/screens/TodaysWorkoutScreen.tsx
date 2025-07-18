import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/common/Card';
import { Typography } from '../components/common/Typography';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS, SPACING } from '../styles';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function TodaysWorkoutScreen({ navigation }: any) {
  const [workoutName, setWorkoutName] = useState('Loading...');
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [programId, setProgramId] = useState<string | null>(null);
  const [targetDay, setTargetDay] = useState<number | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodaysWorkout = async () => {
      try {
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('❌ Auth error:', authError);
          setWorkoutName('Auth Error');
          return;
        }
        
        if (user) {
          // First, get the current program day
          const { data: dayData, error: dayError } = await supabase.rpc('get_current_program_day', {
            client_uuid: user.id
          });

          if (dayError) {
            console.error('❌ Error fetching current program day:', dayError);
            setWorkoutName('Error Loading Day');
            return;
          }

          // Extract the day value and program_id (adjust if your RPC returns different fields)
          const dayInfo = dayData && dayData.length > 0 ? dayData[0] : null;
          if (!dayInfo) {
            setWorkoutName('No Program Day');
            return;
          }

          const currentDay = dayInfo.day;
          const currentProgramId = dayInfo.program_id; // Assuming this field exists
          
          setTargetDay(currentDay as number);
          setProgramId(currentProgramId as string);

          // Now, get the workout name and ID for the current day
          const { data: workoutData, error: workoutError } = await supabase.rpc('get_day_workouts', {
            client_uuid: user.id,
            target_day: currentDay
          });
          
          if (workoutError) {
            console.error('❌ Error fetching workout:', workoutError);
            setWorkoutName('Workout Not Found');
            return;
          }
          
          if (workoutData && workoutData.length > 0) {
            const workout: any = workoutData[0];
            setWorkoutName(workout.workout_name || 'Workout Not Found');
            setWorkoutId(workout.workout_id as string); // Store the workout ID
            // Fetch cover_photo from workouts table
            let coverPhotoUrl = null;
            if (workout.workout_id) {
              const { data: workoutRow, error: workoutRowError } = await supabase
                .from('workouts')
                .select('cover_photo')
                .eq('id', workout.workout_id)
                .single();
              if (!workoutRowError && workoutRow && workoutRow.cover_photo) {
                coverPhotoUrl = workoutRow.cover_photo;
              }
              setCoverPhoto(coverPhotoUrl);
              await fetchWorkoutExercises(workout.workout_id as string);
            }
          } else {
            setWorkoutName('No Workout Today');
          }
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        setWorkoutName('Error Loading Workout');
      } finally {
        setLoading(false);
      }
    };

    const fetchWorkoutExercises = async (workoutId: string) => {
      try {
        const { data, error } = await supabase.rpc('get_workout_preview', {
          workout_uuid: workoutId,
        });
        if (error) {
          console.error("❌ Error fetching workout preview:", error);
          return;
        }
        // Batch fetch images from exercise_library
        const exerciseIds = Array.from(new Set(data.map((item: any) => item.exercise_id)));
        let imageMap: Record<string, string> = {};
        if (exerciseIds.length > 0) {
          const { data: imageRows, error: imageError } = await supabase
            .from('exercise_library')
            .select('id, image')
            .in('id', exerciseIds);
          if (imageError) {
            console.error('❌ Error fetching exercise images:', imageError);
          } else if (imageRows) {
            imageMap = imageRows.reduce((acc: Record<string, string>, row: any) => {
              acc[row.id] = row.image;
              return acc;
            }, {});
          }
        }
        // Transform the data into the format expected by the UI, passing the image map
        const transformedExercises = transformExerciseData(data, imageMap);
        setExercises(transformedExercises);
      } catch (err) {
        console.error('❌ Error fetching exercises:', err);
      }
    };

    // Accept imageMap as a parameter
    const transformExerciseData = (data: any[], imageMap: Record<string, string> = {}) => {
      // Group exercises by exercise_name and aggregate sets/reps
      const exerciseMap = new Map();
      data.forEach((item: any) => {
        const key = item.exercise_name;
        if (!exerciseMap.has(key)) {
          exerciseMap.set(key, {
            id: item.exercise_id, // <-- GOOD: this is the UUID
            name: item.exercise_name,
            muscles: item.muscles_trained,
            image: imageMap[item.exercise_id] || '', // Use fetched image or blank
            setDetails: [],
            blockType: item.block_type,
            orderIndex: item.order_index
          });
        }
        const exercise = exerciseMap.get(key);
        exercise.setDetails.push({
          setNumber: item.set_number,
          setType: item.set_type,
          reps: item.reps
        });
      });
      // Sort by order_index to maintain proper sequence
      const exercisesArray = Array.from(exerciseMap.values());
      exercisesArray.sort((a, b) => a.orderIndex - b.orderIndex);
      // Mark superset and circuit exercises as before
      const supersetGroups = new Map();
      exercisesArray.forEach((exercise: any) => {
        if (exercise.blockType === 'superset') {
          const key = `${exercise.blockType}_${exercise.orderIndex}`;
          if (!supersetGroups.has(key)) {
            supersetGroups.set(key, []);
          }
          supersetGroups.get(key).push(exercise);
        }
      });
      supersetGroups.forEach((group: any[]) => {
        if (group.length >= 2) {
          group.forEach((exercise: any) => {
            exercise.isSuperset = true;
            exercise.supersetGroup = group;
          });
        }
      });
      const circuitGroups = new Map();
      exercisesArray.forEach((exercise: any) => {
        if (exercise.blockType === 'circuit') {
          const key = `${exercise.blockType}_${exercise.orderIndex}`;
          if (!circuitGroups.has(key)) {
            circuitGroups.set(key, []);
          }
          circuitGroups.get(key).push(exercise);
        }
      });
      circuitGroups.forEach((group: any[]) => {
        if (group.length >= 3) {
          group.forEach((exercise: any) => {
            exercise.isCircuit = true;
            exercise.circuitGroup = group;
          });
        }
      });
      return exercisesArray;
    };

    fetchTodaysWorkout();
  }, []);

  // Add this function to calculate total sets
  const calculateTotalSets = () => {
    let totalSets = 0;
    const processedGroups = new Set();
    exercises.forEach((exercise: any) => {
      if (exercise.isCircuit && exercise.circuitGroup) {
        const groupKey = `circuit_${exercise.orderIndex}`;
        if (!processedGroups.has(groupKey)) {
          processedGroups.add(groupKey);
          // Count rounds as the max setNumber in the group
          const maxRound = Math.max(
            ...exercise.circuitGroup.flatMap((ex: any) =>
              ex.setDetails.map((set: any) => Number(set.setNumber) || 1)
            )
          );
          totalSets += maxRound;
        }
      } else if (exercise.isSuperset && exercise.supersetGroup) {
        const groupKey = `superset_${exercise.orderIndex}`;
        if (!processedGroups.has(groupKey)) {
          processedGroups.add(groupKey);
          // Count rounds as the max setNumber in the group
          const maxRound = Math.max(
            ...exercise.supersetGroup.flatMap((ex: any) =>
              ex.setDetails.map((set: any) => Number(set.setNumber) || 1)
            )
          );
          totalSets += maxRound;
        }
      } else {
        // Normal: count all sets
        totalSets += exercise.setDetails.length;
      }
    });
    return totalSets;
  };

  const handleStartWorkout = () => {
    if (exercises && exercises.length > 0) {
      const firstExercise = exercises[0];
      
      // Check if first exercise is part of a circuit
      if (firstExercise.isCircuit && firstExercise.circuitGroup) {
        // Navigate to circuit mode with just the circuit group
        navigation.navigate('ExerciseDetail', { 
          allExercises: firstExercise.circuitGroup,
          workoutName: workoutName,
          workoutId: workoutId,
          programId: programId,
          day: targetDay,
          totalDuration: '20 minutes',
          fullWorkout: exercises
        });
      } else if (firstExercise.isSuperset && firstExercise.supersetGroup) {
        // Navigate to superset mode with just the superset group
        navigation.navigate('ExerciseDetail', { 
          allExercises: firstExercise.supersetGroup,
          workoutName: workoutName,
          workoutId: workoutId,
          programId: programId,
          day: targetDay,
          totalDuration: '15 minutes',
          fullWorkout: exercises
        });
      } else {
        // Navigate to single exercise mode
        navigation.navigate('ExerciseDetail', { 
          exercise: firstExercise,
          workoutName: workoutName,
          workoutId: workoutId,
          programId: programId,
          day: targetDay,
          fullWorkout: exercises
        });
      }
    } else {
      console.log("No exercises available to start.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.secondary }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.secondary }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={16} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Typography.H2 style={styles.headerTitle}>Today's Workout</Typography.H2>
          <Typography.Subtext>{workoutName}</Typography.Subtext>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Workout Cover */}
        <View style={styles.workoutCover}>
          <Image
            source={{ uri: coverPhoto || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/f87bb8eb54-29e9ef32f3de3995d7f0.png' }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.coverOverlay}>
            <View style={styles.coverContent}>
              <View style={styles.coverInfo}>
                <Typography.H1 style={styles.coverTitle}>{workoutName}</Typography.H1>
                <View style={styles.coverStats}>
                  <View style={styles.coverStat}>
                    <Icon name="clock" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.coverStatText}>45 min</Text>
                  </View>
                  <View style={styles.coverStat}>
                    <Icon name="fire" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.coverStatText}>High Intensity</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.startWorkoutButton} onPress={handleStartWorkout}>
                <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Workout Overview */}
        <View style={styles.overviewSection}>
          <Card style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Typography.H2>Workout Overview</Typography.H2>
              <View style={styles.exerciseCount}>
                <Text style={styles.exerciseCountText}>{exercises.length} Exercises</Text>
              </View>
            </View>
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatNumber}>45</Text>
                <Text style={styles.overviewStatLabel}>Minutes</Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatNumber}>{calculateTotalSets()}</Text>
                <Text style={styles.overviewStatLabel}>Total Sets</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseSection}>
          <Typography.H2 style={styles.exerciseSectionTitle}>Exercises</Typography.H2>
          {/* Group exercises by name, then by reps batch */}
          {(() => {
            // Map: exercise_name -> [{ ...exercise, setDetails: [...] }]
            const nameMap = new Map<string, any[]>();
            exercises.forEach((ex: any) => {
              if (!nameMap.has(ex.name)) {
                nameMap.set(ex.name, []);
              }
              nameMap.get(ex.name)!.push(ex);
            });
            const nameEntries = Array.from(nameMap.entries());
            return nameEntries.map(([exerciseName, batches], idx) => {
              const firstBatch = batches[0];
              // For each exercise, group all sets by reps value
              const repsMap = new Map<string, any[]>();
              batches.forEach((batch: any) => {
                batch.setDetails.forEach((set: any) => {
                  const reps = set.reps;
                  if (!repsMap.has(reps)) {
                    repsMap.set(reps, []);
                  }
                  repsMap.get(reps)!.push(set);
                });
              });
              const isCircuit = firstBatch.isCircuit;
              const isSuperset = firstBatch.isSuperset;
              // Only show connector if this is NOT the last card in the group
              const isNotLast = idx < nameEntries.length - 1 && (
                (isSuperset && nameEntries[idx + 1][1][0].isSuperset) ||
                (isCircuit && nameEntries[idx + 1][1][0].isCircuit)
              );
              return (
                <React.Fragment key={exerciseName + idx}>
                  <Card style={styles.exerciseCard}>
                    <View style={styles.exerciseContent}>
                      <View style={styles.exerciseImageWrapper}>
                        <Image
                          source={{ uri: firstBatch.image }}
                          style={styles.exerciseImage}
                          resizeMode="cover"
                        />
                        <View style={styles.exercisePlayOverlay}>
                          <Icon name="play" size={12} color="#fff" />
                        </View>
                      </View>
                      <View style={styles.exerciseInfo}>
                        <Typography.H2 style={styles.exerciseName}>{exerciseName}</Typography.H2>
                        <Typography.Subtext style={styles.exerciseMuscles}>{firstBatch.muscles}</Typography.Subtext>
                        {/* Render each reps group as a row */}
                        {Array.from(repsMap.entries()).map(([reps, sets], batchIdx) => (
                          <View key={batchIdx} style={styles.exerciseDetails}>
                            <View style={[styles.setsBadge, isSuperset && styles.supersetBadge, isCircuit && styles.circuitBadge]}>
                              <Text style={[styles.setsBadgeText, isSuperset && styles.supersetBadgeText, isCircuit && styles.circuitBadgeText]}>{sets.length} sets</Text>
                            </View>
                            <Text style={styles.repsText}>{reps} reps</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </Card>
                  {isSuperset && isNotLast && (
                    <View style={{ alignItems: 'center', marginTop: -16, marginBottom: 0, zIndex: 10 }}>
                      <Icon name="arrows-up-down" size={20} color={COLORS.secondary} />
                    </View>
                  )}
                  {isCircuit && isNotLast && (
                    <View style={styles.circuitIconContainer}>
                      <Icon name="link" size={20} color="#a855f7" />
                    </View>
                  )}
                </React.Fragment>
              );
            });
          })()}
          <TouchableOpacity style={styles.bottomStartButton} onPress={handleStartWorkout}>
            <Icon name="dumbbell" size={20} color="#fff" style={{ marginRight: 12 }} />
            <Text style={styles.bottomStartButtonText}>Start Workout</Text>
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    marginBottom: 2,
  },
  workoutCover: {
    position: 'relative',
    height: 256,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  coverContent: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  coverInfo: {
    flex: 1,
  },
  coverTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  coverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  coverStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coverStatText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  startWorkoutButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  startWorkoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  overviewSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  overviewCard: {
    padding: SPACING.lg,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  exerciseCount: {
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: 20,
  },
  exerciseCountText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  overviewStats: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  overviewStat: {
    flex: 1,
    alignItems: 'center',
  },
  overviewStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  overviewStatLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  exerciseSection: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  exerciseSectionTitle: {
    marginBottom: SPACING.md,
  },
  exerciseCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  exerciseContent: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  exerciseImageWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  exercisePlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    marginBottom: 4,
  },
  exerciseMuscles: {
    marginBottom: SPACING.sm,
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  setsBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: 20,
  },
  setsBadgeText: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  supersetBadge: {
    backgroundColor: COLORS.status.good,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: 20,
  },
  supersetBadgeText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  repsText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  bottomStartButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: 16,
    marginTop: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomStartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  supersetIconContainer: {
    alignItems: 'center',
    marginVertical: -SPACING.sm,
    zIndex: 1,
  },
  circuitIconContainer: {
    alignItems: 'center',
    marginVertical: -SPACING.sm,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  skeletonText: {
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginBottom: 8,
  },
  circuitBadge: {
    backgroundColor: '#f3e8ff',
    borderWidth: 1,
    borderColor: '#a855f7',
    shadowColor: '#a855f7',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  circuitBadgeText: {
    color: '#7c3aed',
    fontWeight: '600',
  },
}); 