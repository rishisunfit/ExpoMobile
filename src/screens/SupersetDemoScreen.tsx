import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/common/Typography';
import { COLORS } from '../styles';
import { sampleSupersetExercises, navigateToSuperset } from '../utils/sampleSupersetData';

export default function SupersetDemoScreen({ navigation }: any) {
  const handleStartSuperset = () => {
    navigateToSuperset(navigation);
  };

  const handleStartSingleExercise = () => {
    navigation.navigate('ExerciseDetail', {
      exercise: sampleSupersetExercises[0]
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Typography.H1>Superset Demo</Typography.H1>
          <Typography.Subtext>
            This screen demonstrates the difference between single exercise mode and superset/circuit mode.
          </Typography.Subtext>
        </View>

        <View style={styles.section}>
          <Typography.H2>Circuit Mode Features</Typography.H2>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Circuit Overview</Text>
                <Text style={styles.featureDescription}>
                  See all exercises in the circuit with their current status
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📹</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Video Integration</Text>
                <Text style={styles.featureDescription}>
                  Video player with progress bar and exercise counter
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚡</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Set Tracking</Text>
                <Text style={styles.featureDescription}>
                  Track weight and reps for each set with active/upcoming states
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔄</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Exercise Navigation</Text>
                <Text style={styles.featureDescription}>
                  Easy navigation between exercises with completion tracking
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Typography.H2>Sample Circuit</Typography.H2>
          <View style={styles.exerciseList}>
            {sampleSupersetExercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.duration} • {exercise.rounds} rounds
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleStartSuperset}>
            <Text style={styles.primaryButtonText}>Start Circuit Mode</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleStartSingleExercise}>
            <Text style={styles.secondaryButtonText}>Start Single Exercise Mode</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  section: {
    padding: 24,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  featureList: {
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  exerciseList: {
    marginTop: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  exerciseNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  buttonSection: {
    padding: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
}); 