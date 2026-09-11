import { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius } from '../../theme';

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

const styles = StyleSheet.create({
  outlineBtn: {
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
    paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center',
  },
  outlineBtnLabel: { color: colors.inkSecondary, fontFamily: 'Figtree_600SemiBold', fontSize: 13.5 },
});
