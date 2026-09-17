import type { TextStyle } from 'react-native';

// Checked Companion design system: black, sunshine yellow, sky blue on zinc neutrals.
export const colors = {
  ink: '#181818',
  inkPressed: '#0D0D12',
  white: '#FFFFFF',
  zinc50: '#FAFAFA',
  zinc100: '#F4F4F5',
  zinc200: '#E4E4E7',
  zinc300: '#D4D4D8',
  zinc400: '#A1A1AA',
  zinc500: '#71717A',
  zinc700: '#3F3F46',
  zinc800: '#27272A',
  amber: '#FBBF24',
  amberPressed: '#F59E0B',
  amberSoft: '#FEF3C7',
  amberInk: '#92400E',
  amberDeep: '#B45309',
  sky: '#BAE6FD',
  skyFaint: '#E0F2FE',
  skyInk: '#075985',
  skyBright: '#0EA5E9',
  skyDeep: '#0369A1',
  mint: '#D1FAE5',
  mintInk: '#047857',
  rose: '#FECACA',
  roseInk: '#B91C1C',
  scrim: 'rgba(24,24,24,0.45)',
} as const;

export const font = {
  regular: 'PlusJakartaSans_400Regular',
  italic: 'PlusJakartaSans_400Regular_Italic',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
  mono: 'JetBrainsMono_400Regular',
  monoSemibold: 'JetBrainsMono_600SemiBold',
} as const;

export type ToneKey = 'amber' | 'sky' | 'zinc' | 'ink' | 'mint';

// Avatar / chip tones as [background, foreground].
export const tones: Record<ToneKey, readonly [string, string]> = {
  amber: [colors.amber, colors.ink],
  sky: [colors.sky, colors.skyInk],
  zinc: [colors.zinc200, colors.zinc700],
  ink: [colors.ink, colors.amber],
  mint: [colors.mint, colors.mintInk],
};

// Seat avatars cycle through these, matching the hangout card.
export const seatTones: readonly (readonly [string, string])[] = [
  [colors.sky, colors.skyInk],
  [colors.amberSoft, colors.amberInk],
  [colors.mint, colors.mintInk],
  [colors.zinc200, colors.zinc700],
];

export const radius = { card: 24, row: 20, box: 18, field: 16, pill: 999, sheet: 28 };

export const text: Record<string, TextStyle> = {
  bigTitle: { fontFamily: font.extrabold, fontSize: 27, lineHeight: 32, letterSpacing: -1, color: colors.ink },
  subtitle: { fontFamily: font.regular, fontSize: 14, lineHeight: 21, color: colors.zinc500 },
  eyebrow: { fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.zinc400 },
  fieldLabel: { fontFamily: font.extrabold, fontSize: 9.5, letterSpacing: 1.1, textTransform: 'uppercase', color: colors.zinc400 },
  cardTitle: { fontFamily: font.extrabold, fontSize: 18, lineHeight: 23, letterSpacing: -0.5, color: colors.ink },
  rowTitle: { fontFamily: font.bold, fontSize: 14.5, letterSpacing: -0.3, color: colors.ink },
  body: { fontFamily: font.regular, fontSize: 13, lineHeight: 19.5, color: colors.zinc500 },
  meta: { fontFamily: font.medium, fontSize: 11.5, color: colors.zinc500 },
};
