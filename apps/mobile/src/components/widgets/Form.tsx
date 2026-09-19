import { forwardRef, useState, type ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import { colors, font, text } from '../../theme';

export function FieldLabel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={style}><Text style={[text.fieldLabel, { marginBottom: 9 }]}>{children}</Text></View>;
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={text.eyebrow}>{children}</Text>
      {right}
    </View>
  );
}

export function Toggle({ value, onChange }: { value: boolean; onChange?: (v: boolean) => void }) {
  return (
    <Pressable
      onPress={() => onChange?.(!value)}
      hitSlop={6}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={[styles.track, { backgroundColor: value ? colors.ink : colors.zinc300, alignItems: value ? 'flex-end' : 'flex-start' }]}
    >
      <View style={[styles.knob, { backgroundColor: value ? colors.amber : colors.white }]} />
    </Pressable>
  );
}

export function ToggleRow({
  title, sub, value, onChange, onWhite, style,
}: { title: string; sub?: string; value: boolean; onChange?: (v: boolean) => void; onWhite?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.toggleRow, { backgroundColor: onWhite ? colors.white : colors.zinc100 }, style]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        {!!sub && <Text style={styles.toggleSub}>{sub}</Text>}
      </View>
      <Toggle value={value} onChange={onChange} />
    </View>
  );
}

export const TextField = forwardRef<TextInput, TextInputProps & { big?: boolean; hidePlaceholderOnFocus?: boolean }>(function TextField({ style, big, value, hidePlaceholderOnFocus, placeholder, onFocus, onBlur, ...rest }, ref) {
  const filled = !!value && String(value).length > 0;
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      ref={ref}
      value={value}
      placeholder={hidePlaceholderOnFocus && focused ? '' : placeholder}
      placeholderTextColor={colors.zinc400}
      style={[styles.field, big && styles.fieldBig, filled ? styles.fieldFilled : styles.fieldEmpty, style]}
      onFocus={(e) => { setFocused(true); onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); onBlur?.(e); }}
      {...rest}
    />
  );
});

export function RadioRow({ label, selected, onPress }: { label: string; selected: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} style={[styles.radioRow, selected ? styles.radioOn : styles.radioOff]}>
      <View style={[styles.radio, { borderColor: selected ? colors.ink : colors.zinc300 }]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={[styles.radioLabel, { color: selected ? colors.ink : colors.zinc700 }]}>{label}</Text>
    </Pressable>
  );
}

export function CheckDot({ size = 19, bg = colors.mintInk, fg = colors.white }: { size?: number; bg?: string; fg?: string }) {
  return (
    <View style={{ width: size, height: size, minWidth: size, borderRadius: 999, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Octicons name="check" size={Math.round(size * 0.6)} color={fg} />
    </View>
  );
}

export type StatusState = 'done' | 'next' | 'later' | 'idle';

// Verification / checklist row: mint when done, zinc otherwise, with a state pill.
export function StatusRow({
  title, sub, state, pill, onPress, leading,
}: { title: string; sub?: string; state: StatusState; pill?: string; onPress?: () => void; leading?: ReactNode }) {
  const done = state === 'done';
  const pillColors = done ? [colors.white, colors.mintInk] : state === 'next' ? [colors.amber, colors.ink] : [colors.zinc200, colors.zinc700];
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.statusRow, { backgroundColor: done ? colors.mint : colors.zinc100 }]}>
      {leading ?? (done ? <CheckDot size={36} /> : <View style={styles.emptyCircle} />)}
      <View style={{ flex: 1 }}>
        <Text style={[styles.statusTitle, done && { color: colors.mintInk }]}>{title}</Text>
        {!!sub && <Text style={[styles.statusSub, done && { color: colors.mintInk, opacity: 0.8 }]}>{sub}</Text>}
      </View>
      {!!pill && (
        <View style={[styles.statusPill, { backgroundColor: pillColors[0] }]}>
          <Text style={[styles.statusPillLabel, { color: pillColors[1] }]}>{pill}</Text>
        </View>
      )}
    </Pressable>
  );
}

const NOTICE = {
  sky: [colors.sky, colors.skyInk],
  mint: [colors.mint, colors.mintInk],
  amber: [colors.amberSoft, colors.amberInk],
  zinc: [colors.zinc100, colors.zinc700],
  rose: [colors.rose, colors.roseInk],
} as const;

export function Notice({
  tone = 'sky', title, children, items, style,
}: { tone?: keyof typeof NOTICE; title?: string; children?: ReactNode; items?: string[]; style?: StyleProp<ViewStyle> }) {
  const [bg, fg] = NOTICE[tone];
  return (
    <View style={[styles.notice, { backgroundColor: bg }, style]}>
      {!!title && <Text style={[text.fieldLabel, { color: fg }]}>{title}</Text>}
      {!!children && <Text style={[styles.noticeText, { color: fg }, !!title && { marginTop: 8 }]}>{children}</Text>}
      {!!items && (
        <View style={{ gap: 10, marginTop: title ? 11 : 0 }}>
          {items.map((it) => (
            <View key={it} style={{ flexDirection: 'row', gap: 11 }}>
              <CheckDot size={18} bg={fg} />
              <Text style={[styles.noticeText, { color: fg, flex: 1 }]}>{it}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// Inline confirmation strip, e.g. "You'll appear as Yana P."
export function ConfirmStrip({ children }: { children: ReactNode }) {
  return (
    <View style={styles.confirm}>
      <CheckDot />
      <Text style={styles.confirmText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  track: { width: 46, height: 28, minWidth: 46, borderRadius: 999, padding: 3, justifyContent: 'center' },
  knob: { width: 22, height: 22, borderRadius: 999 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 16 },
  toggleTitle: { fontFamily: font.bold, fontSize: 14, color: colors.ink },
  toggleSub: { fontFamily: font.regular, fontSize: 12, color: colors.zinc500, marginTop: 3 },
  field: { borderRadius: 16, minHeight: 58, paddingHorizontal: 16, fontFamily: font.bold, fontSize: 16, color: colors.ink },
  fieldBig: { minHeight: 110, paddingTop: 16, paddingBottom: 16, textAlignVertical: 'top', fontFamily: font.extrabold, fontSize: 20, lineHeight: 26, letterSpacing: -0.5 },
  fieldFilled: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink },
  fieldEmpty: { backgroundColor: colors.zinc100, borderWidth: 2, borderColor: colors.zinc100 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, minHeight: 56, paddingHorizontal: 16, borderWidth: 2 },
  radioOn: { backgroundColor: colors.white, borderColor: colors.ink },
  radioOff: { backgroundColor: colors.zinc100, borderColor: colors.zinc100 },
  radio: { width: 20, height: 20, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 9, height: 9, borderRadius: 999, backgroundColor: colors.amber },
  radioLabel: { fontFamily: font.bold, fontSize: 15 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 20, padding: 16, minHeight: 78 },
  emptyCircle: { width: 36, height: 36, minWidth: 36, borderRadius: 999, borderWidth: 2, borderColor: colors.zinc300 },
  statusTitle: { fontFamily: font.extrabold, fontSize: 14.5, color: colors.ink },
  statusSub: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 17, color: colors.zinc500, marginTop: 3 },
  statusPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  statusPillLabel: { fontFamily: font.extrabold, fontSize: 10.5 },
  notice: { borderRadius: 18, padding: 16 },
  noticeText: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 19 },
  confirm: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, backgroundColor: colors.mint, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 15 },
  confirmText: { flex: 1, fontFamily: font.regular, fontSize: 12.5, lineHeight: 18, color: colors.mintInk },
});
