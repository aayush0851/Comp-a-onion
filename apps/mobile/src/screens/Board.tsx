import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { EmptyState, FilterChips, HangoutCard, Header, ListSkeleton, OfflineBanner, TabBar, TabKey, StatusScrim } from '../components/widgets';
import type { CtaTone, FlagTone } from '../components/widgets';
import { FILTER_LABELS, formatProximityKm } from '../data';
import { EventCard, toEventCard } from '../data/eventDisplay';
import { eventsApi, joinRequestsApi } from '../api';
import { connectSse } from '../realtime';
import type { ApiEvent, ApiJoinRequest } from '../api/types';
import { useAppState, useAppDispatch } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Board'>;

function cardState(c: EventCard, userId: string | null, request?: ApiJoinRequest): { cta: string; ctaTone: CtaTone; flag: string; flagTone: FlagTone } {
  const seatsLeft = Math.max(0, c.seatsTotal - c.seatsFilled);
  const seatsFlag = `${seatsLeft} seat${seatsLeft === 1 ? '' : 's'}`;
  if (c.hostId === userId) return { cta: 'Manage', ctaTone: 'ink', flag: 'Hosting', flagTone: 'ink' };
  if (request?.status === 'APPROVED') return { cta: 'Open chat', ctaTone: 'amber', flag: "You're in", flagTone: 'mint' };
  if (request?.status === 'PENDING') return { cta: 'Requested', ctaTone: 'disabled', flag: 'Asked', flagTone: 'sky' };
  if (c.isFull) return { cta: 'Full', ctaTone: 'disabled', flag: 'Full', flagTone: 'zinc' };
  return { cta: c.entry === 'open' ? 'Take a seat' : 'Ask to join', ctaTone: 'ink', flag: seatsFlag, flagTone: seatsLeft === 1 ? 'warn' : 'zinc' };
}

