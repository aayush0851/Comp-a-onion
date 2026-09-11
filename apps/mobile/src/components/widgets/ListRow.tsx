import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, scale, shadow, Tone, tones } from '../../theme';

export function ListRow({
  title, meta, initials, tone = 'sand', pill, right, unread, chevron, dot, onPress,
}: {
  title: string;
  meta?: string;
  initials?: string | null;
  tone?: Tone;
  pill?: string | null;
  right?: string | null;
  unread?: number | string | null;
  chevron?: boolean;
  dot?: boolean;
  onPress?: () => void;
}) {
  const t = tones[tone];
  return (
    <Pressable onPress={onPress} style={styles.listRow}>
      {!!initials && (
        <View style={{ position: 'relative' }}>
          <View style={{ width: 44, height: 44, minWidth: 44, borderRadius: 999, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'Figtree_700Bold', fontSize: 13, color: t.fg }}>{initials}</Text>
          </View>
          {dot && <View style={styles.presenceDot} />}
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Text numberOfLines={1} style={[scale.body, { fontFamily: 'Figtree_700Bold', fontSize: 14.5, letterSpacing: -0.2, color: colors.ink, flexShrink: 1 }]}>{title}</Text>
          {!!pill && (
            <View style={styles.rowPill}>
              <Text style={styles.rowPillLabel}>{pill}</Text>
            </View>
          )}
        </View>
        {!!meta && <Text numberOfLines={1} style={{ fontSize: 12.5, lineHeight: 17, color: colors.muted, marginTop: 3 }}>{meta}</Text>}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        {!!right && <Text style={{ fontFamily: 'Figtree_500Medium', fontSize: 11, color: colors.faint }}>{right}</Text>}
        {!!unread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadLabel}>{unread}</Text>
          </View>
        )}
        {chevron && <Text style={styles.chevron}>›</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listRow: {
    flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.surface, borderRadius: 20, padding: 14,
    minHeight: 72, ...shadow.inner,
  },
  presenceDot: { position: 'absolute', right: -1, bottom: -1, width: 13, height: 13, borderRadius: 999, backgroundColor: colors.sage, borderWidth: 2, borderColor: '#fff' },
  rowPill: { backgroundColor: colors.blush, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  rowPillLabel: { fontFamily: 'Figtree_700Bold', fontSize: 9.5, letterSpacing: 0.3, color: colors.clayPressed },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 999, backgroundColor: colors.clay, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadLabel: { fontFamily: 'Figtree_700Bold', fontSize: 11, color: '#fff' },
  chevron: { fontFamily: 'Figtree_700Bold', fontSize: 15, color: '#C3B8AD' },
});
