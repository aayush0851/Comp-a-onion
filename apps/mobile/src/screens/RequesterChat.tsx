import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, shadow } from '../theme';
import { Header } from '../components/widgets';
import { useAppState, useAppDispatch } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'RequesterChat'>;

export default function RequesterChat({ navigation, route }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState('');
  const { planId, requesterId, name } = route.params;
  const msgs = state.requesterMsgs[requesterId] ?? [];
  const plan = state.publishedPlans.find((p) => p.id === planId);
  const requester = plan?.requesters.find((r) => r.id === requesterId);
  const subtitle = requester?.rating
    ? `★ ${requester.rating.toFixed(1)} · ${requester.ratingCount} plans · tap for profile`
    : 'tap for profile';

  return (
    <View style={styles.screen}>
      <Header
        variant="convo"
        title={name}
        subtitle={subtitle}
        action="Profile"
        onAction={() => navigation.navigate('RequesterProfile', { planId, requesterId })}
        onBack={() => navigation.navigate('PlanManage', { id: planId })}
      />

      {!!plan && (
        <Pressable onPress={() => navigation.navigate('PlanManage', { id: planId })} style={styles.planRow}>
          <Text style={styles.planLabel} numberOfLines={1}>{plan.title}</Text>
          <Text style={styles.planGoto}>›</Text>
        </Pressable>
      )}

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 24, gap: 13 }}>
        {msgs.length === 0 && (
          <View style={styles.emptyWrap}>
            <Feather name="message-circle" size={40} color={colors.faint} />
            <Text style={styles.emptyNote}>No messages yet — say hi to start the conversation.</Text>
          </View>
        )}
        {msgs.map((m) => (
          <View key={m.id} style={{ alignItems: m.mine ? 'flex-end' : 'flex-start' }}>
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
          onPress={() => { dispatch({ type: 'SEND_REQUESTER_MSG', requesterId, text: draft }); setDraft(''); }}
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
  planRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface,
    marginHorizontal: 16, marginTop: 12, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, ...shadow.inner,
  },
  planLabel: { flex: 1, color: colors.inkSecondary, fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
  planGoto: { color: colors.faint, fontFamily: 'Figtree_700Bold', fontSize: 15 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyNote: { color: colors.faint, fontFamily: 'Figtree_400Regular', fontSize: 13, textAlign: 'center' },
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
