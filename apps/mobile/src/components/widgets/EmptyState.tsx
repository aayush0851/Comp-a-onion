import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../../theme';
import { Btn, BtnVariant } from './Btn';

const GLYPH_TONES = {
  amber: [colors.amberSoft, colors.amberDeep],
  sky: [colors.sky, colors.skyDeep],
  zinc: [colors.zinc100, colors.zinc400],
  ink: [colors.ink, colors.amber],
} as const;

export function EmptyState({
  shape = 'circle', tone = 'amber', title, body, cta, ctaVariant = 'primary', onPressCta,
}: {
  shape?: 'circle' | 'square' | 'bubble';
  tone?: keyof typeof GLYPH_TONES;
  title: string;
  body: string;
  cta?: string | null;
  ctaVariant?: BtnVariant;
  onPressCta?: () => void;
}) {
  const [bg, fg] = GLYPH_TONES[tone];
  const inner =
    shape === 'square' ? { borderRadius: 9 }
      : shape === 'bubble' ? { borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomRightRadius: 10, borderBottomLeftRadius: 2 }
        : { borderRadius: 999 };
  return (
    <View style={styles.wrap}>
      <View style={[styles.glyph, { backgroundColor: bg, borderRadius: shape === 'square' ? 24 : 999 }]}>
        <View style={[styles.shape, inner, { borderColor: fg }]}>
          {shape === 'circle' && <View style={[styles.dot, { backgroundColor: fg }]} />}
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {!!cta && (
        <View style={{ alignSelf: 'stretch', marginTop: 22 }}>
          <Btn label={cta} variant={ctaVariant} onPress={onPressCta} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 34, paddingVertical: 28 },
  glyph: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  shape: { width: 30, height: 30, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 9, height: 9, borderRadius: 999 },
  title: { fontFamily: font.extrabold, fontSize: 20, lineHeight: 26, letterSpacing: -0.6, color: colors.ink, marginTop: 20, textAlign: 'center' },
  body: { fontFamily: font.regular, fontSize: 14, lineHeight: 21, color: colors.zinc500, marginTop: 8, textAlign: 'center' },
});
