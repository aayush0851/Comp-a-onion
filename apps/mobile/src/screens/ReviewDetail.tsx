import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, text } from '../theme';
import { Avatar, Btn, EmptyState, Header, ListSkeleton, Stars, UserChip, StatusScrim } from '../components/widgets';
import { formatPostDate, initialsOf } from '../data/postDisplay';
import { useAppDispatch, useAppState } from '../store';
import { reviewsApi } from '../api';
import type { ApiPersonReview } from '../api/reviews';
import { isDefined } from '@companion/common';

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
          setReview(all.find((r) => r.id === route.params.reviewId) ?? null);
          setDraft(state.reviewReplies[route.params.reviewId] ?? '');
        })
        .finally(() => setLoading(false));
    }, [route.params.reviewId]),
  );

  if (loading || !review) {
    return (
      <View style={styles.screen}>
        <Header variant="stack" title="Review" onBack={() => navigation.goBack()} />
        {loading ? <ListSkeleton /> : <EmptyState tone="zinc" title="Review not found" body="It may have been removed." />}
      </View>
    );
  }

  const reviewer = review.review.reviewer;
  const reviewerName = reviewer.name ?? 'Someone';
  const date = formatPostDate(review.review.createdAt);
  const existingReply = state.reviewReplies[review.id];

  const post = () => {
    if (!draft.trim()) return;
    dispatch({ type: 'POST_REVIEW_REPLY', reviewId: review.id, reply: draft.trim() });
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 34 }} keyboardShouldPersistTaps="handled">
        <Header variant="stack" title="Review" subtitle={`From ${reviewerName} · ${date}`} onBack={() => navigation.goBack()} />
        <View style={styles.body}>
          <View style={styles.card}>
            <UserChip
              name={reviewerName}
              initials={initialsOf(reviewer.name)}
              photo={reviewer.profilePicture}
              rating={reviewer.aggregatedRating || undefined}
              chevron
              onPress={() => navigation.navigate('RequesterProfile', { userId: reviewer.id })}
            />
            {isDefined(review.rating) && <View style={{ marginTop: 15 }}><Stars value={review.rating} size="l" showValue={false} /></View>}
            {!!review.note && <Text style={styles.note}>“{review.note}”</Text>}
            {review.tags.length > 0 && (
              <View style={styles.tags}>
                {review.tags.map((t) => (
                  <View key={t} style={styles.tag}><Text style={styles.tagLabel}>{t}</Text></View>
                ))}
              </View>
            )}
            <View style={styles.planRow}>
              <Avatar initials={initialsOf(review.review.post.title).slice(0, 1)} size={30} rounded={9} tone="amber" />
              <Text style={styles.planText} numberOfLines={1}>{review.review.post.title} · {formatPostDate(review.review.post.date)}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={text.fieldLabel}>Your reply — public, once</Text>
            {existingReply ? (
              <Text style={styles.reply}>{existingReply}</Text>
            ) : (
              <TextInput
                value={draft}
                onChangeText={setDraft}
                multiline
                placeholder="Say thanks, or set the record straight. 240 characters."
                placeholderTextColor={colors.zinc400}
                maxLength={240}
                style={styles.replyInput}
              />
            )}
            <View style={{ flexDirection: 'row', gap: 9, marginTop: 12 }}>
              {!existingReply && <Btn label="Post reply" style={{ flex: 1 }} variant={draft.trim() ? 'primary' : 'disabled'} onPress={post} />}
              <Pressable onPress={() => navigation.navigate('ReportReview', { reviewId: review.id })} style={[styles.report, !!existingReply && { flex: 1 }]}>
                <Text style={styles.reportLabel}>Report</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <StatusScrim />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: 16, gap: 11 },
  card: { backgroundColor: colors.zinc100, borderRadius: 24, padding: 16 },
  note: { fontFamily: font.italic, fontSize: 15, lineHeight: 23, color: colors.zinc700, marginTop: 13 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14 },
  tag: { backgroundColor: colors.white, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  tagLabel: { fontFamily: font.bold, fontSize: 11.5, color: colors.zinc700 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.zinc200 },
  planText: { flex: 1, fontFamily: font.bold, fontSize: 12.5, color: colors.zinc700 },
  reply: { fontFamily: font.regular, fontSize: 13.5, lineHeight: 20, color: colors.zinc700, marginTop: 10, backgroundColor: colors.white, borderRadius: 16, padding: 14 },
  replyInput: { backgroundColor: colors.white, borderRadius: 16, minHeight: 84, padding: 14, marginTop: 10, textAlignVertical: 'top', fontFamily: font.regular, fontSize: 13.5, lineHeight: 20, color: colors.ink },
  report: { minHeight: 54, paddingHorizontal: 26, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.rose, alignItems: 'center', justifyContent: 'center' },
  reportLabel: { fontFamily: font.bold, fontSize: 15, color: colors.roseInk },
});
