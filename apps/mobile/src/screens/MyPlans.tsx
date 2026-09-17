import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { EmptyState, FilterChips, HangoutCard, Header, ListRow, ListSkeleton, Notice, TabBar, TabKey, StatusScrim } from '../components/widgets';
import type { CtaTone, FlagTone } from '../components/widgets';
import { formatEventDate, formatEventTime, toEventCard } from '../data/eventDisplay';
import { eventsApi, joinRequestsApi } from '../api';
import { useAppState } from '../store';
import type { ApiEvent } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MyPlans'>;

type Role = 'host' | 'approved' | 'pending';
type MyPlanItem = { event: ApiEvent; role: Role };

const FILTERS = ['Upcoming', 'Archived'] as const;

const ROLE_UI: Record<Role, { flag: (e: ApiEvent) => string; flagTone: (e: ApiEvent) => FlagTone; cta: string; ctaTone: CtaTone }> = {
  host: {
    flag: (e) => (e.entryMode === 'APPROVE' ? 'You approve' : 'Open'),
    flagTone: (e) => (e.entryMode === 'APPROVE' ? 'amber' : 'sky'),
    cta: 'Manage',
    ctaTone: 'ink',
  },
  approved: { flag: () => "You're in", flagTone: () => 'mint', cta: 'Open chat', ctaTone: 'amber' },
  pending: { flag: () => 'Asked', flagTone: () => 'sky', cta: 'Requested', ctaTone: 'soft' },
};

export default function MyPlans({ navigation }: Props) {
  const state = useAppState();
  const [filter, setFilter] = useState<typeof FILTERS[number]>('Upcoming');
  const [hosted, setHosted] = useState<ApiEvent[]>([]);
  const [joined, setJoined] = useState<MyPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchPlans = useCallback(() => {
    setError('');
    return Promise.all([eventsApi.listHosted(), joinRequestsApi.listMine()])
      .then(([hostedEvents, requests]) => {
        setHosted(hostedEvents);
        setJoined(
          requests
            .filter((jr) => (jr.status === 'APPROVED' || jr.status === 'PENDING') && jr.event && jr.event.hostId !== state.userId)
            .map((jr) => ({ event: jr.event!, role: jr.status === 'APPROVED' ? 'approved' as const : 'pending' as const })),
        );
      })
      .catch((e) => { console.error('My plans load failed', e); setError("Couldn't load your hangouts. Pull down to try again."); });
  }, [state.userId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPlans().finally(() => setLoading(false));
    }, [fetchPlans]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPlans().finally(() => setRefreshing(false));
  }, [fetchPlans]);

  const hostedItems: MyPlanItem[] = hosted.map((event) => ({ event, role: 'host' as const }));
  const archived = hostedItems.filter((i) => i.event.isArchived);
  const upcoming = [...hostedItems.filter((i) => !i.event.isArchived), ...joined.filter((i) => !i.event.isArchived)]
    .sort((a, b) => a.event.date.localeCompare(b.event.date));
  const items = filter === 'Archived' ? archived : upcoming;
  const nightsOut = archived.filter((i) => i.event.seatsFilled > 0).length;

  const onTab = (key: TabKey) => {
    if (key === 'explore') navigation.navigate('Board');
    else if (key === 'chats') navigation.navigate('ChatList');
    else if (key === 'me') navigation.navigate('Profile');
  };

  const openItem = ({ event: e, role }: MyPlanItem) => {
    if (role === 'host') navigation.navigate('PlanManage', { id: e.id });
    else if (role === 'approved') navigation.navigate('Chat', { id: e.id });
    else navigation.navigate('Detail', { id: e.id });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />}
      >
        <Header
          variant="home"
          eyebrow="You're hosting"
          title="My hangouts"
          action="New"
          actionTone="amber"
          onAction={() => navigation.navigate('Create')}
        />
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <FilterChips items={[...FILTERS]} active={FILTERS.indexOf(filter)} onChange={(i) => setFilter(FILTERS[i])} />
        </View>

        {loading ? (
          <ListSkeleton />
        ) : !!error ? (
          <View style={{ paddingHorizontal: 20 }}><Notice tone="rose">{error}</Notice></View>
        ) : items.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
            <EmptyState
              shape="square"
              tone="amber"
              title={filter === 'Archived' ? 'Nothing archived yet' : 'Nothing posted yet'}
              body={filter === 'Archived'
                ? 'Hangouts land here once they wrap up.'
                : 'One honest sentence about tonight is enough. It goes out to Checked people nearby.'}
              cta={filter === 'Archived' ? undefined : 'Post a hangout'}
              onPressCta={() => navigation.navigate('Create')}
            />
          </View>
        ) : filter === 'Upcoming' ? (
          <View style={{ paddingHorizontal: 18, gap: 11 }}>
            {items.map((item) => {
              const { event: e, role } = item;
              const card = toEventCard(e);
              const ui = ROLE_UI[role];
              const isHost = role === 'host';
              return (
                <HangoutCard
                  key={e.id}
                  onSurface
                  host={isHost ? 'You' : card.host}
                  hostInitials={isHost ? 'Y' : card.hostInitials}
                  hostPhoto={isHost ? e.host.profilePicture : card.hostPhoto}
                  hostTone={isHost ? 'ink' : 'amber'}
                  hostRating={isHost && e.host.aggregatedRating ? e.host.aggregatedRating : null}
                  where={card.whereWhen}
                  flag={ui.flag(e)}
                  flagTone={ui.flagTone(e)}
                  title={e.title}
                  blurb={e.description}
                  going={card.going.map((g) => ({ label: g.label, photo: g.photo }))}
                  seatText={`${e.seatsFilled} in · ${e.seatsTotal} seats`}
                  cta={ui.cta}
                  ctaTone={ui.ctaTone}
                  onPress={() => (isHost ? navigation.navigate('PlanManage', { id: e.id }) : navigation.navigate('Detail', { id: e.id }))}
                  onPressCta={() => openItem(item)}
                />
              );
            })}
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, gap: 9 }}>
            {items.map(({ event: e }) => {
              const when = `${formatEventDate(e.date)} · ${formatEventTime(e.time)}`;
              const came = e.seatsFilled;
              return (
                <ListRow
                  key={e.id}
                  title={e.title}
                  meta={`${when} · ${came === 0 ? 'nobody joined' : `${came} came`}`}
                  initials={String(came)}
                  tone={came > 0 ? 'amber' : 'zinc'}
                  right={came > 0 ? 'Completed' : 'Expired'}
                  chevron
                  onPress={() => navigation.navigate('PlanManage', { id: e.id })}
                />
              );
            })}
            {nightsOut > 0 && (
              <View style={styles.streak}>
                <Text style={styles.streakTitle}>{nightsOut} {nightsOut === 1 ? 'night' : 'nights'} out so far.</Text>
                <Text style={styles.streakBody}>That used to be zero. Your turn-up rate is why hosts say yes.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <StatusScrim />
      <TabBar active="plans" onPress={onTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  streak: { backgroundColor: colors.amber, borderRadius: 18, padding: 16, marginTop: 4 },
  streakTitle: { fontFamily: font.extrabold, fontSize: 15, letterSpacing: -0.4, color: colors.ink },
  streakBody: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 19, color: colors.amberInk, marginTop: 5 },
});
