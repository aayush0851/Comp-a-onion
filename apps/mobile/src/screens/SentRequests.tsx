import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, ToneKey } from '../theme';
import { EmptyState, Header, ListRow, ListSkeleton, StatusScrim } from '../components/widgets';
import { initialsOf } from '../data/postDisplay';
import { joinRequestsApi } from '../api';
import type { ApiJoinRequest } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SentRequests'>;

const STATUS: Record<ApiJoinRequest['status'], { meta: string; right: string; tone: ToneKey; pill?: string; pillTone?: 'amber' | 'sky' | 'ink' | 'zinc' }> = {
  PENDING: { meta: 'Waiting on the host', right: 'Asked', tone: 'sky', pill: 'PENDING', pillTone: 'sky' },
  APPROVED: { meta: "You're in — the chat is open", right: 'In', tone: 'amber', pill: 'IN', pillTone: 'amber' },
  DECLINED: { meta: 'Not this time', right: 'Passed', tone: 'zinc' },
  EXPIRED: { meta: 'Expired before the host decided', right: 'Expired', tone: 'zinc' },
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
      <ScrollView contentContainerStyle={{ paddingBottom: 34, flexGrow: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />}>
        <Header variant="stack" title="Requests you've sent" subtitle="Everything you've asked to join, and where it stands." onBack={() => navigation.navigate('Profile')} />
        {loading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
            <EmptyState
              shape="square"
              tone="sky"
              title="Nothing sent yet"
              body="Ask to join a hangout and it'll show up here with the host's answer."
              cta="See tonight's board"
              onPressCta={() => navigation.navigate('Board')}
            />
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((jr) => {
              const s = STATUS[jr.status];
              const open = jr.status !== 'DECLINED';
              return (
                <ListRow
                  key={jr.id}
                  title={jr.post?.title ?? 'A hangout'}
                  meta={s.meta}
                  initials={initialsOf(jr.post?.title ?? null)}
                  squircle
                  tone={s.tone}
                  pill={s.pill}
                  pillTone={s.pillTone}
                  chevron={open}
                  onPress={open ? () => navigation.navigate(jr.status === 'APPROVED' ? 'Chat' : 'Detail', { id: jr.postId }) : undefined}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
      <StatusScrim />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  list: { paddingTop: 6, paddingHorizontal: 20, gap: 9 },
});
