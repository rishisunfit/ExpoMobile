import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { Card } from './common/Card';
import { Typography } from './common/Typography';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { COLORS, SPACING } from '../styles';
import { Video, ResizeMode } from 'expo-av';

const { width } = Dimensions.get('window');

interface ExerciseDetailComponentProps {
  exercise: any;
  onNextExercise?: () => void;
  onPreviousExercise?: () => void;
  isFirstExercise?: boolean;
  isLastExercise?: boolean;
  onSetComplete?: (setLog: any) => void;
}

export function ExerciseDetailComponent({
  exercise,
  onNextExercise,
  onPreviousExercise,
  isFirstExercise = false,
  isLastExercise = false,
  onSetComplete
}: ExerciseDetailComponentProps) {
  const [currentSet, setCurrentSet] = useState(1);
  const [setsData, setSetsData] = useState<Array<{weight: string, reps: string, notes: string}>>([]);
  const videoRef = useRef(null);

  const exerciseName = exercise?.name || 'Exercise';
  const exerciseMuscles = exercise?.muscles || 'Muscles';
  const numberOfSets = exercise?.sets || 3;

  const getRepsForSet = (setNumber: number) => {
    if (exercise?.setDetails && exercise.setDetails.length >= setNumber) {
      return exercise.setDetails[setNumber - 1]?.reps?.toString() || '';
    }
    return '';
  };

  useEffect(() => {
    const initialSetsData = Array.from({ length: numberOfSets }, (_, index) => {
        return {
            reps: getRepsForSet(index + 1),
            weight: '',
            notes: '',
        };
    });
    setSetsData(initialSetsData);
  }, [exercise, numberOfSets]);

  const handleSetDataChange = (index: number, field: string, value: string) => {
    const newSetsData = [...setsData];
    if (newSetsData[index]) {
        newSetsData[index][field] = value;
        setSetsData(newSetsData);
    }
  };

  const handleCompleteSet = () => {
    if (onSetComplete) {
      onSetComplete({
        exerciseId: exercise.id,
        setNumber: currentSet,
        ...setsData[currentSet - 1],
      });
    }
    if (currentSet < numberOfSets) {
      setCurrentSet(currentSet + 1);
    } else {
      onNextExercise?.();
    }
  };

  const handleEditSet = (setNumberToEdit: number) => {
    setCurrentSet(setNumberToEdit);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View>
              <Typography.H2>{exerciseName}</Typography.H2>
              <Typography.Subtext>{exerciseMuscles}</Typography.Subtext>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.tutorialButton}>
              <Icon name="play" size={12} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.tutorialButtonText}>Full Video Tutorial</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timerButton}>
              <Text style={styles.timerEmoji}>⏱️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Video Section */}
        <View style={styles.videoSection}>
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              style={styles.videoPlayer}
              source={{
                uri: 'https://customer-8g7cy0djek05hzgw.cloudflarestream.com/3c2ac74dbf59aec6907155eb310e85f6/manifest/video.m3u8',
              }}
              useNativeControls={false}
              resizeMode={ResizeMode.COVER}
              isMuted
            />
          </View>
        </View>

        {/* Exercise Info */}
        <View style={styles.exerciseInfo}>
          <View style={styles.exerciseHeader}>
            <Typography.H2>{exerciseName}</Typography.H2>
            <TouchableOpacity style={styles.substituteButton}>
              <Icon name="rotate" size={14} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.substituteButtonText}>Substitute Exercise</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.exerciseTips}>
            1) Keep an arch in the chest{'\n'}
            2) Screw your hands into the barbell{'\n'}
            3) "Kick the floor away" to recruit legs
          </Text>
        </View>

        {/* Sets Section */}
        <View style={styles.setsSection}>
          {Array.from({ length: numberOfSets }, (_, index) => {
            const setNumber = index + 1;
            const setIndex = index;
            const isCurrentSet = setNumber === currentSet;
            const isUpcoming = setNumber > currentSet;
            const isCompleted = setNumber < currentSet;
            const setData = setsData[setIndex] || { weight: '', reps: '', notes: '' };

            return (
              <Card key={setNumber} style={[styles.setCard, isUpcoming && styles.disabledCard]}>
                <View style={styles.setHeader}>
                  <Typography.H2>Set {setNumber}</Typography.H2>
                  <View style={styles.tagContainer}>
                    {isCompleted && (
                      <TouchableOpacity style={styles.editButton} onPress={() => handleEditSet(setNumber)}>
                        <Icon name="pencil" size={12} color={COLORS.primary} style={{ marginRight: 4 }}/>
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    )}
                    {isCurrentSet && (
                      <View style={styles.currentTag}>
                        <Text style={styles.currentTagText}>Current</Text>
                      </View>
                    )}
                    {isUpcoming && (
                      <View style={styles.upcomingTag}>
                        <Text style={styles.upcomingTagText}>Upcoming</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.setInputs}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Weight (lbs)</Text>
                    <TextInput
                      style={[styles.input, !isCurrentSet && styles.disabledInput]}
                      value={isUpcoming ? "-" : setData.weight}
                      onChangeText={isCurrentSet ? (text) => handleSetDataChange(setIndex, 'weight', text) : undefined}
                      keyboardType="numeric"
                      editable={isCurrentSet}
                      placeholder="-"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TextInput
                      style={[styles.input, !isCurrentSet && styles.disabledInput]}
                      value={isUpcoming ? getRepsForSet(setNumber) : setData.reps}
                      onChangeText={isCurrentSet ? (text) => handleSetDataChange(setIndex, 'reps', text) : undefined}
                      keyboardType="numeric"
                      editable={isCurrentSet}
                    />
                  </View>
                </View>

                <View style={styles.notesContainer}>
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput
                    style={[styles.notesInput, !isCurrentSet && styles.disabledInput]}
                    placeholder="How did this set feel?"
                    value={isUpcoming ? "" : setData.notes}
                    onChangeText={isCurrentSet ? (text) => handleSetDataChange(setIndex, 'notes', text) : undefined}
                    multiline
                    numberOfLines={2}
                    editable={isCurrentSet}
                  />
                </View>

                {isCurrentSet && (
                  <TouchableOpacity style={styles.completeButton} onPress={handleCompleteSet}>
                    <Text style={styles.completeButtonText}>Complete Set</Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
          })}

          {/* Navigation Buttons */}
          <View style={styles.navigationSection}>
            {!isFirstExercise && (
              <TouchableOpacity style={styles.navButton} onPress={onPreviousExercise}>
                <Icon name="chevron-left" size={16} color={COLORS.primary} />
                <Text style={styles.navButtonText}>Previous Exercise</Text>
              </TouchableOpacity>
            )}
            
            {!isLastExercise && (
              <TouchableOpacity style={styles.nextButton} onPress={onNextExercise}>
                <Text style={styles.nextButtonText}>Next Exercise</Text>
                <Icon name="chevron-right" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Rest Timer */}
          <Card style={styles.meadowCard}>
            <View style={styles.meadowHeader}>
              <View style={styles.meadowIconWrapper}>
                <Icon name="robot" size={24} color={COLORS.primary} />
              </View>
              <View>
                <Typography.H2>Ask Meadow</Typography.H2>
                <Typography.Subtext>Your AI fitness assistant</Typography.Subtext>
              </View>
            </View>

            <View style={styles.meadowInputContainer}>
              <TextInput
                style={styles.meadowInput}
                placeholder='e.g. "My knees hurt on set 2, what weight should I use?" Or "How far apart should my hands be on the barbell?"'
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={styles.meadowSendButton}>
                <Icon name="paper-plane" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </Card>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tutorialButton: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorialButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  timerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerEmoji: {
    fontSize: 20,
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
  exerciseInfo: {
    backgroundColor: '#fff',
    padding: 24,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  substituteButton: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  substituteButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseTips: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  setsSection: {
    padding: 24,
    gap: 16,
  },
  setCard: {
    padding: 24,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  currentTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  currentTagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  upcomingTag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  upcomingTagText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  setInputs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    color: COLORS.text.secondary,
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    height: 80,
    textAlignVertical: 'top',
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledCard: {
    opacity: 0.6,
    backgroundColor: '#f8fafc',
  },
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    gap: 8,
  },
  navButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  meadowCard: {
    padding: 24,
  },
  meadowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  meadowIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meadowInputContainer: {
    position: 'relative',
  },
  meadowInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    paddingRight: 48,
    fontSize: 14,
    height: 100,
    textAlignVertical: 'top',
  },
  meadowSendButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 