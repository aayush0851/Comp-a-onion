import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, text } from '../theme';
import { Avatar, Btn, FieldLabel, FilterChips, Footer, Header, ListSkeleton, Notice, ToggleRow, StatusScrim } from '../components/widgets';
import { PEOPLE_TAGS, SETUP_AXES, SETUP_TAGS, SETUP_WORDS } from '../data';
import { initialsOf } from '../data/eventDisplay';
import { useAppState, useAppDispatch } from '../store';
import { eventsApi, reviewsApi, ApiError } from '../api';
import type { ApiEvent, ApiUser } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

type Page = { kind: 'rate'; person: ApiUser } | { kind: 'note'; person: ApiUser } | { kind: 'setup' };

const RATING_WORDS = ['Not great', 'It was okay', 'Fine', 'Good', "Great — I'd meet again"];
const NOTE_MAX = 150;

export default function Review({ navigation, route }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { planId } = route.params;
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pageIndex, setPageIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      eventsApi.getEvent(planId).then(setEvent).finally(() => setLoading(false));
    }, [planId]),
  );

  if (loading || !event) {
    return (
      <View style={styles.screen}>
        <Header variant="stack" onBack={() => navigation.goBack()} />
        <ListSkeleton />
      </View>
    );
  }

  const attendees: ApiUser[] = event.going.filter((u) => u.id !== state.userId);
  const pages: Page[] = [
    ...attendees.flatMap((person): Page[] => [{ kind: 'rate', person }, { kind: 'note', person }]),
    { kind: 'setup' },
  ];
  const page = pages[Math.min(pageIndex, pages.length - 1)];
  const isLast = pageIndex >= pages.length - 1;
  const setupScores = state.setupScores[planId] ?? {};
  const setupTags = state.setupTags[planId] ?? [];

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await reviewsApi.submitReview(planId, {
        setupScores,
        setupTags,
        personReviews: attendees.map((a) => ({
          revieweeId: a.id,
          tags: state.peopleTags[a.id] ?? [],
          rating: state.personRatings[a.id] || undefined,
          note: state.personNotes[a.id]?.trim() || undefined,
          meetAgain: !!state.meetAgain[a.id],
          flagged: !!state.flagged[a.id],
        })),
      });
      const first = attendees[0];
      dispatch({ type: 'SUBMIT_REVIEW', planId });
      dispatch({ type: 'SET_RV_STEP', step: 0 });
      navigation.replace('Filed', {
        rated: attendees.length,
        firstName: first?.name?.split(' ')[0] ?? null,
        stars: first ? state.personRatings[first.id] ?? null : null,
        withNote: first ? !!state.personNotes[first.id]?.trim() : false,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => (isLast ? submit() : setPageIndex((i) => i + 1));
  const back = () => (pageIndex === 0 ? navigation.goBack() : setPageIndex((i) => i - 1));

  const header = (title: string, subtitle: string) => (
    <Header
      variant="stack"
      centerLabel={`Step ${pageIndex + 1} of ${pages.length}`}
      stepsTotal={pages.length}
      stepsCurrent={pageIndex + 1}
      title={title}
      subtitle={subtitle}
      onBack={back}
    />
  );

  let body: React.ReactNode;
  let footer: React.ReactNode = <Btn label={isLast ? 'Submit review' : 'Next'} variant={isLast ? 'amber' : 'primary'} loading={submitting} onPress={next} />;

  if (page.kind === 'rate') {
    const a = page.person;
    const first = a.name?.split(' ')[0] ?? 'them';
    const rating = state.personRatings[a.id] ?? 0;
    const tags = state.peopleTags[a.id] ?? [];
    const flagged = !!state.flagged[a.id];
    body = (
      <>
        {header(`How was it with ${first}?`, "They're rating you at the same time. Neither sees anything until both are in.")}
        <View style={{ alignItems: 'center', paddingTop: 8, paddingHorizontal: 20 }}>
          <Avatar initials={initialsOf(a.name)} photo={a.profilePicture} size={82} rounded={26} tone="amber" />
          <View style={{ flexDirection: 'row', gap: 11, marginTop: 24 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} hitSlop={4} onPress={() => dispatch({ type: 'SET_PERSON_RATING', personId: a.id, rating: n })}>
                <Text style={{ fontSize: 38, lineHeight: 44, color: n <= rating ? colors.amber : colors.zinc200 }}>★</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.ratingWord}>{rating > 0 ? RATING_WORDS[rating - 1] : 'Tap a star'}</Text>
        </View>
        <View style={{ paddingTop: 26, paddingHorizontal: 20 }}>
          <FieldLabel>What stood out — optional</FieldLabel>
          <FilterChips
            multi
            items={PEOPLE_TAGS}
            active={PEOPLE_TAGS.map((t, i) => (tags.includes(t) ? i : -1)).filter((i) => i >= 0)}
            onChange={(i) => dispatch({ type: 'TOGGLE_PERSON_TAG', personId: a.id, tag: PEOPLE_TAGS[i] })}
          />
          <ToggleRow
            style={{ marginTop: 16 }}
            title="Would meet again"
            sub="Mutual only — if you both say yes, you both find out."
            value={!!state.meetAgain[a.id]}
            onChange={() => dispatch({ type: 'TOGGLE_MEET_AGAIN', personId: a.id })}
          />
          <Pressable onPress={() => dispatch({ type: 'TOGGLE_FLAG', personId: a.id })} style={{ paddingVertical: 12 }}>
            <Text style={[styles.flag, flagged && { color: colors.roseInk }]}>
              {flagged ? "Reported privately — we'll follow up with you, not them" : 'Something was off'}
            </Text>
          </Pressable>
        </View>
      </>
    );
  } else if (page.kind === 'note') {
    const a = page.person;
    const first = a.name?.split(' ')[0] ?? 'their';
    const note = state.personNotes[a.id] ?? '';
    body = (
      <>
        {header('Anything worth saying?', `Public on ${first}'s profile once you both submit. Skip it if you'd rather not.`)}
        <View style={{ paddingTop: 8, paddingHorizontal: 20 }}>
          <TextInput
            value={note}
            onChangeText={(v) => dispatch({ type: 'SET_PERSON_NOTE', personId: a.id, note: v.slice(0, NOTE_MAX) })}
            placeholder="Turned up early and saved everyone a seat."
            placeholderTextColor={colors.zinc400}
            multiline
            maxLength={NOTE_MAX}
            style={[styles.noteInput, note.length > 0 ? styles.noteFilled : styles.noteEmpty]}
          />
          <Text style={styles.counter}>{note.length} / {NOTE_MAX}</Text>
          <Notice tone="zinc" style={{ marginTop: 16 }}>Keep it about the evening. No phone numbers, no last names, no addresses.</Notice>
        </View>
      </>
    );
    footer = (
      <>
        <Btn label={isLast ? 'Submit review' : 'Next'} loading={submitting} onPress={next} />
        <Btn label="Skip the note" variant="ghost" onPress={() => { dispatch({ type: 'SET_PERSON_NOTE', personId: a.id, note: '' }); next(); }} />
      </>
    );
  } else {
    body = (
      <>
        {header('And the hangout itself?', 'This goes on the hangout, not on anyone. Everything unlocks for everyone at the same moment.')}
        <View style={{ paddingTop: 6, paddingHorizontal: 20, gap: 16 }}>
          <View style={styles.axes}>
            {SETUP_AXES.map((ax, i) => {
              const score = setupScores[ax.key] ?? 3;
              return (
                <View key={ax.key} style={[styles.axis, i < SETUP_AXES.length - 1 && styles.axisRule]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.axisLabel}>{ax.label}</Text>
                    <Text style={styles.axisWord}>{SETUP_WORDS[score - 1]}</Text>
                  </View>
                  <Text style={styles.axisDesc}>{ax.desc}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Pressable
                        key={n}
                        onPress={() => dispatch({ type: 'SET_SETUP_SCORE', planId, axis: ax.key, score: n })}
                        style={[styles.scoreDot, n <= score && { backgroundColor: colors.ink, borderColor: colors.ink }]}
                      >
                        {n === score && <View style={styles.scoreInner} />}
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
          <View>
            <Text style={[text.fieldLabel, { marginBottom: 11 }]}>And in words</Text>
            <FilterChips
              multi
              activeTone="amber"
              items={SETUP_TAGS}
              active={SETUP_TAGS.map((t, i) => (setupTags.includes(t) ? i : -1)).filter((i) => i >= 0)}
              onChange={(i) => dispatch({ type: 'TOGGLE_SETUP_TAG', planId, tag: SETUP_TAGS[i] })}
            />
          </View>
          {attendees.length === 0 && <Notice tone="zinc">Nobody else came, so there's nobody to rate.</Notice>}
          <Notice tone="amber" title="What gets published">
            Star ratings and notes go to profiles. Tags on people only show once three or more people say the same thing.
          </Notice>
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
      </>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">{body}</ScrollView>
<StatusScrim />
      <Footer>{footer}</Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  ratingWord: { fontFamily: font.extrabold, fontSize: 15, color: colors.ink, marginTop: 14 },
  flag: { fontFamily: font.semibold, fontSize: 12, color: colors.zinc400, textAlign: 'center' },
  noteInput: { minHeight: 152, borderRadius: 18, padding: 16, textAlignVertical: 'top', fontFamily: font.regular, fontSize: 14.5, lineHeight: 22, color: colors.zinc700 },
  noteFilled: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink },
  noteEmpty: { backgroundColor: colors.zinc100, borderWidth: 2, borderColor: colors.zinc100 },
  counter: { alignSelf: 'flex-end', fontFamily: font.bold, fontSize: 11.5, color: colors.zinc400, marginTop: 8 },
  axes: { backgroundColor: colors.zinc100, borderRadius: 20, paddingHorizontal: 16 },
  axis: { paddingVertical: 14 },
  axisRule: { borderBottomWidth: 1, borderBottomColor: colors.zinc200 },
  axisLabel: { fontFamily: font.bold, fontSize: 14, color: colors.ink },
  axisWord: { fontFamily: font.extrabold, fontSize: 11.5, color: colors.amberInk },
  axisDesc: { fontFamily: font.regular, fontSize: 12, color: colors.zinc500, marginTop: 2 },
  scoreDot: { width: 28, height: 28, borderRadius: 999, borderWidth: 2, borderColor: colors.zinc300, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  scoreInner: { width: 10, height: 10, borderRadius: 999, backgroundColor: colors.amber },
  error: { fontFamily: font.semibold, fontSize: 12.5, color: colors.roseInk, textAlign: 'center' },
});
