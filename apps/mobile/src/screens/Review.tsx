import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, scale, shadow } from '../theme';
import { Chip } from '../components/ui';
import { Btn, Header } from '../components/widgets';
import { PEOPLE_TAGS, SETUP_AXES, SETUP_TAGS, SETUP_WORDS } from '../data';
import { useAppState, useAppDispatch } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

const TITLES = ['How did the plan go?', 'And the people who came?', "That's everything."];
const LEDES = [
  'This becomes what people see on the plan once it settles. Nobody is being marked out of five yet.',
  "She's rating you at the same time. Neither of you sees anything until both are in.",
  'Reviews unlock for everyone at the same time tomorrow morning, so nobody can wait to see yours before writing theirs.',
];
const CTAS = ['Next — the people', 'Next — check it over', 'Submit both reviews'];
const RATING_WORDS = ['Not great', 'It was okay', 'Fine', 'Good', "Great — I'd go again"];

export default function Review({ navigation, route }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { planId } = route.params;
  const plan = state.publishedPlans.find((p) => p.id === planId);

  if (!plan) {
    return (
      <View style={styles.screen}>
        <Header variant="stack" title="Nothing to review" onBack={() => navigation.navigate('Profile')} />
      </View>
    );
  }

  const attendees = plan.requesters.filter((r) => !plan.approvalRequired || plan.decided[r.id] === 'in');
  const setupScores = state.setupScores[plan.id] ?? {};
  const setupTags = state.setupTags[plan.id] ?? [];

  const next = () => {
    if (state.rvStep < 2) dispatch({ type: 'SET_RV_STEP', step: (state.rvStep + 1) as 0 | 1 | 2 });
    else {
      dispatch({ type: 'SUBMIT_REVIEW', planId: plan.id });
      dispatch({ type: 'SET_RV_STEP', step: 0 });
      navigation.navigate('Filed');
    }
  };

  const peopleWritten = attendees.filter((a) => (state.peopleTags[a.id]?.length ?? 0) > 0 || state.meetAgain[a.id]).length;
  const meetAgainCount = attendees.filter((a) => state.meetAgain[a.id]).length;

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        stepsTotal={3}
        stepsCurrent={state.rvStep + 1}
        eyebrow={`Part ${state.rvStep + 1} of 3 · ${plan.title}`}
        title={TITLES[state.rvStep]}
        subtitle={LEDES[state.rvStep]}
        onBack={() => (state.rvStep === 0 ? navigation.navigate('Profile') : dispatch({ type: 'SET_RV_STEP', step: (state.rvStep - 1) as 0 | 1 | 2 }))}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, gap: 11 }}>
        {state.rvStep === 0 && (
          <View>
            <View style={styles.card}>
              {SETUP_AXES.map((ax, i) => {
                const score = setupScores[ax.key] ?? 3;
                return (
                  <View key={ax.key} style={[styles.axisRow, i === SETUP_AXES.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.axisLabel}>{ax.label}</Text>
                      <Text style={styles.axisWord}>{SETUP_WORDS[score - 1]}</Text>
                    </View>
                    <Text style={styles.axisDesc}>{ax.desc}</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Pressable
                          key={n}
                          onPress={() => dispatch({ type: 'SET_SETUP_SCORE', planId: plan.id, axis: ax.key, score: n })}
                          style={[styles.scoreDot, n <= score && { backgroundColor: colors.clay, borderColor: colors.clay }]}
                        />
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
            <Text style={[styles.sub, { marginTop: 16 }]}>And in words</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              {SETUP_TAGS.map((t) => (
                <Chip key={t} label={t} selected={setupTags.includes(t)} onPress={() => dispatch({ type: 'TOGGLE_SETUP_TAG', planId: plan.id, tag: t })} />
              ))}
            </View>
          </View>
        )}

        {state.rvStep === 1 && (
          <View style={{ gap: 11 }}>
            {attendees.map((a) => {
              const tags = state.peopleTags[a.id] ?? [];
              const meet = !!state.meetAgain[a.id];
              const flagged = !!state.flagged[a.id];
              const rating = state.personRatings[a.id] ?? 0;
              const note = state.personNotes[a.id] ?? '';
              return (
                <View key={a.id} style={styles.personCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.personAvatar}><Text style={styles.personAvatarLabel}>{a.initials}</Text></View>
                    <Text style={styles.personName}>{a.name}</Text>
                    <View style={{ flex: 1 }} />
                    {a.isNew && (
                      <View style={styles.roleChip}>
                        <Text style={styles.roleChipLabel}>New here</Text>
                      </View>
                    )}
                  </View>

                  <View style={{ alignItems: 'center', marginTop: 14 }}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Pressable key={n} onPress={() => dispatch({ type: 'SET_PERSON_RATING', personId: a.id, rating: n })} hitSlop={6}>
                          <Text style={{ fontSize: 30, lineHeight: 34, color: n <= rating ? colors.clay : '#E0D2C4' }}>★</Text>
                        </Pressable>
                      ))}
                    </View>
                    {rating > 0 && <Text style={styles.ratingWord}>{RATING_WORDS[rating - 1]}</Text>}
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
                    {PEOPLE_TAGS.map((t) => (
                      <Chip key={t} label={t} small selected={tags.includes(t)} onPress={() => dispatch({ type: 'TOGGLE_PERSON_TAG', personId: a.id, tag: t })} />
                    ))}
                  </View>

                  <TextInput
                    value={note}
                    onChangeText={(v) => dispatch({ type: 'SET_PERSON_NOTE', personId: a.id, note: v.slice(0, 150) })}
                    placeholder="Anything worth saying? Optional."
                    placeholderTextColor={colors.faint}
                    multiline
                    maxLength={150}
                    style={styles.noteInput}
                  />

                  <Pressable
                    onPress={() => dispatch({ type: 'TOGGLE_MEET_AGAIN', personId: a.id })}
                    style={[styles.meetToggle, meet ? { backgroundColor: colors.sage, borderColor: colors.sage } : { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Text style={{ color: meet ? '#fff' : colors.inkSecondary, fontFamily: 'Figtree_700Bold', fontSize: 13 }}>
                      {meet ? 'Would meet again ✓' : 'Would meet again'}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => dispatch({ type: 'TOGGLE_FLAG', personId: a.id })} style={styles.flagBtn}>
                    <Text style={{ color: flagged ? colors.blushInk : colors.faint, fontFamily: 'Figtree_400Regular', fontSize: 11.5 }}>
                      {flagged ? 'Reported privately — we\'ll follow up with you, not them' : 'Something was off'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
            {attendees.length === 0 && (
              <Text style={scale.accent}>Nobody to review for this one.</Text>
            )}
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>Mutual only: if you both say "would meet again," you both find out. If one of you doesn't, neither of you ever knows.</Text>
            </View>
          </View>
        )}

        {state.rvStep === 2 && (
          <View>
            <View style={styles.card}>
              {[
                ['Setup review', `Goes to "${plan.title}"`],
                ['People reviews', `${peopleWritten} of ${attendees.length} written`],
                ['Would meet again', `${meetAgainCount} of ${attendees.length}, kept private`],
              ].map(([k, v], i) => (
                <View key={k} style={[styles.summaryRow, i === 2 && { borderBottomWidth: 0 }]}>
                  <Text style={styles.summaryKey}>{k}</Text>
                  <Text style={styles.summaryVal}>{v}</Text>
                </View>
              ))}
            </View>
            <View style={styles.publishCard}>
              <Text style={styles.publishTitle}>What actually gets published</Text>
              <Text style={styles.publishBody}>
                Your star rating and note go straight to their profile. Your tags on people, only once three or more people have said the same thing.
              </Text>
            </View>
            <Text style={[scale.accent, { marginTop: 16 }]}>You'll get theirs at the same time. No editing after that.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Btn label={CTAS[state.rvStep]} onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  card: { backgroundColor: colors.surface, borderRadius: radius.inner, paddingHorizontal: 16, ...shadow.inner },
  axisRow: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.lineCard },
  axisLabel: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 14 },
  axisWord: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 11.5 },
  axisDesc: { color: colors.faint, fontFamily: 'Figtree_400Regular', fontSize: 12, marginTop: 2 },
  scoreDot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: colors.borderSoft, backgroundColor: colors.ground },
  sub: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5, color: colors.ink },
  personCard: { backgroundColor: colors.surface, borderRadius: radius.card - 2, padding: 16, ...shadow.card },
  personAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.neutralAvatar, alignItems: 'center', justifyContent: 'center' },
  personAvatarLabel: { color: colors.inkSecondary, fontFamily: 'Figtree_700Bold', fontSize: 12 },
  personName: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 16 },
  roleChip: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: colors.sageBg },
  roleChipLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 11, color: colors.sageInk },
  ratingWord: { fontFamily: 'Figtree_700Bold', fontSize: 13, color: colors.clayPressed, marginTop: 9 },
  noteInput: {
    marginTop: 12, backgroundColor: colors.ground, borderRadius: 14, padding: 12, minHeight: 56,
    fontSize: 13, lineHeight: 19, color: colors.ink, textAlignVertical: 'top',
  },
  meetToggle: { marginTop: 12, borderWidth: 1.5, borderRadius: radius.small, paddingVertical: 13, alignItems: 'center' },
  flagBtn: { marginTop: 8, borderRadius: radius.small, paddingVertical: 10, paddingHorizontal: 4 },
  noteCard: { backgroundColor: colors.sageBg, borderRadius: radius.inner, padding: 15 },
  noteText: { color: colors.sageInk, fontFamily: 'Figtree_400Regular', fontSize: 12.5, lineHeight: 18 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.lineCard },
  summaryKey: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 13.5 },
  summaryVal: { color: colors.muted, fontFamily: 'Figtree_500Medium', fontSize: 12.5 },
  publishCard: { backgroundColor: colors.blush, borderRadius: radius.inner, padding: 16, marginTop: 12 },
  publishTitle: { color: colors.blushInk, fontFamily: 'Figtree_700Bold', fontSize: 13.5, marginBottom: 6 },
  publishBody: { color: colors.blushInk, fontFamily: 'Figtree_400Regular', fontSize: 12.5, lineHeight: 18 },
  footer: { padding: 20, paddingBottom: 32, backgroundColor: 'rgba(251,246,240,.95)' },
});
