import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Card } from '../components/common/Card';
import { Typography } from '../components/common/Typography';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS, SPACING } from '../styles';
import { format } from 'date-fns';
// import AskMeadow from wherever it is implemented

function generateWorkoutOverview(exercises) {
  if (!exercises || exercises.length === 0) return '';
  // Group by block_type and order_index
  const groups = [];
  let currentGroup = null;
  let lastBlockType = null;
  let lastOrderIndex = null;

  exercises.forEach((ex, idx) => {
    const blockType = ex.block_type || 'normal';
    const orderIndex = ex.order_index;
    if (
      !currentGroup ||
      blockType !== lastBlockType ||
      (blockType !== 'normal' && orderIndex !== lastOrderIndex)
    ) {
      currentGroup = {
        blockType,
        orderIndex,
        exercises: [],
      };
      groups.push(currentGroup);
    }
    currentGroup.exercises.push(ex);
    lastBlockType = blockType;
    lastOrderIndex = orderIndex;
  });

  let mainNumber = 1;
  const INDENT = '    '; // 4 spaces for indentation
  return groups
    .map((group) => {
      const { blockType, exercises } = group;
      const letters = 'abcdefghijklmnopqrstuvwxyz';
      if (blockType === 'circuit' || blockType === 'superset') {
        // (unchanged logic for circuits/supersets)
        const exerciseMap = new Map();
        exercises.forEach((ex) => {
          const name = ex.exercise_name;
          if (!exerciseMap.has(name)) {
            exerciseMap.set(name, { ...ex, count: 1, sets: [ex.set_number || 1], reps: [ex.reps || ''] });
          } else {
            const entry = exerciseMap.get(name);
            entry.count += 1;
            entry.sets.push(ex.set_number || 1);
            entry.reps.push(ex.reps || '');
          }
        });
        const uniqueExercises = Array.from(exerciseMap.values());
        uniqueExercises.forEach(ex => {
          ex.maxSets = Math.max(...ex.sets);
          ex.uniqueReps = Array.from(new Set(ex.reps.filter(r => r !== '')));
        });
        const allSameSets = uniqueExercises.every(ex => ex.maxSets === uniqueExercises[0].maxSets);
        const allSameReps = uniqueExercises.every(ex =>
          ex.uniqueReps.length === uniqueExercises[0].uniqueReps.length &&
          ex.uniqueReps.every((r, idx) => r === uniqueExercises[0].uniqueReps[idx])
        );
        const label =
          blockType === 'circuit'
            ? 'CIRCUIT'
            : blockType === 'superset'
            ? 'SUPERSET'
            : '';
        if (allSameSets && allSameReps) {
          const sets = uniqueExercises[0].maxSets;
          const reps = uniqueExercises[0].uniqueReps.join('-');
          const groupLabel = `${mainNumber++}) ${sets}x${reps} ${label}:`;
          const exList = uniqueExercises
            .map((ex, idx) => `${INDENT}${letters[idx]}) ${ex.exercise_name}`)
            .join('\n');
          return `${groupLabel}\n${exList}`;
        } else {
          const groupLabel = `${mainNumber++}) ${label}:`;
          const exList = uniqueExercises
            .map((ex, idx) => {
              const reps = ex.uniqueReps.join('-');
              return `${INDENT}${letters[idx]}) ${ex.maxSets}x${reps} ${ex.exercise_name}`;
            })
            .join('\n');
          return `${groupLabel}\n${exList}`;
        }
      } else {
        // For normal, group by unique exercise name
        const exerciseNameMap = new Map();
        exercises.forEach((ex) => {
          const name = ex.exercise_name;
          if (!exerciseNameMap.has(name)) {
            exerciseNameMap.set(name, []);
          }
          exerciseNameMap.get(name).push(ex);
        });
        // For each unique exercise, group by reps batch
        const lines = [];
        exerciseNameMap.forEach((exList, name) => {
          const batchMap = new Map();
          exList.forEach((ex) => {
            const key = `${ex.reps}`;
            if (!batchMap.has(key)) {
              batchMap.set(key, { name: ex.exercise_name, reps: ex.reps, count: 1 });
            } else {
              batchMap.get(key).count += 1;
            }
          });
          const batches = Array.from(batchMap.values());
          if (batches.length === 1) {
            const b = batches[0];
            lines.push(`${mainNumber++}) ${b.count}x${b.reps} ${b.name}`);
          } else {
            batches.forEach((b, idx) => {
              lines.push(`${mainNumber}${letters[idx]}) ${b.count}x${b.reps} ${b.name}`);
            });
            mainNumber++;
          }
        });
        return lines.join('\n');
      }
    })
    .join('\n');
}

