import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { Header, ListRow } from '../components/widgets';
import { useAppState } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'EventChats'>;

export default function EventChats({ navigation, route }: Props) {
  const state = useAppState();
  const plan = state.publishedPlans.find((p) => p.id === route.params.planId);

  if (!plan) {
    return (
      <View style={styles.screen}>
        <Header variant="stack" title="Chats" onBack={() => navigation.navigate('ChatList')} />
      </View>
    );
  }

  const threads = plan.requesters
    .filter((r) => (state.requesterMsgs[r.id] ?? []).length > 0)
    .map((r) => ({ requester: r, msgs: state.requesterMsgs[r.id] }));

  return (
    <View style={styles.screen}>
      <Header variant="stack" title={plan.title} subtitle="Individual chats for this plan" onBack={() => navigation.navigate('ChatList')} />
      <ScrollView contentContainerStyle={styles.list}>
        {threads.map(({ requester, msgs }) => {
          const lastMsg = msgs[msgs.length - 1];
          return (
            <ListRow
              key={requester.id}
              title={requester.name}
              meta={`${lastMsg.mine ? 'You: ' : ''}${lastMsg.text}`}
              initials={requester.initials}
              tone={requester.tone}
              onPress={() => navigation.navigate('RequesterChat', { planId: plan.id, requesterId: requester.id, name: requester.name })}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  list: { paddingHorizontal: 20, paddingBottom: 34, gap: 10 },
});
