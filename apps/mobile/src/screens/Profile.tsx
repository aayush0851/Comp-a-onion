import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, text } from '../theme';
import { Avatar, Badge, Btn, FilterChips, ListRow, ratingText, Sheet, SheetRow, Stars, StatTiles, TabBar, StatusScrim } from '../components/widgets';
import { PROFILE_TAGS } from '../data';
import { initialsOf } from '../data/postDisplay';
import { useAppDispatch, useAppState } from '../store';
import { postsApi, joinRequestsApi, reviewsApi, usersApi } from '../api';
import { uploadMedia } from '../firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type PendingReview = { postId: string; title: string };

export function memberSince(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

export default function Profile({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [editingVibe, setEditingVibe] = useState(false);
  const [rating, setRating] = useState(0);
  const [since, setSince] = useState<string | null>(null);
  const [serverPhoto, setServerPhoto] = useState<string | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [hostedCount, setHostedCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0);
  const [pendingReview, setPendingReview] = useState<PendingReview | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const displayName = state.name.trim() || 'You';

  useEffect(() => {
    usersApi.getMe().then((me) => { setRating(me.aggregatedRating); setSince(memberSince(me.createdAt)); setServerPhoto(me.profilePicture); });
    reviewsApi.listReceived().then((r) => setReviewCount(r.length));
    joinRequestsApi.listMine().then((jrs) => setJoinedCount(jrs.filter((jr) => jr.status === 'APPROVED').length));

    postsApi.listHosted().then(async (hosted) => {
      setHostedCount(hosted.length);
      const lastArchived = hosted
        .filter((e) => e.isArchived && e.seatsFilled > 0)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      if (!lastArchived) return;
      const mine = await reviewsApi.hasReviewed(lastArchived.id);
      if (!mine) setPendingReview({ postId: lastArchived.id, title: lastArchived.title });
    });
  }, []);

  const pick = async (source: 'camera' | 'library') => {
    setShowPhotoSheet(false);
    const perm = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 };
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      dispatch({ type: 'SET_PROFILE_PHOTO', uri });
      setUploadingPhoto(true);
      try {
        const url = await uploadMedia(uri);
        await usersApi.updateMe({ profilePicture: url });
      } catch (e) {
        console.error('Photo upload failed', e);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={[styles.topRow, { paddingTop: insets.top + 2 }]}>
          <Text style={styles.id}>ID # {(state.userId ?? '').slice(-4).toUpperCase() || '····'}</Text>
          <Pressable onPress={() => navigation.navigate('EditProfile')} style={styles.editPill}>
            <Text style={styles.editLabel}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.identity}>
          <Pressable disabled={uploadingPhoto} onPress={() => setShowPhotoSheet(true)}>
            <Avatar initials={initialsOf(state.name || null)} photo={state.profilePhoto ?? serverPhoto} size={72} rounded={22} tone="amber" />
            <View style={styles.photoBadge}><Text style={styles.photoBadgeGlyph}>{uploadingPhoto ? '…' : '↑'}</Text></View>
          </Pressable>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
            <Text style={[text.eyebrow, { fontSize: 9.5, marginTop: 5 }]}>#Checked member{since ? ` · since ${since}` : ''}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <StatTiles
            highlight={2}
            tiles={[
              { value: rating ? `★ ${ratingText(rating)}` : '—', label: 'Rating' },
              { value: String(hostedCount + joinedCount), label: 'Meetups' },
              { value: String(hostedCount), label: 'Hosted' },
            ]}
          />
        </View>

        <View style={[styles.section, { gap: 12 }]}>
          <Pressable onPress={() => navigation.navigate('MyReviews')} style={styles.ratingsCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ratingsTitle}>Ratings & feedback</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <Stars value={rating} size="s" showValue={false} />
                <Text style={styles.ratingsMeta}>{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</Text>
              </View>
            </View>
            <Text style={styles.ratingsChevron}>›</Text>
          </Pressable>

          {!!pendingReview && (
            <Pressable onPress={() => navigation.navigate('Review', { planId: pendingReview.postId })} style={styles.pending}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pendingTitle}>A review is waiting</Text>
                <Text style={styles.pendingSub} numberOfLines={1}>{pendingReview.title} — the setup and who showed up</Text>
              </View>
              <Text style={[styles.ratingsChevron, { color: colors.ink }]}>›</Text>
            </Pressable>
          )}

          <View style={styles.upFor}>
            <View style={styles.upForHead}>
              <Text style={text.fieldLabel}>Up for</Text>
              <Pressable onPress={() => setEditingVibe((v) => !v)} hitSlop={8}>
                <Text style={styles.upForEdit}>{editingVibe ? 'Done' : 'Edit'}</Text>
              </Pressable>
            </View>
            <View style={{ marginTop: 11 }}>
              {editingVibe ? (
                <FilterChips
                  multi
                  activeTone="amber"
                  items={PROFILE_TAGS}
                  active={PROFILE_TAGS.map((t, i) => (state.vibeTags.includes(t) ? i : -1)).filter((i) => i >= 0)}
                  onChange={(i) => dispatch({ type: 'TOGGLE_VIBE_TAG', tag: PROFILE_TAGS[i] })}
                />
              ) : state.vibeTags.length > 0 ? (
                <View style={styles.tags}>
                  {state.vibeTags.map((t) => (
                    <View key={t} style={styles.tag}><Text style={styles.tagLabel}>{t}</Text></View>
                  ))}
                </View>
              ) : (
                <Text style={styles.muted}>Nothing yet — tap Edit to add a few.</Text>
              )}
            </View>
          </View>

          <View style={styles.badges}>
            <Badge label="Verified Identity" tone="sky" />
            {rating >= 4.5 && <Badge label="Highly rated" tone="amber" glyph="★" />}
            {hostedCount > 0 && <Badge label={`Hosted ${hostedCount}`} tone="mint" />}
          </View>

          <View style={{ gap: 9 }}>
            <ListRow title="Edit highlights" meta="Clips and photos on your profile" chevron onPress={() => navigation.navigate('Highlights', { mode: 'edit' })} />
            {!!state.userId && (
              <ListRow title="View my profile" meta="See what others see when they tap your name" chevron onPress={() => navigation.navigate('RequesterProfile', { userId: state.userId! })} />
            )}
            <ListRow title="Requests you've sent" meta="Everything you've asked to join" chevron onPress={() => navigation.navigate('SentRequests')} />
            <ListRow title="Notifications" meta="Requests, approvals and ratings" chevron onPress={() => navigation.navigate('Notifications')} />
            <ListRow title="Settings" meta="Visibility, notifications, safety" chevron onPress={() => navigation.navigate('Settings')} />
          </View>
        </View>
      </ScrollView>
      <StatusScrim />

      <TabBar
        active="me"
        onPress={(key) => {
          if (key === 'plans') navigation.navigate('MyPlans');
          else if (key === 'chats') navigation.navigate('ChatList');
          else if (key === 'explore') navigation.navigate('Board');
        }}
      />

      <Sheet visible={showPhotoSheet} onClose={() => setShowPhotoSheet(false)} title="Update your photo" sub="Shown on your profile, never on the board.">
        <View style={{ marginTop: 8 }}>
          <SheetRow label="Take a photo" onPress={() => pick('camera')} />
          <SheetRow label="Choose from library" onPress={() => pick('library')} />
        </View>
        <View style={{ marginTop: 14 }}><Btn label="Cancel" variant="ghost" onPress={() => setShowPhotoSheet(false)} /></View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: 20 },
  id: { fontFamily: font.monoSemibold, fontSize: 11, color: colors.zinc400 },
  editPill: { backgroundColor: colors.zinc100, borderRadius: 999, paddingHorizontal: 15, minHeight: 42, justifyContent: 'center' },
  editLabel: { fontFamily: font.bold, fontSize: 12, color: colors.ink },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 10, paddingHorizontal: 20 },
  photoBadge: { position: 'absolute', right: -4, bottom: -4, width: 26, height: 26, borderRadius: 999, backgroundColor: colors.ink, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  photoBadgeGlyph: { fontFamily: font.extrabold, fontSize: 12, color: colors.amber },
  name: { fontFamily: font.extrabold, fontSize: 22, letterSpacing: -0.8, color: colors.ink },
  section: { paddingTop: 18, paddingHorizontal: 20 },
  ratingsCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.ink, borderRadius: 20, padding: 16 },
  ratingsTitle: { fontFamily: font.extrabold, fontSize: 14.5, color: colors.white },
  ratingsMeta: { fontFamily: font.semibold, fontSize: 12, color: colors.zinc400 },
  ratingsChevron: { fontFamily: font.bold, fontSize: 16, color: colors.amber },
  pending: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.amber, borderRadius: 20, padding: 16 },
  pendingTitle: { fontFamily: font.extrabold, fontSize: 14.5, color: colors.ink },
  pendingSub: { fontFamily: font.regular, fontSize: 12.5, color: colors.amberInk, marginTop: 4 },
  upFor: { backgroundColor: colors.zinc100, borderRadius: 20, padding: 16 },
  upForHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  upForEdit: { fontFamily: font.bold, fontSize: 12, color: colors.ink },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tag: { backgroundColor: colors.white, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  tagLabel: { fontFamily: font.bold, fontSize: 11.5, color: colors.zinc700 },
  muted: { fontFamily: font.regular, fontSize: 12.5, color: colors.zinc500 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
});
