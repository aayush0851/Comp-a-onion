import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';
import { colors, shadow } from '../theme';
import { Header } from '../components/widgets';
import { notificationsApi, joinRequestsApi } from '../api';
import { connectSse } from '../realtime';
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
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function describe(n: ApiNotification): React.ReactNode {
  const event = n.eventTitle ?? 'a plan';
  const actor = n.actorName ?? 'Someone';
  switch (n.kind) {
    case 'JOIN_REQUEST':
      return <Text style={styles.line}><Text style={styles.strong}>{actor}</Text> asked to join <Text style={styles.strong}>{event}</Text></Text>;
    case 'APPROVAL':
      return n.payload.decision === 'APPROVED'
        ? <Text style={styles.line}>You're in — <Text style={styles.strong}>{event}</Text></Text>
        : <Text style={styles.line}>Not this time — <Text style={styles.strong}>{event}</Text></Text>;
    case 'RATING_RECEIVED':
      return <Text style={styles.line}><Text style={styles.strong}>{actor}</Text> rated you</Text>;
    case 'REVIEW_UNLOCKED':
      return <Text style={styles.line}>Your ratings for <Text style={styles.strong}>{event}</Text> are unlocked</Text>;
    default:
      return <Text style={styles.line}>New activity</Text>;
  }
}

export default function Notifications({ navigation }: Props) {
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    notificationsApi.listNotifications().then(setItems).finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => {
    load();
    return connectSse<ApiNotification>('/notifications/stream', (n) => {
      setItems((prev) => [n, ...prev.filter((p) => p.id !== n.id)]);
    });
  }, [load]));

  const markAllRead = async () => {
    await notificationsApi.markAllNotificationsRead();
    load();
  };

  const openNotification = async (n: ApiNotification) => {
    if (!n.read) notificationsApi.markNotificationRead(n.id).catch(() => {});
    if (n.kind === 'JOIN_REQUEST' && n.payload.eventId) navigation.navigate('PlanManage', { id: n.payload.eventId });
    else if (n.kind === 'APPROVAL' && n.payload.eventId) {
      if (n.payload.joinRequestId) joinRequestsApi.markRead(n.payload.joinRequestId).catch(() => {});
      navigation.navigate('Detail', { id: n.payload.eventId });
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
      <Header
        variant="stack"
        title="What you missed"
        subtitle="Requests, approvals and ratings. Nothing else."
        action="Mark all read"
        onAction={markAllRead}
        onBack={() => navigation.goBack()}
      />
      {loading ? (
        <ActivityIndicator color={colors.clay} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <Text style={[styles.line, { textAlign: 'center', marginTop: 40, color: colors.muted }]}>Nothing yet.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          {today.length > 0 && <Text style={styles.sectionLabel}>Today</Text>}
          {today.map((n) => (
            <NotificationRow key={n.id} item={n} onPress={() => openNotification(n)} onLetIn={() => letThemIn(n)} />
          ))}
          {earlier.length > 0 && <Text style={[styles.sectionLabel, { marginTop: 6 }]}>Earlier</Text>}
          {earlier.map((n) => (
            <NotificationRow key={n.id} item={n} onPress={() => openNotification(n)} onLetIn={() => letThemIn(n)} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function NotificationRow({ item, onPress, onLetIn }: { item: ApiNotification; onPress: () => void; onLetIn: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, item.read && { opacity: 0.76 }]}>
      <View style={[styles.dot, { backgroundColor: item.read ? colors.borderSoft : colors.clay }]} />
      <View style={{ flex: 1 }}>
        {describe(item)}
        <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        {item.kind === 'JOIN_REQUEST' && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Pressable onPress={onLetIn} style={styles.primaryBtn}>
              <Text style={styles.primaryLabel}>Let them in</Text>
            </Pressable>
            <Pressable onPress={onPress} style={styles.viewBtn}>
              <Text style={styles.viewLabel}>View</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 34, gap: 10 },
  sectionLabel: { fontFamily: 'Figtree_700Bold', fontSize: 10.5, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.faint },
  row: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, borderRadius: 20, padding: 15, ...shadow.inner },
  dot: { width: 8, height: 8, minWidth: 8, borderRadius: 999, marginTop: 6 },
  line: { fontSize: 13.5, lineHeight: 20, color: colors.ink },
  strong: { fontFamily: 'Figtree_700Bold' },
  time: { fontFamily: 'Figtree_500Medium', fontSize: 11.5, color: colors.faint, marginTop: 5 },
  primaryBtn: { flex: 1, minHeight: 40, borderRadius: 999, backgroundColor: colors.clay, alignItems: 'center', justifyContent: 'center' },
  primaryLabel: { fontFamily: 'Figtree_700Bold', fontSize: 12.5, color: '#fff' },
  viewBtn: { minHeight: 40, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  viewLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5, color: colors.inkSecondary },
});