function consolidateExercisesForPreview(exercises) {
  if (!exercises || exercises.length === 0) return [];
  // Group by block_type and order_index for circuits/supersets, otherwise by name+reps batch
  const result = [];
  let lastBlockType = null;
  let lastOrderIndex = null;
  let group = [];
  let groupType = null;
  let groupOrderIndex = null;

  const pushGroup = () => {
    if (group.length > 0) {
      result.push({
        type: groupType,
        orderIndex: groupOrderIndex,
        exercises: group,
      });
      group = [];
    }
  };

  exercises.forEach((ex, idx) => {
    const blockType = ex.block_type || 'normal';
    const orderIndex = ex.order_index;
    if (
      group.length === 0 ||
      (blockType === groupType && blockType !== 'normal' && orderIndex === groupOrderIndex) ||
      (blockType === 'normal' && groupType === 'normal')
    ) {
      groupType = blockType;
      groupOrderIndex = orderIndex;
      group.push(ex);
    } else {
      pushGroup();
      groupType = blockType;
      groupOrderIndex = orderIndex;
      group = [ex];
    }
  });
  pushGroup();

  // Now, for each group, consolidate exercises
  const consolidated = [];
  result.forEach((g) => {
    if (g.type === 'circuit' || g.type === 'superset') {
      // Group by exercise name + reps batch
      const batchMap = new Map();
      g.exercises.forEach((ex) => {
        const key = `${ex.exercise_name}__${ex.reps}`;
        if (!batchMap.has(key)) {
          batchMap.set(key, { ...ex, setNumbers: [ex.set_number], repsList: [ex.reps] });
        } else {
          const entry = batchMap.get(key);
          entry.setNumbers.push(ex.set_number);
          entry.repsList.push(ex.reps);
        }
      });
      consolidated.push({
        type: g.type,
        orderIndex: g.orderIndex,
        exercises: Array.from(batchMap.values()),
      });
    } else {
      // Normal: group by exercise name + reps batch
      const batchMap = new Map();
      g.exercises.forEach((ex) => {
        const key = `${ex.exercise_name}__${ex.reps}`;
        if (!batchMap.has(key)) {
          batchMap.set(key, { ...ex, setNumbers: [ex.set_number], repsList: [ex.reps] });
        } else {
          const entry = batchMap.get(key);
          entry.setNumbers.push(ex.set_number);
          entry.repsList.push(ex.reps);
        }
      });
      consolidated.push({
        type: g.type,
        orderIndex: g.orderIndex,
        exercises: Array.from(batchMap.values()),
      });
    }
  });
  return consolidated;
}

const NOTES_KEY = 'freestyle_notes_v2'; // new key for multi-note support

