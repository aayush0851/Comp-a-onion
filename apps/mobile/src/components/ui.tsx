import React, { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { colors, radius, shadow } from '../theme';

export function PencilIcon({ size = 14, color = '#fff' }: { size?: number; color?: string }) {
  const barLength = size * 1.05;
  const barWidth = size * 0.24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ rotate: '-45deg' }] }}>
        <View
          style={{
            width: 0, height: 0,
            borderTopWidth: barWidth / 2, borderBottomWidth: barWidth / 2, borderRightWidth: barWidth,
            borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: color,
          }}
        />
        <View style={{ width: barLength - barWidth, height: barWidth, backgroundColor: color, borderTopRightRadius: 1, borderBottomRightRadius: 1 }} />
      </View>
    </View>
  );
}

export function UploadIcon({ size = 14, color = '#fff' }: { size?: number; color?: string }) {
  const arrowWidth = size * 0.5;
  const stemWidth = size * 0.16;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 0, height: 0,
            borderLeftWidth: arrowWidth / 2, borderRightWidth: arrowWidth / 2, borderBottomWidth: arrowWidth * 0.65,
            borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color,
          }}
        />
        <View style={{ width: stemWidth, height: size * 0.32, backgroundColor: color }} />
      </View>
      <View style={{ width: size * 0.85, height: size * 0.14, backgroundColor: color, borderRadius: 1, marginTop: size * 0.12 }} />
    </View>
  );
}

export function PrimaryButton({
  label, onPress, style, dark,
}: { label: string; onPress?: () => void; style?: StyleProp<ViewStyle>; dark?: boolean }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.primaryBtn,
        { backgroundColor: pressed ? colors.clayPressed : colors.clay },
        dark && { backgroundColor: pressed ? '#1c1a17' : colors.ink },
        style,
      ]}
    >
      <Text style={[styles.primaryBtnLabel, dark && { color: colors.ground }]}>{label}</Text>
    </Pressable>
  );
}

export function OutlineButton({
  label, onPress, style, flex,
}: { label: string; onPress?: () => void; style?: StyleProp<ViewStyle>; flex?: boolean }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.outlineBtn,
        pressed && { backgroundColor: '#F6EFE7' },
        flex && { flex: 1 },
        style,
      ]}
    >
      <Text style={styles.outlineBtnLabel}>{label}</Text>
    </Pressable>
  );
}

export function BackPill({ onPress, label = '← Back' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, shadow.chip, { alignSelf: 'flex-start' }]}>
      <Text style={styles.pillLabel}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label, selected, onPress, small, style,
}: { label: string; selected?: boolean; onPress?: () => void; small?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        small && { paddingVertical: 9, paddingHorizontal: 11 },
        selected
          ? { backgroundColor: colors.ink, borderColor: colors.ink }
          : { backgroundColor: 'transparent', borderColor: colors.border },
        style,
      ]}
    >
      <Text style={[styles.chipLabel, { color: selected ? colors.ground : colors.inkSecondary }]}>{label}</Text>
    </Pressable>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function Avatar({
  label, bg = colors.blush, fg = colors.clayPressed, size = 34, style, ring,
}: { label: string; bg?: string; fg?: string; size?: number; style?: StyleProp<ViewStyle>; ring?: boolean }) {
  return (
    <View
      style={[
        {
          width: size, height: size, borderRadius: size / 2, backgroundColor: bg,
          alignItems: 'center', justifyContent: 'center',
        },
        ring && { borderWidth: 2, borderColor: colors.ground },
        style,
      ]}
    >
      <Text style={{ color: fg, fontFamily: 'Figtree_700Bold', fontSize: size * 0.32 }}>{label}</Text>
    </View>
  );
}

export function ProgressBars({ total, current }: { total: number; current: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 5, marginTop: 18 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{ flex: 1, height: 5, borderRadius: 999, backgroundColor: i <= current ? colors.clay : colors.borderSoft }}
        />
      ))}
    </View>
  );
}

export function OnboardingHeader({
  onBack, step, totalSteps, title, subtitle,
}: { onBack?: () => void; step?: number; totalSteps?: number; title: string; subtitle?: string }) {
  return (
    <View>
      {onBack && <BackPill onPress={onBack} />}
      {step !== undefined && totalSteps !== undefined && <ProgressBars total={totalSteps} current={step} />}
      <Text style={[text.title28, { marginTop: 18 }]}>{title}</Text>
      {subtitle ? <Text style={[text.body, { marginTop: 11 }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function SelectTile({
  title, desc, selected, onPress,
}: { title: string; desc?: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tile,
        selected
          ? { backgroundColor: colors.blush, borderColor: colors.clay }
          : { backgroundColor: colors.surface, borderColor: colors.borderSoft },
      ]}
    >
      <Text style={[styles.tileTitle, { color: selected ? colors.blushInk : colors.ink }]}>{title}</Text>
      {!!desc && <Text style={[styles.tileDesc, { color: selected ? colors.blushInk2 : colors.muted }]}>{desc}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryBtn: {
    borderRadius: radius.pill, paddingVertical: 17, alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnLabel: { color: '#FFFFFF', fontFamily: 'Figtree_700Bold', fontSize: 15 },
  outlineBtn: {
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
    paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center',
  },
  outlineBtnLabel: { color: colors.inkSecondary, fontFamily: 'Figtree_600SemiBold', fontSize: 13.5 },
  pill: {
    backgroundColor: colors.surface, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 14,
  },
  pillLabel: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
  chip: {
    borderRadius: radius.pill, borderWidth: 1, paddingVertical: 11, paddingHorizontal: 14,
  },
  chipLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
  sectionLabel: {
    fontFamily: 'Figtree_600SemiBold', fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase',
    color: colors.faint, marginBottom: 10,
  },
  tile: {
    borderRadius: radius.inner, borderWidth: 1.5, padding: 15,
  },
  tileTitle: { fontFamily: 'Figtree_700Bold', fontSize: 15 },
  tileDesc: { fontFamily: 'Figtree_400Regular', fontSize: 12, lineHeight: 17, marginTop: 4 },
});

export const text: Record<string, TextStyle> = {
  display1: { fontFamily: 'Figtree_700Bold', fontSize: 35, lineHeight: 37, letterSpacing: -0.9, color: colors.ink },
  display2: { fontFamily: 'Newsreader_400Regular_Italic', fontSize: 33, lineHeight: 36, color: colors.clay },
  title28: { fontFamily: 'Figtree_700Bold', fontSize: 28, lineHeight: 31, letterSpacing: -0.8, color: colors.ink },
  title26: { fontFamily: 'Figtree_700Bold', fontSize: 26, lineHeight: 29, letterSpacing: -0.7, color: colors.ink },
  title32: { fontFamily: 'Figtree_700Bold', fontSize: 32, lineHeight: 35, letterSpacing: -1, color: colors.ink },
  body: { fontFamily: 'Figtree_400Regular', fontSize: 14, lineHeight: 22, color: colors.muted },
  aside: { fontFamily: 'Newsreader_400Regular_Italic', fontSize: 16, lineHeight: 22, color: colors.muted },
  wordmark: { fontFamily: 'Figtree_800ExtraBold', fontSize: 17, letterSpacing: -0.3, color: colors.ink },
};
