import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { EmptyState, FilterChips, Header, ListRow, TabBar } from '../components/widgets';
import { initialsOf } from '../data/eventDisplay';
import { chatApi, eventsApi, joinRequestsApi } from '../api';
import { connectSse } from '../realtime';
import type { ApiChatMessage, ApiDmThread } from '../api/chat';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

const FILTERS = ['All', 'Plans', 'People'];

type EventThread = { eventId: string; title: string; lastMessage: ApiChatMessage | null };

export default function ChatList({ navigation }: Props) {
  const [filter, setFilter] = useState(0);
  const [eventThreads, setEventThreads] = useState<EventThread[]>([]);
  const [dmThreads, setDmThreads] = useState<ApiDmThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchThreads = useCallback(async () => {
    const [hosted, mine, dms] = await Promise.all([eventsApi.listHosted(), joinRequestsApi.listMine(), chatApi.listDmThreads()]);
    const approvedMineEvents = mine.filter((jr) => jr.status === 'APPROVED' && jr.event).map((jr) => jr.event!);
    const eventsById = new Map([...hosted, ...approvedMineEvents].map((e) => [e.id, e]));

    const threads = await Promise.all(
      [...eventsById.values()].map(async (e) => {
        const msgs = await chatApi.listEventMessages(e.id);
        return { eventId: e.id, title: e.title, lastMessage: msgs[msgs.length - 1] ?? null };
      }),
    );

    return { threads: threads.sort((a, b) => (b.lastMessage?.createdAt ?? '').localeCompare(a.lastMessage?.createdAt ?? '')), dms };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);

      fetchThreads()
        .then(({ threads, dms }) => {
          if (cancelled) return;
          setEventThreads(threads);
          setDmThreads(dms);
        })
        .finally(() => { if (!cancelled) setLoading(false); });

      return () => { cancelled = true; };
    }, [fetchThreads]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchThreads()
      .then(({ threads, dms }) => { setEventThreads(threads); setDmThreads(dms); })
      .finally(() => setRefreshing(false));
  }, [fetchThreads]);

  const eventThreadIds = eventThreads.map((t) => t.eventId).join(',');
  const dmPeerIds = dmThreads.map((t) => t.peer.id).join(',');

  // Live updates for threads already on screen — a brand-new thread (first DM
  // from someone, or your first message in a just-approved plan) won't appear
  // until the list is reloaded, since there's nothing here to subscribe to yet.
  useFocusEffect(
    useCallback(() => {
      if (loading) return;
      const disconnects = [
        ...eventThreads.map((t) => connectSse<ApiChatMessage>(`/events/${t.eventId}/messages/stream`, (msg) => {
          setEventThreads((prev) => prev
            .map((p) => (p.eventId === t.eventId ? { ...p, lastMessage: msg } : p))
            .sort((a, b) => (b.lastMessage?.createdAt ?? '').localeCompare(a.lastMessage?.createdAt ?? '')));
        })),
        ...dmThreads.map((t) => connectSse<ApiChatMessage>(`/users/${t.peer.id}/dm/stream`, (msg) => {
          setDmThreads((prev) => prev.map((p) => (p.peer.id === t.peer.id ? { ...p, lastMessage: msg } : p)));
        })),
      ];
      return () => disconnects.forEach((d) => d());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, eventThreadIds, dmPeerIds]),
  );

  const showPlans = filter !== 2;
  const showPeople = filter !== 1;
  const visibleEventThreads = showPlans ? eventThreads : [];
  const visibleDmThreads = showPeople ? dmThreads : [];
  const isEmpty = visibleEventThreads.length === 0 && visibleDmThreads.length === 0;

  return (
    <View style={styles.screen}>
      <Header variant="home" title="Chats" subtitle="A chat opens the moment a host says yes." />
      <View style={{ flex: 1 }}>
        {!loading && !isEmpty && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
            <FilterChips items={FILTERS} active={filter} onChange={setFilter} />
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={colors.clay} style={{ marginTop: 40 }} />
        ) : isEmpty ? (
          <View style={{ paddingTop: 40 }}>
            <EmptyState
              shape="bubble"
              tone="sage"
              title="No chats yet"
              body="Ask to join something, or post a plan of your own. Chats show up here once someone says yes."
              cta="See tonight's board"
              onPressCta={() => navigation.navigate('Board')}
            />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.clay} />}
          >
            {visibleEventThreads.map((t) => (
              <ListRow
                key={t.eventId}
                title={t.title}
                meta={t.lastMessage ? `${t.lastMessage.author.name ?? 'Someone'}: ${t.lastMessage.text}` : 'Say hi to start the conversation.'}
                initials={initialsOf(t.title)}
                tone="peach"
                onPress={() => navigation.navigate('Chat', { id: t.eventId })}
              />
            ))}
            {visibleDmThreads.map((t) => (
              <ListRow
                key={t.peer.id}
                title={t.peer.name ?? 'Someone'}
                meta={`${t.lastMessage.authorId === t.peer.id ? '' : 'You: '}${t.lastMessage.text}`}
                initials={initialsOf(t.peer.name)}
                tone="sand"
                onPress={() => navigation.navigate('RequesterChat', { requesterId: t.peer.id, name: t.peer.name ?? 'Someone' })}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <TabBar
        active="chats"
        unread={false}
        onPress={(key) => {
          if (key === 'plans') navigation.navigate('MyPlans');
          else if (key === 'me') navigation.navigate('Profile');
          else if (key === 'explore') navigation.navigate('Board');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
});
