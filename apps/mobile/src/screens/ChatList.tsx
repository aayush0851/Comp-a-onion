import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { EmptyState, FilterChips, Header, ListRow, TabBar } from '../components/widgets';
import { ACTIVITIES, CHAT_SEED } from '../data';
import { useAppState } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

const FILTERS = ['All', 'Plans', 'People'];

export default function ChatList({ navigation }: Props) {
  const state = useAppState();
  const [filter, setFilter] = useState(0);
  const eventChats = ACTIVITIES.filter((a) => a.id === 'ramen' || state.requested.includes(a.id));

  const hostedEvents = state.publishedPlans.flatMap((plan) => {
    const threads = plan.requesters.filter((r) => (state.requesterMsgs[r.id] ?? []).length > 0);
    if (threads.length === 0) return [];
    const msgsPerThread = threads.map((r) => state.requesterMsgs[r.id]);
    const lastMsg = msgsPerThread[msgsPerThread.length - 1].slice(-1)[0];
    return [{ plan, threadCount: threads.length, lastMsg }];
  });

  const isEmpty = eventChats.length === 0 && hostedEvents.length === 0;

  return (
    <View style={styles.screen}>
      <Header
        variant="home"
        title="Chats"
        subtitle="A chat opens the moment a host says yes."
        action="3 unread"
        actionDot
        onAction={() => navigation.navigate('Notifications')}
      />
      <View style={{ flex: 1 }}>
        {!isEmpty && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
            <FilterChips items={FILTERS} active={filter} onChange={setFilter} />
          </View>
        )}

        {isEmpty ? (
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
          <ScrollView contentContainerStyle={styles.list}>
            {eventChats.map((a) => {
              const lastMsg = a.id === 'ramen' ? CHAT_SEED[CHAT_SEED.length - 1] : null;
              return (
                <ListRow
                  key={a.id}
                  title={a.title}
                  meta={lastMsg ? `${lastMsg.mine ? 'You' : lastMsg.author}: ${lastMsg.text}` : 'Say hi to start the conversation.'}
                  initials={a.hostInitials}
                  tone="peach"
                  right={a.time}
                  onPress={() => navigation.navigate('Chat', { id: a.id })}
                />
              );
            })}
            {hostedEvents.map(({ plan, threadCount, lastMsg }) => (
              <ListRow
                key={plan.id}
                title={plan.title}
                meta={`${lastMsg.mine ? 'You: ' : ''}${lastMsg.text}`}
                initials={plan.title.slice(0, 2).toUpperCase()}
                tone="sand"
                unread={threadCount > 1 ? threadCount : undefined}
                onPress={() => navigation.navigate('EventChats', { planId: plan.id })}
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
