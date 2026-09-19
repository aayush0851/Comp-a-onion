import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, seatTones, ToneKey } from '../theme';
import { useAppDispatch } from '../store';
import { BackButton, Btn, CheckDot, EmptyState, Footer, Header, ListRow, ListSkeleton, Notice, SectionLabel, Sheet, UserChip, StatusScrim } from '../components/widgets';
import { costModeLabel, genderRestrictionLabel } from '../data';
import { MAP_LINK_LABEL, mapLinkOf, openMapLink } from '../data/mapLink';
import { formatPostDate, formatPostTime, initialsOf } from '../data/postDisplay';
import { fromApiCostMode, fromApiGenderRestriction } from '../api/types';
import { postsApi, joinRequestsApi, notificationsApi, reviewsApi } from '../api';
import { useLivePost } from '../realtime';
import type { ApiPost, ApiJoinRequest, ApiUser } from '../api/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanManage'>;

const PERSON_TONES: ToneKey[] = ['amber', 'sky', 'mint', 'zinc'];

export default function PlanManage({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [post, setPost] = useState<ApiPost | null>(null);
  const [pending, setPending] = useState<ApiJoinRequest[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [deciding, setDeciding] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchPlan = useCallback(() => {
    setError(false);
    return Promise.all([
      postsApi.getPost(route.params.id),
      joinRequestsApi.listForHost(route.params.id),
      reviewsApi.hasReviewed(route.params.id),
    ])
      .then(([e, jrs, mine]) => {
        setPost(e); setPending(jrs); setReviewed(!!mine);
        // Opening the hangout acknowledges the requests that were waiting on it.
        notificationsApi.markPostNotificationsRead(route.params.id, ['JOIN_REQUEST']).catch(() => {});
        dispatch({ type: 'CLEAR_POST_UPDATE', postId: route.params.id });
      })
      .catch((e) => { console.error('PlanManage load failed', e); setError(true); });
  }, [route.params.id, dispatch]);

  const load = useCallback(() => {
    setLoading(true);
    fetchPlan().finally(() => setLoading(false));
  }, [fetchPlan]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useLivePost(route.params.id, fetchPlan);
  useFocusEffect(useCallback(() => { notificationsApi.setOpenPost(route.params.id); return () => notificationsApi.setOpenPost(null); }, [route.params.id]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPlan().finally(() => setRefreshing(false));
  }, [fetchPlan]);

  const back = () => navigation.navigate('MyPlans');

  if (error || loading || !post) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.white }]}>
        <Header variant="stack" title="Your hangout" onBack={back} />
        {error ? (
          <EmptyState tone="zinc" title="Couldn't load this hangout." body="Check your connection and try again." cta="Try again" ctaVariant="secondary" onPressCta={load} />
        ) : (
          <ListSkeleton />
        )}
      </View>
    );
  }

  const decide = async (id: string, decision: 'APPROVED' | 'DECLINED') => {
    setDeciding(id);
    try {
      await joinRequestsApi.decide(id, decision);
      await load();
    } finally {
      setDeciding(null);
    }
  };

  const archive = async () => {
    setConfirmDelete(false);
    await postsApi.archivePost(post.id);
    dispatch({ type: 'CLEAR_POST_UPDATE', postId: post.id });
    load();
  };

  const message = (u: ApiUser) => navigation.navigate('RequesterChat', { planId: post.id, requesterId: u.id, name: u.name ?? 'Someone' });
  const openProfile = (u: ApiUser) => navigation.navigate('RequesterProfile', { userId: u.id });
  const came = post.seatsFilled;
  const waiting = pending.filter((jr) => jr.status === 'PENDING');
  const passed = pending.filter((jr) => jr.status === 'DECLINED');

  if (post.isArchived) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.white }]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />}>
          <Header
            variant="stack"
            eyebrow={`Completed · ${formatPostDate(post.date)}`}
            title={post.title}
            subtitle={`${mapLinkOf(post.venue) ? MAP_LINK_LABEL : post.venue ?? 'Flexible'} · ${came === 0 ? 'nobody came' : `${came} ${came === 1 ? 'person' : 'people'} came`}`}
            onBack={back}
          />
          <View style={styles.body}>
            {!!post.description && <Text style={[styles.postDescription, { marginTop: -8 }]}>{post.description}</Text>}
            {came > 0 && !reviewed && (
              <View style={styles.rateCard}>
                <Text style={styles.rateTitle}>Rate the {came === 1 ? 'one' : came} who came</Text>
                <Text style={styles.rateBody}>Both sides unlock at the same moment. Nobody sees theirs first.</Text>
                <View style={{ flexDirection: 'row', gap: 9, marginTop: 15 }}>
                  <Pressable onPress={() => navigation.navigate('Review', { planId: post.id })} style={[styles.rateBtn, { flex: 1, backgroundColor: colors.amber }]}>
                    <Text style={[styles.rateBtnLabel, { color: colors.ink }]}>Start rating</Text>
                  </Pressable>
                  <Pressable onPress={back} style={[styles.rateBtn, { paddingHorizontal: 17, backgroundColor: colors.zinc800 }]}>
                    <Text style={[styles.rateBtnLabel, { color: colors.zinc200 }]}>Later</Text>
                  </Pressable>
                </View>
              </View>
            )}
            {came > 0 && reviewed && (
              <View style={styles.doneCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                  <CheckDot size={28} />
                  <Text style={styles.doneTitle}>Your review is in</Text>
                </View>
                <Text style={styles.doneBody}>It unlocks for everyone at the same moment.</Text>
                <Pressable onPress={() => navigation.navigate('MyReviews')} style={styles.doneFoot}>
                  <Text style={styles.doneLink}>See reviews ›</Text>
                </Pressable>
              </View>
            )}
            {came === 0 && <Notice tone="zinc">Nobody joined this one. It happens — the next one is a fresh start.</Notice>}
            {came > 0 && <SectionLabel>Who came</SectionLabel>}
            {post.going.map((u, i) => (
              <ListRow
                key={u.id}
                title={u.name ?? 'Someone'}
                meta={reviewed ? 'Came · you rated' : 'Came · not rated yet'}
                initials={initialsOf(u.name)}
                photo={u.profilePicture}
                tone={PERSON_TONES[i % PERSON_TONES.length]}
                pill={reviewed ? null : 'RATE'}
                right={reviewed ? 'Rated' : null}
                chevron
                onPress={() => openProfile(u)}
              />
            ))}
          </View>
        </ScrollView>
        <StatusScrim />
      </View>
    );
  }

  const approvalRequired = post.entryMode === 'APPROVE';
  const when = `${formatPostDate(post.date)} · ${formatPostTime(post.time)}`;
  const details = [when, mapLinkOf(post.venue) ? MAP_LINK_LABEL : post.venue || 'Venue TBD', genderRestrictionLabel(fromApiGenderRestriction(post.genderRestriction)), costModeLabel(fromApiCostMode(post.costMode))]
    .filter(Boolean).join(' · ');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />}>
        <View style={[styles.topRow, { paddingTop: insets.top + 2 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <BackButton onPress={back} onSurface />
          </View>
          <Text style={styles.filled}>{came} of {post.seatsTotal} filled</Text>
        </View>
        <View style={{ paddingTop: 14, paddingHorizontal: 20 }}>
          <Text style={styles.postLine} numberOfLines={2}>{post.title} · {details}</Text>
          {!!mapLinkOf(post.venue) && (
            <Pressable onPress={() => openMapLink(mapLinkOf(post.venue)!)} hitSlop={6}>
              <Text style={styles.mapLink}>{MAP_LINK_LABEL} ›</Text>
            </Pressable>
          )}
          {!!post.description && <Text style={styles.postDescription} numberOfLines={3}>{post.description}</Text>}
          <Text style={styles.bigTitle}>{approvalRequired ? "Who's asking to join" : "Who's in"}</Text>
          <Text style={styles.subtitle}>
            {approvalRequired
              ? waiting.length === 0 ? 'Nobody has asked yet. Requests land here the moment they come in.' : `${waiting.length} ${waiting.length === 1 ? 'person' : 'people'} asked to join your group.`
              : 'Open seats — people take one straight away, no queue.'}
          </Text>
        </View>

        <View style={styles.cards}>
          {approvalRequired && waiting.map((jr) => (
            <View key={jr.id} style={styles.card}>
              <View style={styles.cardHead}>
                <View style={{ flex: 1 }}>
                  <UserChip
                    name={jr.user?.name ?? 'Someone'}
                    initials={initialsOf(jr.user?.name ?? null)}
                    photo={jr.user?.profilePicture}
                    rating={jr.user?.aggregatedRating || undefined}
                    chevron={!!jr.user}
                    onPress={jr.user ? () => openProfile(jr.user!) : undefined}
                  />
                </View>
              </View>
              {!!jr.introText && <Text style={styles.intro}>“{jr.introText}”</Text>}
              <View style={{ flexDirection: 'row', gap: 9, marginTop: 14 }}>
                <Btn label="Pass" variant="secondary" full={false} style={{ width: 112 }} onPress={() => decide(jr.id, 'DECLINED')} />
                <Btn label="Let them in" glyph="✓" variant="amber" style={{ flex: 1 }} loading={deciding === jr.id} onPress={() => decide(jr.id, 'APPROVED')} />
              </View>
              {!!jr.user && (
                <Pressable onPress={() => message(jr.user!)} style={styles.messageLink} hitSlop={6}>
                  <Text style={styles.messageLabel}>Message first</Text>
                </Pressable>
              )}
            </View>
          ))}

          {post.going.map((u, i) => (
            <View key={u.id} style={styles.card}>
              <UserChip
                name={u.name ?? 'Someone'}
                initials={initialsOf(u.name)}
                photo={u.profilePicture}
                tone={PERSON_TONES[i % PERSON_TONES.length]}
                rating={u.aggregatedRating || undefined}
                chevron
                onPress={() => openProfile(u)}
              />
              <View style={styles.inRow}>
                <CheckDot size={20} />
                <Text style={styles.inLabel}>In — they've got the group chat</Text>
                <Pressable onPress={() => message(u)} hitSlop={6}>
                  <Text style={styles.seatLabel}>Message</Text>
                </Pressable>
              </View>
            </View>
          ))}

          {approvalRequired && waiting.length === 0 && post.going.length === 0 && passed.length === 0 && (
            <View style={styles.card}>
              <EmptyState shape="square" tone="amber" title="Your queue is empty." body="When someone asks to join, their one line lands here. You decide — they never see a no." />
            </View>
          )}
          {passed.length > 0 && <SectionLabel>Passed</SectionLabel>}
          {passed.map((jr) => (
            <View key={jr.id} style={styles.card}>
              <UserChip
                name={jr.user?.name ?? 'Someone'}
                initials={initialsOf(jr.user?.name ?? null)}
                photo={jr.user?.profilePicture}
                rating={jr.user?.aggregatedRating || undefined}
                chevron={!!jr.user}
                onPress={jr.user ? () => openProfile(jr.user!) : undefined}
              />
              {!!jr.introText && <Text style={styles.intro}>“{jr.introText}”</Text>}
              <View style={{ marginTop: 14 }}>
                <Btn label="Let them in after all" glyph="✓" variant="secondary" loading={deciding === jr.id} onPress={() => decide(jr.id, 'APPROVED')} />
              </View>
            </View>
          ))}

          {!approvalRequired && post.going.length === 0 && (
            <View style={styles.card}>
              <EmptyState tone="zinc" title="No one's in yet." body="Open seats fill up fast once people see it on the board." />
            </View>
          )}
        </View>

      </ScrollView>
      <StatusScrim color={colors.zinc100} />
      <Footer style={{ backgroundColor: colors.zinc100 }}>
        {post.seatsTotal > 2 ? (
          <Btn label={`Open Group Chat (${came}/${post.seatsTotal} filled)`} onPress={() => navigation.navigate('Chat', { id: post.id })} />
        ) : post.going[0] && (
          <Btn label={`Chat with ${post.going[0].name?.split(' ')[0] ?? 'your guest'}`} onPress={() => message(post.going[0])} />
        )}
        <View style={{ marginTop: 8 }}>
          <Btn label="Delete this hangout" variant="danger" onPress={() => setConfirmDelete(true)} />
        </View>
        <Sheet visible={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this hangout?" sub="It will be closed to new joiners and moved to your completed plans.">
          <View style={{ gap: 9, marginTop: 18 }}>
            <Btn label="Yes, delete" variant="danger" onPress={archive} />
            <Btn label="Cancel" variant="secondary" onPress={() => setConfirmDelete(false)} />
          </View>
        </Sheet>
      </Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.zinc100 },
  body: { paddingTop: 6, paddingHorizontal: 20, gap: 11 },
  rateCard: { backgroundColor: colors.ink, borderRadius: 20, padding: 18 },
  rateTitle: { fontFamily: font.extrabold, fontSize: 16, letterSpacing: -0.4, color: colors.white },
  rateBody: { fontFamily: font.regular, fontSize: 13, lineHeight: 20, color: colors.zinc400, marginTop: 6 },
  rateBtn: { minHeight: 46, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  rateBtnLabel: { fontFamily: font.bold, fontSize: 13.5 },
  doneCard: { backgroundColor: colors.mint, borderRadius: 20, padding: 17 },
  doneTitle: { fontFamily: font.extrabold, fontSize: 15, color: colors.mintInk },
  doneBody: { fontFamily: font.regular, fontSize: 13, lineHeight: 20, color: colors.mintInk, opacity: 0.85, marginTop: 9 },
  doneFoot: { marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: 'rgba(4,120,87,.2)', alignItems: 'flex-end' },
  doneLink: { fontFamily: font.extrabold, fontSize: 12, color: colors.mintInk },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20, minHeight: 44 },
  filled: { fontFamily: font.bold, fontSize: 11.5, color: colors.zinc500 },
  mapLink: { fontFamily: font.bold, fontSize: 12.5, color: colors.amberInk, textDecorationLine: 'underline', marginBottom: 9 },
  postLine: { fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.zinc400, marginBottom: 9 },
  postDescription: { fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: colors.zinc500, marginBottom: 9, marginTop: -3 },
  bigTitle: { fontFamily: font.extrabold, fontSize: 27, lineHeight: 32, letterSpacing: -1, color: colors.ink },
  subtitle: { fontFamily: font.regular, fontSize: 14, lineHeight: 21, color: colors.zinc500, marginTop: 8 },
  cards: { paddingTop: 18, paddingHorizontal: 16, gap: 11 },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 16 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  intro: { fontFamily: font.italic, fontSize: 13.5, lineHeight: 20, color: colors.zinc700, marginTop: 12 },
  messageLink: { alignSelf: 'center', marginTop: 10 },
  messageLabel: { fontFamily: font.bold, fontSize: 12, color: colors.zinc500 },
  inRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 13, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.zinc100 },
  inLabel: { flex: 1, fontFamily: font.bold, fontSize: 12.5, color: colors.mintInk },
  seatLabel: { fontFamily: font.bold, fontSize: 11.5, color: colors.zinc400 },
});
