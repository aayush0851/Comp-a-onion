import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { EmptyState, FilterChips, HangoutCard, Header, ListRow, ListSkeleton, Notice, TabBar, TabKey, StatusScrim } from '../components/widgets';
import type { CtaTone, FlagTone } from '../components/widgets';
import { formatPostDate, formatPostTime, toPostCard } from '../data/postDisplay';
import { postsApi, joinRequestsApi } from '../api';
import { useAppDispatch, useAppState } from '../store';
import type { ApiPost } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MyPlans'>;

type Role = 'host' | 'approved' | 'pending' | 'declined';
type MyPlanItem = { post: ApiPost; role: Role; unread?: boolean };

const FILTERS = ['Upcoming', 'Archived'] as const;

const ROLE_UI: Record<Role, { flag: (e: ApiPost) => string; flagTone: (e: ApiPost) => FlagTone; cta: string; ctaTone: CtaTone }> = {
  host: {
    flag: () => '',
    flagTone: (e) => (e.entryMode === 'APPROVE' ? 'amber' : 'sky'),
    cta: 'Manage',
    ctaTone: 'ink',
  },
  approved: { flag: () => "You're in", flagTone: () => 'mint', cta: 'Open chat', ctaTone: 'amber' },
  pending: { flag: () => 'Requested', flagTone: () => 'sky', cta: 'Requested', ctaTone: 'soft' },
  declined: { flag: () => 'Passed', flagTone: () => 'zinc', cta: 'Not this time', ctaTone: 'disabled' },
};

export default function MyPlans({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState<typeof FILTERS[number]>('Upcoming');
  const [hosted, setHosted] = useState<ApiPost[]>([]);
  const [joined, setJoined] = useState<MyPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchPlans = useCallback(() => {
    setError('');
    return Promise.all([postsApi.listHosted(), joinRequestsApi.listMine()])
      .then(([hostedPosts, requests]) => {
        setHosted(hostedPosts);
        // An archived hangout is shown disabled, so it never carries an update flag.
        const archivedIds = [...hostedPosts, ...requests.flatMap((jr) => (jr.post ? [jr.post] : []))].filter((p) => p.isArchived).map((p) => p.id);
        archivedIds.forEach((postId) => dispatch({ type: 'CLEAR_POST_UPDATE', postId }));
        setJoined(
          requests
            .filter((jr) => (jr.status === 'APPROVED' || jr.status === 'PENDING' || jr.status === 'DECLINED') && jr.post && jr.post.hostId !== state.userId)
            .map((jr) => ({ post: jr.post!, role: jr.status === 'APPROVED' ? 'approved' as const : jr.status === 'DECLINED' ? 'declined' as const : 'pending' as const, unread: joinRequestsApi.hasNewApproval(jr) })),
        );
      })
      .catch((e) => { console.error('My plans load failed', e); setError("Couldn't load your hangouts. Pull down to try again."); });
  }, [state.userId, dispatch]);

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

  const hostedItems: MyPlanItem[] = hosted.map((post) => ({ post, role: 'host' as const }));
  const archived = hostedItems.filter((i) => i.post.isArchived);
  const upcoming = [...hostedItems.filter((i) => !i.post.isArchived), ...joined.filter((i) => !i.post.isArchived)]
    .sort((a, b) => a.post.date.localeCompare(b.post.date));
  const items = filter === 'Archived' ? archived : upcoming;
  const nightsOut = archived.filter((i) => i.post.seatsFilled > 0).length;

  const onTab = (key: TabKey) => {
    if (key === 'explore') navigation.navigate('Board');
    else if (key === 'chats') navigation.navigate('ChatList');
    else if (key === 'me') navigation.navigate('Profile');
  };

  const openItem = ({ post: e, role }: MyPlanItem) => {
    if (role === 'host') navigation.navigate('PlanManage', { id: e.id });
    else if (role === 'approved' && e.seatsTotal > 2) navigation.navigate('Chat', { id: e.id });
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
                : 'One honest sentence about tonight is enough. It goes out to people nearby.'}
              cta={filter === 'Archived' ? undefined : 'Post a hangout'}
              onPressCta={() => navigation.navigate('Create')}
            />
          </View>
        ) : filter === 'Upcoming' ? (
          <View style={{ paddingHorizontal: 18, gap: 11 }}>
            {items.map((item) => {
              const { post: e, role } = item;
              const card = toPostCard(e);
              const ui = ROLE_UI[role];
              const isHost = role === 'host';
              return (
                <HangoutCard
                  key={e.id}
                  onSurface
                  card={{
                    ...card,
                    ...(isHost && { host: 'You', hostInitials: 'Y' }),
                    goingLine: `${e.seatsFilled} in · ${e.seatsTotal} seats`,
                  }}
                  hostTone={isHost ? 'ink' : 'amber'}
                  hostRating={isHost && e.host.aggregatedRating ? e.host.aggregatedRating : null}
                  flag={ui.flag(e)}
                  updated={!!item.unread || state.postUpdates.includes(e.id)}
                  flagIcon={isHost ? (e.entryMode === 'APPROVE' ? 'lock' : 'zap') : undefined}
                  flagTone={ui.flagTone(e)}
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
            {items.map(({ post: e }) => {
              const when = `${formatPostDate(e.date)} · ${formatPostTime(e.time)}`;
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
