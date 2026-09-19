import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, ToneKey } from '../theme';
import { EmptyState, FilterChips, Header, ListRow, ListSkeleton, TabBar, StatusScrim } from '../components/widgets';
import { initialsOf } from '../data/postDisplay';
import { shortStamp } from '../data';
import { chatApi } from '../api';
import { connectSse } from '../realtime';
import type { ApiChatMessage, ApiDmThread, ApiPostThread } from '../api/chat';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

const FILTERS = ['All', 'Hangouts', 'People'];
const PEOPLE_TONES: ToneKey[] = ['sky', 'mint', 'amber', 'zinc'];

export default function ChatList({ navigation }: Props) {
  const [filter, setFilter] = useState(0);
  const [postThreads, setPostThreads] = useState<ApiPostThread[]>([]);
  const [dmThreads, setDmThreads] = useState<ApiDmThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchThreads = useCallback(async () => {
    const [threads, dms] = await Promise.all([chatApi.listPostThreads(), chatApi.listDmThreads()]);
    return { threads, dms };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);

      fetchThreads()
        .then(({ threads, dms }) => {
          if (cancelled) return;
          setPostThreads(threads);
          setDmThreads(dms);
        })
        .finally(() => { if (!cancelled) setLoading(false); });

      return () => { cancelled = true; };
    }, [fetchThreads]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchThreads()
      .then(({ threads, dms }) => { setPostThreads(threads); setDmThreads(dms); })
      .finally(() => setRefreshing(false));
  }, [fetchThreads]);

  const postThreadIds = postThreads.map((t) => t.postId).join(',');
  const dmPeerIds = dmThreads.map((t) => t.peer.id).join(',');

  // Live updates for threads already on screen — a brand-new thread (first DM
  // from someone, or your first message in a just-approved plan) won't appear
  // until the list is reloaded, since there's nothing here to subscribe to yet.
  useFocusEffect(
    useCallback(() => {
      if (loading) return;
      const disconnects = [
        ...postThreads.map((t) => connectSse<ApiChatMessage>(`/posts/${t.postId}/messages/stream`, (msg) => {
          setPostThreads((prev) => prev
            .map((p) => (p.postId === t.postId ? { ...p, lastMessage: msg } : p))
            .sort((a, b) => (b.lastMessage?.createdAt ?? '').localeCompare(a.lastMessage?.createdAt ?? '')));
        })),
        ...dmThreads.map((t) => connectSse<ApiChatMessage>(`/users/${t.peer.id}/dm/stream`, (msg) => {
          setDmThreads((prev) => prev.map((p) => (p.peer.id === t.peer.id ? { ...p, lastMessage: msg } : p)));
        })),
      ];
      return () => disconnects.forEach((d) => d());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, postThreadIds, dmPeerIds]),
  );

  const visiblePostThreads = filter !== 2 ? postThreads : [];
  const visibleDmThreads = filter !== 1 ? dmThreads : [];
  const isEmpty = postThreads.length === 0 && dmThreads.length === 0;
  const total = postThreads.length + dmThreads.length;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />}
      >
        <Header
          variant="home"
          eyebrow={!loading && total > 0 ? `${total} ${total === 1 ? 'conversation' : 'conversations'}` : null}
          title="Chats"
          subtitle="A chat opens the moment a host lets you in."
        />

        {loading ? (
          <ListSkeleton />
        ) : isEmpty ? (
          <View style={{ paddingTop: 30 }}>
            <EmptyState
              shape="bubble"
              tone="sky"
              title="No chats yet"
              body="Ask to join something, or post a hangout of your own. Chats show up here once a host says yes."
              cta="See tonight's hangouts"
              onPressCta={() => navigation.navigate('Board')}
            />
          </View>
        ) : (
          <>
            <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
              <FilterChips items={FILTERS} active={filter} onChange={setFilter} />
            </View>
            <View style={styles.list}>
              {visiblePostThreads.map((t) => (
                <ListRow
                  key={t.postId}
                  title={t.title}
                  meta={t.lastMessage ? `${t.lastMessage.author.name ?? 'Someone'}: ${t.lastMessage.text}` : 'Say hi to start the conversation.'}
                  initials={initialsOf(t.title).slice(0, 1)}
                  tone="amber"
                  pill="HANGOUT"
                  right={t.lastMessage ? shortStamp(t.lastMessage.createdAt) : null}
                  onPress={() => navigation.navigate('Chat', { id: t.postId })}
                />
              ))}
              {visibleDmThreads.map((t, i) => (
                <ListRow
                  key={t.peer.id}
                  title={t.peer.name ?? 'Someone'}
                  meta={`${t.lastMessage.authorId === t.peer.id ? '' : 'You: '}${t.lastMessage.text}`}
                  initials={initialsOf(t.peer.name)}
                  photo={t.peer.profilePicture}
                  tone={PEOPLE_TONES[i % PEOPLE_TONES.length]}
                  right={shortStamp(t.lastMessage.createdAt)}
                  onPress={() => navigation.navigate('RequesterChat', { requesterId: t.peer.id, name: t.peer.name ?? 'Someone' })}
                />
              ))}
              <View style={styles.note}>
                <View style={styles.noteRing} />
                <Text style={styles.noteText}>Chats stay open for everyone who got in. Keep it to the plan — no one likes a group chat that won't die.</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <StatusScrim />

      <TabBar
        active="chats"
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
  screen: { flex: 1, backgroundColor: colors.white },
  list: { paddingHorizontal: 20, gap: 9 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.sky, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 15, marginTop: 4 },
  noteRing: { width: 16, height: 16, minWidth: 16, borderRadius: 999, borderWidth: 2, borderColor: colors.skyInk },
  noteText: { flex: 1, fontFamily: font.regular, fontSize: 12, lineHeight: 18, color: colors.skyInk },
});
