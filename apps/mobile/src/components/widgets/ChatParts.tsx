import { useRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { colors, font } from '../../theme';
import { Avatar } from './Avatar';
import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';

export type BubbleMessage = { id: string; text: string; mine: boolean; authorName?: string | null; authorInitials?: string; authorPhoto?: string | null; authorTone?: readonly [string, string] };

export function chatTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function SystemNote({ children }: { children: ReactNode }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.system}>{children}</Text>
    </View>
  );
}

export function Bubble({ m, showName }: { m: BubbleMessage; showName?: boolean }) {
  if (m.mine) {
    return (
      <View style={{ alignItems: 'flex-end' }}>
        <View style={[styles.bubble, styles.mine]}><Text style={[styles.text, { fontFamily: font.semibold }]}>{m.text}</Text></View>
      </View>
    );
  }
  return (
    <View style={styles.theirsRow}>
      <Avatar initials={m.authorInitials ?? '?'} photo={m.authorPhoto} size={30} colorsOverride={m.authorTone} />
      <View style={{ maxWidth: '78%' }}>
        {showName && !!m.authorName && <Text style={styles.name}>{m.authorName}</Text>}
        <View style={[styles.bubble, styles.theirs]}><Text style={styles.text}>{m.text}</Text></View>
      </View>
    </View>
  );
}

// Within this many px of the bottom still counts as "reading the latest".
const STICK_TO_BOTTOM_PX = 80;

// Follows new messages down like any chat app, unless the user has scrolled up to read older ones.
export function ChatBody({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const scrollRef = useRef<ScrollView>(null);
  const atBottom = useRef(true);
  // Jump (not glide) to the bottom when the chat first opens; animate only once it has scrolled.
  const settled = useRef(false);
  const follow = () => { if (atBottom.current) scrollRef.current?.scrollToEnd({ animated: settled.current }); };
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={100}
        onScroll={({ nativeEvent: { contentOffset, contentSize, layoutMeasurement } }) => {
          atBottom.current = contentSize.height - contentOffset.y - layoutMeasurement.height < STICK_TO_BOTTOM_PX;
          settled.current = true;
        }}
        onContentSizeChange={follow}
        onLayout={follow}
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}

export function Composer({ value, onChange, onSend, placeholder }: { value: string; onChange: (t: string) => void; onSend: () => void; placeholder: string }) {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardVisible();
  return (
    <View style={[styles.composer, { paddingBottom: keyboard ? 12 : Math.max(insets.bottom, 12) + 12 }]}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.zinc400}
        style={styles.input}
        multiline
        onSubmitEditing={onSend}
      />
      <Pressable onPress={onSend} disabled={!value.trim()} accessibilityLabel="Send" style={[styles.send, !value.trim() && { opacity: 0.4 }]}>
        <FontAwesome name="send" size={16} color={colors.amber} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 1, paddingTop: 16, paddingHorizontal: 18, paddingBottom: 20, gap: 12 },
  system: { backgroundColor: colors.zinc200, borderRadius: 999, overflow: 'hidden', paddingHorizontal: 13, paddingVertical: 7, fontFamily: font.bold, fontSize: 11, color: colors.zinc500 },
  theirsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 9 },
  name: { fontFamily: font.bold, fontSize: 11, color: colors.zinc500, marginBottom: 4 },
  bubble: { paddingVertical: 12, paddingHorizontal: 14, maxWidth: 280 },
  mine: { backgroundColor: colors.amber, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 18, borderBottomRightRadius: 5 },
  theirs: { backgroundColor: colors.white, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 5 },
  text: { fontFamily: font.regular, fontSize: 13.5, lineHeight: 20, color: colors.ink },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12, paddingHorizontal: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.zinc200 },
  input: { flex: 1, backgroundColor: colors.zinc100, borderRadius: 22, minHeight: 44, maxHeight: 120, paddingHorizontal: 16, paddingVertical: 11, fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  send: { width: 44, height: 44, minWidth: 44, borderRadius: 999, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
});
