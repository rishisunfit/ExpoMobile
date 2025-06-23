import { TextStyle } from 'react-native';
import { COLORS } from './colors';

export const TYPOGRAPHY: Record<string, TextStyle> = {
  h1: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.text.primary,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  body: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  subtext: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  caption: {
    fontSize: 12,
    color: COLORS.text.light,
  }
} as const; 