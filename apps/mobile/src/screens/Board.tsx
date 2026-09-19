import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Octicons from '@expo/vector-icons/Octicons';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { EmptyState, FeaturedCard, Notice, FilterChips, HangoutCard, Header, ListSkeleton, OfflineBanner, TabBar, TabKey, StatusScrim } from '../components/widgets';
import type { CtaTone, FlagTone } from '../components/widgets';
import { formatProximityKm } from '../data';
import { PostCard, toPostCard } from '../data/postDisplay';
import { postsApi, joinRequestsApi } from '../api';
import { boardQueryString } from '../api/posts';
import { connectSse } from '../realtime';
import type { ApiPost, ApiJoinRequest } from '../api/types';
import type { ApiNotification } from '../api/notifications';
import { useAppState, useAppDispatch } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Board'>;

type PostDelta = Pick<ApiPost, 'id' | 'seatsTotal' | 'seatsFilled' | 'isFull' | 'isArchived'>;
type BoardFrame = ({ type: 'updated' } & PostDelta) | { type: 'created' };

// Up to this many new posts are pulled in automatically; past it, the user pulls down to refresh.
const MAX_AUTO_REFRESH = 5;

const QUICK_TYPES = ['Walk n talk', 'Food', 'Coffee', 'Drinks'];
const BOARD_CHIPS = [{ label: '', glyph: <Octicons name="sliders" size={16} color={colors.zinc700} /> }, 'Women only', ...QUICK_TYPES];

function cardState(c: PostCard, userId: string | null, request?: ApiJoinRequest): { cta: string; ctaTone: CtaTone; flag: string; flagTone: FlagTone } {
  const seatsLeft = Math.max(0, c.seatsTotal - c.seatsFilled);
  const seatsFlag = `${seatsLeft} seat${seatsLeft === 1 ? '' : 's'}`;
  if (c.hostId === userId) return { cta: 'Manage', ctaTone: 'ink', flag: 'Hosting', flagTone: 'ink' };
  if (request?.status === 'APPROVED') return { cta: 'Open chat', ctaTone: 'amber', flag: "You're in", flagTone: 'mint' };
  if (request?.status === 'PENDING') return { cta: 'Requested', ctaTone: 'disabled', flag: 'Requested', flagTone: 'sky' };
  if (request?.status === 'DECLINED') return { cta: 'Not this time', ctaTone: 'disabled', flag: 'Passed', flagTone: 'zinc' };
  if (request?.status === 'EXPIRED') return { cta: 'Expired', ctaTone: 'disabled', flag: 'Expired', flagTone: 'zinc' };
  if (c.isExpired) return { cta: 'Ended', ctaTone: 'disabled', flag: 'Ended', flagTone: 'zinc' };
  if (c.isFull) return { cta: 'Full', ctaTone: 'disabled', flag: 'Full', flagTone: 'zinc' };
  return { cta: c.entry === 'open' ? 'Take a seat' : 'Ask to join', ctaTone: 'ink', flag: seatsFlag, flagTone: seatsLeft === 1 ? 'warn' : 'zinc' };
}

