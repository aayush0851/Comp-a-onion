import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, seatTones } from '../theme';
import { Bubble, ChatBody, chatTime, Composer, EmptyState, Header, SystemNote } from '../components/widgets';
import { formatPostDate, formatPostTime, initialsOf } from '../data/postDisplay';
import { useAppState } from '../store';
import { chatApi, postsApi } from '../api';
import { connectSse } from '../realtime';
import { playSound } from '../sounds';
import { useChatThreadRead } from '../hooks/useChatThreadRead';
import type { ApiChatMessage } from '../api/chat';
import type { ApiPost } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

function appendUnique(prev: ApiChatMessage[], msg: ApiChatMessage): ApiChatMessage[] {
  return prev.some((m) => m.id === msg.id) ? prev : [...prev, msg];
}

export default function Chat({ navigation, route }: Props) {
  const state = useAppState();
  const [post, setPost] = useState<ApiPost | null>(null);
  const [msgs, setMsgs] = useState<ApiChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loaded, setLoaded] = useState(false);
  useChatThreadRead(route.params.id);

  useFocusEffect(
    useCallback(() => {
      postsApi.getPost(route.params.id).then(setPost);
      chatApi.listPostMessages(route.params.id).then(setMsgs).finally(() => setLoaded(true));
      const disconnect = connectSse<ApiChatMessage>(
        `/posts/${route.params.id}/messages/stream`,
        (msg) => setMsgs((prev) => appendUnique(prev, msg)),
      );
      return disconnect;
    }, [route.params.id]),
  );

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const msg = await chatApi.sendPostMessage(route.params.id, text);
    playSound('message');
    setMsgs((prev) => appendUnique(prev, msg));
  };

  const authorIds = [...new Set(msgs.map((m) => m.authorId))];
  const toneFor = (id: string) => (post && id === post.hostId ? ([colors.amber, colors.ink] as const) : seatTones[authorIds.indexOf(id) % seatTones.length]);
  const last = msgs[msgs.length - 1];
  // Joins without a time sort first; ISO strings compare correctly as text.
  const timeline = [
    ...(post?.going ?? []).map((user) => ({ kind: 'join' as const, at: user.joinedAt ?? '', user })),
    ...msgs.map((msg) => ({ kind: 'msg' as const, at: msg.createdAt, msg })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <View style={styles.screen}>
      <Header
        variant="convo"
        title={post?.title ?? '…'}
        subtitle={post ? `${post.seatsFilled} going · ${formatPostTime(post.time)} · ${formatPostDate(post.date)}` : ''}
        action="Hangout"
        onAction={() => navigation.navigate('Detail', { id: route.params.id })}
        onBack={() => navigation.navigate('ChatList')}
      />
      <ChatBody footer={<Composer value={draft} onChange={setDraft} onSend={send} placeholder="Message the group" />}>
        {loaded && msgs.length === 0 && (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <EmptyState shape="bubble" tone="sky" title="Say hi to the group" body="Nobody's said anything yet. Where to meet is a good first message." />
          </View>
        )}
        {timeline.map((item, i) => {
          if (item.kind === 'join') {
            const u = item.user;
            return <SystemNote key={`join-${u.id}`}>{u.id === state.userId ? 'You' : (u.name?.split(' ')[0] ?? 'Someone')} joined</SystemNote>;
          }
          const m = item.msg;
          const mine = m.authorId === state.userId;
          const prev = timeline[i - 1];
          const showName = !mine && (prev?.kind !== 'msg' || prev.msg.authorId !== m.authorId);
          return (
            <Bubble
              key={m.id}
              showName={showName}
              m={{ id: m.id, text: m.text, mine, authorName: m.author.name, authorInitials: initialsOf(m.author.name), authorPhoto: m.author.profilePicture, authorTone: toneFor(m.authorId) }}
            />
          );
        })}
        {!!last && last.authorId === state.userId && (
          <Text style={[styles.meta, { alignSelf: 'flex-end' }]}>Sent · {chatTime(last.createdAt)}</Text>
        )}
      </ChatBody>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.zinc100 },
  meta: { fontFamily: font.semibold, fontSize: 10.5, color: colors.zinc400 },
});
