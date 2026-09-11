import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

export function FilterChips({
  items, active, onChange,
}: { items: string[]; active: number; onChange?: (i: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {items.map((label, i) => {
        const on = i === active;
        return (
          <Pressable
            key={label + i}
            onPress={() => onChange?.(i)}
            style={[styles.chip, { backgroundColor: on ? colors.ink : 'transparent', borderColor: on ? colors.ink : colors.border }]}
          >
            <Text style={[styles.chipLabel, { color: on ? colors.ground : colors.inkSecondary }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: 999, borderWidth: 1, minHeight: 40, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  chipLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
});
