import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../../theme';

export function Sheet({
  visible, onClose, title, sub, children,
}: { visible: boolean; onClose: () => void; title?: string; sub?: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 14 }]}>
          <View style={styles.handle} />
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!sub && <Text style={styles.sub}>{sub}</Text>}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// A tappable row inside a sheet list (e.g. "Take a photo").
export function SheetRow({ label, onPress, danger }: { label: string; onPress?: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.zinc200 }]}>
      <Text style={[styles.rowLabel, danger && { color: colors.roseInk }]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(24,24,24,.55)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 12, paddingHorizontal: 20 },
  handle: { width: 44, height: 5, borderRadius: 999, backgroundColor: colors.zinc200, alignSelf: 'center', marginBottom: 20 },
  title: { fontFamily: font.extrabold, fontSize: 20, lineHeight: 26, letterSpacing: -0.6, color: colors.ink },
  sub: { fontFamily: font.regular, fontSize: 13.5, lineHeight: 20, color: colors.zinc500, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.zinc100, borderRadius: 16, minHeight: 56, paddingHorizontal: 16, marginTop: 9 },
  rowLabel: { fontFamily: font.bold, fontSize: 15, color: colors.ink },
  chevron: { fontFamily: font.bold, fontSize: 16, color: colors.zinc300 },
});
