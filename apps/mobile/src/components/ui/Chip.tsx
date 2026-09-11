import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius } from '../../theme';

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

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.pill, borderWidth: 1, paddingVertical: 11, paddingHorizontal: 14,
  },
  chipLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
});
