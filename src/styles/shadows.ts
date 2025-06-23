import { ViewStyle } from 'react-native';

export const SHADOWS: Record<string, ViewStyle> = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
} as const; 