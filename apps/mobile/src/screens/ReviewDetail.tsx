import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, scale, shadow } from '../theme';
import { Btn, Header, Stars, UserChip } from '../components/widgets';
import { initialsOf } from '../data/eventDisplay';
import { useAppDispatch, useAppState } from '../store';
import { reviewsApi } from '../api';
import type { ApiPersonReview } from '../api/reviews';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewDetail'>;

export default function ReviewDetail({ navigation, route }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [review, setReview] = useState<ApiPersonReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      reviewsApi.listReceived()
        .then((all) => {
          const found = all.find((r) => r.id === route.params.reviewId) ?? null;
          setReview(found);
          setDraft(state.reviewReplies[route.params.reviewId] ?? '');
        })
        .finally(() => setLoading(false));
    }, [route.params.reviewId]),
  );

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header variant="stack" title="Review" onBack={() => navigation.goBack()} />
        <ActivityIndicator color={colors.clay} style={{ marginTop: 40 }} />
      </View>
    );
  }

  if (!review) {
    return (
      <View style={styles.screen}>
        <Header variant="stack" title="Review" onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const reviewerName = review.review.reviewer.name ?? 'Someone';
  const date = new Date(review.review.createdAt).toLocaleDateString();

  const post = () => {
    if (!draft.trim()) return;
    dispatch({ type: 'POST_REVIEW_REPLY', reviewId: review.id, reply: draft.trim() });
  };

  return (
    <View style={styles.screen}>
      <Header variant="stack" title="Review" subtitle={`From ${reviewerName} · ${date}`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <UserChip
            name={reviewerName}
            initials={initialsOf(review.review.reviewer.name)}
            rating={review.review.reviewer.aggregatedRating || undefined}
          />
          <View style={{ marginTop: 15 }}><Stars value={review.rating ?? 0} size="l" /></View>
          {!!review.note && (
            <Text style={[scale.body, { fontSize: 15, lineHeight: 23, color: '#453F39', marginTop: 13 }]}>{review.note}</Text>
          )}
          {!!review.tags.length && (
            <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap', marginTop: 14 }}>
              {review.tags.map((t) => (
                <View key={t} style={styles.tag}><Text style={styles.tagLabel}>{t}</Text></View>
              ))}
            </View>
          )}
          <View style={styles.planRow}>
            <View style={styles.planThumb} />
            <Text style={{ flex: 1, fontFamily: 'Figtree_600SemiBold', fontSize: 12.5, color: colors.inkSecondary }} numberOfLines={1}>{review.review.event.title}</Text>
          </View>
        </View>

        <View style={styles.replyCard}>
          <Text style={styles.replyLabel}>Your reply — public, once</Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            multiline
            placeholder="Say thanks, or set the record straight. 240 characters."
            placeholderTextColor={colors.faint}
            maxLength={240}
            style={styles.replyInput}
          />
          <View style={{ flexDirection: 'row', gap: 9, marginTop: 12 }}>
            <View style={{ flex: 1 }}><Btn label="Post reply" variant="primary" onPress={post} /></View>
            <View style={{ width: 104 }}><Btn label="Report" variant="danger" onPress={() => navigation.navigate('ReportReview', { reviewId: review.id })} /></View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 34, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 18, ...shadow.card },
  tag: { backgroundColor: '#F8F2EC', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  tagLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 11, color: colors.inkSecondary },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line },
  planThumb: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.neutralAvatar },
  replyCard: { backgroundColor: colors.surface, borderRadius: radius.inner, padding: 16, ...shadow.inner },
  replyLabel: { fontFamily: 'Figtree_700Bold', fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.faint },
  replyInput: { backgroundColor: '#F8F5F0', borderRadius: 14, minHeight: 84, padding: 13, fontSize: 13.5, lineHeight: 20, color: colors.ink, marginTop: 10, textAlignVertical: 'top' },
});
