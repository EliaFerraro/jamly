/**
 * Design tokens. Every colour, space and type size in the app comes from here
 * (docs/tech/33-conventions.md): no literal hex values, no magic numbers in
 * styles. The stage-dark theme is a product feature and cannot be maintained
 * if it is scattered across component files.
 */

import { colors } from './colors';

/** 4pt base scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

/**
 * Type scale. `stage` and `stageNext` exist for performance mode and are
 * deliberately far larger than anything else — they are read from a music
 * stand, not from the hand.
 */
export const typography = {
  stage: { fontSize: 56, lineHeight: 60, fontWeight: '800' },
  stageNext: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 17, fontWeight: '400' },
} as const;

/**
 * Minimum touch target. Assume the user is standing, wearing in-ears and not
 * looking carefully (docs/design/20-design-principles.md).
 */
export const touchTarget = 48;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  touchTarget,
} as const;

export { colors };
export type Theme = typeof theme;
