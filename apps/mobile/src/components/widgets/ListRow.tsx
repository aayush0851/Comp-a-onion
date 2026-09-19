import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, ToneKey, tones } from '../../theme';
import { Avatar } from './Avatar';

const PILL_TONES = {
  amber: [colors.amber, colors.ink],
  sky: [colors.sky, colors.skyInk],
  ink: [colors.ink, colors.amber],
  zinc: [colors.zinc200, colors.zinc700],
} as const;

export function ListRow({
  title, meta, initials, photo, tone = 'zinc', squircle, pill, pillTone = 'amber', right, unread, chevron, dot, onWhite, leading, onPress,
}: {
  title: string;
  meta?: string | null;
  initials?: string | null;
  photo?: string | null;
  tone?: ToneKey;
  squircle?: boolean;
  pill?: string | null;
  pillTone?: keyof typeof PILL_TONES;
  right?: string | null;
  unread?: number | string | null;
  chevron?: boolean;
  dot?: boolean;
  onWhite?: boolean;
  leading?: ReactNode;
  onPress?: () => void;
}) {
  const bg = onWhite ? colors.white : colors.zinc100;
  const [pillBg, pillFg] = PILL_TONES[pillTone];
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.row, { backgroundColor: bg }]}>
      {leading}
      {!leading && !!initials && (
        <View>
          <Avatar initials={initials} photo={photo} size={44} colorsOverride={tones[tone]} rounded={squircle ? 14 : undefined} />
          {dot && <View style={[styles.dot, { borderColor: bg }]} />}
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
          {!!pill && (
            <View style={[styles.pill, { backgroundColor: pillBg }]}>
              <Text style={[styles.pillLabel, { color: pillFg }]}>{pill}</Text>
            </View>
          )}
        </View>
        {!!meta && <Text numberOfLines={1} style={styles.meta}>{meta}</Text>}
      </View>
      {(!!right || !!unread || chevron) && (
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          {!!right && <Text style={styles.right}>{right}</Text>}
          {!!unread && (
            <View style={styles.unread}>
              <Text style={styles.unreadLabel}>{unread}</Text>
            </View>
          )}
          {chevron && <Text style={styles.chevron}>›</Text>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 20, padding: 14, minHeight: 74 },
  dot: { position: 'absolute', right: -1, bottom: -1, width: 13, height: 13, borderRadius: 999, backgroundColor: colors.amber, borderWidth: 2 },
  title: { fontFamily: font.bold, fontSize: 14.5, letterSpacing: -0.3, color: colors.ink, flexShrink: 1 },
  pill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  pillLabel: { fontFamily: font.extrabold, fontSize: 9, letterSpacing: 0.5 },
  meta: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 17, color: colors.zinc500, marginTop: 3 },
  right: { fontFamily: font.semibold, fontSize: 11, color: colors.zinc400 },
  unread: { minWidth: 24, height: 24, borderRadius: 999, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  unreadLabel: { fontFamily: font.extrabold, fontSize: 11, lineHeight: 14, color: colors.ink, includeFontPadding: false, textAlignVertical: 'center' },
  chevron: { fontFamily: font.bold, fontSize: 16, color: colors.zinc300 },
});
