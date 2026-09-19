import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, ToneKey } from '../theme';
import { EmptyState, FilterChips, Header, ListSkeleton, RatingSummary, ratingText, ReviewCard, StatusScrim } from '../components/widgets';
import { initialsOf } from '../data/postDisplay';
import { shortStamp } from '../data';
import { useAppState } from '../store';
import { reviewsApi, usersApi } from '../api';
import type { ApiPersonReview } from '../api/reviews';
import { isDefined } from '@companion/common';

type Props = NativeStackScreenProps<RootStackParamList, 'MyReviews'>;

const TONES: ToneKey[] = ['amber', 'sky', 'mint', 'zinc'];

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

  const rated = received.filter((r) => isDefined(r.rating));
  const dist = [5, 4, 3, 2, 1].map((star) => (rated.length ? Math.round((rated.filter((r) => r.rating === star).length / rated.length) * 100) : 0));
  const traits = useMemo(() => {
    const counts = new Map<string, number>();
    received.forEach((r) => r.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([label, n]) => ({ label, n: String(n) }));
  }, [received]);

  const filters = [`All ${received.length}`, '5 star', '4 star', 'With notes'];
  const reviews = useMemo(() => received.filter((r) => {
    if (filter === 1) return r.rating === 5;
    if (filter === 2) return r.rating === 4;
    if (filter === 3) return !!r.note?.trim();
    return true;
  }), [filter, received]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 34, flexGrow: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />}>
        <Header
          variant="stack"
          title="Your ratings"
          subtitle="What people said after meeting you. They saw yours at the same moment."
          onBack={() => navigation.navigate('Profile')}
        />
        {loading ? (
          <ListSkeleton />
        ) : received.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 60 }}>
            <EmptyState
              tone="amber"
              title="No reputation yet"
              body="Go to one hangout and your record starts filling in."
              cta="See tonight's hangouts"
              onPressCta={() => navigation.navigate('Board')}
            />
          </View>
        ) : (
          <View style={styles.body}>
            <View style={{ paddingHorizontal: 16 }}>
              <RatingSummary value={rating} count={received.length} dist={dist} traits={traits} />
            </View>
            <FilterChips scroll items={filters} active={filter} onChange={setFilter} />
            <View style={{ gap: 11, paddingHorizontal: 16 }}>
              {reviews.map((r, i) => {
                const reviewer = r.review.reviewer;
                return (
                  <ReviewCard
                    key={r.id}
                    plan={r.review.post.title}
                    date={shortStamp(r.review.createdAt)}
                    rating={r.rating ?? 0}
                    showStars={isDefined(r.rating)}
                    body={r.note}
                    reviewer={`${reviewer.name ?? 'Someone'}${reviewer.aggregatedRating ? ` · ${ratingText(reviewer.aggregatedRating)} rating` : ''}`}
                    initials={initialsOf(reviewer.name)}
                    photo={reviewer.profilePicture}
                    tone={TONES[i % TONES.length]}
                    tags={r.tags}
                    reply={state.reviewReplies[r.id]}
                    onPress={() => navigation.navigate('ReviewDetail', { reviewId: r.id })}
                  />
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
      <StatusScrim />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, gap: 14 },
});
