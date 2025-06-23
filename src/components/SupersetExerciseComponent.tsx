import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { Card } from './common/Card';
import { Typography } from './common/Typography';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS, SPACING } from '../styles';
import { Video, ResizeMode } from 'expo-av';
import type { Exercise } from '../types/Exercise';
import { SHADOWS } from '../styles/shadows';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SupersetExerciseComponentProps {
  exercises: Exercise[];
  currentExerciseIndex: number;
  onNextExercise?: () => void;
  onPreviousExercise?: () => void;
  onCompleteSet?: () => void;
  onSkipToNext?: () => void;
  workoutName?: string;
  totalDuration?: string;
  onFinishGroup?: () => void;
  isLastGroup?: boolean;
  blockType?: 'circuit' | 'superset';
  onSelectExercise?: (index: number) => void;
}

export function SupersetExerciseComponent({
  exercises,
  currentExerciseIndex,
  onNextExercise,
  onPreviousExercise,
  onCompleteSet,
  onSkipToNext,
  workoutName = 'Circuit Workout',
  totalDuration = '20 minutes',
  onFinishGroup,
  isLastGroup = false,
  blockType = 'circuit',
  onSelectExercise,
}: SupersetExerciseComponentProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [editingRoundIndex, setEditingRoundIndex] = useState<number | null>(null);
  const [allSetsData, setAllSetsData] = useState<Array<Array<{weight: string, reps: string, notes: string}>>>([]);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [notes, setNotes] = useState('');
  const videoRef = useRef(null);

  const accentColor = blockType === 'superset' ? COLORS.secondary : COLORS.accent;
  const accentColorLight = blockType === 'superset' ? COLORS.status.good : `${COLORS.accent}20`;
  const editButtonBackgroundColor = blockType === 'superset' ? '#dbeafe' : '#ede9fe'; // light blue or light purple

  const currentExercise = exercises[currentExerciseIndex];
  const isFirstExercise = currentExerciseIndex === 0;
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const numberOfSets = currentExercise?.rounds || 3;

  useEffect(() => {
    if (exercises.length > 0 && allSetsData.length === 0) {
        const initialData = exercises.map(exercise =>
            Array.from({ length: exercise.rounds || 3 }, (_, i) => ({
                weight: '',
                reps: getRepsForSet(i + 1, exercise),
                notes: ''
            }))
        );
        setAllSetsData(initialData);
    }
  }, [exercises]);

  // Get reps for a specific set from exercise data
  const getRepsForSet = (setNumber: number, forExercise = currentExercise) => {
    if (!forExercise) return '';
    if (forExercise?.setDetails && forExercise.setDetails.length >= setNumber) {
      return forExercise.setDetails[setNumber - 1]?.reps?.toString() || '';
    }
    return forExercise?.reps?.toString() || '';
  };

  const handleSetDataChange = (exerciseIndex: number, roundIndex: number, field: string, value: string) => {
    const newAllSetsData = [...allSetsData];
    if (newAllSetsData[exerciseIndex] && newAllSetsData[exerciseIndex][roundIndex]) {
        newAllSetsData[exerciseIndex][roundIndex][field] = value;
        setAllSetsData(newAllSetsData);
    }
  };

  const handleCompleteAndGoToNextInGroup = () => {
    setEditingRoundIndex(null); // Ensure we exit editing mode when progressing
    const isLastExerciseInGroup = currentExerciseIndex === exercises.length - 1;

    if (isLastExerciseInGroup) {
        const totalRounds = exercises[0]?.rounds || 3;
        if (currentRound >= totalRounds) {
            onFinishGroup?.(); // All rounds of the circuit are complete
        } else {
            setCurrentRound(currentRound + 1);
            onSelectExercise?.(0); // Loop to first exercise for next round
        }
    } else {
        onSelectExercise?.(currentExerciseIndex + 1); // Go to next exercise in same round
    }
  };
  
  const handleEditSet = (roundIndexToEdit: number) => {
    if (editingRoundIndex === roundIndexToEdit) {
      setEditingRoundIndex(null); // Toggle off editing for this round
    } else {
      setEditingRoundIndex(roundIndexToEdit); // Toggle on editing for this round
    }
  };

  const handleCompleteSet = () => {
    // This now effectively does the same as the main group progression button
    handleCompleteAndGoToNextInGroup();
  };

  const handleSkipToNext = () => {
    onSkipToNext?.();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={onPreviousExercise}>
              <Icon name="chevron-left" size={16} color={COLORS.text.primary} />
            </TouchableOpacity>
            <View>
              <Typography.H2>{workoutName}</Typography.H2>
              <Typography.Subtext>{exercises.length} exercises • {totalDuration}</Typography.Subtext>
            </View>
          </View>
          <View style={[styles.circuitModeBadge, { backgroundColor: accentColorLight }]}>
            <Text style={[styles.circuitModeText, { color: accentColor }]}>
              {blockType === 'superset' ? 'Superset Mode' : 'Circuit Mode'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Exercise Video */}
        <View style={styles.videoSection}>
          <View style={styles.videoContainer}>
            {currentExercise?.example?.video_url ? (
              <Video
                ref={videoRef}
                style={styles.videoPlayer}
                source={{ uri: currentExercise.example.video_url }}
                useNativeControls={false}
                resizeMode={ResizeMode.COVER}
                isMuted
              />
            ) : currentExercise?.imageUrl ? (
              <Image
                source={{ uri: currentExercise.imageUrl }}
                style={styles.videoPlayer}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderVideo}>
                <Icon name="play" size={32} color="#fff" />
              </View>
            )}
            
            {/* Video Overlay */}
            <View style={styles.videoOverlay}>
              <TouchableOpacity style={styles.playButton}>
                <Icon name="play" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Exercise Counter */}
            <View style={[styles.exerciseCounter, { backgroundColor: accentColor }]}>
              <Text style={styles.exerciseCounterText}>
                Exercise {currentExerciseIndex + 1} of {exercises.length}
              </Text>
            </View>

            {/* Video Progress Bar */}
            <View style={styles.videoProgress}>
              <Text style={styles.progressTime}>0:15</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { backgroundColor: accentColor }]} />
              </View>
              <Text style={styles.progressTime}>1:20</Text>
            </View>
          </View>
        </View>

        {/* Current Exercise Info */}
        <View style={styles.exerciseInfo}>
          <View style={styles.exerciseHeader}>
            <Typography.H2>{currentExercise?.name}</Typography.H2>
            <TouchableOpacity style={[styles.substituteButton, { backgroundColor: accentColorLight }]}>
              <Icon name="rotate" size={14} color={accentColor} style={{ marginRight: 8 }} />
              <Text style={[styles.substituteButtonText, { color: accentColor }]}>Substitute Exercise</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.exerciseMeta}>
            <View style={styles.metaItem}>
              <Icon name="clock" size={14} color={COLORS.text.secondary} />
              <Text style={styles.metaText}>{currentExercise?.duration || '45 seconds'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="repeat" size={14} color={COLORS.text.secondary} />
              <Text style={styles.metaText}>{currentExercise?.rounds || 3} rounds</Text>
            </View>
          </View>
        </View>

        {/* Circuit Overview */}
        <View style={styles.circuitOverview}>
          <Typography.H2 style={styles.overviewTitle}>Circuit Overview</Typography.H2>
          
          {exercises.map((exercise, index) => {
            const isCurrent = index === currentExerciseIndex;
            const isCompleted = exercise.isCompleted;
            
            const cardStyle = [
              styles.exerciseCard,
              ...(isCurrent ? [styles.currentExerciseCard, { backgroundColor: accentColorLight, borderColor: accentColor }] : []),
              ...(isCompleted ? [styles.completedExerciseCard] : [])
            ];
            
            return (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => {
                    onSelectExercise?.(index);
                    setEditingRoundIndex(null);
                }}
                disabled={isCurrent}
              >
                <Card 
                  style={cardStyle}
                >
                  <View style={styles.exerciseCardHeader}>
                    <View style={[
                      styles.exerciseNumber,
                      isCurrent && [styles.currentExerciseNumber, { backgroundColor: accentColor }],
                      isCompleted && styles.completedExerciseNumber
                    ]}>
                      {isCompleted ? (
                        <Icon name="check" size={16} color="#fff" />
                      ) : (
                        <Text style={[
                          styles.exerciseNumberText,
                          isCurrent && styles.currentExerciseNumberText
                        ]}>
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    
                    <View style={styles.exerciseCardContent}>
                      <Typography.H2 style={styles.exerciseCardName}>{exercise.name}</Typography.H2>
                      <Typography.Subtext>
                        {exercise.duration || '45 seconds'} • {exercise.rounds || 3} rounds
                      </Typography.Subtext>
                    </View>
                    
                    {isCurrent && (
                      <View style={[styles.currentBadge, { backgroundColor: accentColor }]}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                    
                    {!isCurrent && !isCompleted && (
                      <TouchableOpacity style={styles.playButtonSmall}>
                        <Icon name="play" size={12} color={COLORS.text.secondary} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Show sets for current exercise */}
                  {isCurrent && (
                    <View style={styles.setsContainer}>
                      {Array.from({ length: numberOfSets }, (_, roundIndex) => {
                        const roundNumber = roundIndex + 1;
                        const isCurrentRound = roundNumber === currentRound;
                        const isUpcoming = roundNumber > currentRound;
                        const isCompleted = roundNumber < currentRound;
                        const isEditingThisRound = editingRoundIndex === roundIndex;
                        const setData = allSetsData[currentExerciseIndex]?.[roundIndex] || { weight: '', reps: ''};
                        
                        return (
                          <View key={roundNumber} style={[
                            styles.setCard,
                            isCurrentRound && [styles.currentSetCard, { borderColor: accentColor }],
                            isUpcoming && styles.upcomingSetCard,
                            isCompleted && styles.completedSetCard,
                            isEditingThisRound && styles.editingSetCard,
                          ]}>
                            <View style={styles.setHeader}>
                              <Text style={styles.setTitle}>Round {roundNumber}</Text>
                              {isCompleted ? (
                                <TouchableOpacity
                                  style={[
                                    styles.sleekEditButton,
                                    { backgroundColor: isEditingThisRound ? COLORS.error : editButtonBackgroundColor }
                                  ]}
                                  onPress={() => handleEditSet(roundIndex)}
                                >
                                    <Icon 
                                      name={isEditingThisRound ? "check" : "pencil"} 
                                      size={12} 
                                      color={isEditingThisRound ? '#fff' : accentColor} 
                                      style={{ marginRight: 6 }}
                                    />
                                    <Text style={[
                                      styles.sleekEditButtonText,
                                      { color: isEditingThisRound ? '#fff' : accentColor }
                                    ]}>
                                      {isEditingThisRound ? "Save Changes" : "Edit"}
                                    </Text>
                                </TouchableOpacity>
                              ) : (
                                <View style={[styles.setStatus,
                                  isCurrentRound && [styles.currentSetStatus, { backgroundColor: accentColor }],
                                  isUpcoming && styles.upcomingSetStatus,
                                ]}>
                                  <Text style={[styles.setStatusText,
                                    isCurrentRound && styles.currentSetStatusText,
                                    isUpcoming && styles.upcomingSetStatusText,
                                  ]}>
                                    {isCurrentRound ? 'Active' : 'Upcoming'}
                                  </Text>
                                </View>
                              )}
                            </View>
                            
                            <View style={styles.setInputs}>
                              <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Weight (lbs)</Text>
                                <TextInput
                                  style={[ styles.input, !(isCurrentRound || isEditingThisRound) && styles.disabledInput ]}
                                  value={setData.weight}
                                  onChangeText={(text) => handleSetDataChange(currentExerciseIndex, roundIndex, 'weight', text)}
                                  keyboardType="numeric"
                                  editable={isCurrentRound || isEditingThisRound}
                                  placeholder="0"
                                />
                              </View>
                              <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Reps</Text>
                                <TextInput
                                  style={[ styles.input, !(isCurrentRound || isEditingThisRound) && styles.disabledInput ]}
                                  value={setData.reps}
                                  onChangeText={(text) => handleSetDataChange(currentExerciseIndex, roundIndex, 'reps', text)}
                                  keyboardType="numeric"
                                  editable={isCurrentRound || isEditingThisRound}
                                  placeholder="0"
                                />
                              </View>
                            </View>
                          </View>
                        );
                      })}

                      <TouchableOpacity style={[styles.nextInGroupButton, {backgroundColor: accentColor}]} onPress={handleCompleteAndGoToNextInGroup}>
                          <Text style={styles.nextInGroupButtonText}>Next Exercise in {blockType === 'superset' ? 'Superset' : 'Circuit'}</Text>
                          <Icon name="arrow-right" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.completeSetButton, { backgroundColor: accentColor }]} onPress={handleCompleteSet}>
              <Text style={styles.completeSetButtonText}>Complete Set</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.skipButton} onPress={handleSkipToNext}>
              <Text style={styles.skipButtonText}>Skip to Next Exercise</Text>
            </TouchableOpacity>
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationSection}>
            {!isLastGroup && (
              <TouchableOpacity style={[styles.nextButton, { backgroundColor: accentColor }]} onPress={onFinishGroup}>
                <Text style={styles.nextButtonText}>Next Group</Text>
                <Icon name="chevron-right" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuitModeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  circuitModeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  videoSection: {
    backgroundColor: '#000',
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  placeholderVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseCounter: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  exerciseCounterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  videoProgress: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTime: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  progressFill: {
    width: '25%',
    height: '100%',
    borderRadius: 2,
  },
  exerciseInfo: {
    backgroundColor: '#fff',
    padding: 24,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  substituteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  substituteButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  circuitOverview: {
    padding: 24,
    gap: 16,
  },
  overviewTitle: {
    marginBottom: 8,
  },
  exerciseCard: {
    padding: 16,
    marginBottom: 12,
  },
  currentExerciseCard: {
    borderWidth: 2,
  },
  completedExerciseCard: {
    backgroundColor: `${COLORS.success}10`,
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  exerciseNumber: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentExerciseNumber: {
  },
  completedExerciseNumber: {
    backgroundColor: COLORS.success,
  },
  exerciseNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.secondary,
  },
  currentExerciseNumberText: {
    color: '#fff',
  },
  exerciseCardContent: {
    flex: 1,
  },
  exerciseCardName: {
    marginBottom: 4,
  },
  currentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  playButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setsContainer: {
    gap: 12,
  },
  setCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  currentSetCard: {
  },
  upcomingSetCard: {
    backgroundColor: '#f8fafc',
    opacity: 0.6,
  },
  completedSetCard: {
    backgroundColor: '#f8fafc',
    opacity: 0.8,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  setStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentSetStatus: {
  },
  upcomingSetStatus: {
    backgroundColor: '#e5e7eb',
  },
  completedSetStatus: {
      backgroundColor: '#e5e7eb',
  },
  setStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  currentSetStatusText: {
    color: '#fff',
  },
  upcomingSetStatusText: {
    color: '#6b7280',
  },
  completedSetStatusText: {
      color: '#6b7280',
  },
  setInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
  },
  actionButtons: {
    gap: 12,
    marginTop: 16,
  },
  completeSetButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeSetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  navigationSection: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  sleekEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe', 
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  sleekEditButtonText: {
      color: COLORS.secondary,
      fontWeight: '600',
      fontSize: 12,
  },
  nextInGroupButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 16,
      gap: 8,
  },
  nextInGroupButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
  },
  editingSetCard: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
}); 