# Superset/Circuit Mode Implementation

This document explains how the superset/circuit mode functionality works in the fitness app.

## Overview

The app now supports two modes for exercise tracking:

1. **Single Exercise Mode**: Traditional exercise tracking with sets and reps
2. **Superset/Circuit Mode**: Multi-exercise circuit with progress tracking

## How It Works

### Automatic Mode Detection

The `ExerciseDetailScreen` automatically detects which mode to use based on the navigation parameters:

- **Single Exercise**: Pass `exercise` parameter
- **Superset/Circuit**: Pass `allExercises` parameter (array of exercises)

### Navigation Examples

```typescript
// Single Exercise Mode
navigation.navigate('ExerciseDetail', {
  exercise: singleExercise
});

// Superset/Circuit Mode
navigation.navigate('ExerciseDetail', {
  allExercises: exerciseArray,
  workoutName: 'Upper Body Circuit',
  totalDuration: '20 minutes'
});
```

## Data Structure

### Exercise Object Structure

```typescript
interface SupersetExercise {
  id: string;
  name: string;
  muscles: string;
  duration?: string;
  rounds?: number;
  sets?: number;
  reps?: number;
  videoUrl?: string;
  imageUrl?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
  setDetails?: Array<{ reps?: number; weight?: number }>;
}
```

### Sample Data

See `src/utils/sampleSupersetData.ts` for complete examples.

## Key Features

### 1. Circuit Overview
- Shows all exercises in the circuit
- Visual indicators for current, completed, and upcoming exercises
- Exercise numbers with completion checkmarks

### 2. Video Integration
- Video player with overlay controls
- Exercise counter (e.g., "Exercise 1 of 5")
- Progress bar for video playback

### 3. Set Tracking
- Individual set cards for the current exercise
- Active/upcoming set states
- Weight and reps input fields
- Set completion tracking

### 4. Navigation
- Previous/Next exercise buttons
- Skip to next exercise option
- Automatic progression when sets are completed

## Components

### SupersetExerciseComponent
Main component for superset/circuit mode. Features:
- Video player with overlay
- Exercise information display
- Circuit overview with all exercises
- Set tracking for current exercise
- Action buttons for navigation

### ExerciseDetailScreen
Updated to conditionally render either:
- `ExerciseDetailComponent` (single exercise)
- `SupersetExerciseComponent` (superset/circuit)

## Styling

The superset mode uses the same color scheme as the rest of the app:
- Primary: `#10b981` (green)
- Success: `#16a34a` (dark green for completed exercises)
- Text colors from the existing color palette

## Usage Examples

### Starting a Circuit Workout

```typescript
import { navigateToSuperset } from '../utils/sampleSupersetData';

// Navigate to circuit mode
navigateToSuperset(navigation);
```

### Creating Custom Circuit Data

```typescript
const customCircuit = [
  {
    id: '1',
    name: 'Push-ups',
    muscles: 'Chest, Triceps',
    duration: '45 seconds',
    rounds: 3,
    sets: 3,
    reps: 12,
    videoUrl: 'your-video-url',
    isCompleted: false,
    isCurrent: true,
    setDetails: [
      { reps: 12, weight: 0 },
      { reps: 10, weight: 0 },
      { reps: 8, weight: 0 }
    ]
  },
  // ... more exercises
];

navigation.navigate('ExerciseDetail', {
  allExercises: customCircuit,
  workoutName: 'Custom Circuit',
  totalDuration: '25 minutes'
});
```

## Demo Screen

A demo screen is available at `src/screens/SupersetDemoScreen.tsx` that showcases:
- Feature explanations
- Sample circuit data
- Buttons to test both modes

## Future Enhancements

Potential improvements for the superset functionality:
1. Rest timer between exercises
2. Circuit completion tracking
3. Progress saving and resuming
4. Custom circuit creation
5. Exercise substitution within circuits
6. Audio cues and notifications

## Notes

- The component automatically handles state management for current exercise and set tracking
- Video URLs and image URLs are optional - placeholders will be shown if not provided
- The interface is designed to be responsive and follows the existing app design patterns
- All existing functionality (like the Meadow AI assistant) is preserved in single exercise mode 