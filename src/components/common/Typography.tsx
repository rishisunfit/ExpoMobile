import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { TYPOGRAPHY } from '../../styles';

interface TypographyProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export const Typography = {
  H1: ({ children, style }: TypographyProps) => (
    <Text style={[styles.h1, style]}>{children}</Text>
  ),
  H2: ({ children, style }: TypographyProps) => (
    <Text style={[styles.h2, style]}>{children}</Text>
  ),
  Body: ({ children, style }: TypographyProps) => (
    <Text style={[styles.body, style]}>{children}</Text>
  ),
  Subtext: ({ children, style }: TypographyProps) => (
    <Text style={[styles.subtext, style]}>{children}</Text>
  ),
  Caption: ({ children, style }: TypographyProps) => (
    <Text style={[styles.caption, style]}>{children}</Text>
  ),
};

const styles = StyleSheet.create({
  h1: TYPOGRAPHY.h1,
  h2: TYPOGRAPHY.h2,
  body: TYPOGRAPHY.body,
  subtext: TYPOGRAPHY.subtext,
  caption: TYPOGRAPHY.caption,
}); 