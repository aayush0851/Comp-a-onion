import { useCallback, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, ToneKey } from '../theme';
import { EmptyState, FilterChips, Header, ListRow, ListSkeleton, TabBar, StatusScrim } from '../components/widgets';
import { initialsOf } from '../data/postDisplay';
import { shortStamp } from '../data';
import { chatApi } from '../api';
import { connectSse } from '../realtime';
import { useAppDispatch, useAppState } from '../store';
import type { ApiChatMessage, ApiDmThread, ApiPostThread } from '../api/chat';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

const FILTERS = ['All', 'Hangouts', 'People'];
const PEOPLE_TONES: ToneKey[] = ['sky', 'mint', 'amber', 'zinc'];

const unreadLabel = (n?: number) => (!n ? null : n > 99 ? '99+' : n);
const dmKey = (t: ApiDmThread) => chatApi.threadKey(t.post.id, t.peer.id);

// Sets a thread's latest message and keeps the list newest-first.
function bumpThread<T extends { lastMessage: ApiChatMessage | null }>(list: T[], isThread: (t: T) => boolean, msg: ApiChatMessage) {
  return list
    .map((t) => (isThread(t) ? { ...t, lastMessage: msg } : t))
    .sort((a, b) => (b.lastMessage?.createdAt ?? '').localeCompare(a.lastMessage?.createdAt ?? ''));
}

export default function ChatList({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState(0);
  const [postThreads, setPostThreads] = useState<ApiPostThread[]>([]);
  const [dmThreads, setDmThreads] = useState<ApiDmThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Also re-syncs the unread counts with the server, which is the source of truth.
  const fetchThreads = useCallback(async () => {
    const [threads, dms] = await Promise.all([chatApi.listPostThreads(), chatApi.listDmThreads()]);
    setPostThreads(threads);
    setDmThreads(dms);
    dispatch({ type: 'SET_CHAT_UNREAD', counts: chatApi.unreadCounts(threads, dms) });
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchThreads().catch(() => {}).finally(() => setLoading(false));
    }, [fetchThreads]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchThreads().catch(() => {}).finally(() => setRefreshing(false));
  }, [fetchThreads]);

  const shownKeys = useRef(new Set<string>());
  shownKeys.current = new Set([...postThreads.map((t) => chatApi.threadKey(t.postId)), ...dmThreads.map(dmKey)]);

  // Live: move the thread a message belongs to to the top, or reload when it starts a new thread.
  useFocusEffect(
    useCallback(() => connectSse<ApiChatMessage>('/chat/stream', (msg) => {
      const key = chatApi.messageThreadKey(msg, state.userId);
      if (!shownKeys.current.has(key)) {
        fetchThreads().catch(() => {});
        return;
      }
      setPostThreads((prev) => bumpThread(prev, (t) => chatApi.threadKey(t.postId) === key, msg));
      setDmThreads((prev) => bumpThread(prev, (t) => dmKey(t) === key, msg));
    }), [fetchThreads, state.userId]),
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
              <View style={styles.note}>
                <View style={styles.noteRing} />
                <Text style={styles.noteText}>Chats close once the hangout is over, or if the host cancels it.</Text>
              </View>
              {visiblePostThreads.map((t) => (
                <ListRow
                  key={t.postId}
                  title={t.title}
                  meta={t.lastMessage ? `${t.lastMessage.author.name ?? 'Someone'}: ${t.lastMessage.text}` : 'Say hi to start the conversation.'}
                  leading={<View style={styles.hangoutIcon}><Ionicons name="people" size={22} color={colors.ink} /></View>}
                  pill="HANGOUT"
                  right={t.lastMessage ? shortStamp(t.lastMessage.createdAt) : null}
                  unread={unreadLabel(state.chatUnread[chatApi.threadKey(t.postId)])}
                  onPress={() => navigation.navigate('Chat', { id: t.postId })}
                />
              ))}
              {visibleDmThreads.map((t, i) => (
                <ListRow
                  key={dmKey(t)}
                  title={`${t.peer.name ?? 'Someone'} · ${t.post.title}`}
                  meta={`${t.lastMessage.authorId === t.peer.id ? '' : 'You: '}${t.lastMessage.text}`}
                  initials={initialsOf(t.peer.name)}
                  photo={t.peer.profilePicture}
                  tone={PEOPLE_TONES[i % PEOPLE_TONES.length]}
                  right={shortStamp(t.lastMessage.createdAt)}
                  unread={unreadLabel(state.chatUnread[dmKey(t)])}
                  onPress={() => navigation.navigate('RequesterChat', { planId: t.post.id, requesterId: t.peer.id, name: t.peer.name ?? 'Someone' })}
                />
              ))}
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
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.sky, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 15, marginBottom: 4 },
  noteRing: { width: 16, height: 16, minWidth: 16, borderRadius: 999, borderWidth: 2, borderColor: colors.skyInk },
  noteText: { flex: 1, fontFamily: font.regular, fontSize: 12, lineHeight: 18, color: colors.skyInk },
  hangoutIcon: { width: 44, height: 44, borderRadius: 999, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center' },
});
