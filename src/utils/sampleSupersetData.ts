// Sample data structure for superset/circuit exercises
export const sampleSupersetExercises = [
  {
    id: '1',
    name: 'Push-ups',
    muscles: 'Chest, Triceps, Shoulders',
    duration: '45 seconds',
    rounds: 3,
    sets: 3,
    reps: 12,
    videoUrl: 'https://customer-8g7cy0djek05hzgw.cloudflarestream.com/3c2ac74dbf59aec6907155eb310e85f6/manifest/video.m3u8',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/4035b89eaa-5d5d347a87bc4fa5ad65.png',
    isCompleted: false,
    isCurrent: true,
    setDetails: [
      { reps: 12, weight: 0 },
      { reps: 10, weight: 0 },
      { reps: 8, weight: 0 }
    ]
  },
  {
    id: '2',
    name: 'Mountain Climbers',
    muscles: 'Core, Shoulders',
    duration: '30 seconds',
    rounds: 3,
    sets: 3,
    reps: 20,
    videoUrl: '',
    imageUrl: '',
    isCompleted: false,
    isCurrent: false,
    setDetails: [
      { reps: 20, weight: 0 },
      { reps: 18, weight: 0 },
      { reps: 15, weight: 0 }
    ]
  },
  {
    id: '3',
    name: 'Burpees',
    muscles: 'Full Body',
    duration: '45 seconds',
    rounds: 3,
    sets: 3,
    reps: 8,
    videoUrl: '',
    imageUrl: '',
    isCompleted: false,
    isCurrent: false,
    setDetails: [
      { reps: 8, weight: 0 },
      { reps: 6, weight: 0 },
      { reps: 5, weight: 0 }
    ]
  },
  {
    id: '4',
    name: 'Plank Hold',
    muscles: 'Core',
    duration: '60 seconds',
    rounds: 3,
    sets: 3,
    reps: 1,
    videoUrl: '',
    imageUrl: '',
    isCompleted: false,
    isCurrent: false,
    setDetails: [
      { reps: 1, weight: 0 },
      { reps: 1, weight: 0 },
      { reps: 1, weight: 0 }
    ]
  },
  {
    id: '5',
    name: 'Jumping Jacks',
    muscles: 'Cardio, Legs',
    duration: '30 seconds',
    rounds: 3,
    sets: 3,
    reps: 25,
    videoUrl: '',
    imageUrl: '',
    isCompleted: false,
    isCurrent: false,
    setDetails: [
      { reps: 25, weight: 0 },
      { reps: 20, weight: 0 },
      { reps: 18, weight: 0 }
    ]
  }
];

// Example of how to navigate to superset mode
export const navigateToSuperset = (navigation: any) => {
  navigation.navigate('ExerciseDetail', {
    allExercises: sampleSupersetExercises,
    workoutName: 'Upper Body Circuit',
    totalDuration: '20 minutes'
  });
};

// Example of how to navigate to single exercise mode
export const navigateToSingleExercise = (navigation: any, exercise: any) => {
  navigation.navigate('ExerciseDetail', {
    exercise: exercise
  });
}; 