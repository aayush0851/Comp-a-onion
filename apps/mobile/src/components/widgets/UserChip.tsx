import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, Tone, tones } from '../../theme';

export function UserChip({
  name, initials, photo, rating, count, verified = true, size = 'm', tone = 'peach', meta, onPress,
}: {
  name: string;
  initials: string;
  photo?: string | null;
  rating?: number | null;
  count?: number | null;
  verified?: boolean;
  size?: 's' | 'm' | 'l';
  tone?: Tone;
  meta?: string | null;
  onPress?: () => void;
}) {
  const av = { s: 36, m: 44, l: 56 }[size];
  const ifs = { s: 11, m: 13, l: 16 }[size];
  const nfs = { s: 13.5, m: 15, l: 17 }[size];
  const t = tones[tone];
  return (
    <Pressable onPress={onPress} style={styles.userChip}>
      {photo ? (
        <Image source={{ uri: photo }} style={{ width: av, height: av, minWidth: av, borderRadius: av / 2 }} />
      ) : (
        <View style={{ width: av, height: av, minWidth: av, borderRadius: av / 2, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Figtree_700Bold', fontSize: ifs, color: t.fg }}>{initials}</Text>
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text numberOfLines={1} style={{ fontFamily: 'Figtree_700Bold', fontSize: nfs, letterSpacing: -0.2, color: colors.ink, flexShrink: 1 }}>{name}</Text>
          {verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedGlyph}>✓</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
          {!!rating && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Text style={{ fontSize: 10, color: colors.clay }}>★</Text>
              <Text style={{ fontFamily: 'Figtree_700Bold', fontSize: 11.5, color: colors.inkSecondary }}>{rating.toFixed(1)}</Text>
              {!!count && <Text style={{ fontFamily: 'Figtree_500Medium', fontSize: 11.5, color: colors.faint }}>· {count} plans</Text>}
            </View>
          )}
          {!!meta && <Text numberOfLines={1} style={{ fontFamily: 'Figtree_500Medium', fontSize: 11.5, color: colors.muted }}>{meta}</Text>}
        </View>
      </View>
      {onPress && <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  userChip: { flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 44 },
  verifiedBadge: { width: 15, height: 15, minWidth: 15, borderRadius: 999, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  verifiedGlyph: { fontFamily: 'Figtree_800ExtraBold', fontSize: 9, color: '#fff' },
  chevron: { fontFamily: 'Figtree_700Bold', fontSize: 15, color: '#C3B8AD' },
});
