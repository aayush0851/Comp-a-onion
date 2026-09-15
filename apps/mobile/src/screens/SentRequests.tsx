import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { EmptyState, Header, ListRow } from '../components/widgets';
import { joinRequestsApi } from '../api';
import type { ApiJoinRequest } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SentRequests'>;

const STATUS_LABEL: Record<ApiJoinRequest['status'], string> = {
  PENDING: 'Waiting on the host',
  APPROVED: "You're in",
  DECLINED: 'Not this time',
  EXPIRED: 'Expired',
};

const STATUS_TONE: Record<ApiJoinRequest['status'], 'peach' | 'sage' | 'sand'> = {
  PENDING: 'sand',
  APPROVED: 'sage',
  DECLINED: 'peach',
  EXPIRED: 'peach',
};

export default function SentRequests({ navigation }: Props) {
  const [items, setItems] = useState<ApiJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      joinRequestsApi.listMine().then(setItems).finally(() => setLoading(false));
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    joinRequestsApi.listMine().then(setItems).finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    const unread = items.filter((jr) => jr.status !== 'PENDING' && !jr.lastReadAt);
    unread.forEach((jr) => joinRequestsApi.markRead(jr.id).catch(() => {}));
  }, [items]);

  return (
    <View style={styles.screen}>
      <Header variant="stack" title="Requests you've sent" subtitle="Everything you've asked to join, and where it stands." onBack={() => navigation.navigate('Profile')} />
      {loading ? (
        <ActivityIndicator color={colors.clay} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <View style={{ paddingTop: 40 }}>
          <EmptyState
            shape="square"
            tone="sand"
            title="Nothing sent yet"
            body="Ask to join a plan and it'll show up here with the host's answer."
            cta="See tonight's board"
            onPressCta={() => navigation.navigate('Board')}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.clay} />}
        >
          {items.map((jr) => (
            <ListRow
              key={jr.id}
              title={jr.event?.title ?? 'A plan'}
              meta={STATUS_LABEL[jr.status]}
              initials={(jr.event?.title ?? '??').slice(0, 2).toUpperCase()}
              tone={STATUS_TONE[jr.status]}
              chevron={jr.status !== 'DECLINED'}
              onPress={jr.status !== 'DECLINED' ? () => navigation.navigate('Detail', { id: jr.eventId }) : undefined}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  list: { paddingHorizontal: 20, paddingBottom: 34, gap: 10 },
});
