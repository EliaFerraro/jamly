import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography } from '@/theme';

type Variant = keyof typeof typography;
type Tone = 'primary' | 'secondary' | 'muted' | 'accent' | 'danger';

type TextProps = RNTextProps & {
  variant?: Variant;
  tone?: Tone;
};

const tones: Record<Tone, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  accent: colors.accent,
  danger: colors.danger,
};

/**
 * The only text primitive. Going through the type scale keeps the app legible
 * at arm's length and keeps OS font scaling working — a lot of gigging
 * musicians are over 50 (docs/design/20-design-principles.md).
 */
export function Text({ variant = 'body', tone = 'primary', style, ...rest }: TextProps) {
  return <RNText style={[typography[variant], { color: tones[tone] }, style]} {...rest} />;
}
