import { StyleSheet } from 'react-native';

export const Typography = StyleSheet.create({
  hero: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  captionMedium: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  number: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  numberSmall: {
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
