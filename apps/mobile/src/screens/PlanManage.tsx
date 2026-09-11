import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { Btn, Header, UserChip } from '../components/widgets';
import { costModeLabel, formatDateKey, genderRestrictionLabel } from '../data';
import { isPlanArchived, planArchiveReason, useAppState, useAppDispatch } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanManage'>;

export default function PlanManage({ navigation, route }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const plan = state.publishedPlans.find((p) => p.id === route.params.id);

  if (!plan) {
    return (
      <View style={styles.screen}>
        <Header variant="stack" title="Plan not found" onBack={() => navigation.navigate('MyPlans')} />
      </View>
    );
  }

  const archived = isPlanArchived(plan);
  const when = plan.date ? `${formatDateKey(plan.date)}${plan.time ? ` · ${plan.time}` : ''}` : plan.time ?? 'No time set';
  const joinedCount = plan.approvalRequired
    ? Object.values(plan.decided).filter((d) => d === 'in').length
    : plan.requesters.length;
  const shapeLabel = plan.shape === 'duo' ? 'Just me + one' : plan.shape === 'group' ? `Up to ${plan.size} people` : 'Group size not set';
  const reviewed = state.reviewedPlans.includes(plan.id);
  const setupTags = state.setupTags[plan.id] ?? [];

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        eyebrow={`${when}${plan.approvalRequired ? ' · you approve' : ''}`}
        title={plan.title}
        subtitle={[plan.venue || 'Venue TBD', shapeLabel, genderRestrictionLabel(plan.genderRestriction)].join(' · ')}
        onBack={() => navigation.navigate('MyPlans')}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {archived && (
          <View style={styles.planCardWrap}>
            <View style={styles.archivedChip}>
              <Text style={styles.archivedLabel}>{planArchiveReason(plan)}</Text>
            </View>
          </View>
        )}
        {plan.tags.length > 0 && (
          <View style={[styles.planCardWrap, styles.tagRow]}>
            {plan.tags.map((t) => (
              <View key={t} style={styles.tagChip}><Text style={styles.tagLabel}>{t}</Text></View>
            ))}
          </View>
        )}
        {!!costModeLabel(plan.costMode) && (
          <Text style={[styles.costLine, styles.planCardWrap]}>{costModeLabel(plan.costMode)}</Text>
        )}

        {archived && joinedCount > 0 && reviewed && setupTags.length > 0 && (
          <View style={styles.planCardWrap}>
            <Text style={[styles.sectionLabel, { paddingHorizontal: 0, marginTop: 18 }]}>What people said about this plan</Text>
            <View style={styles.reviewCard}>
              {setupTags.map((t) => (
                <View key={t} style={styles.wordPill}>
                  <Text style={styles.wordLabel}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {archived && joinedCount > 0 && !reviewed && (
          <View style={styles.planCardWrap}>
            <Pressable style={styles.reviewPrompt} onPress={() => navigation.navigate('Review', { planId: plan.id })}>
              <Text style={styles.reviewPromptText}>Leave a review for this plan →</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.list}>
          <Text style={styles.sectionLabel}>
            {plan.approvalRequired ? `Who's asking — ${joinedCount} in` : `Who's joined — ${joinedCount}`}
          </Text>
          {plan.requesters.length === 0 && (
            <View style={styles.empty}>
              <Feather name="users" size={38} color={colors.faint} />
              <Text style={[styles.emptyText, { marginTop: 10 }]}>No requests yet.</Text>
            </View>
          )}
          {plan.requesters.map((q) => {
            const decision = plan.decided[q.id];
            const settled = !plan.approvalRequired || !!decision;
            return (
              <View key={q.id} style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <UserChip
                      name={q.name}
                      initials={q.initials}
                      tone={q.tone}
                      rating={q.rating}
                      count={q.ratingCount}
                      verified={!q.isNew}
                      meta={q.isNew ? 'New here · no plans yet' : q.history}
                      onPress={() => navigation.navigate('RequesterProfile', { planId: plan.id, requesterId: q.id })}
                    />
                  </View>
                  <Pressable
                    onPress={() => navigation.navigate('RequesterChat', { planId: plan.id, requesterId: q.id, name: q.name })}
                    hitSlop={8}
                  >
                    <Text style={styles.messageLink}>Message</Text>
                  </Pressable>
                </View>
                <Text style={styles.intro}>“{q.intro}”</Text>
                {!settled && plan.approvalRequired && !archived && (
                  <View style={{ flexDirection: 'row', gap: 9, marginTop: 14 }}>
                    <View style={{ flex: 1 }}>
                      <Btn
                        label="Let them in"
                        onPress={() => dispatch({ type: 'DECIDE_REQUESTER', planId: plan.id, requesterId: q.id, decision: 'in' })}
                      />
                    </View>
                    <Btn
                      label="Not this time"
                      variant="secondary"
                      full={false}
                      onPress={() => dispatch({ type: 'DECIDE_REQUESTER', planId: plan.id, requesterId: q.id, decision: 'out' })}
                    />
                  </View>
                )}
                {plan.approvalRequired && decision === 'in' && (
                  <View style={[styles.settled, { backgroundColor: colors.sageBg }]}>
                    <Text style={[styles.settledLabel, { color: colors.sageInk }]}>In — they've got the chat</Text>
                  </View>
                )}
                {plan.approvalRequired && decision === 'out' && (
                  <View style={[styles.settled, { backgroundColor: '#F4EEE7' }]}>
                    <Text style={[styles.settledLabel, { color: colors.muted }]}>Told them no.</Text>
                  </View>
                )}
                {!plan.approvalRequired && (
                  <View style={[styles.settled, { backgroundColor: colors.sageBg }]}>
                    <Text style={[styles.settledLabel, { color: colors.sageInk }]}>Joined — open seats</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {!archived && (
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            <Btn label="Archive this plan" variant="danger" onPress={() => dispatch({ type: 'ARCHIVE_PLAN', planId: plan.id })} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  header: { padding: 20, paddingTop: 36, paddingBottom: 14 },
  planCardWrap: { paddingHorizontal: 16, marginTop: 4 },
  planCard: { backgroundColor: colors.surface, borderRadius: radius.card, overflow: 'hidden', ...shadow.card },
  timeChip: {
    position: 'absolute', left: 14, bottom: 14, backgroundColor: colors.ink,
    borderRadius: 999, paddingVertical: 8, paddingHorizontal: 13,
  },
  timeLabel: { color: colors.ground, fontFamily: 'Figtree_700Bold', fontSize: 13 },
  entryChip: { position: 'absolute', right: 14, bottom: 14, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  entryLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 11 },
  cardBody: { padding: 17 },
  cardTitle: { fontFamily: 'Figtree_700Bold', fontSize: 22, letterSpacing: -0.4, color: colors.ink },
  cardVenue: { fontFamily: 'Figtree_400Regular', fontSize: 13.5, lineHeight: 19, color: colors.muted, marginTop: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tagChip: { backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  tagLabel: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 11.5 },
  seatRule: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15,
    paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line,
  },
  seatLine: { color: colors.muted, fontFamily: 'Figtree_500Medium', fontSize: 12.5 },
  shapeChip: { backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 11 },
  shapeLabel: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 11.5 },
  costLine: { color: colors.faint, fontFamily: 'Figtree_500Medium', fontSize: 12, marginTop: 10 },
  archivedChip: {
    alignSelf: 'flex-start', backgroundColor: colors.blush, borderRadius: 999,
    paddingVertical: 6, paddingHorizontal: 12, marginTop: 10,
  },
  archivedLabel: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 11.5 },
  sectionLabel: {
    fontFamily: 'Figtree_600SemiBold', fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase',
    color: colors.faint, marginBottom: 10, paddingHorizontal: 16,
  },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36 },
  reviewCard: { backgroundColor: colors.surface, borderRadius: radius.card - 4, padding: 15, gap: 8, ...shadow.card },
  wordPill: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14,
  },
  wordLabel: { color: colors.blushInk, fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
  reviewPrompt: { backgroundColor: colors.ink, borderRadius: radius.inner, padding: 15, alignItems: 'center', marginTop: 18 },
  reviewPromptText: { color: colors.ground, fontFamily: 'Figtree_700Bold', fontSize: 13.5 },
  emptyText: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 13.5 },
  list: { paddingHorizontal: 16, gap: 11, marginTop: 22 },
  card: { backgroundColor: colors.surface, borderRadius: radius.card - 2, padding: 17, ...shadow.card },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.neutralAvatar, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: colors.inkSecondary, fontFamily: 'Figtree_700Bold', fontSize: 13 },
  name: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 16 },
  newChip: { backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9 },
  newLabel: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 10 },
  history: { color: colors.faint, fontFamily: 'Figtree_500Medium', fontSize: 11.5, marginTop: 6 },
  messageLink: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
  intro: { color: colors.ink, fontFamily: 'Figtree_400Regular', fontSize: 13.5, lineHeight: 20, marginTop: 9 },
  settled: { marginTop: 13, borderRadius: 14, padding: 11 },
  settledLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5, lineHeight: 17 },
});
