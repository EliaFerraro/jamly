/**
 * Jamly colour tokens — stage-dark first.
 *
 * The dark theme is THE theme (docs/design/20-design-principles.md, Rule 3):
 * this app is read at 1.5m, in a dark room, by someone holding an instrument.
 *
 * Rules enforced here:
 *  - Elevation is expressed with layered SURFACES, not shadows. Shadows are
 *    invisible in the dark.
 *  - `accent` means "now" and nothing else — the current song, the next event.
 *    If everything is highlighted, nothing is.
 */

export const colors = {
  // Backgrounds, from deepest to most raised.
  bg: '#0B0D10',
  surface: '#14181D',
  surfaceRaised: '#1C222A',
  border: '#2A323C',

  // Text. `textPrimary` on `bg` is ~15:1 — comfortably past WCAG AAA.
  textPrimary: '#F2F5F8',
  textSecondary: '#A7B2BF',
  textMuted: '#6B7684',

  /** "Now". Reserved for the current song and the next event. Nothing else. */
  accent: '#FF6B35',
  accentMuted: '#7A3419',

  // Semantic. Always paired with text or an icon — a stage is full of
  // coloured light, so colour alone never carries meaning.
  success: '#3DD68C',
  warning: '#F5C451',
  danger: '#F2545B',

  // Live-sync states, used by performance mode.
  synced: '#3DD68C',
  detached: '#A7B2BF',
  offline: '#F5C451',

  black: '#000000',
  white: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;
