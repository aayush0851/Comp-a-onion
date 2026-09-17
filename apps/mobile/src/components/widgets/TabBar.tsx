import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../../theme';

export type TabKey = 'explore' | 'plans' | 'chats' | 'me';

function ExploreIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 17, height: 17, borderRadius: 999, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: color }} />
    </View>
  );
}

function HangoutsIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 17, height: 17, justifyContent: 'center', gap: 3 }}>
      <View style={{ height: 2.4, borderRadius: 2, backgroundColor: color }} />
      <View style={{ height: 2.4, borderRadius: 2, backgroundColor: color }} />
      <View style={{ height: 2.4, width: '62%', borderRadius: 2, backgroundColor: color }} />
    </View>
  );
}

function ChatsIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 17, height: 15 }}>
      <View style={{ width: 17, height: 13, borderRadius: 5, borderWidth: 2, borderColor: color }} />
      <View style={{ position: 'absolute', left: 3, bottom: 0, width: 4.5, height: 4.5, backgroundColor: color, borderRadius: 1, transform: [{ rotate: '45deg' }] }} />
    </View>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 17, height: 17, alignItems: 'center', gap: 2 }}>
      <View style={{ width: 7, height: 7, borderRadius: 999, borderWidth: 2, borderColor: color }} />
      <View style={{ width: 14, height: 6, borderTopLeftRadius: 6, borderTopRightRadius: 6, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, borderWidth: 2, borderBottomWidth: 0, borderColor: color }} />
    </View>
  );
}

const TABS: { key: TabKey; label: string; Icon: (p: { color: string }) => ReactElement }[] = [
  { key: 'explore', label: 'Explore', Icon: ExploreIcon },
  { key: 'plans', label: 'Hangouts', Icon: HangoutsIcon },
  { key: 'chats', label: 'Chats', Icon: ChatsIcon },
  { key: 'me', label: 'Profile', Icon: ProfileIcon },
];

export function TabBar({ active, unread = false, onPress }: { active: TabKey; unread?: boolean; onPress?: (key: TabKey) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {TABS.map(({ key, label, Icon }) => {
        const on = key === active;
        return (
          <Pressable key={key} onPress={() => onPress?.(key)} style={styles.item} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <View style={[styles.iconPill, { backgroundColor: on ? colors.ink : 'transparent' }]}>
              <Icon color={on ? colors.amber : colors.zinc400} />
              {key === 'chats' && unread && <View style={styles.unread} />}
            </View>
            <Text style={[styles.label, { color: on ? colors.ink : colors.zinc400, fontFamily: on ? font.bold : font.medium }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,.97)', borderTopWidth: 1, borderTopColor: colors.zinc200, paddingTop: 9, paddingHorizontal: 10 },
  item: { flex: 1, alignItems: 'center', gap: 6, minHeight: 52 },
  iconPill: { width: 40, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  unread: { position: 'absolute', right: 4, top: 2, width: 8, height: 8, borderRadius: 999, backgroundColor: colors.amber, borderWidth: 1.5, borderColor: colors.white },
  label: { fontSize: 10.5, letterSpacing: -0.1 },
});
