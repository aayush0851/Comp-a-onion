import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { BackPill, PrimaryButton, OutlineButton } from '../components/ui';
import { QUEUE_SEED } from '../data';
import { useAppState, useAppDispatch } from '../state';

type Props = NativeStackScreenProps<RootStackParamList, 'Queue'>;

export default function Queue({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const approved = Object.values(state.decided).filter((d) => d === 'in').length;
  const decidedCount = Object.keys(state.decided).length;
  const sub = decidedCount === 0
    ? `${QUEUE_SEED.length} people asked for 3 seats. "New here" shows only to you — they don't know it exists.`
    : `${approved} let in, ${Math.max(0, 3 - approved)} seats left. Everyone you approve lands in the chat straight away.`;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <BackPill onPress={() => navigation.navigate('Board')} label="← Board" />
          <Text style={styles.title}>Who's asking</Text>
          <Text style={styles.sub}>{sub}</Text>
        </View>
        <View style={styles.list}>
          {QUEUE_SEED.map((q) => {
            const decision = state.decided[q.id];
            return (
              <View key={q.id} style={[styles.card, decision === 'out' && { backgroundColor: colors.settledDeclineBg }]}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                  <View style={styles.avatar}><Text style={styles.avatarLabel}>{q.initials}</Text></View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <Text style={styles.name}>{q.name}</Text>
                      <View style={styles.verifiedChip}>
                        <View style={styles.verifiedDot} />
                        <Text style={styles.verifiedLabel}>verified</Text>
                      </View>
                      {q.isNew && (
                        <View style={styles.newChip}><Text style={styles.newLabel}>New here · only you see this</Text></View>
                      )}
                    </View>
                    <Text style={styles.history}>{q.history}</Text>
                    <Text style={styles.intro}>{q.intro}</Text>
                  </View>
                </View>
                {!decision && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                    <PrimaryButton label="Let them in" style={{ flex: 1, paddingVertical: 14 }} onPress={() => dispatch({ type: 'DECIDE', id: q.id, decision: 'in' })} />
                    <OutlineButton label="Not this time" onPress={() => dispatch({ type: 'DECIDE', id: q.id, decision: 'out' })} />
                  </View>
                )}
                {decision === 'in' && (
                  <View style={[styles.settled, { backgroundColor: colors.sageBg }]}>
                    <Text style={[styles.settledLabel, { color: colors.sageInk }]}>In — they've got the chat</Text>
                  </View>
                )}
                {decision === 'out' && (
                  <View style={[styles.settled, { backgroundColor: '#F4EEE7' }]}>
                    <Text style={[styles.settledLabel, { color: colors.muted }]}>Told them no. No reason given, no drama.</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label="Open the group chat" dark onPress={() => navigation.navigate('Chat', { id: 'ramen' })} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  header: { padding: 20, paddingTop: 36, paddingBottom: 14 },
  title: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 27, letterSpacing: -0.6, marginTop: 18 },
  sub: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 13, lineHeight: 19, marginTop: 8 },
  list: { paddingHorizontal: 16, gap: 11 },
  card: { backgroundColor: colors.surface, borderRadius: radius.card - 2, padding: 17, ...shadow.card },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.neutralAvatar, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: colors.inkSecondary, fontFamily: 'Figtree_700Bold', fontSize: 13 },
  name: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 16 },
  verifiedChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.sageBg, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8 },
  verifiedDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.sage },
  verifiedLabel: { color: colors.sageInk, fontFamily: 'Figtree_600SemiBold', fontSize: 10 },
  newChip: { backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9 },
  newLabel: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 10 },
  history: { color: colors.faint, fontFamily: 'Figtree_500Medium', fontSize: 11.5, marginTop: 6 },
  intro: { color: colors.ink, fontFamily: 'Figtree_400Regular', fontSize: 13.5, lineHeight: 20, marginTop: 9 },
  settled: { marginTop: 13, borderRadius: 14, padding: 11 },
  settledLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5, lineHeight: 17 },
  footer: { padding: 20, paddingBottom: 32, backgroundColor: 'rgba(251,246,240,.95)' },
});
