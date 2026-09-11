import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { text } from '../components/ui';
import { ACTIVITIES, CHAT_SEED, TABS } from '../data';
import { useAppState } from '../state';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

export default function ChatList({ navigation }: Props) {
  const state = useAppState();
  const activeChats = ACTIVITIES.filter((a) => a.id === 'ramen' || state.requested.includes(a.id));

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <Text style={text.aside}>Plans you're in, all in one place.</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 90, gap: 10 }}>
        {activeChats.map((a) => {
          const lastMsg = a.id === 'ramen' ? CHAT_SEED[CHAT_SEED.length - 1] : null;
          return (
            <Pressable key={a.id} onPress={() => navigation.navigate('Chat', { id: a.id })} style={styles.row}>
              <View style={styles.avatar}><Text style={styles.avatarLabel}>{a.hostInitials}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{a.title}</Text>
                <Text style={styles.rowPreview} numberOfLines={1}>
                  {lastMsg ? `${lastMsg.mine ? 'You' : lastMsg.author}: ${lastMsg.text}` : 'Say hi to start the conversation.'}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })}
        {activeChats.length === 0 && (
          <View style={styles.empty}>
            <Feather name="message-circle" size={42} color={colors.faint} />
            <Text style={[text.aside, { marginTop: 12 }]}>No active chats yet. Join a plan to start one.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = t === 'Chats';
          return (
            <Pressable
              key={t}
              onPress={() => {
                if (t === 'Plans') navigation.navigate('MyPlans');
                else if (t === 'Chats') navigation.navigate('ChatList');
                else if (t === 'Me') navigation.navigate('Profile');
                else navigation.navigate('Board');
              }}
              style={[styles.tabPill, active ? { backgroundColor: colors.ink } : { backgroundColor: 'transparent' }]}
            >
              <Text style={[styles.tabLabel, { color: active ? colors.ground : colors.muted }]}>{t}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  header: { padding: 20, paddingTop: 36, paddingBottom: 10 },
  title: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 29, letterSpacing: -0.6, marginBottom: 6 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface,
    borderRadius: radius.inner, padding: 14, ...shadow.inner,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: colors.clayPressed, fontFamily: 'Figtree_700Bold', fontSize: 14 },
  rowTitle: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 14.5 },
  rowPreview: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 12.5, marginTop: 3 },
  chevron: { color: colors.faint, fontFamily: 'Figtree_600SemiBold', fontSize: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(251,246,240,.94)',
    borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 18, paddingBottom: 24,
  },
  tabPill: { borderRadius: 999, paddingVertical: 9, paddingHorizontal: 15 },
  tabLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
});
