import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../../theme';
import { ratingText, Stars } from './Stars';

export function RatingSummary({
  value, count, dist, traits = [], onWhite,
}: { value: number; count: number; dist: number[]; traits?: { label: string; n: string }[]; onWhite?: boolean }) {
  const bg = onWhite ? colors.white : colors.zinc100;
  const rule = onWhite ? colors.zinc100 : colors.zinc200;
  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
        <View style={{ alignItems: 'center', minWidth: 84 }}>
          <Text style={styles.big}>{ratingText(value)}</Text>
          <View style={{ marginTop: 5 }}><Stars value={value} size="s" showValue={false} /></View>
          <Text style={styles.count}>{count} {count === 1 ? 'meetup' : 'meetups'}</Text>
        </View>
        <View style={{ flex: 1, gap: 7 }}>
          {dist.map((pct, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <Text style={[styles.distLabel, { width: 8 }]}>{5 - i}</Text>
              <View style={[styles.track, { backgroundColor: onWhite ? colors.zinc100 : colors.zinc200 }]}>
                <View style={{ height: '100%', borderRadius: 999, backgroundColor: i === 0 ? colors.amber : colors.zinc300, width: `${Math.max(pct, 2)}%` }} />
              </View>
              <Text style={[styles.distLabel, { width: 28, textAlign: 'right' }]}>{pct}%</Text>
            </View>
          ))}
        </View>
      </View>
      {traits.length > 0 && (
        <View style={[styles.traits, { borderTopColor: rule }]}>
          {traits.map((t) => (
            <View key={t.label} style={[styles.trait, { backgroundColor: onWhite ? colors.zinc100 : colors.white }]}>
              <Text style={styles.traitCheck}>✓</Text>
              <Text style={styles.traitLabel}>{t.label}</Text>
              <Text style={styles.traitCount}>{t.n}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 18 },
  big: { fontFamily: font.extrabold, fontSize: 40, lineHeight: 44, letterSpacing: -1.8, color: colors.ink },
  count: { fontFamily: font.semibold, fontSize: 11, color: colors.zinc500, marginTop: 6 },
  distLabel: { fontFamily: font.bold, fontSize: 10.5, color: colors.zinc400 },
  track: { flex: 1, height: 6, borderRadius: 999, overflow: 'hidden' },
  traits: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, paddingTop: 15, borderTopWidth: 1 },
  trait: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  traitCheck: { fontFamily: font.extrabold, fontSize: 10.5, color: colors.mintInk },
  traitLabel: { fontFamily: font.bold, fontSize: 11.5, color: colors.zinc700 },
  traitCount: { fontFamily: font.extrabold, fontSize: 11.5, color: colors.amberInk },
});
