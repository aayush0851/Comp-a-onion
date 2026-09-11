import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { Feather } from '@expo/vector-icons';
import { colors, shadow } from '../theme';
import { useAppState, useAppDispatch } from '../state';

type Props = NativeStackScreenProps<RootStackParamList, 'RequesterChat'>;

export default function RequesterChat({ navigation, route }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState('');
  const { planId, requesterId, name } = route.params;
  const msgs = state.requesterMsgs[requesterId] ?? [];
  const plan = state.publishedPlans.find((p) => p.id === planId);
  const requester = plan?.requesters.find((r) => r.id === requesterId);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => navigation.navigate('PlanManage', { id: planId })} hitSlop={10}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('RequesterProfile', { planId, requesterId })}>
            <View style={styles.avatar}><Text style={styles.avatarLabel}>{requester?.initials ?? name[0]}</Text></View>
          </Pressable>
          <View>
            <Pressable onPress={() => navigation.navigate('RequesterProfile', { planId, requesterId })}>
              <Text style={styles.title}>{name}</Text>
            </Pressable>
            {!!plan && (
              <Pressable onPress={() => navigation.navigate('PlanManage', { id: planId })} style={styles.planRow}>
                <Text style={styles.planLabel}>{plan.title}</Text>
                <Text style={styles.planGoto}>›</Text>
              </Pressable>
            )}
          </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  headerCard: {
    width: '100%', backgroundColor: colors.surface, padding: 18, ...shadow.card,
  },
  backArrow: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 22 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.neutralAvatar, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: colors.inkSecondary, fontFamily: 'Figtree_700Bold', fontSize: 14 },
  title: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 20, letterSpacing: -0.4 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  planLabel: { color: colors.faint, fontFamily: 'Figtree_500Medium', fontSize: 11.5 },
  planGoto: { color: colors.faint, fontFamily: 'Figtree_700Bold', fontSize: 14 },
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
