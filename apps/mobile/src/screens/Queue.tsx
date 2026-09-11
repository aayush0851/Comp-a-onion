import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { Btn, Header, UserChip } from '../components/widgets';
import { QUEUE_SEED } from '../data';
import { useAppState, useAppDispatch } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Queue'>;

export default function Queue({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const approved = Object.values(state.decided).filter((d) => d === 'in').length;
  const decidedCount = Object.keys(state.decided).length;
  const sub = decidedCount === 0
    ? `${QUEUE_SEED.length} people asked for 3 seats. "New here" shows only to you.`
    : `${approved} let in, ${Math.max(0, 3 - approved)} seats left. Everyone you approve lands in the chat straight away.`;

  return (
    <View style={styles.screen}>
      <Header variant="stack" title="Who's asking" subtitle={sub} onBack={() => navigation.navigate('Board')} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.list}>
          {QUEUE_SEED.map((q) => {
            const decision = state.decided[q.id];
            return (
              <View key={q.id} style={[styles.card, decision === 'out' && { backgroundColor: colors.settledDeclineBg, opacity: 0.72 }]}>
                <UserChip
                  name={q.name}
                  initials={q.initials}
                  tone={q.tone}
                  rating={q.rating}
                  count={q.ratingCount}
                  verified={!q.isNew}
                  meta={q.isNew ? 'New here · no plans yet' : q.history}
                />
                <Text style={styles.intro}>“{q.intro}”</Text>
                {!decision && (
                  <View style={{ flexDirection: 'row', gap: 9, marginTop: 14 }}>
                    <View style={{ flex: 1 }}><Btn label="Let them in" onPress={() => dispatch({ type: 'DECIDE', id: q.id, decision: 'in' })} /></View>
                    <Btn label="Not this time" variant="secondary" full={false} onPress={() => dispatch({ type: 'DECIDE', id: q.id, decision: 'out' })} />
                  </View>
                )}
                {decision === 'in' && (
                  <View style={[styles.settled, { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: 'transparent', borderTopWidth: 1, borderTopColor: colors.line, borderRadius: 0, paddingTop: 13, paddingHorizontal: 0 }]}>
                    <View style={styles.checkDot}><Text style={styles.checkDotLabel}>✓</Text></View>
                    <Text style={[styles.settledLabel, { color: colors.sageInk }]}>In — they've got the chat</Text>
                  </View>
                )}
                {decision === 'out' && (
                  <Text style={[styles.settledLabel, { color: colors.muted, marginTop: 13, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line }]}>
                    You said no. They aren't told who else got in.
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Btn label="Open the group chat" variant="dark" onPress={() => navigation.navigate('Chat', { id: 'ramen' })} />
      </View>
    </View>
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
  intro: { color: colors.ink, fontFamily: 'Newsreader_400Regular_Italic', fontSize: 13.5, lineHeight: 20, marginTop: 11 },
  settled: { marginTop: 13, borderRadius: 14, padding: 11 },
  settledLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5, lineHeight: 17 },
  checkDot: { width: 18, height: 18, borderRadius: 999, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  checkDotLabel: { color: '#fff', fontFamily: 'Figtree_800ExtraBold', fontSize: 10 },
  footer: { padding: 20, paddingBottom: 32, backgroundColor: 'rgba(251,246,240,.95)' },
});
