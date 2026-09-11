import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { Chip, SectionLabel } from '../components/ui';
import { Btn, Header } from '../components/widgets';
import {
  COST_MODE_OPTIONS, GENDER_RESTRICTION_OPTIONS, VIBE_TAGS,
  nextSevenDays, formatDateKey,
} from '../data';
import { useAppState, useAppDispatch } from '../store';
import TimeWheelSheet from '../components/TimeWheelSheet';

type Props = NativeStackScreenProps<RootStackParamList, 'Create'>;

const STEP_TITLES = ['What are you actually doing?', 'When, and where-ish?', 'Who comes, and how they get in'];

export default function Create({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const dateOptions = useMemo(() => nextSevenDays(), []);
  const [showTimeSheet, setShowTimeSheet] = useState(false);

  const canContinue = state.step !== 1 || !!state.planDate;

  const next = () => {
    if (!canContinue) return;
    if (state.step < 2) {
      dispatch({ type: 'SET_STEP', step: (state.step + 1) as 0 | 1 | 2 });
    } else {
      dispatch({ type: 'PUBLISH_PLAN' });
      navigation.navigate('Board');
    }
  };

  const cta = state.step < 2 ? 'Next' : 'Publish';

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        stepsTotal={3}
        stepsCurrent={state.step + 1}
        eyebrow={`Step ${state.step + 1} of 3`}
        title={STEP_TITLES[state.step]}
        onBack={() => (state.step === 0 ? navigation.navigate('MyPlans') : dispatch({ type: 'SET_STEP', step: (state.step - 1) as 0 | 1 | 2 }))}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4 }}>
        {state.step === 0 && (
          <View>
            <TextInput
              value={state.planTitle}
              onChangeText={(t) => dispatch({ type: 'SET_TITLE', title: t })}
              placeholder="Ramen, then walk it off"
              placeholderTextColor={colors.faint}
              multiline
              style={styles.titleInput}
            />
            <Text style={styles.note}>This is the whole card. No photo of you, no bio, no ice-breakers.</Text>
            <View style={{ marginTop: 22 }}>
              <SectionLabel>Vibe — up to three</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {VIBE_TAGS.map((t) => (
                  <Chip key={t} label={t} selected={state.planTags.includes(t)} onPress={() => dispatch({ type: 'TOGGLE_TAG', tag: t })} style={styles.chipShape} />
                ))}
              </View>
            </View>
          </View>
        )}

        {state.step === 1 && (
          <View>
            <SectionLabel>Date</SectionLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, marginTop: 10 }}>
              {dateOptions.map((d) => {
                const sel = state.planDate === d.key;
                return (
                  <Pressable
                    key={d.key}
                    onPress={() => dispatch({ type: 'SET_DATE', date: d.key })}
                    style={[styles.dateCell, sel ? { backgroundColor: colors.ink } : { backgroundColor: colors.surface }]}
                  >
                    <Text numberOfLines={1} style={{ color: sel ? colors.ground : colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 }}>{d.label}</Text>
                    <Text numberOfLines={1} style={{ color: sel ? 'rgba(251,246,240,.7)' : colors.faint, fontFamily: 'Figtree_500Medium', fontSize: 11, marginTop: 2 }}>{d.dateLabel}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={{ marginTop: 22 }}>
              <SectionLabel>Time — optional</SectionLabel>
              <Pressable onPress={() => setShowTimeSheet(true)} style={styles.timeButton}>
                <Text style={styles.timeButtonLabel}>Time</Text>
                <View style={styles.timeButtonRight}>
                  <Text style={styles.timeButtonValue}>{state.planTime ?? 'Any time'}</Text>
                  {!!state.planTime && (
                    <Pressable onPress={() => dispatch({ type: 'CLEAR_TIME' })} hitSlop={10} style={styles.clearBtn}>
                      <Text style={styles.clearBtnLabel}>✕</Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            </View>
            {!!(state.planDate && state.planTime) && (
              <View style={styles.summaryPill}>
                <Text style={styles.summaryText}>{formatDateKey(state.planDate!)} · {state.planTime}</Text>
              </View>
            )}
            <TimeWheelSheet
              visible={showTimeSheet}
              initialTime={state.planTime}
              onClose={() => setShowTimeSheet(false)}
              onConfirm={(time) => { dispatch({ type: 'SET_TIME', time }); setShowTimeSheet(false); }}
            />
            <View style={{ marginTop: 22 }}>
              <SectionLabel>Where — optional</SectionLabel>
              <TextInput
                value={state.planVenue ?? ''}
                onChangeText={(v) => dispatch({ type: 'SET_VENUE', venue: v })}
                placeholder="Paste a Google Maps link"
                placeholderTextColor={colors.faint}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={styles.venueInput}
              />
            </View>
          </View>
        )}

        {state.step === 2 && (
          <View>
            <SectionLabel>How many of you</SectionLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              <Chip label="Just me + one" selected={state.shape === 'duo'} onPress={() => dispatch({ type: 'SET_SHAPE', shape: 'duo' })} style={styles.chipShape} />
              <Chip label="The more the merrier" selected={state.shape === 'group'} onPress={() => dispatch({ type: 'SET_SHAPE', shape: 'group' })} style={styles.chipShape} />
            </View>
            {state.shape === 'group' && (
              <View style={styles.stepper}>
                <Pressable onPress={() => dispatch({ type: 'SET_SIZE', delta: -1 })} style={styles.stepperBtn}>
                  <Text style={styles.stepperBtnLabel}>−</Text>
                </Pressable>
                <Text style={styles.stepperLabel}>Up to {state.size} people, including you</Text>
                <Pressable onPress={() => dispatch({ type: 'SET_SIZE', delta: 1 })} style={styles.stepperBtn}>
                  <Text style={styles.stepperBtnLabel}>+</Text>
                </Pressable>
              </View>
            )}
            <View style={{ marginTop: 22 }}>
              <SectionLabel>Who gets in</SectionLabel>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Approve each request</Text>
                  <Text style={styles.switchDesc}>Off means open seats — first come, no approval.</Text>
                </View>
                <Switch
                  value={state.approvalRequired}
                  onValueChange={(v) => dispatch({ type: 'SET_APPROVAL_REQUIRED', value: v })}
                  trackColor={{ false: colors.borderSoft, true: colors.clay }}
                  thumbColor="#fff"
                />
              </View>
            </View>
            <View style={{ marginTop: 22 }}>
              <SectionLabel>Who can ask to join</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {GENDER_RESTRICTION_OPTIONS.map((g) => (
                  <Chip
                    key={g.key}
                    label={g.title}
                    selected={state.genderRestriction === g.key}
                    onPress={() => dispatch({ type: 'SET_GENDER_RESTRICTION', genderRestriction: g.key })}
                    style={styles.chipShape}
                  />
                ))}
              </View>
            </View>
            <View style={{ marginTop: 22 }}>
              <SectionLabel>Who's paying — optional</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {COST_MODE_OPTIONS.map((c) => (
                  <Chip
                    key={c.key}
                    label={c.title}
                    selected={state.costMode === c.key}
                    onPress={() => dispatch({ type: 'TOGGLE_COST_MODE', costMode: c.key })}
                    style={styles.chipShape}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Btn label={cta} variant={canContinue ? 'primary' : 'disabled'} onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  header: { padding: 20, paddingTop: 36, paddingBottom: 16 },
  kicker: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 11.5, marginTop: 13 },
  title: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 26, letterSpacing: -0.6, marginTop: 7 },
  titleInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.inner, backgroundColor: colors.surface,
    padding: 16, fontFamily: 'Figtree_700Bold', fontSize: 21, color: colors.ink, height: 100, textAlignVertical: 'top',
  },
  note: { color: colors.faint, fontFamily: 'Figtree_400Regular', fontSize: 12, marginTop: 9, lineHeight: 17 },
  dateCell: { minWidth: 80, borderRadius: 14, paddingVertical: 11, paddingHorizontal: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.borderSoft },
  chipShape: { borderRadius: 14 },
  timeButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.inner, backgroundColor: colors.surface,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  timeButtonLabel: { color: colors.muted, fontFamily: 'Figtree_500Medium', fontSize: 14 },
  timeButtonRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeButtonValue: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 15 },
  clearBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' },
  clearBtnLabel: { color: colors.clayPressed, fontFamily: 'Figtree_700Bold', fontSize: 11 },
  summaryPill: {
    marginTop: 18, backgroundColor: colors.blush, borderRadius: radius.inner, paddingVertical: 12, paddingHorizontal: 15,
  },
  summaryText: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 13, textAlign: 'center' },
  venueInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.inner, backgroundColor: colors.surface,
    paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Figtree_500Medium', fontSize: 14, color: colors.ink,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  stepperBtn: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  stepperBtnLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 20, color: colors.ink },
  stepperLabel: { flex: 1, textAlign: 'center', color: colors.inkSecondary, fontFamily: 'Figtree_600SemiBold', fontSize: 13 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface,
    borderRadius: radius.inner, padding: 16, ...shadow.chip,
  },
  switchTitle: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 14 },
  switchDesc: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 12, marginTop: 3 },
  footer: { padding: 20, paddingBottom: 32, backgroundColor: 'rgba(251,246,240,.95)' },
  ctaDisabled: { opacity: 0.45 },
});
