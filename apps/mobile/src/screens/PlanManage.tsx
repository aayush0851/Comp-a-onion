import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { Btn, Header, UserChip } from '../components/widgets';
import { costModeLabel, genderRestrictionLabel } from '../data';
import { formatEventDate, formatEventTime } from '../data/eventDisplay';
import { fromApiCostMode, fromApiGenderRestriction } from '../api/types';
import { eventsApi, joinRequestsApi, reviewsApi } from '../api';
import type { ApiEvent, ApiJoinRequest } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanManage'>;

export default function PlanManage({ navigation, route }: Props) {
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [pending, setPending] = useState<ApiJoinRequest[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [deciding, setDeciding] = useState<string | null>(null);

  const fetchPlan = useCallback(() => {
    setError(false);
    return Promise.all([
      eventsApi.getEvent(route.params.id),
      joinRequestsApi.listForHost(route.params.id),
      reviewsApi.hasReviewed(route.params.id),
    ])
      .then(([e, jrs, mine]) => { setEvent(e); setPending(jrs); setReviewed(!!mine); })
      .catch((e) => { console.error('PlanManage load failed', e); setError(true); });
  }, [route.params.id]);

  const load = useCallback(() => {
    setLoading(true);
    fetchPlan().finally(() => setLoading(false));
  }, [fetchPlan]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPlan().finally(() => setRefreshing(false));
  }, [fetchPlan]);

  if (error) {
    return (
      <View style={styles.screen}>
        <Header variant="stack" title="Your plan" onBack={() => navigation.navigate('MyPlans')} />
        <View style={styles.empty}>
          <Feather name="alert-circle" size={38} color={colors.faint} />
          <Text style={[styles.emptyText, { marginTop: 10 }]}>Couldn't load this plan.</Text>
          <View style={{ marginTop: 16, paddingHorizontal: 40, width: '100%' }}>
            <Btn label="Try again" variant="secondary" onPress={load} />
          </View>
        </View>
      </View>
    );
  }

  if (loading || !event) {
    return (
      <View style={styles.screen}>
        <Header variant="stack" title="Your plan" onBack={() => navigation.navigate('MyPlans')} />
        <ActivityIndicator color={colors.clay} style={{ marginTop: 40 }} />
      </View>
    );
  }

  const when = `${formatEventDate(event.date)} · ${formatEventTime(event.time)}`;
  const approvalRequired = event.entryMode === 'APPROVE';
  const shapeLabel = event.seatsTotal <= 2 ? 'Just me + one' : `Up to ${event.seatsTotal} people`;

  const decide = async (id: string, decision: 'APPROVED' | 'DECLINED') => {
    setDeciding(id);
    try {
      await joinRequestsApi.decide(id, decision);
      await load();
    } finally {
      setDeciding(null);
    }
  };

  const archive = async () => {
    await eventsApi.archiveEvent(event.id);
    load();
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        eyebrow={`${when}${approvalRequired ? ' · you approve' : ''}`}
        title={event.title}
        subtitle={[event.venue || 'Venue TBD', shapeLabel, genderRestrictionLabel(fromApiGenderRestriction(event.genderRestriction))].join(' · ')}
        onBack={() => navigation.navigate('MyPlans')}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.clay} />}
      >
        {event.isArchived && (
          <View style={styles.planCardWrap}>
            <View style={styles.archivedChip}><Text style={styles.archivedLabel}>Archived by you</Text></View>
          </View>
        )}
        {event.tags.length > 0 && (
          <View style={[styles.planCardWrap, styles.tagRow]}>
            {event.tags.map((t) => (
              <View key={t} style={styles.tagChip}><Text style={styles.tagLabel}>{t}</Text></View>
            ))}
          </View>
        )}
        {!!costModeLabel(fromApiCostMode(event.costMode)) && (
          <Text style={[styles.costLine, styles.planCardWrap]}>{costModeLabel(fromApiCostMode(event.costMode))}</Text>
        )}

        <View style={styles.list}>
          <Text style={styles.sectionLabel}>Who's joined — {event.seatsFilled} of {event.seatsTotal}</Text>
          {event.going.length === 0 && (
            <View style={styles.empty}>
              <Feather name="users" size={38} color={colors.faint} />
              <Text style={[styles.emptyText, { marginTop: 10 }]}>Nobody's in yet.</Text>
            </View>
          )}
          {event.going.map((u) => (
            <View key={u.id} style={[styles.card, { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }]}>
              <View style={{ flex: 1 }}>
                <UserChip
                  name={u.name ?? 'Someone'}
                  initials={(u.name ?? '??').slice(0, 2).toUpperCase()}
                  rating={u.aggregatedRating || undefined}
                  onPress={() => navigation.navigate('RequesterProfile', { userId: u.id })}
                />
              </View>
              <Pressable
                onPress={() => navigation.navigate('RequesterChat', { planId: event.id, requesterId: u.id, name: u.name ?? 'Someone' })}
                hitSlop={8}
              >
                <Text style={styles.messageLink}>Message</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {event.isArchived && event.seatsFilled > 0 && !reviewed && (
          <View style={styles.planCardWrap}>
            <Btn label="Leave a review for this plan →" variant="secondary" onPress={() => navigation.navigate('Review', { planId: event.id })} />
          </View>
        )}

        {approvalRequired && (
          <View style={[styles.list, { marginTop: 26 }]}>
            <Text style={styles.sectionLabel}>Who's asking — {pending.length}</Text>
            {pending.length === 0 && (
              <View style={styles.empty}>
                <Feather name="inbox" size={38} color={colors.faint} />
                <Text style={[styles.emptyText, { marginTop: 10 }]}>No requests yet.</Text>
              </View>
            )}
            {pending.map((jr) => (
              <View key={jr.id} style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <UserChip
                      name={jr.user?.name ?? 'Someone'}
                      initials={(jr.user?.name ?? '??').slice(0, 2).toUpperCase()}
                      rating={jr.user?.aggregatedRating || undefined}
                      onPress={jr.user ? () => navigation.navigate('RequesterProfile', { userId: jr.user!.id }) : undefined}
                    />
                  </View>
                  {!!jr.user && (
                    <Pressable
                      onPress={() => navigation.navigate('RequesterChat', { planId: event.id, requesterId: jr.user!.id, name: jr.user!.name ?? 'Someone' })}
                      hitSlop={8}
                    >
                      <Text style={styles.messageLink}>Message</Text>
                    </Pressable>
                  )}
                </View>
                {!!jr.introText && <Text style={styles.intro}>“{jr.introText}”</Text>}
                {!event.isArchived && (
                  <View style={{ flexDirection: 'row', gap: 9, marginTop: 14 }}>
                    <View style={{ flex: 1 }}>
                      <Btn
                        label={deciding === jr.id ? 'Working…' : 'Let them in'}
                        onPress={() => decide(jr.id, 'APPROVED')}
                      />
                    </View>
                    <Btn label="Not this time" variant="secondary" full={false} onPress={() => decide(jr.id, 'DECLINED')} />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {!event.isArchived && (
          <View style={{ paddingHorizontal: 16, marginTop: 26 }}>
            <Btn label="Archive this plan" variant="danger" onPress={archive} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  planCardWrap: { paddingHorizontal: 16, marginTop: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tagChip: { backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  tagLabel: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 11.5 },
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
  emptyText: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 13.5 },
  list: { paddingHorizontal: 16, gap: 11, marginTop: 22 },
  card: { backgroundColor: colors.surface, borderRadius: radius.card - 2, padding: 17, ...shadow.card },
  intro: { color: colors.ink, fontFamily: 'Figtree_400Regular', fontSize: 13.5, lineHeight: 20, marginTop: 9 },
  messageLink: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
});
