import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../../theme';

export type ChipItem = string | { label: string; glyph?: string };

export function FilterChips({
  items, active, onChange, activeTone = 'ink', scroll, multi,
}: {
  items: ChipItem[];
  active: number | number[];
  onChange?: (i: number) => void;
  activeTone?: 'ink' | 'amber';
  scroll?: boolean;
  multi?: boolean;
}) {
  const isOn = (i: number) => (Array.isArray(active) ? active.includes(i) : i === active);
  const on = activeTone === 'amber' ? { bg: colors.amber, fg: colors.ink } : { bg: colors.ink, fg: colors.white };
  const chips = items.map((item, i) => {
    const { label, glyph } = typeof item === 'string' ? { label: item, glyph: undefined } : item;
    const selected = isOn(i);
    return (
      <Pressable
        key={label + i}
        onPress={() => onChange?.(i)}
        accessibilityState={multi ? { checked: selected } : { selected }}
        style={[styles.chip, { backgroundColor: selected ? on.bg : colors.zinc100 }]}
      >
        {!!glyph && <Text style={[styles.glyph, { color: selected ? on.fg : colors.zinc700 }]}>{glyph}</Text>}
        <Text style={[styles.label, { color: selected ? on.fg : colors.zinc700 }]}>{label}</Text>
      </Pressable>
    );
  });
  if (scroll) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
        {chips}
      </ScrollView>
    );
  }
  return <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{chips}</View>;
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 999, minHeight: 42, paddingHorizontal: 16 },
  glyph: { fontSize: 11 },
  label: { fontFamily: font.bold, fontSize: 12.5, letterSpacing: -0.1 },
});
