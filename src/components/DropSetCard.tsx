import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Card } from './common/Card';
import { Typography } from './common/Typography';
import { COLORS } from '../styles';

interface DropSetCardProps {
  setNumber: number;
  isCurrentSet: boolean;
  isUpcoming: boolean;
  weight: string;
  reps: string;
  notes: string;
  onWeightChange: (weight: string) => void;
  onRepsChange: (reps: string) => void;
  onNotesChange: (notes: string) => void;
  onCompleteSet: () => void;
  dropPercentage?: string;
}

export function DropSetCard({
  setNumber,
  isCurrentSet,
  isUpcoming,
  weight,
  reps,
  notes,
  onWeightChange,
  onRepsChange,
  onNotesChange,
  onCompleteSet,
  dropPercentage = "15%"
}: DropSetCardProps) {
  return (
    <Card style={{ ...styles.setCard, ...(!isCurrentSet ? styles.disabledCard : {}) }}>
      <View style={styles.setHeader}>
        <Typography.H2>Set {setNumber}</Typography.H2>
        <View style={styles.tagContainer}>
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
          <View style={styles.dropSetTag}>
            <Text style={styles.dropSetTagText}>Drop set</Text>
          </View>
        </View>
      </View>

      <View style={styles.setInputs}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (lbs)</Text>
          <TextInput
            style={[styles.input, !isCurrentSet && styles.disabledInput]}
            value={isCurrentSet ? weight : "135"}
            onChangeText={isCurrentSet ? onWeightChange : undefined}
            keyboardType="numeric"
            editable={isCurrentSet}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reps</Text>
          <TextInput
            style={[styles.input, !isCurrentSet && styles.disabledInput]}
            value={isCurrentSet ? reps : "10"}
            onChangeText={isCurrentSet ? onRepsChange : undefined}
            keyboardType="numeric"
            editable={isCurrentSet}
          />
        </View>
      </View>

      <View style={styles.dropSetInfo}>
        <View style={styles.dropSetTag}>
          <Text style={styles.dropSetTagText}>Drop by {dropPercentage}</Text>
        </View>
      </View>

      <View style={styles.notesContainer}>
        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
          style={[styles.notesInput, !isCurrentSet && styles.disabledInput]}
          placeholder="How did this set feel?"
          value={isCurrentSet ? notes : ""}
          onChangeText={isCurrentSet ? onNotesChange : undefined}
          multiline
          numberOfLines={2}
          editable={isCurrentSet}
        />
      </View>

      {isCurrentSet && (
        <TouchableOpacity style={styles.completeButton} onPress={onCompleteSet}>
          <Text style={styles.completeButtonText}>Complete Set</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  setCard: {
    padding: 24,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
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
  dropSetTag: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dropSetTagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
  dropSetInfo: {
    alignItems: 'center',
    marginBottom: 16,
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
}); 