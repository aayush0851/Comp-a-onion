import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { EmptyState, FilterChips, Header, RatingSummary, ReviewCard } from '../components/widgets';
import { RATING_DIST, RATING_TRAITS, RECEIVED_REVIEWS } from '../data';
import { myAverageRating, useAppState } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'MyReviews'>;

const FILTERS = ['All', '5 star', '4 star', 'With notes'];

export default function MyReviews({ navigation }: Props) {
  const state = useAppState();
  const [filter, setFilter] = useState(0);
  const reviews = useMemo(() => RECEIVED_REVIEWS.filter((r) => {
    if (filter === 1) return r.rating === 5;
    if (filter === 2) return r.rating === 4;
    if (filter === 3) return r.body.trim().length > 0;
    return true;
  }), [filter]);

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        title="Your ratings"
        subtitle="What people said after meeting you. They saw yours at the same moment."
        onBack={() => navigation.navigate('Profile')}
      />
      {RECEIVED_REVIEWS.length === 0 ? (
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
        <ScrollView contentContainerStyle={styles.body}>
          <RatingSummary value={myAverageRating()} count={RECEIVED_REVIEWS.length} dist={RATING_DIST} traits={RATING_TRAITS} />
          <FilterChips items={FILTERS} active={filter} onChange={setFilter} />
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              reviewer={r.reviewer}
              initials={r.initials}
              tone={r.tone}
              reviewerRating={r.reviewerRating}
              reviewerCount={r.reviewerCount}
              rating={r.rating}
              date={r.date}
              body={r.body}
              tags={r.tags}
              plan={r.plan}
              reply={state.reviewReplies[r.id] ?? r.reply}
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
