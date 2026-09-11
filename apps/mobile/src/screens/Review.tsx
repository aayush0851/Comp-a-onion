import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { BackPill, Chip, PrimaryButton, ProgressBars, SectionLabel, text } from '../components/ui';
import { PEOPLE_TAGS, REVIEW_ATTENDEES, SETUP_AXES, SETUP_TAGS, SETUP_WORDS } from '../data';
import { useAppState, useAppDispatch } from '../state';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

const KICKERS = ['Part 1 of 3 · the setup', 'Part 2 of 3 · the people', 'Part 3 of 3 · done'];
const TITLES = ['How was the plan itself?', 'And the people you met?', "That's everything."];
const LEDES = [
  'This goes back to Priya as a host score, and to the venue. Nobody is being marked out of five yet.',
  'Private. They never see what you picked — it only ever shows up on their profile as words, once enough people have said the same thing.',
  'Reviews unlock for everyone at the same time tomorrow morning, so nobody can wait to see yours before writing theirs.',
];
const CTAS = ['Next — the people', 'Next — check it over', 'Submit both reviews'];

export default function Review({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const next = () => {
    if (state.rvStep < 2) dispatch({ type: 'SET_RV_STEP', step: (state.rvStep + 1) as 0 | 1 | 2 });
    else { dispatch({ type: 'SET_RV_STEP', step: 0 }); navigation.navigate('Filed'); }
  };

  const peopleWritten = REVIEW_ATTENDEES.filter((a) => (state.peopleTags[a.id]?.length ?? 0) > 0 || state.meetAgain[a.id]).length;
  const meetAgainCount = Object.values(state.meetAgain).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <BackPill
          onPress={() => (state.rvStep === 0 ? navigation.navigate('Profile') : dispatch({ type: 'SET_RV_STEP', step: (state.rvStep - 1) as 0 | 1 | 2 }))}
        />
        <ProgressBars total={3} current={state.rvStep} />
        <Text style={styles.kicker}>{KICKERS[state.rvStep]}</Text>
        <Text style={styles.title}>{TITLES[state.rvStep]}</Text>
        <Text style={styles.lede}>{LEDES[state.rvStep]}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 11 }}>
        {state.rvStep === 0 && (
          <View>
            <View style={styles.card}>
              {SETUP_AXES.map((ax, i) => {
                const score = state.setupScores[ax.key] ?? 3;
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
                          onPress={() => dispatch({ type: 'SET_SETUP_SCORE', axis: ax.key, score: n })}
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
                <Chip key={t} label={t} selected={state.setupTags.includes(t)} onPress={() => dispatch({ type: 'TOGGLE_SETUP_TAG', tag: t })} />
              ))}
            </View>
          </View>
        )}

        {state.rvStep === 1 && (
          <View style={{ gap: 11 }}>
            {REVIEW_ATTENDEES.map((a) => {
              const tags = state.peopleTags[a.id] ?? [];
              const meet = !!state.meetAgain[a.id];
              const flagged = !!state.flagged[a.id];
              return (
                <View key={a.id} style={styles.personCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.personAvatar}><Text style={styles.personAvatarLabel}>{a.initials}</Text></View>
                    <Text style={styles.personName}>{a.name}</Text>
                    <View style={{ flex: 1 }} />
                    <View style={[
                      styles.roleChip,
                      a.role === 'Host' ? { backgroundColor: colors.blush } : a.role === 'First plan' ? { backgroundColor: colors.sageBg } : { backgroundColor: '#F4EEE7' },
                    ]}>
                      <Text style={[
                        styles.roleChipLabel,
                        { color: a.role === 'Host' ? colors.clayPressed : a.role === 'First plan' ? colors.sageInk : colors.muted },
                      ]}>{a.role}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
                    {PEOPLE_TAGS.map((t) => (
                      <Chip key={t} label={t} small selected={tags.includes(t)} onPress={() => dispatch({ type: 'TOGGLE_PERSON_TAG', personId: a.id, tag: t })} />
                    ))}
                  </View>
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
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>Mutual only: if you both say "would meet again," you both find out. If one of you doesn't, neither of you ever knows.</Text>
            </View>
          </View>
        )}

        {state.rvStep === 2 && (
          <View>
            <View style={styles.card}>
              {[
                ['Setup review', 'Goes to Priya and the venue'],
                ['People reviews', `${peopleWritten} of 3 written`],
                ['Would meet again', `${meetAgainCount} of 3, kept private`],
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
                Priya's host scores, updated. Your tags on people, only once three or more people have said the same thing. Nothing you wrote, and no numbers, ever appear next to a person's name.
              </Text>
            </View>
            <Text style={[text.aside, { marginTop: 16 }]}>You'll get theirs at the same time. No editing after that.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={CTAS[state.rvStep]} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  header: { padding: 20, paddingTop: 36, paddingBottom: 14 },
  kicker: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 11.5, marginTop: 13 },
  title: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 24, letterSpacing: -0.5, marginTop: 7 },
  lede: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 13, lineHeight: 19, marginTop: 8 },
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
  roleChip: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  roleChipLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 11 },
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
