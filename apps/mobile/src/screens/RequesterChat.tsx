import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, text } from '../theme';
import { Avatar, Bubble, ChatBody, chatTime, Composer, EmptyState, Header, ratingText } from '../components/widgets';
import { formatPostTime, initialsOf } from '../data/postDisplay';
import { useAppState } from '../store';
import { chatApi, postsApi, usersApi } from '../api';
import { connectSse } from '../realtime';
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

  useFocusEffect(
    useCallback(() => {
      chatApi.listDmThread(requesterId).then(setMsgs);
      usersApi.getPublicProfile(requesterId).then(setPeer).catch(() => {});
      if (planId) postsApi.getPost(planId).then(setPlan).catch(() => {});
      const disconnect = connectSse<ApiChatMessage>(
        `/users/${requesterId}/dm/stream`,
        (msg) => setMsgs((prev) => appendUnique(prev, msg)),
      );
      return disconnect;
    }, [requesterId, planId]),
  );

  const send = async () => {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    const msg = await chatApi.sendDm(requesterId, t);
    setMsgs((prev) => appendUnique(prev, msg));
  };

  const first = name.split(' ')[0];
  const isHost = !!plan && plan.hostId === state.userId;
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
        onBack={() => (planId ? navigation.navigate('PlanManage', { id: planId }) : navigation.navigate('ChatList'))}
      />
      <ChatBody footer={<Composer value={draft} onChange={setDraft} onSend={send} placeholder={`Message ${first}`} />}>
        {!!plan && (
          <View style={styles.about}>
            <Text style={text.fieldLabel}>About this chat</Text>
            <Pressable
              onPress={() => navigation.navigate(isHost ? 'PlanManage' : 'Detail', { id: plan.id })}
              style={styles.aboutRow}
            >
              <Avatar initials={initialsOf(plan.title).slice(0, 1)} size={38} rounded={13} tone="amber" />
              <View style={{ flex: 1 }}>
                <Text style={styles.aboutTitle} numberOfLines={1}>{plan.title}</Text>
                <Text style={styles.aboutSub} numberOfLines={1}>
                  {isHost ? `${first} asked to join` : 'You asked to join'} · {formatPostTime(plan.time)}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>
        )}
        {msgs.length === 0 && (
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
      </ChatBody>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.zinc100 },
  title: { fontFamily: font.bold, fontSize: 16.5, letterSpacing: -0.4, color: colors.ink },
  subtitle: { fontFamily: font.medium, fontSize: 12, color: colors.zinc500, marginTop: 2 },
  about: { backgroundColor: colors.white, borderRadius: 20, padding: 15 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 11 },
  aboutTitle: { fontFamily: font.bold, fontSize: 13.5, color: colors.ink },
  aboutSub: { fontFamily: font.regular, fontSize: 11.5, color: colors.zinc500, marginTop: 2 },
  chevron: { fontFamily: font.bold, fontSize: 16, color: colors.zinc300 },
  meta: { alignSelf: 'flex-end', fontFamily: font.semibold, fontSize: 10.5, color: colors.zinc400 },
});
