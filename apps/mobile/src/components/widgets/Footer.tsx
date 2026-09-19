import type { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';

// Bottom-pinned action area used by every stack screen.
export function Footer({ children, style, transparent }: { children: ReactNode; style?: StyleProp<ViewStyle>; transparent?: boolean }) {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardVisible();
  return (
    <View
      style={[
        { paddingTop: 16, paddingHorizontal: 20, paddingBottom: keyboard ? 16 : Math.max(insets.bottom, 14) + 16, gap: 5, backgroundColor: transparent ? 'transparent' : colors.white },
        style,
      ]}
    >
      {children}
    </View>
  );
}
