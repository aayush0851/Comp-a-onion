import { StyleSheet, Text, View } from 'react-native';
import { colors, Tone } from '../../theme';
import { Btn, BtnVariant } from './Btn';

export function EmptyState({
  shape = 'circle', tone = 'peach', title, body, cta, ctaVariant = 'primary', onPressCta,
}: {
  shape?: 'circle' | 'square' | 'bubble';
  tone?: Tone;
  title: string;
  body: string;
  cta?: string | null;
  ctaVariant?: BtnVariant;
  onPressCta?: () => void;
}) {
  const glyphTones: Record<Tone, { bg: string; fg: string }> = {
    peach: { bg: '#F6E4DA', fg: colors.clay },
    sage: { bg: '#E8EDE3', fg: colors.sage },
    sand: { bg: '#EFE6DC', fg: colors.faint },
  };
  const g = glyphTones[tone];
  const shapeRadius = shape === 'square' ? 9 : shape === 'bubble' ? undefined : 999;
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: 34, paddingVertical: 28 }}>
      <View style={{ width: 74, height: 74, borderRadius: 999, backgroundColor: g.bg, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={[
            { width: 30, height: 30, borderWidth: 2, borderColor: g.fg, alignItems: 'center', justifyContent: 'center' },
            shape === 'bubble'
              ? { borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomRightRadius: 10, borderBottomLeftRadius: 2 }
              : { borderRadius: shapeRadius },
          ]}
        >
          {shape === 'circle' && <View style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: g.fg }} />}
        </View>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {!!cta && (
        <View style={{ width: '100%', marginTop: 22 }}>
          <Btn label={cta} variant={ctaVariant} onPress={onPressCta} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyTitle: { fontFamily: 'Figtree_700Bold', fontSize: 20, lineHeight: 25, letterSpacing: -0.4, color: colors.ink, marginTop: 20, textAlign: 'center' },
  emptyBody: { fontFamily: 'Newsreader_400Regular_Italic', fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 8, textAlign: 'center' },
});
