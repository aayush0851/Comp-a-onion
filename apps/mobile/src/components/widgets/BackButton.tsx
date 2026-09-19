import { Pressable, StyleSheet } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import { colors } from '../../theme';

export function BackButton({ onPress, dark, onSurface }: { onPress?: () => void; dark?: boolean; onSurface?: boolean }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.button, onSurface && { backgroundColor: colors.white }, dark && styles.buttonDark]}>
      <Octicons name="arrow-left" size={18} color={dark ? colors.white : colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 42, height: 42, minWidth: 42, borderRadius: 999, backgroundColor: colors.zinc100, alignItems: 'center', justifyContent: 'center' },
  buttonDark: { backgroundColor: 'rgba(255,255,255,.12)' },
});
