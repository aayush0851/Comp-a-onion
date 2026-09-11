import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow } from '../../theme';
import { Stars } from './Stars';

export function RatingSummary({
  value, count, dist, traits,
}: { value: number; count: number; dist: number[]; traits: { label: string; n: string }[] }) {
  return (
    <View style={styles.ratingSummary}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
        <View style={{ alignItems: 'center', minWidth: 86 }}>
          <Text style={styles.ratingBig}>{value.toFixed(1)}</Text>
          <View style={{ marginTop: 4 }}><Stars value={value} size="s" showValue={false} /></View>
          <Text style={{ fontFamily: 'Figtree_500Medium', fontSize: 11.5, color: colors.muted, marginTop: 6 }}>{count} ratings</Text>
        </View>
        <View style={{ flex: 1, gap: 7 }}>
          {dist.map((pct, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <Text style={styles.distLabel}>{5 - i}</Text>
              <View style={styles.distTrack}>
                <View style={{ height: '100%', borderRadius: 999, backgroundColor: i === 0 ? colors.clay : '#DCC6B4', width: `${Math.max(pct, 2)}%` }} />
              </View>
              <Text style={[styles.distLabel, { width: 22, textAlign: 'right' }]}>{pct}%</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.traitsRow}>
        {traits.map((t) => (
          <View key={t.label} style={styles.traitPill}>
            <Text style={styles.traitCheck}>✓</Text>
            <Text style={styles.traitLabel}>{t.label}</Text>
            <Text style={styles.traitCount}>{t.n}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ratingSummary: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 18, ...shadow.card },
  ratingBig: { fontFamily: 'Figtree_800ExtraBold', fontSize: 42, letterSpacing: -1.6, color: colors.ink },
  distLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 10.5, color: colors.faint, width: 8 },
  distTrack: { flex: 1, height: 6, borderRadius: 999, backgroundColor: colors.line, overflow: 'hidden' },
  traitsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 16, paddingTop: 15, borderTopWidth: 1, borderTopColor: colors.line },
  traitPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8F2EC', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  traitCheck: { fontFamily: 'Figtree_800ExtraBold', fontSize: 11, color: colors.sage },
  traitLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 11.5, color: colors.inkSecondary },
  traitCount: { fontFamily: 'Figtree_700Bold', fontSize: 11.5, color: colors.clayPressed },
});