export default function FreestyleWorkoutScreen({ navigation }: any) {
  const [notes, setNotes] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [allNotes, setAllNotes] = useState<any[]>([]); // all notes for all workouts
  const [workoutNotes, setWorkoutNotes] = useState<any[]>([]); // notes for this workout
  const [currentNoteIdx, setCurrentNoteIdx] = useState<number | null>(null); // null = new note

  // Ask Meadow state
  const [meadowInput, setMeadowInput] = useState('');
  const [meadowResponse, setMeadowResponse] = useState('');
  const [meadowLoading, setMeadowLoading] = useState(false);

  // Mock AI API call (replace with real API as needed)
  const askMeadow = async (question: string) => {
    setMeadowLoading(true);
    setMeadowResponse('');
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: question }],
          max_tokens: 150,
        }),
      });
      const data = await response.json();
      setMeadowResponse(data.choices?.[0]?.message?.content || 'No response');
    } catch (err) {
      setMeadowResponse('Error contacting AI service.');
    }
    setMeadowLoading(false);
  };

  // Load notes from AsyncStorage
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const saved = await AsyncStorage.getItem(NOTES_KEY);
        if (saved) setAllNotes(JSON.parse(saved));
        else setAllNotes([]);
      } catch {}
      setLoadingNotes(false);
    };
    loadNotes();
  }, []);

  // Fetch today's exercises (reuse TodaysWorkoutScreen logic)
  useEffect(() => {
    const fetchExercises = async () => {
      setLoadingExercises(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user');
        const { data: dayData, error: dayError } = await supabase.rpc('get_current_program_day', { client_uuid: user.id });
        if (dayError || !dayData || !dayData[0]) throw new Error('No program day');
        setWorkoutName(dayData[0].workout_name || 'Today\'s Workout');
        const currentDay = dayData[0].day;
        const { data: workoutData, error: workoutError } = await supabase.rpc('get_day_workouts', { client_uuid: user.id, target_day: currentDay });
        if (workoutError || !workoutData || !workoutData[0]) throw new Error('No workout');
        const workoutId = workoutData[0].workout_id;
        setWorkoutId(workoutId);
        const { data: exerciseData, error: exerciseError } = await supabase.rpc('get_workout_preview', { workout_uuid: workoutId });
        if (exerciseError) throw new Error('No exercises');
        setExercises(exerciseData || []);
      } catch (err) {
        setExercises([]);
      }
      setLoadingExercises(false);
    };
    fetchExercises();
  }, []);

  // Filter notes for this workout when allNotes or workoutId changes
  useEffect(() => {
    if (!workoutId) return;
    const filtered = allNotes.filter(n => n.workoutId === workoutId);
    setWorkoutNotes(filtered);
    setCurrentNoteIdx(filtered.length > 0 ? 0 : null);
    setNotes(''); // blank unless editing
  }, [allNotes, workoutId]);

  // When navigating to a note, update input
  useEffect(() => {
    if (currentNoteIdx !== null && workoutNotes[currentNoteIdx]) {
      setNotes(workoutNotes[currentNoteIdx].note);
    } else {
      setNotes('');
    }
  }, [currentNoteIdx, workoutNotes]);

  // Save or update note
  const handleSaveNote = async () => {
    if (!workoutId) return;
    let updatedNotes = [...allNotes];
    const now = new Date();
    if (currentNoteIdx !== null && workoutNotes[currentNoteIdx]) {
      // Update existing note
      const globalIdx = allNotes.findIndex(n => n.workoutId === workoutId && n.date === workoutNotes[currentNoteIdx].date);
      if (globalIdx !== -1) {
        updatedNotes[globalIdx] = { ...updatedNotes[globalIdx], note: notes };
      }
      setAllNotes(updatedNotes);
      setSavingNotes(true);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
      setSavingNotes(false);
      // Do not clear input when editing
    } else {
      // Add new note
      updatedNotes.push({ workoutId, date: now.toISOString(), note: notes });
      setAllNotes(updatedNotes);
      setSavingNotes(true);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
      setSavingNotes(false);
      // After saving, clear input and set currentNoteIdx to the new note
      setNotes('');
      setCurrentNoteIdx(workoutNotes.length); // will be the new last note
    }
  };

  // Arrows navigation
  const handlePrevNote = () => {
    if (currentNoteIdx !== null && currentNoteIdx > 0) setCurrentNoteIdx(currentNoteIdx - 1);
  };
  const handleNextNote = () => {
    if (currentNoteIdx !== null && currentNoteIdx < workoutNotes.length - 1) setCurrentNoteIdx(currentNoteIdx + 1);
  };
  const handleNewNote = () => {
    setCurrentNoteIdx(null);
    setNotes('');
  };

  // Placeholder for finish workout (send notes to supabase)
  const handleFinishWorkout = async () => {
    if (!workoutId) return;
    // TODO: send workoutNotes to supabase
    alert('Notes would be sent to Supabase! (' + workoutNotes.length + ' notes)');
  };

  const workoutOverview = generateWorkoutOverview(exercises);
  const consolidatedExerciseGroups = consolidateExercisesForPreview(exercises);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.secondary }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {/* Removed back button */}
              <View>
                <Typography.H1 style={styles.headerTitle}>{workoutName}</Typography.H1>
                {workoutOverview ? (
                  <Text style={styles.overviewText}>{workoutOverview}</Text>
                ) : null}
              </View>
            </View>
            {/* Removed timer button */}
          </View>

          {/* Workout Data Entry */}
          <Card style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <View style={styles.notesIconWrap}>
                <Icon name="pen" size={20} color={COLORS.accent} />
              </View>
              <View>
                <Typography.H2>Type workout data here</Typography.H2>
                <Typography.Subtext>Log your performance</Typography.Subtext>
              </View>
            </View>
            <TextInput
              style={styles.notesInput}
              placeholder={
                'Bench Press\nSet 1: 135 for 10. felt easy\nSet 2: 135 for 10. Again, not too bad.\nLast set was 135 but I only got 8 because my shoulder hurt'
              }
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.finishButton} onPress={handleSaveNote}>
              <Text style={styles.finishButtonText}>Save Note</Text>
            </TouchableOpacity>
            {savingNotes && <Text style={styles.savingText}>Saving...</Text>}
          </Card>

          {/* Ask Meadow Section */}
          <Card style={styles.askMeadowCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.status.elite, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="robot" size={24} color={COLORS.primary} />
              </View>
              <View>
                <Typography.H2>Ask Meadow</Typography.H2>
                <Typography.Subtext>Your AI fitness assistant</Typography.Subtext>
              </View>
            </View>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={{ borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, paddingRight: 48, fontSize: 14, height: 100, textAlignVertical: 'top' }}
                placeholder={'e.g. "My knees hurt on set 2, what weight should I use?" Or "How far apart should my hands be on the barbell?"'}
                multiline
                numberOfLines={3}
                value={meadowInput}
                onChangeText={setMeadowInput}
                editable={!meadowLoading}
              />
              <TouchableOpacity
                style={{ position: 'absolute', bottom: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', opacity: meadowInput.trim() && !meadowLoading ? 1 : 0.5 }}
                onPress={() => askMeadow(meadowInput)}
                disabled={!meadowInput.trim() || meadowLoading}
              >
                {meadowLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Icon name="paper-plane" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            {meadowResponse ? (
              <View style={{ marginTop: 16, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12 }}>
                <Text style={{ color: COLORS.text.primary }}>{meadowResponse}</Text>
              </View>
            ) : null}
          </Card>

          {/* Notes Section */}
          {workoutNotes.length > 0 && (
            <Card style={styles.notesCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <TouchableOpacity onPress={handlePrevNote} disabled={currentNoteIdx === 0 || currentNoteIdx === null} style={{ opacity: currentNoteIdx === 0 || currentNoteIdx === null ? 0.3 : 1, marginRight: 12 }}>
                  <Icon name="chevron-left" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={{ flex: 1, textAlign: 'center', color: COLORS.text.primary, fontWeight: '600' }}>
                  Note {currentNoteIdx !== null ? currentNoteIdx + 1 : ''} / {workoutNotes.length}
                </Text>
                <TouchableOpacity onPress={handleNextNote} disabled={currentNoteIdx === null || currentNoteIdx === workoutNotes.length - 1} style={{ opacity: currentNoteIdx === null || currentNoteIdx === workoutNotes.length - 1 ? 0.3 : 1, marginLeft: 12 }}>
                  <Icon name="chevron-right" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNewNote} style={{ marginLeft: 16 }}>
                  <Icon name="plus" size={18} color={COLORS.accent} />
                </TouchableOpacity>
              </View>
              {currentNoteIdx !== null && workoutNotes[currentNoteIdx] && (
                <View>
                  <Text style={{ color: COLORS.text.secondary, fontSize: 12, marginBottom: 4 }}>
                    {format(new Date(workoutNotes[currentNoteIdx].date), 'PPpp')}
                  </Text>
                  <Text style={{ color: COLORS.text.primary, fontSize: 16 }}>{workoutNotes[currentNoteIdx].note}</Text>
                </View>
              )}
            </Card>
          )}

          {/* Exercises Section */}
          <View style={styles.exercisesSection}>
            <Typography.H2 style={{ marginBottom: 12 }}>Exercises</Typography.H2>
            {loadingExercises ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : consolidatedExerciseGroups.length === 0 ? (
              <Text style={styles.noExercisesText}>No exercises found for today.</Text>
            ) : (
              consolidatedExerciseGroups.map((group, groupIdx) => (
                <View key={groupIdx} style={{ marginBottom: 8 }}>
                  {/* Group exercises by name, then by reps batch */}
                  {(() => {
                    // Map: exercise_name -> [{ setNumbers, repsList, ... }]
                    const nameMap = new Map();
                    group.exercises.forEach(ex => {
                      if (!nameMap.has(ex.exercise_name)) {
                        nameMap.set(ex.exercise_name, []);
                      }
                      nameMap.get(ex.exercise_name).push(ex);
                    });
                    return Array.from(nameMap.entries()).map(([exerciseName, batches], idx) => {
                      // All batches for this exercise (e.g. 3x5, 2x10)
                      const firstBatch = batches[0];
                      const isCircuit = group.type === 'circuit';
                      const isSuperset = group.type === 'superset';
                      return (
                        <React.Fragment key={exerciseName + idx}>
                          <Card style={styles.exerciseCard}>
                            <View style={styles.exerciseRow}>
                              <Image
                                source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/f92363f388-355f6895ba753eaa0ff5.png' }}
                                style={styles.exerciseImage}
                              />
                              <View style={{ flex: 1 }}>
                                <Text style={styles.exerciseName}>{exerciseName}</Text>
                                <Text style={styles.exerciseMuscles}>{firstBatch.muscles_trained}</Text>
                                {/* Render all batches as rows */}
                                {batches.map((batch, batchIdx) => {
                                  const totalSets = batch.setNumbers.length;
                                  const repsSet = Array.from(new Set(batch.repsList.filter(r => r !== undefined && r !== null)));
                                  const repsLabel = repsSet.length === 1 ? `${repsSet[0]} reps` : `${Math.min(...repsSet.map(Number))}-${Math.max(...repsSet.map(Number))} reps`;
                                  return (
                                    <View key={batchIdx} style={styles.exerciseMetaRow}>
                                      <View style={[styles.setsBadge, isCircuit && styles.circuitBadge, isSuperset && styles.supersetBadge]}>
                                        <Text style={[styles.setsBadgeText, isCircuit && styles.circuitBadgeText, isSuperset && styles.supersetBadgeText]}>{totalSets} sets</Text>
                                      </View>
                                      <Text style={styles.exerciseMeta}>{repsLabel}</Text>
                                    </View>
                                  );
                                })}
                              </View>
                            </View>
                          </Card>
                          {/* Connector icons (between cards, not batches) */}
                          {idx < nameMap.size - 1 && group.type === 'circuit' && (
                            <View style={styles.circuitIconOverlay}>
                              <Icon name="link" size={20} color="#a855f7" />
                            </View>
                          )}
                          {idx < nameMap.size - 1 && group.type === 'superset' && (
                            <View style={styles.supersetIconOverlay}>
                              <Icon name="arrows-up-down" size={20} color={COLORS.secondary} />
                            </View>
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </View>
              ))
            )}
          </View>

          {/* Finish Workout Button */}
          <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}>
            <Text style={styles.finishButtonText}>Finish Workout</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  overviewText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  timerButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesCard: {
    margin: SPACING.lg,
    padding: SPACING.lg,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  notesIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notesInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    backgroundColor: '#fff',
    minHeight: 100,
    marginBottom: 16,
  },
  finishButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  savingText: {
    color: COLORS.text.secondary,
    fontSize: 12,
    textAlign: 'right',
  },
  askMeadowCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  exercisesSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  noExercisesText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 24,
  },
  exerciseCard: {
    marginBottom: 12,
    padding: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 16,
    backgroundColor: '#f1f5f9',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  exerciseMuscles: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  exerciseMetaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  exerciseMeta: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginRight: 12,
  },
  circuitIconContainer: {
    alignItems: 'center',
    marginVertical: -8,
  },
  supersetIconContainer: {
    alignItems: 'center',
    marginVertical: -8,
  },
  circuitIconOverlay: {
    alignItems: 'center',
    marginTop: -16,
    marginBottom: 0,
    zIndex: 10,
  },
  supersetIconOverlay: {
    alignItems: 'center',
    marginTop: -16,
    marginBottom: 0,
    zIndex: 10,
  },
  setsBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  setsBadgeText: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  circuitBadge: {
    backgroundColor: '#f3e8ff',
    borderWidth: 1,
    borderColor: '#a855f7',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  circuitBadgeText: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  supersetBadge: {
    backgroundColor: COLORS.status.good,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  supersetBadgeText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
});

