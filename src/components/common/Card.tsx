import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../../styles';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.background.card,
    ...SHADOWS.card,
  },
}); 