import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, shadow } from '../../theme';

export type BtnVariant = 'primary' | 'secondary' | 'dark' | 'ghost' | 'danger' | 'disabled';

const BTN_VARIANTS: Record<BtnVariant, { bg: string; fg: string; bd: string; shadow?: object }> = {
  primary: { bg: colors.clay, fg: '#FFFFFF', bd: colors.clay, shadow: { shadowColor: colors.clay, shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 } },
  secondary: { bg: colors.surface, fg: colors.ink, bd: colors.border, shadow: shadow.inner },
  dark: { bg: colors.ink, fg: colors.ground, bd: colors.ink, shadow: { shadowColor: colors.ink, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 } },
  ghost: { bg: 'transparent', fg: colors.inkSecondary, bd: 'transparent' },
  danger: { bg: colors.surface, fg: colors.clayPressed, bd: '#E8C9B8' },
  disabled: { bg: colors.borderSoft, fg: colors.faint, bd: colors.borderSoft },
};

export function Btn({
  label, variant = 'primary', onPress, full = true, style,
}: { label: string; variant?: BtnVariant; onPress?: () => void; full?: boolean; style?: StyleProp<ViewStyle> }) {
  const v = BTN_VARIANTS[variant];
  const disabled = variant === 'disabled';
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.bd, width: full ? '100%' : undefined },
        v.shadow,
        style,
      ]}
    >
      <Text style={[styles.btnLabel, { color: v.fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52, borderRadius: radius.pill, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22,
  },
  btnLabel: { fontFamily: 'Figtree_700Bold', fontSize: 15, letterSpacing: -0.1 },
});
