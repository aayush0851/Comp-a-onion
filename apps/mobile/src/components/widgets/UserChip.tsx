import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, ToneKey, tones } from '../../theme';
import { Avatar } from './Avatar';
import { ratingText } from './Stars';

export function VerifiedDot({ size = 15 }: { size?: number }) {
  return (
    <View style={[styles.verified, { width: size, height: size, minWidth: size }]}>
      <Text style={[styles.verifiedGlyph, { fontSize: size * 0.6 }]}>✓</Text>
    </View>
  );
}

export function UserChip({
  name, initials, photo, age, rating, meta, verified = true, size = 'm', tone = 'amber', squircle, chevron, onPress,
}: {
  name: string;
  initials: string;
  photo?: string | null;
  age?: number | null;
  rating?: number | null;
  meta?: string | null;
  verified?: boolean;
  size?: 's' | 'm' | 'l';
  tone?: ToneKey;
  squircle?: boolean;
  chevron?: boolean;
  onPress?: () => void;
}) {
  const av = { s: 38, m: 46, l: 58 }[size];
  const nfs = { s: 13.5, m: 15, l: 17.5 }[size];
  const toneColors = tone === 'zinc' ? ([colors.zinc100, colors.zinc700] as const) : tones[tone];
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.chip}>
      <Avatar initials={initials} photo={photo} size={av} colorsOverride={toneColors} rounded={squircle ? 16 : undefined} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text numberOfLines={1} style={[styles.name, { fontSize: nfs }]}>{name}</Text>
          {!!age && <Text style={[styles.age, { fontSize: nfs }]}>, {age}</Text>}
          {verified && <VerifiedDot />}
        </View>
        {(!!rating || !!meta) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 3 }}>
            {!!rating && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Text style={styles.star}>★</Text>
                <Text style={styles.rating}>{ratingText(rating)}</Text>
              </View>
            )}
            {!!meta && <Text numberOfLines={1} style={styles.meta}>{meta}</Text>}
          </View>
        )}
      </View>
      {chevron && <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  name: { fontFamily: font.bold, letterSpacing: -0.3, color: colors.ink, flexShrink: 1 },
  age: { fontFamily: font.medium, color: colors.zinc400, marginLeft: -6 },
  verified: { borderRadius: 999, backgroundColor: colors.skyBright, alignItems: 'center', justifyContent: 'center' },
  verifiedGlyph: { fontFamily: font.extrabold, color: colors.white },
  star: { fontSize: 10, color: colors.amber },
  rating: { fontFamily: font.bold, fontSize: 11.5, color: colors.ink },
  meta: { fontFamily: font.medium, fontSize: 11.5, color: colors.zinc500, flexShrink: 1 },
  chevron: { fontFamily: font.bold, fontSize: 15, color: colors.zinc300 },
});
