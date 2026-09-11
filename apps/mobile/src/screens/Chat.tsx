import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { BackPill } from '../components/ui';
import { ACTIVITIES } from '../data';
import { useAppState, useAppDispatch } from '../state';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function Chat({ navigation, route }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState('');
  const activity = ACTIVITIES.find((a) => a.id === route.params.id) ?? ACTIVITIES[0];
  const msgs = activity.id === 'ramen' ? state.msgs : [];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <BackPill onPress={() => navigation.navigate('ChatList')} label="← Chats" />
        <View style={styles.headerCard}>
          <Text style={styles.title}>{activity.title}</Text>
          <Text style={styles.meta}>Hosted by {activity.host} · 19:30 today · 3 going</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 24, gap: 13 }}>
        {msgs.length === 0 && (
          <View style={styles.emptyWrap}>
            <Feather name="message-circle" size={40} color={colors.faint} />
            <Text style={styles.emptyNote}>No messages yet — say hi to start the conversation.</Text>
          </View>
        )}
        {msgs.map((m) => (
          <View key={m.id} style={{ alignItems: m.mine ? 'flex-end' : 'flex-start' }}>
            {!m.mine && (
              <View style={styles.authorRow}>
                {m.host && (
                  <View style={styles.hostBadge}><Text style={styles.hostBadgeIcon}>★</Text></View>
                )}
                <Text style={styles.author}>{m.author}</Text>
              </View>
            )}
            <View style={[styles.bubble, m.mine ? styles.bubbleMine : styles.bubbleOther]}>
              <Text style={[styles.bubbleText, { color: m.mine ? '#fff' : colors.ink }]}>{m.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Say something"
          placeholderTextColor={colors.faint}
          style={styles.input}
        />
        <Pressable
          onPress={() => { dispatch({ type: 'SEND_MSG', text: draft }); setDraft(''); }}
          style={styles.sendBtn}
        >
          <Text style={styles.sendLabel}>Send</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  header: { padding: 20, paddingTop: 36, paddingBottom: 18, backgroundColor: colors.ground },
  headerCard: {
    backgroundColor: colors.surface, borderRadius: radius.inner, padding: 16, marginTop: 14, ...shadow.card,
  },
  title: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 20, letterSpacing: -0.4 },
  meta: { color: colors.muted, fontFamily: 'Figtree_500Medium', fontSize: 12, marginTop: 4 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyNote: { color: colors.faint, fontFamily: 'Figtree_400Regular', fontSize: 13, textAlign: 'center' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3, marginHorizontal: 4 },
  hostBadge: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: colors.clay,
    alignItems: 'center', justifyContent: 'center',
  },
  hostBadgeIcon: { color: '#fff', fontSize: 8, textAlign: 'center', includeFontPadding: false },
  author: { color: colors.faint, fontFamily: 'Figtree_600SemiBold', fontSize: 10.5 },
  bubble: { maxWidth: '80%', paddingVertical: 12, paddingHorizontal: 14, ...shadow.chip },
  bubbleMine: { backgroundColor: colors.clay, borderRadius: 20, borderBottomRightRadius: 6 },
  bubbleOther: { backgroundColor: colors.surface, borderRadius: 20, borderBottomLeftRadius: 6 },
  bubbleText: { fontFamily: 'Figtree_400Regular', fontSize: 13.5, lineHeight: 19 },
  composer: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 24, alignItems: 'center' },
  input: {
    flex: 1, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 999,
    paddingVertical: 14, paddingHorizontal: 16, fontFamily: 'Figtree_400Regular', fontSize: 14, color: colors.ink,
  },
  sendBtn: { backgroundColor: colors.clay, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 20 },
  sendLabel: { color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 14 },
});
