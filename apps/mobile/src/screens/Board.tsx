import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, scale } from '../theme';
import { FilterChips, Header, PlanCard, TabBar, TabKey } from '../components/widgets';
import { FILTER_LABELS, formatProximityKm, GREETINGS } from '../data';
import { toEventCard } from '../data/eventDisplay';
import { eventsApi, joinRequestsApi } from '../api';
import { connectSse } from '../realtime';
import type { ApiEvent, ApiJoinRequest } from '../api/types';
import { useAppState, useAppDispatch } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Board'>;

export default function Board({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [myRequests, setMyRequests] = useState<Map<string, ApiJoinRequest>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state.onboarded) dispatch({ type: 'SET_ONBOARDED' });
  }, [state.onboarded]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([eventsApi.listBoard(state.filter), joinRequestsApi.listMine()])
      .then(([board, mine]) => {
        setEvents(board);
        setMyRequests(new Map(mine.filter((jr) => jr.status !== 'DECLINED' && jr.status !== 'EXPIRED').map((jr) => [jr.eventId, jr])));
      })
      .catch((e) => { console.error('Board load failed', e); setError("Couldn't load the board. Pull down to try again."); })
      .finally(() => setLoading(false));
  }, [state.filter]);

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

  return (
    <View style={styles.screen}>
      <View style={[styles.blob, { top: -70, right: -60, width: 230, height: 230, backgroundColor: colors.blush }]} />
      <View style={[styles.blob, { top: 70, left: -90, width: 180, height: 180, backgroundColor: colors.sageBg }]} />
      <Header
        variant="home"
        title={GREETINGS[state.filter]}
        subtitle="Nobody's committed yet. Neither are you."
        action={`Nearby · ${formatProximityKm(state.proximityKm)}`}
        actionDot
        onAction={() => navigation.navigate('SearchFilters')}
      />
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <FilterChips
          items={[...FILTER_LABELS]}
          active={state.filter}
          onChange={(i) => dispatch({ type: 'SET_FILTER', filter: i as 0 | 1 | 2 })}
        />
      </View>
      {loading ? (
        <ActivityIndicator color={colors.clay} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.cards}>
          {!!error && <Text style={[scale.meta, { textAlign: 'center' }]}>{error}</Text>}
          {!error && cards.length === 0 && (
            <Text style={[scale.meta, { textAlign: 'center', paddingTop: 20 }]}>Nothing posted near you yet.</Text>
          )}
          {cards.map((c) => {
            const isHost = c.hostId === state.userId;
            const myRequest = myRequests.get(c.id);
            const isBlockedByCapacity = c.isFull && !isHost && !myRequest;
            const cta = isHost
              ? 'Manage plan'
              : myRequest?.status === 'APPROVED'
                ? 'Open chat'
                : myRequest?.status === 'PENDING'
                  ? 'Requested'
                  : isBlockedByCapacity
                    ? 'Full'
                    : c.entry === 'open' ? 'Take a seat' : 'Ask to join';
            return (
              <PlanCard
                key={c.id}
                title={c.title}
                blurb={c.venueLine}
                venue={c.genderRestriction !== 'anyone' ? `${c.genderRestriction === 'women' ? 'Women' : 'Men'} only` : null}
                time={c.time}
                dist=""
                badge={null}
                badgeTone="primary"
                badgeIcon={c.entry === 'open' ? 'zap' : undefined}
                kind={c.shapeLabel}
                filled={c.seatsFilled}
                total={c.seatsTotal}
                cta={cta}
                ctaVariant={isBlockedByCapacity ? 'disabled' : 'primary'}
                disabled={isBlockedByCapacity}
                youSignedUp={myRequest?.status === 'APPROVED'}
                host={c.host}
                hostInitials={c.hostInitials}
                hostPhoto={c.hostPhoto}
                onPress={() => navigation.navigate('Detail', { id: c.id })}
                onPressCta={() => navigation.navigate('Detail', { id: c.id })}
              />
            );
          })}
          <Text style={[scale.accent, { fontSize: 15, paddingHorizontal: 6 }]}>
            Nothing here for you? Post your own — twenty seconds, and people nearby see it.
          </Text>
        </ScrollView>
      )}
      <View style={styles.tabBar}>
        <TabBar active="explore" unread={false} onPress={onTab} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  blob: { position: 'absolute', borderRadius: 999 },
  cards: { paddingHorizontal: 16, paddingTop: 2, paddingBottom: 100, gap: 14 },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
