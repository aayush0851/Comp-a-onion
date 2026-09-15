import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { EmptyState, FilterChips, Header, RatingSummary, ReviewCard } from '../components/widgets';
import { RATING_DIST, RATING_TRAITS } from '../data';
import { initialsOf } from '../data/eventDisplay';
import { useAppState } from '../store';
import { reviewsApi, usersApi } from '../api';
import type { ApiPersonReview } from '../api/reviews';

type Props = NativeStackScreenProps<RootStackParamList, 'MyReviews'>;

const FILTERS = ['All', '5 star', '4 star', 'With notes'];

export default function MyReviews({ navigation }: Props) {
  const state = useAppState();
  const [filter, setFilter] = useState(0);
  const [received, setReceived] = useState<ApiPersonReview[]>([]);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = useCallback(() => Promise.all([reviewsApi.listReceived(), usersApi.getMe()])
    .then(([reviews, me]) => { setReceived(reviews); setRating(me.aggregatedRating); }), []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReviews().finally(() => setLoading(false));
    }, [fetchReviews]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReviews().finally(() => setRefreshing(false));
  }, [fetchReviews]);

  const reviews = useMemo(() => received.filter((r) => {
    if (filter === 1) return r.rating === 5;
    if (filter === 2) return r.rating === 4;
    if (filter === 3) return !!r.note?.trim();
    return true;
  }), [filter, received]);

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        title="Your ratings"
        subtitle="What people said after meeting you. They saw yours at the same moment."
        onBack={() => navigation.navigate('Profile')}
      />
      {loading ? (
        <ActivityIndicator color={colors.clay} style={{ marginTop: 40 }} />
      ) : received.length === 0 ? (
        <View style={{ paddingTop: 30 }}>
          <EmptyState
            shape="circle"
            tone="peach"
            title="No ratings yet"
            body="Nobody can rate you until you've actually met. Go to one plan and this fills up."
            cta="See tonight's board"
            onPressCta={() => navigation.navigate('Board')}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.clay} />}
        >
          <RatingSummary value={rating} count={received.length} dist={RATING_DIST} traits={RATING_TRAITS} />
          <FilterChips items={FILTERS} active={filter} onChange={setFilter} />
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              reviewer={r.review.reviewer.name ?? 'Someone'}
              initials={initialsOf(r.review.reviewer.name)}
              tone="peach"
              reviewerRating={r.review.reviewer.aggregatedRating || undefined}
              rating={r.rating ?? 0}
              date={new Date(r.review.createdAt).toLocaleDateString()}
              body={r.note ?? ''}
              tags={r.tags}
              plan={r.review.event.title}
              reply={state.reviewReplies[r.id]}
              onPress={() => navigation.navigate('ReviewDetail', { reviewId: r.id })}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 34, gap: 12 },
});