export default function Board({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [myRequests, setMyRequests] = useState<Map<string, ApiJoinRequest>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [lastLoaded, setLastLoaded] = useState<string | null>(null);

  useEffect(() => {
    if (!state.onboarded) dispatch({ type: 'SET_ONBOARDED' });
  }, [state.onboarded]);

  const fetchBoard = useCallback(() => {
    return Promise.all([eventsApi.listBoard(state.filter), joinRequestsApi.listMine()])
      .then(([board, mine]) => {
        setError(false);
        setEvents(board);
        setMyRequests(new Map(mine.filter((jr) => jr.status !== 'DECLINED' && jr.status !== 'EXPIRED').map((jr) => [jr.eventId, jr])));
        setLastLoaded(new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }));
      })
      .catch((e) => { console.error('Board load failed', e); setError(true); });
  }, [state.filter]);

  const load = useCallback(() => {
    setLoading(true);
    fetchBoard().finally(() => setLoading(false));
  }, [fetchBoard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBoard().finally(() => setRefreshing(false));
  }, [fetchBoard]);

  useFocusEffect(useCallback(() => {
    load();
    // The stream is just a "something new was posted" signal — the actual
    // gender/date filtering already lives server-side in listBoard.
    return connectSse<object>('/events/stream', () => load());
  }, [load]));

  const cards = events.map(toEventCard);

  const onTab = (key: TabKey) => {
    if (key === 'plans') navigation.navigate('MyPlans');
    else if (key === 'chats') navigation.navigate('ChatList');
    else if (key === 'me') navigation.navigate('Profile');
  };

  const openCard = (c: EventCard, request?: ApiJoinRequest) => {
    if (c.hostId === state.userId) navigation.navigate('PlanManage', { id: c.id });
    else if (request?.status === 'APPROVED') navigation.navigate('Chat', { id: c.id });
    else navigation.navigate('Detail', { id: c.id });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />}
      >
        <Header
          variant="home"
          eyebrow={`Nearby · ${FILTER_LABELS[state.filter]}`}
          title="Companion"
          action={error ? 'Offline' : formatProximityKm(state.proximityKm)}
          actionDot={!error}
          onAction={() => navigation.navigate('SearchFilters')}
        />

        {error ? (
          <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
            <OfflineBanner onRetry={load} lastLoaded={lastLoaded} />
          </View>
        ) : (
          <View style={{ paddingHorizontal: 18 }}>
            <View style={styles.featured}>
              <View style={styles.featuredTop}>
                <View style={styles.featuredPill}><Text style={styles.featuredPillLabel}>FEATURED HANGOUT</Text></View>
                <Text style={styles.featuredWhen}>{FILTER_LABELS[state.filter]}</Text>
              </View>
              <Text style={styles.featuredTitle}>What's happening near you {state.filter === 0 ? 'tonight' : state.filter === 1 ? 'tomorrow' : 'this week'}</Text>
              <Pressable onPress={() => navigation.navigate('Create')} style={styles.featuredPrompt}>
                <Text style={styles.featuredPromptText}>What are you doing tonight?</Text>
              </Pressable>
              <View style={styles.featuredFoot}>
                <Text style={styles.featuredNote}>And you, too — post yours in 30 seconds.</Text>
                <Pressable onPress={() => navigation.navigate('Create')} style={styles.postBtn}>
                  <Text style={styles.postLabel}>Post</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        <View style={{ paddingTop: 16, paddingBottom: 14 }}>
          <FilterChips scroll items={FILTER_LABELS} active={state.filter} onChange={(i) => dispatch({ type: 'SET_FILTER', filter: i as 0 | 1 | 2 })} />
        </View>

        {loading && cards.length === 0 ? (
          <ListSkeleton />
        ) : (
          <View style={{ paddingHorizontal: 18, gap: 11, opacity: error ? 0.55 : 1 }}>
            {!error && cards.length === 0 && (
              <EmptyState
                tone="amber"
                title="Nobody free yet."
                body="Nothing posted near you right now. Post yours — people nearby see it in seconds."
                cta="Post a hangout"
                onPressCta={() => navigation.navigate('Create')}
              />
            )}
            {cards.map((c) => {
              const request = myRequests.get(c.id);
              const s = cardState(c, state.userId, request);
              const tags = [c.shapeLabel, ...(c.genderRestriction !== 'anyone' ? [c.genderRestriction === 'women' ? 'Women only' : 'Men only'] : []), ...c.tags].slice(0, 3);
              return (
                <HangoutCard
                  key={c.id}
                  onSurface
                  host={c.host}
                  hostInitials={c.hostInitials}
                  hostPhoto={c.hostPhoto}
                  where={c.whereWhen}
                  flag={error ? 'Cached' : s.flag}
                  flagTone={error ? 'zinc' : s.flagTone}
                  title={c.title}
                  tags={tags}
                  going={c.going.map((g) => ({ label: g.label, photo: g.photo }))}
                  seatText={c.goingLine}
                  cta={error ? 'Reconnect to join' : s.cta}
                  ctaTone={error ? 'disabled' : s.ctaTone}
                  dimmed={c.isFull && !request && c.hostId !== state.userId}
                  onPress={() => navigation.navigate('Detail', { id: c.id })}
                  onPressHost={() => navigation.navigate('RequesterProfile', { userId: c.hostId })}
                  onPressCta={() => openCard(c, request)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
      <StatusScrim />
      <TabBar active="explore" onPress={onTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  featured: { backgroundColor: colors.amber, borderRadius: 24, padding: 17 },
  featuredTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  featuredPill: { backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 },
  featuredPillLabel: { fontFamily: font.extrabold, fontSize: 9.5, letterSpacing: 1, color: colors.amber },
  featuredWhen: { fontFamily: font.bold, fontSize: 11, color: colors.amberInk },
  featuredTitle: { fontFamily: font.extrabold, fontSize: 19, lineHeight: 24, letterSpacing: -0.6, color: colors.ink, marginTop: 13 },
  featuredPrompt: { backgroundColor: colors.white, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 15, marginTop: 13 },
  featuredPromptText: { fontFamily: font.semibold, fontSize: 13.5, color: colors.zinc700 },
  featuredFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 11 },
  featuredNote: { flex: 1, fontFamily: font.semibold, fontSize: 12, color: colors.amberInk },
  postBtn: { backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 15, minHeight: 40, justifyContent: 'center' },
  postLabel: { fontFamily: font.bold, fontSize: 12, color: colors.white },
});
