import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, text } from '../theme';
import { Bubble, ChatBody, chatTime, Composer, EmptyState, Header, ratingText } from '../components/widgets';
import { initialsOf, toPostCard } from '../data/postDisplay';
import { useAppState } from '../store';
import { ApiError, chatApi, postsApi, usersApi } from '../api';
import { connectSse } from '../realtime';
import { useChatThreadRead } from '../hooks/useChatThreadRead';
import type { ApiChatMessage } from '../api/chat';
import type { ApiPost, ApiUser } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RequesterChat'>;

function appendUnique(prev: ApiChatMessage[], msg: ApiChatMessage): ApiChatMessage[] {
  return prev.some((m) => m.id === msg.id) ? prev : [...prev, msg];
}

export default function RequesterChat({ navigation, route }: Props) {
  const state = useAppState();
  const { planId, requesterId, name } = route.params;
  const [msgs, setMsgs] = useState<ApiChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [peer, setPeer] = useState<ApiUser | null>(null);
  const [plan, setPlan] = useState<ApiPost | null>(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  useChatThreadRead(planId, requesterId);

  useFocusEffect(
    useCallback(() => {
      chatApi.listDmThread(requesterId, planId).then(setMsgs).finally(() => setLoaded(true));
      usersApi.getPublicProfile(requesterId).then(setPeer).catch(() => {});
      postsApi.getPost(planId).then(setPlan).catch(() => {});
      const disconnect = connectSse<ApiChatMessage>(
        chatApi.dmPath(requesterId, planId, '/stream'),
        (msg) => setMsgs((prev) => appendUnique(prev, msg)),
      );
      return disconnect;
    }, [requesterId, planId]),
  );

  const send = async () => {
    const t = draft.trim();
    if (!t) return;
    setError('');
    try {
      const msg = await chatApi.sendDm(requesterId, t, planId);
      setDraft('');
      setMsgs((prev) => appendUnique(prev, msg));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't send that. Try again.");
    }
  };

  const first = name.split(' ')[0];
  const isHost = !!plan && plan.hostId === state.userId;
  const card = plan && toPostCard(plan);
  const subtitle = [peer?.aggregatedRating ? `★ ${ratingText(peer.aggregatedRating)}` : null, 'tap for profile'].filter(Boolean).join(' · ');
  const last = msgs[msgs.length - 1];
  const openProfile = () => navigation.navigate('RequesterProfile', { userId: requesterId });

  return (
    <View style={styles.screen}>
      <Header
        variant="convo"
        left={
          <Pressable onPress={openProfile}>
            <Text numberOfLines={1} style={styles.title}>{name}</Text>
            <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text>
          </Pressable>
        }
        action="Profile"
        onAction={openProfile}
        onBack={() => navigation.goBack()}
      />
      <ChatBody footer={<Composer value={draft} onChange={setDraft} onSend={send} placeholder={`Message ${first}`} />}>
        {!!card && (
          <Pressable
            onPress={() => navigation.navigate(isHost ? 'PlanManage' : 'Detail', { id: card.id })}
            style={styles.about}
          >
            <Text style={text.fieldLabel}>Hangout</Text>
            <Text style={styles.aboutTitle} numberOfLines={1}>{card.title}</Text>
            <View style={styles.aboutMeta}>
              <FontAwesome name="calendar-o" size={12} color={colors.zinc500} />
              <Text style={styles.aboutSub} numberOfLines={1}>{card.whenShort} · {card.seatsFilled} joined</Text>
            </View>
          </Pressable>
        )}
        {loaded && msgs.length === 0 && (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <EmptyState shape="bubble" tone="sky" title={`Say hi to ${first}`} body="No messages yet. Keep it short — a hello is plenty." />
          </View>
        )}
        {msgs.map((m) => (
          <Bubble
            key={m.id}
            m={{ id: m.id, text: m.text, mine: m.authorId === state.userId, authorInitials: initialsOf(m.author.name), authorPhoto: m.author.profilePicture, authorTone: [colors.amber, colors.ink] }}
          />
        ))}
        {!!last && last.authorId === state.userId && (
          <Text style={styles.meta}>Sent · {chatTime(last.createdAt)}</Text>
        )}
        {!!error && <Text style={[styles.meta, { color: colors.roseInk }]}>{error}</Text>}
      </ChatBody>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.zinc100 },
  title: { fontFamily: font.bold, fontSize: 16.5, letterSpacing: -0.4, color: colors.ink },
  subtitle: { fontFamily: font.medium, fontSize: 12, color: colors.zinc500, marginTop: 2 },
  about: { backgroundColor: colors.white, borderRadius: 20, padding: 15 },
  aboutTitle: { fontFamily: font.bold, fontSize: 13.5, color: colors.ink, marginTop: 4 },
  aboutMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  aboutSub: { fontFamily: font.regular, fontSize: 11.5, color: colors.zinc500 },
  meta: { alignSelf: 'flex-end', fontFamily: font.semibold, fontSize: 10.5, color: colors.zinc400 },
});
