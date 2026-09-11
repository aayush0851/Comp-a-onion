import type { TextStyle } from 'react-native';

export const colors = {
  ground: '#FBF6F0',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFCF9',
  ink: '#2E2A26',
  inkSecondary: '#5C534B',
  muted: '#8A7F75',
  faint: '#A79C92',
  line: '#F1E8DE',
  lineCard: '#F4EBE1',
  border: '#E4D8CB',
  borderSoft: '#EDE2D6',
  clay: '#C96F4A',
  clayPressed: '#A6512F',
  blush: '#F6E4DA',
  blushInk: '#7A3A1E',
  blushInk2: '#96543A',
  sage: '#7A8B6F',
  sageBg: '#E8EDE3',
  sageInk: '#4F5C46',
  sageInk2: '#3E4A37',
  neutralAvatar: '#EFE6DC',
  darkGround: '#241F1B',
  darkBlob1: '#3A2E28',
  darkBlob2: '#332A26',
  stripeA: '#EFE6DC',
  stripeB: '#F8F2EB',
  settledDeclineBg: '#F4EEE7',
} as const;

export const radius = {
  card: 24,
  inner: 20,
  sheet: 26,
  tile: 16,
  small: 14,
  pill: 999,
};

export const shadow = {
  card: { shadowColor: '#2E2A26', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  inner: { shadowColor: '#2E2A26', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  chip: { shadowColor: '#2E2A26', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  sheet: { shadowColor: '#2E2A26', shadowOpacity: 0.1, shadowRadius: 24, shadowOffset: { width: 0, height: -6 }, elevation: 4 },
  dark: { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 34, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
};

export const stripe = (h: number) => ({
  height: h,
  backgroundColor: colors.stripeA,
  overflow: 'hidden' as const,
});

export type Tone = 'peach' | 'sage' | 'sand';

export const tones: Record<Tone, { bg: string; fg: string }> = {
  peach: { bg: '#F6E4DA', fg: '#A6512F' },
  sage: { bg: '#E8EDE3', fg: '#5C6B52' },
  sand: { bg: '#EFE6DC', fg: '#5C534B' },
};

export const badgeTones: Record<'light' | 'primary' | 'sage' | 'dark', { bg: string; fg: string }> = {
  light: { bg: 'rgba(255,255,255,.92)', fg: '#5C534B' },
  primary: { bg: '#C96F4A', fg: '#FFFFFF' },
  sage: { bg: '#7A8B6F', fg: '#FFFFFF' },
  dark: { bg: '#2E2A26', fg: '#FBF6F0' },
};

// Five-step type scale from the Companion design system.
export const scale: Record<string, TextStyle> = {
  display: { fontFamily: 'Figtree_700Bold', fontSize: 28, lineHeight: 33, letterSpacing: -0.7, color: colors.ink },
  card: { fontFamily: 'Figtree_700Bold', fontSize: 21, lineHeight: 25, letterSpacing: -0.45, color: colors.ink },
  inline: { fontFamily: 'Figtree_700Bold', fontSize: 17, lineHeight: 20, letterSpacing: -0.3, color: colors.ink },
  body: { fontFamily: 'Figtree_400Regular', fontSize: 13.5, lineHeight: 20, color: '#453F39' },
  label: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5, color: colors.ink },
  micro: { fontFamily: 'Figtree_700Bold', fontSize: 8.5, letterSpacing: 0.7, color: colors.muted },
  eyebrow: { fontFamily: 'Figtree_700Bold', fontSize: 11, letterSpacing: 0.8, color: colors.clayPressed, textTransform: 'uppercase' },
  accent: { fontFamily: 'Newsreader_400Regular_Italic', fontSize: 14.5, lineHeight: 20, color: colors.muted },
  meta: { fontFamily: 'Figtree_500Medium', fontSize: 12, color: colors.muted },
};