export default function Board({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [myRequests, setMyRequests] = useState<Map<string, ApiJoinRequest>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [lastLoaded, setLastLoaded] = useState<string | null>(null);

  useEffect(() => {
    if (!state.onboarded) dispatch({ type: 'SET_ONBOARDED' });
  }, [state.onboarded]);

  const hasLoaded = useRef(false);
  const latestFetch = useRef(0);
  const fetchBoard = useCallback(() => {
    const id = ++latestFetch.current;
    return Promise.all([postsApi.listBoard(state), joinRequestsApi.listMine()])
      .then(([board, mine]) => {
        if (id !== latestFetch.current) return; // a newer filter change is already in flight
        setError(false);
        setPosts(board);
        setMyRequests(new Map(mine.map((jr) => [jr.postId, jr])));
        setLastLoaded(new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }));
      })
      .catch((e) => { if (id === latestFetch.current) { console.error('Board load failed', e); setError(true); } });
  }, [state.filter, state.groupSize, state.whoThere, state.typeFilters, state.searchQuery, state.proximityKm, state.boardVersion]);

  // Once more than MAX_AUTO_REFRESH new posts have been announced since the last deliberate load
  // (focus, filter change, pull), the stream is closed and this flag asks the user to pull down.
  const newPostsRef = useRef(0);
  const [hasUnloaded, setHasUnloaded] = useState(false);
  const resetNewPosts = () => { newPostsRef.current = 0; setHasUnloaded(false); };

  const load = useCallback(() => {
    resetNewPosts();
    if (!hasLoaded.current) setLoading(true); // only the first load shimmers; refetches update in place
    fetchBoard().finally(() => { hasLoaded.current = true; setLoading(false); });
  }, [fetchBoard]);

  const onRefresh = useCallback(() => {
    resetNewPosts();
    setRefreshing(true);
    fetchBoard().finally(() => setRefreshing(false));
  }, [fetchBoard]);

  const onCreatedFrame = useCallback(() => {
    newPostsRef.current += 1;
    if (newPostsRef.current > MAX_AUTO_REFRESH) setHasUnloaded(true);
    else fetchBoard();
  }, [fetchBoard]);

  // Seat and status changes arrive as a small delta: patch the card in place, drop it once archived.
  const patchPost = useCallback((d: PostDelta) => {
    setPosts((prev) => (d.isArchived
      ? prev.filter((p) => p.id !== d.id)
      : prev.map((p) => (p.id === d.id ? { ...p, seatsTotal: d.seatsTotal, seatsFilled: d.seatsFilled, isFull: d.isFull } : p))));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // The server only pushes frames for posts this board would show, so the stream takes the same filters as the list.
  const streamPath = useMemo(
    () => `/posts/stream${boardQueryString(state)}`,
    [state.filter, state.groupSize, state.whoThere, state.typeFilters, state.searchQuery, state.proximityKm],
  );

  // 'created' is just a nudge to re-fetch; 'updated' is a small delta to patch in.
  // The host's decision on one of my requests arrives as a notification; flip that card right away.
  useFocusEffect(useCallback(() => connectSse<ApiNotification>('/notifications/stream', (n) => {
    const { postId, decision } = n.payload;
    if (n.kind !== 'APPROVAL' || !postId || !decision) return;
    setMyRequests((prev) => {
      const current = prev.get(postId);
      return current ? new Map(prev).set(postId, { ...current, status: decision, lastReadAt: null }) : prev;
    });
  }), []));

  // While hasUnloaded is set the stream stays closed: everything is picked up by the next pull-to-refresh.
  useFocusEffect(useCallback(() => {
    if (hasUnloaded) return undefined;
    return connectSse<BoardFrame>(streamPath, (frame) => {
      if (frame.type === 'updated') patchPost(frame);
      else onCreatedFrame();
    });
  }, [streamPath, state.boardVersion, hasUnloaded, onCreatedFrame, patchPost]));

  const cards = posts
    .map(toPostCard)
    .filter((c) => !state.hideAsked || !myRequests.has(c.id));

  const onTab = (key: TabKey) => {
    if (key === 'plans') navigation.navigate('MyPlans');
    else if (key === 'chats') navigation.navigate('ChatList');
    else if (key === 'me') navigation.navigate('Profile');
  };

  const openCard = (c: PostCard, request?: ApiJoinRequest) => {
    if (c.hostId === state.userId) navigation.navigate('PlanManage', { id: c.id });
    else if (request?.status === 'APPROVED' && c.shapeLabel === 'Group') navigation.navigate('Chat', { id: c.id });
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
          hideTitle
          title="Companion"
          action={error ? 'Offline' : formatProximityKm(state.proximityKm)}
          actionDot={!error}
          onAction={() => navigation.navigate('SearchFilters')}
        />

        {error && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
            <OfflineBanner onRetry={load} lastLoaded={lastLoaded} />
          </View>
        )}

        <View style={{ paddingTop: 16, paddingBottom: 14 }}>
          <FilterChips
            scroll
            fixedFirst
            items={BOARD_CHIPS}
            active={[
              ...(state.whoThere === 1 ? [1] : []),
              ...QUICK_TYPES.map((tp, i) => (state.typeFilters.includes(tp) ? i + 2 : -1)).filter((i) => i > 0),
            ]}
            onChange={(i) => {
              if (i === 0) navigation.navigate('SearchFilters');
              else if (i === 1) dispatch({ type: 'SET_WHO_THERE', whoThere: state.whoThere === 1 ? 2 : 1 });
              else {
                const tp = QUICK_TYPES[i - 2];
                dispatch({ type: 'SET_TYPE_FILTERS', types: state.typeFilters.includes(tp) ? state.typeFilters.filter((x) => x !== tp) : [...state.typeFilters, tp] });
              }
            }}
          />
        </View>

        {loading && cards.length === 0 ? (
          <ListSkeleton />
        ) : (
          <View style={{ paddingHorizontal: 18, gap: 11, opacity: error ? 0.55 : 1 }}>
            {hasUnloaded && <Notice tone="amber">People might have posted new hangouts in your area. Pull down to refresh.</Notice>}
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
              return (
                <HangoutCard
                  key={c.id}
                  onSurface
                  featured={c.isFeatured}
                  card={c}
                  flag={error ? 'Cached' : s.flag}
                  updated={!!(request && joinRequestsApi.hasNewApproval(request)) || state.postUpdates.includes(c.id)}
                  flagTone={error ? 'zinc' : s.flagTone}
                  cta={error ? 'Reconnect to join' : s.cta}
                  ctaTone={error ? 'disabled' : s.ctaTone}
                  dimmed={(c.isFull || c.isExpired) && !request && c.hostId !== state.userId}
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
});
