export type GenderRestriction = 'anyone' | 'women' | 'men';
export type CostMode = 'host' | 'dutch';

export const GENDER_RESTRICTION_OPTIONS: { key: GenderRestriction; title: string; desc: string }[] = [
  { key: 'anyone', title: 'Anyone', desc: 'Open to anyone nearby.' },
  { key: 'women', title: 'Women only', desc: 'Only women can ask to join.' },
  { key: 'men', title: 'Men only', desc: 'Only men can ask to join.' },
];

export const COST_MODE_OPTIONS: { key: CostMode; title: string; desc: string }[] = [
  { key: 'dutch', title: 'Go dutch', desc: 'Everyone pays their own way.' },
  { key: 'host', title: "Host's got it", desc: "You're sponsoring — nobody else pays." },
];

export function genderRestrictionLabel(g: GenderRestriction): string {
  return GENDER_RESTRICTION_OPTIONS.find((o) => o.key === g)?.title ?? 'Anyone';
}

export function costModeLabel(c: CostMode | null): string | null {
  if (!c) return null;
  return c === 'host' ? 'Host is sponsoring' : 'Go dutch';
}

export type Gender = 'Woman' | 'Man' | 'Nonbinary';

export function genderIconSymbol(g: Gender): string {
  if (g === 'Woman') return '♀';
  if (g === 'Man') return '♂';
  return '⚧';
}

export const GENDER_COLORS: Record<Gender, { bg: string; fg: string }> = {
  Woman: { bg: '#F9E1EA', fg: '#B23A6B' },
  Man: { bg: '#E1EAF9', fg: '#2F5FA6' },
  Nonbinary: { bg: '#EDE1F9', fg: '#6B3AA6' },
};

export function genderRestrictionColors(g: GenderRestriction): { bg: string; fg: string } {
  if (g === 'women') return GENDER_COLORS.Woman;
  if (g === 'men') return GENDER_COLORS.Man;
  return { bg: '#E8EDE3', fg: '#4F5C46' };
}
