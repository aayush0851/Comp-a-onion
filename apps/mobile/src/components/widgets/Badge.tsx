import { StyleSheet, Text, View } from 'react-native';
import { colors, font, lift } from '../../theme';

export type BadgeTone = 'sky' | 'amber' | 'mint' | 'zinc' | 'ink' | 'solid';

const BADGE_TONES: Record<BadgeTone, [string, string]> = {
  sky: [colors.sky, colors.skyInk],
  amber: [colors.amberSoft, colors.amberInk],
  mint: [colors.mint, colors.mintInk],
  zinc: [colors.zinc100, colors.zinc700],
  ink: [colors.ink, colors.amber],
  solid: [colors.amber, colors.ink],
};

export function Badge({ label, tone = 'sky', glyph = '✓' }: { label: string; tone?: BadgeTone; glyph?: string | null }) {
  const [bg, fg] = BADGE_TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {!!glyph && <Text style={[styles.glyph, { color: fg }]}>{glyph}</Text>}
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

// Small uppercase status pill (DONE / NEXT / LATER) and card flags.
export function Pill({ label, bg, fg, upper }: { label: string; bg: string; fg: string; upper?: boolean }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[upper ? styles.pillUpper : styles.pillLabel, { color: fg }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  glyph: { fontSize: 10.5, lineHeight: 13 },
  label: { fontFamily: font.bold, fontSize: 11.5, letterSpacing: -0.1, ...lift(11.5) },
  pill: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7, alignSelf: 'flex-start' },
  pillLabel: { fontFamily: font.bold, fontSize: 10.5, letterSpacing: -0.1, ...lift(10.5) },
  pillUpper: { fontFamily: font.extrabold, fontSize: 10.5, textTransform: 'uppercase', ...lift(10.5) },
});
