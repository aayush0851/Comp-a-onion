import { useCallback, useState, type ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { EmptyState, Header, ListSkeleton, SectionLabel, StatusScrim } from '../components/widgets';
import { notificationsApi, joinRequestsApi } from '../api';
import { connectSse } from '../realtime';
import { useAppDispatch } from '../store';
import type { ApiNotification } from '../api/notifications';

type Props = { navigation: NavigationProp<RootStackParamList> };

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'Yesterday';
  if (day < 7) return `${day} days ago`;
  return new Date(iso).toLocaleDateString();
}

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function describe(n: ApiNotification): ReactNode {
  const post = n.postTitle ?? 'a hangout';
  const actor = n.actorName ?? 'Someone';
  switch (n.kind) {
    case 'JOIN_REQUEST':
      return <><Text style={styles.strong}>{actor}</Text> asked to join <Text style={styles.strong}>{post}</Text></>;
    case 'APPROVAL':
      return n.payload.decision === 'APPROVED'
        ? <>You're in — <Text style={styles.strong}>{post}</Text></>
        : <>Not this time — <Text style={styles.strong}>{post}</Text></>;
    case 'RATING_RECEIVED':
      return <><Text style={styles.strong}>{actor}</Text> rated you</>;
    case 'REVIEW_UNLOCKED':
      return <>Your ratings for <Text style={styles.strong}>{post}</Text> are unlocked</>;
    default:
      return 'New activity';
  }
}

export default function Notifications({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    notificationsApi.listNotifications().then(setItems).finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    notificationsApi.listNotifications().then(setItems).finally(() => setRefreshing(false));
  }, []);

  useFocusEffect(useCallback(() => {
    load();
    return connectSse<ApiNotification>('/notifications/stream', (n) => {
      setItems((prev) => [n, ...prev.filter((p) => p.id !== n.id)]);
    });
  }, [load]));

  const markAllRead = async () => {
    await notificationsApi.markAllNotificationsRead();
    dispatch({ type: 'SET_POST_UPDATES', ids: [] });
    load();
  };

  const openNotification = async (n: ApiNotification) => {
    if (!n.read) notificationsApi.markNotificationRead(n.id).catch(() => {});
    if (n.payload.postId && (n.kind === 'JOIN_REQUEST' || n.kind === 'APPROVAL')) dispatch({ type: 'CLEAR_POST_UPDATE', postId: n.payload.postId });
    if (n.kind === 'JOIN_REQUEST' && n.payload.postId) navigation.navigate('PlanManage', { id: n.payload.postId });
    else if (n.kind === 'APPROVAL' && n.payload.postId) {
      if (n.payload.joinRequestId) joinRequestsApi.markRead(n.payload.joinRequestId).catch(() => {});
      navigation.navigate('Detail', { id: n.payload.postId });
    } else if (n.kind === 'RATING_RECEIVED' || n.kind === 'REVIEW_UNLOCKED') navigation.navigate('MyReviews');
  };

  const letThemIn = async (n: ApiNotification) => {
    if (!n.payload.joinRequestId) return;
    await joinRequestsApi.decide(n.payload.joinRequestId, 'APPROVED');
    await notificationsApi.markNotificationRead(n.id);
    load();
  };

  const today = items.filter((n) => isToday(n.createdAt));
  const earlier = items.filter((n) => !isToday(n.createdAt));

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 34, flexGrow: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />}>
        <Header
          variant="stack"
          title="What you missed"
          subtitle="Requests, approvals and ratings. Nothing else."
          action={items.some((n) => !n.read) ? 'Mark read' : null}
          onAction={markAllRead}
          onBack={() => navigation.goBack()}
        />
        {loading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 60 }}>
            <EmptyState tone="zinc" title="All caught up" body="Requests, approvals and ratings land here the moment they happen." />
          </View>
        ) : (
          <View style={styles.body}>
            {today.length > 0 && <SectionLabel>Today</SectionLabel>}
            {today.map((n) => <NotificationRow key={n.id} item={n} onPress={() => openNotification(n)} onLetIn={() => letThemIn(n)} />)}
            {earlier.length > 0 && <View style={{ marginTop: 6 }}><SectionLabel>Earlier</SectionLabel></View>}
            {earlier.map((n) => <NotificationRow key={n.id} item={n} onPress={() => openNotification(n)} onLetIn={() => letThemIn(n)} />)}
          </View>
        )}
      </ScrollView>
      <StatusScrim />
    </View>
  );
}

function NotificationRow({ item, onPress, onLetIn }: { item: ApiNotification; onPress: () => void; onLetIn: () => void }) {
  const actionable = item.kind === 'JOIN_REQUEST' && !item.read;
  const dot = actionable ? colors.ink : item.read ? colors.zinc300 : colors.amber;
  return (
    <Pressable onPress={onPress} style={[styles.row, { backgroundColor: actionable ? colors.amber : colors.zinc100 }, item.read && { opacity: 0.72 }]}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.line}>{describe(item)}</Text>
        <Text style={[styles.time, { color: actionable ? colors.amberInk : colors.zinc400 }]}>{timeAgo(item.createdAt)}</Text>
        {actionable && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Pressable onPress={onLetIn} style={styles.letIn}>
              <Text style={styles.letInLabel}>Let them in</Text>
            </Pressable>
            <Pressable onPress={onPress} style={styles.view}>
              <Text style={styles.viewLabel}>View</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: 20, gap: 9 },
  row: { flexDirection: 'row', gap: 12, borderRadius: 20, padding: 15 },
  dot: { width: 8, height: 8, minWidth: 8, borderRadius: 999, marginTop: 6 },
  line: { fontFamily: font.regular, fontSize: 13.5, lineHeight: 20, color: colors.ink },
  strong: { fontFamily: font.bold },
  time: { fontFamily: font.bold, fontSize: 11.5, marginTop: 5 },
  letIn: { flex: 1, minHeight: 42, borderRadius: 999, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  letInLabel: { fontFamily: font.bold, fontSize: 12.5, color: colors.amber },
  view: { minHeight: 42, paddingHorizontal: 16, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.6)', alignItems: 'center', justifyContent: 'center' },
  viewLabel: { fontFamily: font.bold, fontSize: 12.5, color: colors.ink },
});
