import { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius } from '../../theme';

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

const styles = StyleSheet.create({
  primaryBtn: {
    borderRadius: radius.pill, paddingVertical: 17, alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnLabel: { color: '#FFFFFF', fontFamily: 'Figtree_700Bold', fontSize: 15 },
});
