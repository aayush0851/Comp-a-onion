import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

export type TabKey = 'explore' | 'plans' | 'chats' | 'me';

function ExploreIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 19, height: 19, borderRadius: 999, borderWidth: 1.8, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: color }} />
    </View>
  );
}

function PlansIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 19, height: 19, justifyContent: 'center', gap: 3 }}>
      <View style={{ height: 2.6, borderRadius: 2, backgroundColor: color }} />
      <View style={{ height: 2.6, borderRadius: 2, backgroundColor: color }} />
      <View style={{ height: 2.6, width: '62%', borderRadius: 2, backgroundColor: color }} />
    </View>
  );
}

function ChatsIcon({ color, unread }: { color: string; unread?: boolean }) {
  return (
    <View style={{ width: 19, height: 19 }}>
      <View style={{ width: 19, height: 15, borderRadius: 5, borderWidth: 1.8, borderColor: color }} />
      <View style={{ position: 'absolute', left: 3, bottom: 0, width: 5, height: 5, backgroundColor: color, borderRadius: 1, transform: [{ rotate: '45deg' }] }} />
      {unread && <View style={{ position: 'absolute', right: -4, top: -3, minWidth: 8, height: 8, borderRadius: 999, backgroundColor: colors.clay, borderWidth: 1.5, borderColor: colors.ground }} />}
    </View>
  );
}

function MeIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 19, height: 19, alignItems: 'center', gap: 2 }}>
      <View style={{ width: 8, height: 8, borderRadius: 999, borderWidth: 1.8, borderColor: color }} />
      <View style={{ width: 15, height: 7, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, borderWidth: 1.8, borderColor: color, borderBottomWidth: 0 }} />
    </View>
  );
}

const TAB_ORDER: { key: TabKey; label: string }[] = [
  { key: 'explore', label: 'Explore' },
  { key: 'plans', label: 'Plans' },
  { key: 'chats', label: 'Chats' },
  { key: 'me', label: 'Me' },
];

export function TabBar({
  active, unread = true, onPress,
}: { active: TabKey; unread?: boolean; onPress?: (key: TabKey) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TAB_ORDER.map(({ key, label }) => {
        const on = key === active;
        const color = on ? colors.clay : colors.faint;
        return (
          <Pressable key={key} onPress={() => onPress?.(key)} style={styles.tabItem}>
            {key === 'explore' && <ExploreIcon color={color} />}
            {key === 'plans' && <PlansIcon color={color} />}
            {key === 'chats' && <ChatsIcon color={color} unread={unread} />}
            {key === 'me' && <MeIcon color={color} />}
            <Text style={[styles.tabLabel, { color, fontFamily: on ? 'Figtree_700Bold' : 'Figtree_500Medium' }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row', backgroundColor: 'rgba(251,246,240,.96)', borderTopWidth: 1, borderTopColor: colors.line,
    paddingTop: 8, paddingHorizontal: 10,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 5, minHeight: 52, paddingTop: 6 },
  tabLabel: { fontSize: 10.5, letterSpacing: -0.1 },
});
