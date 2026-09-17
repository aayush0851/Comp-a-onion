import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font } from '../../theme';

export function BackButton({ onPress, dark, onSurface }: { onPress?: () => void; dark?: boolean; onSurface?: boolean }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.button, onSurface && { backgroundColor: colors.white }, dark && styles.buttonDark]}>
      <Text style={[styles.glyph, dark && { color: colors.white }]}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 42, height: 42, minWidth: 42, borderRadius: 999, backgroundColor: colors.zinc100, alignItems: 'center', justifyContent: 'center' },
  buttonDark: { backgroundColor: 'rgba(255,255,255,.12)' },
  glyph: { fontFamily: font.bold, fontSize: 17, color: colors.ink },
});
