import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseDetailComponent } from '../components/ExerciseDetailComponent';
import { SupersetExerciseComponent } from '../components/SupersetExerciseComponent';

export default function ExerciseDetailScreen({ route, navigation }: any) {
  const { 
    exercise: initialExercise, 
    allExercises, 
    workoutName, 
    workoutId,
    programId,
    day,
    totalDuration, 
    fullWorkout 
  } = route.params || {};
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentMode, setCurrentMode] = useState<'single' | 'circuit' | 'superset'>('single');
  const [fullWorkoutExercises, setFullWorkoutExercises] = useState<any[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [allSetLogs, setAllSetLogs] = useState<any[]>([]);

  useEffect(() => {
    // Store the full workout if provided
    if (fullWorkout && fullWorkout.length > 0) {
      setFullWorkoutExercises(fullWorkout);
    }

    // If we have allExercises passed in, use those (circuit/superset mode)
    if (allExercises && allExercises.length > 0) {
      setExercises(allExercises);
      setCurrentMode(allExercises[0]?.isCircuit ? 'circuit' : 'superset');
    } else if (initialExercise) {
      // If we only have one exercise, create an array with just that (single mode)
      setExercises([initialExercise]);
      setCurrentMode('single');
    }
    // Restore logs if passed in
    if (route.params?.allSetLogs) {
      setAllSetLogs(route.params.allSetLogs);
    }
    console.log('[DEBUG] useEffect - currentMode:', currentMode);
  }, [initialExercise, allExercises, fullWorkout]);

  useEffect(() => {
    console.log('[DEBUG] allSetLogs updated:', allSetLogs);
  }, [allSetLogs]);

  const currentExercise = exercises[currentExerciseIndex];
  const isFirstExercise = currentExerciseIndex === 0;
  
  // Check if this is the last exercise in the full workout
  const isLastExercise = () => {
    if (fullWorkoutExercises.length === 0) {
      // No full workout data, use current array logic
      return currentExerciseIndex === exercises.length - 1;
    }
    
    // Check if there are more exercises in the full workout
    const currentExerciseNames = exercises.map(ex => ex.name);
    const currentGroupStartIndex = fullWorkoutExercises.findIndex(ex => 
      currentExerciseNames.includes(ex.name)
    );
    
    if (currentGroupStartIndex === -1) return true;
    
    const nextGroupStartIndex = currentGroupStartIndex + exercises.length;
    return nextGroupStartIndex >= fullWorkoutExercises.length;
  };

  // Find the next exercise group in the full workout
  const findNextExerciseGroup = () => {
    if (fullWorkoutExercises.length === 0) return null;
    
    // Find the current group's exercises in the full workout
    const currentExerciseNames = exercises.map(ex => ex.name);
    const currentGroupStartIndex = fullWorkoutExercises.findIndex(ex => 
      currentExerciseNames.includes(ex.name)
    );
    
    if (currentGroupStartIndex === -1) return null;
    
    // Find the next group
    const nextGroupStartIndex = currentGroupStartIndex + exercises.length;
    if (nextGroupStartIndex >= fullWorkoutExercises.length) return null;
    
    const nextExercise = fullWorkoutExercises[nextGroupStartIndex];
    
    // Determine the next group based on the next exercise's type
    if (nextExercise.isCircuit && nextExercise.circuitGroup) {
      return {
        type: 'circuit',
        exercises: nextExercise.circuitGroup,
        name: workoutName || 'Circuit Workout'
      };
    } else if (nextExercise.isSuperset && nextExercise.supersetGroup) {
      return {
        type: 'superset',
        exercises: nextExercise.supersetGroup,
        name: workoutName || 'Superset Workout'
      };
    } else {
      return {
        type: 'single',
        exercise: nextExercise
      };
    }
  };

  const goToNextGroup = () => {
    console.log('[DEBUG] goToNextGroup called. allSetLogs:', allSetLogs);
    const nextGroup = findNextExerciseGroup();
    if (nextGroup) {
      if (nextGroup.type === 'single') {
        console.log('[DEBUG] Navigating to next single exercise group');
        navigation.replace('ExerciseDetail', {
          exercise: nextGroup.exercise,
          fullWorkout: fullWorkoutExercises,
          workoutName: workoutName,
          workoutId: workoutId,
          programId: programId,
          day: day,
          allSetLogs: allSetLogs, // pass logs forward
        });
      } else {
        console.log('[DEBUG] Navigating to next superset/circuit group');
        navigation.replace('ExerciseDetail', {
          allExercises: nextGroup.exercises,
          workoutName: nextGroup.name,
          totalDuration: nextGroup.type === 'circuit' ? '20 minutes' : '15 minutes',
          fullWorkout: fullWorkoutExercises,
          workoutId: workoutId,
          programId: programId,
          day: day,
          allSetLogs: allSetLogs, // pass logs forward
        });
      }
    } else {
      // Navigate to WorkoutComplete with all the required data
      console.log('[DEBUG] Navigating to WorkoutCompleteScreen with setLogs:', allSetLogs);
      navigation.navigate('WorkoutComplete', {
        workoutId: workoutId,
        workoutName: workoutName,
        programId: programId,
        day: day,
        setLogs: allSetLogs
      });
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      goToNextGroup();
    }
  };

  // Find the previous exercise group in the full workout
  const findPreviousExerciseGroup = () => {
    if (fullWorkoutExercises.length === 0) return null;

    // Find the current group's exercises in the full workout
    const currentExerciseNames = exercises.map(ex => ex.name);
    const currentGroupStartIndex = fullWorkoutExercises.findIndex(ex =>
      currentExerciseNames.includes(ex.name)
    );

    if (currentGroupStartIndex === -1) return null;

    // Find the previous group
    const prevGroupEndIndex = currentGroupStartIndex - 1;
    if (prevGroupEndIndex < 0) return null;

    // Now, walk backwards to find the start of the previous group
    // If previous is a circuit/superset, it will have .circuitGroup/.supersetGroup
    const prevExercise = fullWorkoutExercises[prevGroupEndIndex];
    if (prevExercise.isCircuit && prevExercise.circuitGroup) {
      return {
        type: 'circuit',
        exercises: prevExercise.circuitGroup,
        name: workoutName || 'Circuit Workout',
      };
    } else if (prevExercise.isSuperset && prevExercise.supersetGroup) {
      return {
        type: 'superset',
        exercises: prevExercise.supersetGroup,
        name: workoutName || 'Superset Workout',
      };
    } else {
      return {
        type: 'single',
        exercise: prevExercise,
      };
    }
  };

  const goToPreviousGroup = () => {
    const prevGroup = findPreviousExerciseGroup();
    if (prevGroup) {
      if (prevGroup.type === 'single') {
        navigation.replace('ExerciseDetail', {
          exercise: prevGroup.exercise,
          fullWorkout: fullWorkoutExercises,
          workoutName: workoutName,
          workoutId: workoutId,
          programId: programId,
          day: day,
          allSetLogs: allSetLogs, // pass logs backward
        });
      } else {
        navigation.replace('ExerciseDetail', {
          allExercises: prevGroup.exercises,
          workoutName: prevGroup.name,
          totalDuration: prevGroup.type === 'circuit' ? '20 minutes' : '15 minutes',
          fullWorkout: fullWorkoutExercises,
          workoutId: workoutId,
          programId: programId,
          day: day,
          allSetLogs: allSetLogs, // pass logs backward
        });
      }
    } else {
      // If no previous group, go back to workout screen
      navigation.goBack();
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    } else {
      // At the beginning of current group, go to previous group if possible
      goToPreviousGroup();
    }
  };

  const handleCompleteSet = () => {
    // When all sets are completed for current exercise, move to next
    handleNextExercise();
  };

  const handleSkipToNext = () => {
    handleNextExercise();
  };

  const handleSelectExercise = (index: number) => {
    setCurrentExerciseIndex(index);
  };

  // Helper: are we on the last group/exercise?
  const isTrulyLastGroup = () => {
    if (fullWorkoutExercises.length === 0) return isLastExercise();
    // Find current group start index
    const currentExerciseNames = exercises.map(ex => ex.name);
    const currentGroupStartIndex = fullWorkoutExercises.findIndex(ex =>
      currentExerciseNames.includes(ex.name)
    );
    if (currentGroupStartIndex === -1) return isLastExercise();
    // If next group would be out of bounds, this is the last group
    const nextGroupStartIndex = currentGroupStartIndex + exercises.length;
    return nextGroupStartIndex >= fullWorkoutExercises.length;
  };

  // Handler for Complete Workout button
  const handleCompleteWorkout = () => {
    navigation.navigate('WorkoutComplete', {
      workoutId: workoutId,
      workoutName: workoutName,
      programId: programId,
      day: day,
      setLogs: allSetLogs
    });
  };

  if (!currentExercise) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        {/* Loading or error state */}
      </SafeAreaView>
    );
  }

  // Move this log outside of the return statement to avoid linter error
  console.log('[DEBUG] Rendering ExerciseDetailScreen, currentMode:', currentMode);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {currentMode === 'single' ? (
        <ExerciseDetailComponent
          exercise={currentExercise}
          onNextExercise={goToNextGroup}
          onPreviousExercise={handlePreviousExercise}
          isFirstExercise={isFirstExercise}
          isLastExercise={isLastExercise()}
          onSetComplete={(setLog) => {
            console.log('[DEBUG] onSetComplete called (single):', setLog);
            setAllSetLogs(prev => [...prev, setLog]);
          }}
          allSetLogs={allSetLogs}
          fullWorkoutExercises={fullWorkoutExercises}
          showFinalNavigation={isTrulyLastGroup()}
          onCompleteWorkout={handleCompleteWorkout}
        />
      ) : (
        <SupersetExerciseComponent
          exercises={exercises}
          currentExerciseIndex={currentExerciseIndex}
          onNextExercise={handleNextExercise}
          onPreviousExercise={handlePreviousExercise}
          onCompleteSet={handleNextExercise}
          onSkipToNext={handleNextExercise}
          workoutName={workoutName || 'Circuit Workout'}
          totalDuration={totalDuration || '20 minutes'}
          onFinishGroup={goToNextGroup}
          isLastGroup={isLastExercise()}
          blockType={currentMode}
          onSelectExercise={handleSelectExercise}
          showFinalNavigation={isTrulyLastGroup()}
          onCompleteWorkout={handleCompleteWorkout}
        />
      )}
    </SafeAreaView>
  );
} 