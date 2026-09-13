import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, scale } from '../theme';
import { EmptyState, FilterChips, Header, ListRow, PlanCard, TabBar, TabKey } from '../components/widgets';
import { costModeLabel, genderRestrictionLabel } from '../data';
import { formatEventDate, formatEventTime, toEventCard } from '../data/eventDisplay';
import { fromApiCostMode, fromApiGenderRestriction } from '../api/types';
import { eventsApi, joinRequestsApi } from '../api';
import { useAppState } from '../store';
import type { ApiEvent } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MyPlans'>;

type Role = 'host' | 'approved' | 'pending';
type MyPlanItem = { event: ApiEvent; role: Role };

const FILTERS = ['Upcoming', 'Archived'] as const;

export default function MyPlans({ navigation }: Props) {
  const state = useAppState();
  const [filter, setFilter] = useState<typeof FILTERS[number]>('Upcoming');
  const [hosted, setHosted] = useState<ApiEvent[]>([]);
  const [joined, setJoined] = useState<MyPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError('');
      Promise.all([eventsApi.listHosted(), joinRequestsApi.listMine()])
        .then(([hostedEvents, requests]) => {
          setHosted(hostedEvents);
          setJoined(
            requests
              .filter((jr) => (jr.status === 'APPROVED' || jr.status === 'PENDING') && jr.event && jr.event.hostId !== state.userId)
              .map((jr) => ({ event: jr.event!, role: jr.status === 'APPROVED' ? 'approved' as const : 'pending' as const })),
          );
        })
        .catch((e) => { console.error('My plans load failed', e); setError("Couldn't load your plans. Pull down to try again."); })
        .finally(() => setLoading(false));
    }, [state.userId]),
  );

  const hostedItems: MyPlanItem[] = hosted.map((event) => ({ event, role: 'host' as const }));
  const archived = hostedItems.filter((i) => i.event.isArchived);
  const upcoming = [...hostedItems.filter((i) => !i.event.isArchived), ...joined.filter((i) => !i.event.isArchived)]
    .sort((a, b) => a.event.date.localeCompare(b.event.date));
  const items = filter === 'Archived' ? archived : upcoming;

  const onTab = (key: TabKey) => {
    if (key === 'explore') navigation.navigate('Board');
    else if (key === 'chats') navigation.navigate('ChatList');
    else if (key === 'me') navigation.navigate('Profile');
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="home"
        title="Your plans"
        subtitle="Everything you're hosting or in on, in one place."
        action={!loading && !error && filter === 'Upcoming' && items.length === 0 ? undefined : 'New plan'}
        onAction={() => navigation.navigate('Create')}
      />
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <FilterChips
          items={[...FILTERS]}
          active={FILTERS.indexOf(filter)}
          onChange={(i) => setFilter(FILTERS[i])}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.clay} style={{ marginTop: 40 }} />
      ) : !!error ? (
        <Text style={[scale.meta, { textAlign: 'center', paddingTop: 40 }]}>{error}</Text>
      ) : items.length === 0 ? (
        <View style={{ paddingTop: 40 }}>
          <EmptyState
            shape="square"
            tone="peach"
            title={filter === 'Archived' ? 'Nothing archived' : 'Nothing coming up'}
            body={filter === 'Archived'
              ? 'Plans land here once you archive them.'
              : "Post a plan or ask to join one — either way, it'll show up here."}
            cta={filter === 'Archived' ? undefined : 'Post a plan'}
            onPressCta={() => navigation.navigate('Create')}
          />
        </View>
      ) : filter === 'Upcoming' ? (
        <ScrollView contentContainerStyle={styles.cards}>
          {items.map(({ event: e, role }) => {
            const isHost = role === 'host';
            const card = toEventCard(e);
            const time = formatEventTime(e.time);
            const shapeLabel = e.seatsTotal <= 2 ? 'Just me + one' : genderRestrictionLabel(fromApiGenderRestriction(e.genderRestriction));
            const badge = isHost
              ? (e.entryMode === 'APPROVE' ? 'You approve' : 'Open seats')
              : role === 'approved' ? "You're in" : 'Waiting on host';
            const badgeTone = isHost
              ? (e.entryMode === 'APPROVE' ? 'light' : 'sage')
              : role === 'approved' ? 'sage' : 'light';
            const cta = isHost ? 'Manage plan' : role === 'approved' ? 'Open chat' : 'Requested';
            const goTo = () => navigation.navigate(isHost ? 'PlanManage' : 'Detail', { id: e.id });
            const goToCta = () => {
              if (isHost) navigation.navigate('PlanManage', { id: e.id });
              else if (role === 'approved') navigation.navigate('Chat', { id: e.id });
              else navigation.navigate('Detail', { id: e.id });
            };
            return (
              <PlanCard
                key={e.id}
                compact
                title={e.title}
                blurb={card.venueLine}
                venue={isHost ? `YOUR PLAN${e.venue ? ` · ${e.venue.toUpperCase()}` : ''}` : card.slot}
                time={time}
                dist=""
                badge={badge}
                badgeTone={badgeTone}
                tag={costModeLabel(fromApiCostMode(e.costMode))}
                kind={shapeLabel}
                filled={e.seatsFilled}
                total={e.seatsTotal}
                cta={cta}
                ctaVariant="secondary"
                host={isHost ? 'You' : card.host}
                hostInitials={isHost ? 'YO' : card.hostInitials}
                hostPhoto={isHost ? e.host.profilePicture : card.hostPhoto}
                onPress={goTo}
                onPressCta={goToCta}
              />
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {items.map(({ event: e }) => {
            const when = `${formatEventDate(e.date)} · ${formatEventTime(e.time)}`;
            return (
              <ListRow
                key={e.id}
                title={e.title}
                meta={[when, e.venue ?? undefined].filter(Boolean).join(' · ')}
                initials={String(e.seatsFilled)}
                tone="sage"
                chevron
                right="Archived by you"
                onPress={() => navigation.navigate('PlanManage', { id: e.id })}
              />
            );
          })}
        </ScrollView>
      )}

      <View style={styles.tabBar}>
        <TabBar active="plans" unread={false} onPress={onTab} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  cards: { paddingHorizontal: 16, paddingBottom: 100, gap: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
