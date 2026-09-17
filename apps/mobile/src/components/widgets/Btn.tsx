import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, font } from '../../theme';

export type BtnVariant = 'primary' | 'amber' | 'secondary' | 'outlined' | 'ghost' | 'danger' | 'disabled';

const VARIANTS: Record<BtnVariant, { bg: string; fg: string; bd: string; pressed: string }> = {
  primary: { bg: colors.ink, fg: colors.white, bd: colors.ink, pressed: colors.zinc800 },
  amber: { bg: colors.amber, fg: colors.ink, bd: colors.amber, pressed: colors.amberPressed },
  secondary: { bg: colors.zinc100, fg: colors.ink, bd: colors.zinc100, pressed: colors.zinc200 },
  outlined: { bg: colors.white, fg: colors.ink, bd: colors.zinc200, pressed: colors.zinc100 },
  ghost: { bg: 'transparent', fg: colors.zinc500, bd: 'transparent', pressed: colors.zinc100 },
  danger: { bg: colors.white, fg: colors.roseInk, bd: colors.rose, pressed: colors.zinc50 },
  disabled: { bg: colors.zinc100, fg: colors.zinc400, bd: colors.zinc100, pressed: colors.zinc100 },
};

export function Btn({
  label, variant = 'primary', glyph, onPress, full = true, loading, small, style,
}: {
  label: string;
  variant?: BtnVariant;
  glyph?: string;
  onPress?: () => void;
  full?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = VARIANTS[variant];
  const inert = variant === 'disabled' || loading;
  return (
    <Pressable
      onPress={inert ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        small && styles.small,
        { backgroundColor: pressed && !inert ? v.pressed : v.bg, borderColor: pressed && !inert && variant !== 'outlined' && variant !== 'danger' ? v.pressed : v.bd },
        full ? { alignSelf: 'stretch' } : { alignSelf: 'flex-start' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          <Text style={[styles.label, small && styles.smallLabel, { color: v.fg }]}>{label}</Text>
          {!!glyph && <Text style={[styles.label, small && styles.smallLabel, { color: v.fg }]}>{glyph}</Text>}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 54, paddingHorizontal: 22, borderRadius: 999, borderWidth: 1.5 },
  small: { minHeight: 44, paddingHorizontal: 17 },
  label: { fontFamily: font.bold, fontSize: 15, letterSpacing: -0.1 },
  smallLabel: { fontSize: 12.5 },
});
