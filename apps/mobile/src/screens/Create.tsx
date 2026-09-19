import { useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Octicons from '@expo/vector-icons/Octicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, text } from '../theme';
import { isValidVenue, POST_DESCRIPTION_MAX, POST_TITLE_MAX, VENUE_TEXT_MAX } from '@companion/common';
import { Btn, FieldLabel, FilterChips, Footer, Header, TextField, Toggle, StatusScrim } from '../components/widgets';
import { COST_MODE_OPTIONS, GENDER_RESTRICTION_OPTIONS, PLAN_TYPES, nextSevenDays } from '../data';
import { useAppState, useAppDispatch } from '../store';
import TimeWheelSheet from '../components/TimeWheelSheet';
import { postsApi, ApiError } from '../api';
import type { ApiPost } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Create'>;

const STEP_TITLES = ['What are you doing tonight?', 'When, and where-ish?', 'Who comes, and how they get in'];
const STEP_CTAS = ['Continue to Time & Spot', "Continue to Who's Coming", 'Post the hangout'];
const MAX_TITLE = POST_TITLE_MAX;
const MAX_DESCRIPTION = POST_DESCRIPTION_MAX;
const DATE_CELL = (Dimensions.get('window').width - 40 - 20) / 3;

function to24Hour(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return time;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
}

function ApprovalBox({ value, onChange, sub }: { value: boolean; onChange: (v: boolean) => void; sub: string }) {
  return (
    <View style={styles.approval}>
      <View style={{ flex: 1 }}>
        <Text style={styles.approvalTitle}>Curated Approval</Text>
        <Text style={styles.approvalSub}>{sub}</Text>
      </View>
      <Toggle value={value} onChange={onChange} />
    </View>
  );
}

export default function Create({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const dateOptions = useMemo(() => nextSevenDays(), []);
  const [showTimeSheet, setShowTimeSheet] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [posted, setPosted] = useState<ApiPost | null>(null);

  const venueOk = isValidVenue(state.planVenue ?? '');
  const canContinue = (state.step !== 0 || state.planTitle.trim().length > 0) && (state.step !== 1 || (!!state.planDate && venueOk));
  const setApproval = (value: boolean) => dispatch({ type: 'SET_APPROVAL_REQUIRED', value });

  const next = async () => {
    if (!canContinue) return;
    if (state.step < 2) {
      dispatch({ type: 'SET_STEP', step: (state.step + 1) as 0 | 1 | 2 });
      return;
    }
    setPublishing(true);
    setError('');
    try {
      const post = await postsApi.createPost({
        title: state.planTitle.trim(),
        description: state.planDescription.trim() || undefined,
        date: state.planDate!,
        time: state.planTime ? to24Hour(state.planTime) : undefined,
        venue: state.planVenue ?? undefined,
        entryMode: state.approvalRequired ? 'APPROVE' : 'OPEN',
        seatsTotal: state.shape === 'duo' ? 2 : state.size,
        tags: state.planTags,
        genderRestriction: state.genderRestriction,
        costMode: state.costMode,
      });
      dispatch({ type: 'RESET_CREATE' });
      setPosted(post);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't post. Try again.");
    } finally {
      setPublishing(false);
    }
  };

  if (posted) {
    const approval = posted.entryMode === 'APPROVE';
    return (
      <View style={[styles.posted, { paddingTop: insets.top + 52 }]}>
        <View style={{ paddingHorizontal: 24 }}>
          <Text style={[text.eyebrow, { color: colors.amberInk }]}>It's out there</Text>
          <Text style={styles.postedTitle}>{posted.title}</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
            <View style={[styles.stat, { backgroundColor: colors.ink }]}>
              <Text style={[styles.statValue, { color: colors.white }]}>{posted.seatsTotal - 1}</Text>
              <Text style={[styles.statLabel, { color: colors.zinc400 }]}>{posted.seatsTotal - 1 === 1 ? 'seat' : 'seats'} to fill</Text>
            </View>
            <View style={[styles.stat, { backgroundColor: colors.white }]}>
              <Text style={styles.statValue}>0</Text>
              <Text style={[styles.statLabel, { color: colors.zinc500 }]}>{approval ? 'asking to join' : 'joined so far'}</Text>
            </View>
          </View>
          <Text style={styles.postedBody}>
            {approval
              ? "Curated Approval is on, so nobody's in yet. Have a look at who's asking — you can pass without saying anything."
              : 'Open seats — people nearby can take one straight away. The group chat opens as they join.'}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <Footer transparent>
          <Btn label={approval ? "See who's asking" : 'Manage hangout'} onPress={() => navigation.replace('PlanManage', { id: posted.id })} />
          <Btn label="Later" variant="ghost" style={{ borderColor: 'transparent' }} onPress={() => navigation.navigate('Board')} />
        </Footer>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Header
          variant="stack"
          showTitle
          stepsTotal={3}
          stepsCurrent={state.step + 1}
          title={STEP_TITLES[state.step]}
          subtitle={state.step === 0 ? 'One honest sentence is better than a pitch.' : null}
          onBack={() => (state.step === 0 ? navigation.goBack() : dispatch({ type: 'SET_STEP', step: (state.step - 1) as 0 | 1 | 2 }))}
        />

        <View style={styles.body}>
          {state.step === 0 && (
            <>
              <View style={styles.ideaBox}>
                <Text style={text.fieldLabel}>Your plan idea</Text>
                <TextInput
                  value={state.planTitle}
                  onChangeText={(t) => dispatch({ type: 'SET_TITLE', title: t })}
                  placeholder="Grabbing spicy pork buns, then sketching in the park."
                  placeholderTextColor={colors.zinc400}
                  multiline
                  maxLength={MAX_TITLE}
                  style={styles.ideaInput}
                />
                <Text style={styles.ideaCount}>{state.planTitle.length > 0 ? `${state.planTitle.length} / ${MAX_TITLE}` : `MAX ${MAX_TITLE} CHARS`}</Text>
              </View>
              <FieldLabel style={{ marginTop: 20 }}>Description — optional</FieldLabel>
              <TextField
                value={state.planDescription}
                onChangeText={(t) => dispatch({ type: 'SET_DESCRIPTION', description: t })}
                placeholder="A few more details worth knowing before they join."
                multiline
                maxLength={MAX_DESCRIPTION}
                style={{ minHeight: 72, textAlignVertical: 'top' }}
              />
              <Text style={styles.toneTitle}>What kind of plan?</Text>
              <View style={{ marginTop: 12 }}>
                <FilterChips
                  multi
                  activeTone="amber"
                  items={PLAN_TYPES}
                  active={PLAN_TYPES.map((t, i) => (state.planTags.includes(t) ? i : -1)).filter((i) => i >= 0)}
                  onChange={(i) => dispatch({ type: 'TOGGLE_TAG', tag: PLAN_TYPES[i] })}
                />
              </View>
              <View style={{ marginTop: 20 }}>
                <ApprovalBox value={state.approvalRequired} onChange={setApproval} sub="You handpick who sits with you." />
              </View>
            </>
          )}

          {state.step === 1 && (
            <>
              <FieldLabel>Date</FieldLabel>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} style={{ marginHorizontal: -20 }}>
                <View style={{ width: 10 }} />
                {dateOptions.map((d) => {
                  const sel = state.planDate === d.key;
                  return (
                    <Pressable key={d.key} onPress={() => dispatch({ type: 'SET_DATE', date: d.key })} style={[styles.dateCell, { backgroundColor: sel ? colors.ink : colors.zinc100 }]}>
                      <Text numberOfLines={1} style={[styles.dateLabel, { color: sel ? colors.amber : colors.ink }]}>{d.label}</Text>
                      <Text numberOfLines={1} style={[styles.dateSub, { color: sel ? colors.zinc400 : colors.zinc500 }]}>{d.dateLabel}</Text>
                    </Pressable>
                  );
                })}
                <View style={{ width: 10 }} />
              </ScrollView>

              <FieldLabel style={{ marginTop: 22 }}>Time</FieldLabel>
              <Pressable
                onPress={() => state.planDate && setShowTimeSheet(true)}
                disabled={!state.planDate}
                style={[styles.timeRow, !state.planDate && { opacity: 0.5 }]}
              >
                <Text style={styles.timeLabel}>{state.planDate ? 'Kick off' : 'Pick a date first'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={[styles.timeValue, !state.planTime && { color: colors.zinc400 }]}>{state.planTime ?? 'Any time'}</Text>
                  {!!state.planTime && (
                    <Pressable onPress={() => dispatch({ type: 'CLEAR_TIME' })} hitSlop={10} style={styles.clear}>
                      <Octicons name="x" size={13} color={colors.zinc700} />
                    </Pressable>
                  )}
                </View>
              </Pressable>

              <FieldLabel style={{ marginTop: 22 }}>Where — optional</FieldLabel>
              <TextField
                value={state.planVenue ?? ''}
                onChangeText={(v) => dispatch({ type: 'SET_VENUE', venue: v })}
                placeholder="Paste a Maps link"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={{ fontFamily: font.semibold, fontSize: 15 }}
              />
              {!venueOk && <Text style={styles.venueError}>Paste a Maps link, or keep it to {VENUE_TEXT_MAX} characters.</Text>}
              <View style={styles.spotNote}>
                <View style={styles.spotRing} />
                <Text style={styles.spotText}>Nobody sees the exact spot until you let them in.</Text>
              </View>

              <TimeWheelSheet
                visible={showTimeSheet}
                initialTime={state.planTime}
                onClose={() => setShowTimeSheet(false)}
                onConfirm={(time) => { dispatch({ type: 'SET_TIME', time }); setShowTimeSheet(false); }}
              />
            </>
          )}

          {state.step === 2 && (
            <>
              <FieldLabel>Group size</FieldLabel>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {(['duo', 'group'] as const).map((shape) => {
                  const sel = state.shape === shape;
                  return (
                    <Pressable key={shape} onPress={() => dispatch({ type: 'SET_SHAPE', shape })} style={[styles.segment, { backgroundColor: sel ? colors.ink : colors.zinc100 }]}>
                      <Text style={[styles.segmentLabel, { color: sel ? colors.amber : colors.zinc700 }]}>{shape === 'duo' ? 'Just me + one' : 'A whole group'}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {state.shape === 'group' && (
                <View style={styles.stepper}>
                  <Pressable onPress={() => dispatch({ type: 'SET_SIZE', delta: -1 })} style={[styles.stepperBtn, { backgroundColor: colors.white }]}>
                    <Octicons name="dash" size={18} color={colors.ink} />
                  </Pressable>
                  <Text style={styles.stepperLabel}>Up to {state.size}, including you</Text>
                  <Pressable onPress={() => dispatch({ type: 'SET_SIZE', delta: 1 })} style={[styles.stepperBtn, { backgroundColor: colors.ink }]}>
                    <Octicons name="plus" size={18} color={colors.amber} />
                  </Pressable>
                </View>
              )}
              <View style={{ marginTop: 20 }}>
                <ApprovalBox value={state.approvalRequired} onChange={setApproval} sub="Off means open seats — first come, no approval." />
              </View>
              <FieldLabel style={{ marginTop: 20 }}>Who can ask</FieldLabel>
              <FilterChips
                items={GENDER_RESTRICTION_OPTIONS.map((g) => g.title)}
                active={GENDER_RESTRICTION_OPTIONS.findIndex((g) => g.key === state.genderRestriction)}
                onChange={(i) => dispatch({ type: 'SET_GENDER_RESTRICTION', genderRestriction: GENDER_RESTRICTION_OPTIONS[i].key })}
              />
              <FieldLabel style={{ marginTop: 20 }}>Who's paying</FieldLabel>
              <FilterChips
                items={COST_MODE_OPTIONS.map((c) => c.title)}
                active={COST_MODE_OPTIONS.findIndex((c) => c.key === state.costMode)}
                onChange={(i) => dispatch({ type: 'TOGGLE_COST_MODE', costMode: COST_MODE_OPTIONS[i].key })}
              />
            </>
          )}
        </View>
      </ScrollView>
      <StatusScrim />

      <Footer>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Btn
          label={STEP_CTAS[state.step]}
          glyph={state.step < 2 ? '→' : undefined}
          variant={!canContinue ? 'disabled' : state.step === 2 ? 'amber' : 'primary'}
          loading={publishing}
          onPress={next}
        />
      </Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: 20 },
  ideaBox: { backgroundColor: colors.zinc100, borderRadius: 20, padding: 16 },
  ideaInput: { marginTop: 10, minHeight: 72, padding: 0, textAlignVertical: 'top', fontFamily: font.bold, fontSize: 16.5, lineHeight: 24, letterSpacing: -0.4, color: colors.ink },
  ideaCount: { alignSelf: 'flex-end', marginTop: 12, fontFamily: font.bold, fontSize: 9.5, letterSpacing: 1, color: colors.zinc400 },
  venueError: { fontFamily: font.medium, fontSize: 12, color: colors.roseInk, marginTop: 8 },
  toneTitle: { marginTop: 22, fontFamily: font.extrabold, fontSize: 15, letterSpacing: -0.4, color: colors.ink },
  approval: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.sky, borderRadius: 20, padding: 16 },
  approvalTitle: { fontFamily: font.extrabold, fontSize: 14.5, letterSpacing: -0.3, color: '#0C4A6E' },
  approvalSub: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 18, color: colors.skyInk, marginTop: 4 },
  dateCell: { width: DATE_CELL, borderRadius: 16, padding: 15, alignItems: 'center' },
  dateLabel: { fontFamily: font.extrabold, fontSize: 14 },
  dateSub: { fontFamily: font.semibold, fontSize: 11.5, marginTop: 3 },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.zinc100, borderRadius: 16, minHeight: 58, paddingHorizontal: 16 },
  timeLabel: { fontFamily: font.semibold, fontSize: 15, color: colors.zinc500 },
  timeValue: { fontFamily: font.extrabold, fontSize: 15, color: colors.ink },
  clear: { width: 22, height: 22, borderRadius: 999, backgroundColor: colors.zinc200, alignItems: 'center', justifyContent: 'center' },
  spotNote: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 11, backgroundColor: colors.sky, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 15 },
  spotRing: { width: 16, height: 16, borderRadius: 999, borderWidth: 2, borderColor: colors.skyInk },
  spotText: { flex: 1, fontFamily: font.regular, fontSize: 12, lineHeight: 18, color: colors.skyInk },
  segment: { flex: 1, borderRadius: 16, minHeight: 50, alignItems: 'center', justifyContent: 'center' },
  segmentLabel: { fontFamily: font.bold, fontSize: 13.5 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.zinc100, borderRadius: 16, paddingVertical: 8, paddingHorizontal: 10, marginTop: 10 },
  stepperBtn: { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  stepperLabel: { fontFamily: font.bold, fontSize: 13.5, color: colors.ink },
  error: { fontFamily: font.semibold, fontSize: 12.5, color: colors.roseInk, textAlign: 'center', marginBottom: 8 },
  posted: { flex: 1, backgroundColor: colors.amber },
  postedTitle: { fontFamily: font.extrabold, fontSize: 33, lineHeight: 38, letterSpacing: -1.3, color: colors.ink, marginTop: 13 },
  stat: { flex: 1, borderRadius: 20, padding: 18 },
  statValue: { fontFamily: font.extrabold, fontSize: 32, letterSpacing: -1.4, color: colors.ink },
  statLabel: { fontFamily: font.bold, fontSize: 11, marginTop: 4 },
  postedBody: { fontFamily: font.regular, fontSize: 14, lineHeight: 22, color: colors.amberInk, marginTop: 22 },
});
