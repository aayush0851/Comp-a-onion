import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../../theme';
import { SERVER_STATUS_INDICATOR_ENABLED } from '../../data';
import { ServerStatusDot, useServerStatus } from './ServerStatusDot';

export function CheckMark({ size = 26, dark = true }: { size?: number; dark?: boolean }) {
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.35, backgroundColor: dark ? colors.ink : colors.amber }]}>
      <Text style={{ fontFamily: font.extrabold, fontSize: size / 2, color: dark ? colors.amber : colors.ink }}>✓</Text>
    </View>
  );
}

export function Wordmark({ ink = colors.ink, onDark }: { ink?: string; onDark?: boolean }) {
  const content = (
    <>
      <CheckMark dark={!onDark} />
      <Text style={[styles.word, { color: ink }]}>Companion</Text>
    </>
  );
  if (!SERVER_STATUS_INDICATOR_ENABLED) return <View style={styles.row}>{content}</View>;
  return <WordmarkWithStatus>{content}</WordmarkWithStatus>;
}

function WordmarkWithStatus({ children }: { children: ReactNode }) {
  const { status, wake } = useServerStatus();
  return (
    <Pressable onPress={wake} hitSlop={8} style={styles.row}>
      {children}
      <ServerStatusDot status={status} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { alignItems: 'center', justifyContent: 'center' },
  word: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: -0.6 },
});
