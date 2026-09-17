import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, seatTones } from '../theme';
import { Bubble, ChatBody, chatTime, Composer, EmptyState, Header, SystemNote } from '../components/widgets';
import { formatEventDate, formatEventTime, initialsOf } from '../data/eventDisplay';
import { useAppState } from '../store';
import { chatApi, eventsApi } from '../api';
import { connectSse } from '../realtime';
import type { ApiChatMessage } from '../api/chat';
import type { ApiEvent } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

function appendUnique(prev: ApiChatMessage[], msg: ApiChatMessage): ApiChatMessage[] {
  return prev.some((m) => m.id === msg.id) ? prev : [...prev, msg];
}

export default function Chat({ navigation, route }: Props) {
  const state = useAppState();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [msgs, setMsgs] = useState<ApiChatMessage[]>([]);
  const [draft, setDraft] = useState('');

  useFocusEffect(
    useCallback(() => {
      eventsApi.getEvent(route.params.id).then(setEvent);
      chatApi.listEventMessages(route.params.id).then(setMsgs);
      const disconnect = connectSse<ApiChatMessage>(
        `/events/${route.params.id}/messages/stream`,
        (msg) => setMsgs((prev) => appendUnique(prev, msg)),
      );
      return disconnect;
    }, [route.params.id]),
  );

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const msg = await chatApi.sendEventMessage(route.params.id, text);
    setMsgs((prev) => appendUnique(prev, msg));
  };

  const authorIds = [...new Set(msgs.map((m) => m.authorId))];
  const toneFor = (id: string) => (event && id === event.hostId ? ([colors.amber, colors.ink] as const) : seatTones[authorIds.indexOf(id) % seatTones.length]);
  const last = msgs[msgs.length - 1];
  const hostFirst = event?.host.name?.split(' ')[0];

  return (
    <View style={styles.screen}>
      <Header
        variant="convo"
        title={event?.title ?? '…'}
        subtitle={event ? `${event.seatsFilled} going · ${formatEventTime(event.time)} · ${formatEventDate(event.date)}` : ''}
        action="Hangout"
        onAction={() => navigation.navigate('Detail', { id: route.params.id })}
        onBack={() => navigation.navigate('ChatList')}
      />
      <ChatBody footer={<Composer value={draft} onChange={setDraft} onSend={send} placeholder="Message the table" />}>
        {!!event && event.hostId !== state.userId && <SystemNote>Chat opened when {hostFirst ?? 'the host'} let you in</SystemNote>}
        {msgs.length === 0 && (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <EmptyState shape="bubble" tone="sky" title="Say hi to the table" body="Nobody's said anything yet. Where to meet is a good first message." />
          </View>
        )}
        {msgs.map((m, i) => {
          const mine = m.authorId === state.userId;
          const showName = !mine && msgs[i - 1]?.authorId !== m.authorId;
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
