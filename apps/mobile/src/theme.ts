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

export const space = [4, 6, 7, 9, 11, 13, 14, 16, 18, 20, 22];

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
