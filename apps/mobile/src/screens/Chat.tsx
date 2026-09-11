import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, shadow } from '../theme';
import { Header } from '../components/widgets';
import { ACTIVITIES } from '../data';
import { useAppState, useAppDispatch } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function Chat({ navigation, route }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState('');
  const activity = ACTIVITIES.find((a) => a.id === route.params.id) ?? ACTIVITIES[0];
  const msgs = activity.id === 'ramen' ? state.msgs : [];

  return (
    <View style={styles.screen}>
      <Header
        variant="convo"
        title={activity.title}
        subtitle={`${activity.seatsFilled} going · ${activity.time} today`}
        action="Plan"
        onAction={() => navigation.navigate('Detail', { id: activity.id })}
        onBack={() => navigation.navigate('ChatList')}
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
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
