import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, shadow } from '../../theme';

export function BackButton({ onPress, dark }: { onPress?: () => void; dark?: boolean }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.backButton, dark && styles.backButtonDark]}>
      <Text style={[styles.backGlyph, dark && styles.backGlyphDark]}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40, height: 40, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center', ...shadow.inner,
  },
  backButtonDark: { backgroundColor: 'rgba(251,246,240,.12)', borderColor: 'rgba(251,246,240,.2)' },
  backGlyph: { fontFamily: 'Figtree_700Bold', fontSize: 17, color: colors.ink },
  backGlyphDark: { color: colors.ground },
});
