import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, scale, shadow } from '../theme';
import { Chip, OutlineButton, PencilIcon, UploadIcon } from '../components/ui';
import { Header, Stars, TabBar } from '../components/widgets';
import { VIBE_TAGS } from '../data';
import { useAppDispatch, useAppState } from '../store';
import { eventsApi, joinRequestsApi, reviewsApi, usersApi } from '../api';
import { uploadMedia } from '../firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type PendingReview = { eventId: string; title: string };

export default function Profile({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [editingVibe, setEditingVibe] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [hostedCount, setHostedCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0);
  const [pendingReview, setPendingReview] = useState<PendingReview | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const displayName = state.name.trim() || 'You';
  const initials = state.name.trim() ? state.name.trim().slice(0, 2).toUpperCase() : 'YO';

  useEffect(() => {
    usersApi.getMe().then((me) => setRating(me.aggregatedRating));
    reviewsApi.listReceived().then((r) => setReviewCount(r.length));
    joinRequestsApi.listMine().then((jrs) => setJoinedCount(jrs.filter((jr) => jr.status === 'APPROVED').length));

    eventsApi.listHosted().then(async (hosted) => {
      setHostedCount(hosted.length);
      const lastArchived = hosted
        .filter((e) => e.isArchived && e.seatsFilled > 0)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      if (!lastArchived) return;
      const mine = await reviewsApi.hasReviewed(lastArchived.id);
      if (!mine) setPendingReview({ eventId: lastArchived.id, title: lastArchived.title });
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
      <Header
        variant="home"
        title={displayName}
        subtitle="Joined March · SoMa"
        action="Edit"
        onAction={() => navigation.navigate('EditProfile')}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <View style={styles.avatarWrap}>
            {state.profilePhoto ? (
              <Image source={{ uri: state.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}><Text style={styles.avatarLabel}>{initials}</Text></View>
            )}
            <Pressable disabled={uploadingPhoto} onPress={() => setShowPhotoSheet(true)} style={styles.avatarEditBadge}>
              <UploadIcon size={13} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statTile}>
              <Text style={styles.statNum}>{hostedCount + joinedCount}</Text>
              <Text style={styles.statLabel}>plans</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statNum}>{hostedCount}</Text>
              <Text style={styles.statLabel}>hosted</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={[styles.statNum, { color: colors.clayPressed }]}>{rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>rating</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.card} onPress={() => navigation.navigate('MyReviews')}>
          <View style={{ flex: 1 }}>
            <Text style={[scale.inline, { fontSize: 14.5 }]}>Ratings & feedback</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 }}>
              <Stars value={rating} size="s" showValue={false} />
              <Text style={styles.cardMeta}>{reviewCount} ratings</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        {!!state.userId && (
          <Pressable style={styles.card} onPress={() => navigation.navigate('RequesterProfile', { userId: state.userId! })}>
            <View style={{ flex: 1 }}>
              <Text style={[scale.inline, { fontSize: 14.5 }]}>View my profile</Text>
              <Text style={[styles.cardMeta, { marginTop: 6 }]}>See what others see when they tap your name</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.label}>Edit highlights</Text>
            <Pressable onPress={() => navigation.navigate('Highlights', { mode: 'edit' })}>
              <PencilIcon size={13} color={colors.ink} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.label}>What I'm up for</Text>
            <Pressable onPress={() => setEditingVibe((v) => !v)}>
              <Text style={styles.editLink}>{editingVibe ? 'Done' : 'Edit'}</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {editingVibe ? VIBE_TAGS.map((t) => (
              <Chip key={t} label={t} selected={state.vibeTags.includes(t)} onPress={() => dispatch({ type: 'TOGGLE_VIBE_TAG', tag: t })} />
            )) : state.vibeTags.length > 0 ? state.vibeTags.map((t) => (
              <View key={t} style={styles.outlinePill}><Text style={styles.outlinePillLabel}>{t}</Text></View>
            )) : (
              <Text style={styles.cardMeta}>Nothing yet — tap Edit to add a few.</Text>
            )}
          </View>
        </View>

        {!!pendingReview && (
          <Pressable style={styles.reviewBanner} onPress={() => navigation.navigate('Review', { planId: pendingReview.eventId })}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewTitle}>A review is waiting</Text>
              <Text style={styles.reviewSub}>{pendingReview.title} — the setup and who showed up</Text>
            </View>
            <Text style={[styles.chevron, { color: colors.clay }]}>›</Text>
          </Pressable>
        )}

        <Pressable style={styles.card} onPress={() => navigation.navigate('SentRequests')}>
          <View style={{ flex: 1 }}>
            <Text style={[scale.inline, { fontSize: 14.5 }]}>Requests you've sent</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Settings')} style={styles.settingsLink}>
          <Text style={styles.settingsLinkLabel}>Settings</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </ScrollView>

      <TabBar
        active="me"
        unread={false}
        onPress={(key) => {
          if (key === 'plans') navigation.navigate('MyPlans');
          else if (key === 'chats') navigation.navigate('ChatList');
          else if (key === 'explore') navigation.navigate('Board');
        }}
      />

      <Modal visible={showPhotoSheet} transparent animationType="fade" onRequestClose={() => setShowPhotoSheet(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowPhotoSheet(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Update your photo</Text>
            <Pressable onPress={() => pick('camera')} style={styles.sheetRow}>
              <Text style={styles.sheetRowLabel}>Take a photo</Text>
            </Pressable>
            <Pressable onPress={() => pick('library')} style={styles.sheetRow}>
              <Text style={styles.sheetRowLabel}>Choose from library</Text>
            </Pressable>
            <OutlineButton label="Cancel" onPress={() => setShowPhotoSheet(false)} style={{ marginTop: 8 }} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  avatarWrap: {},
  avatar: { width: 74, height: 74, borderRadius: 999, borderWidth: 1.5, borderColor: colors.clay },
  avatarPlaceholder: { backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: colors.clayPressed, fontFamily: 'Figtree_700Bold', fontSize: 22 },
  avatarEditBadge: {
    position: 'absolute', right: -2, bottom: -2, width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.clay, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.ground,
  },
  statsRow: { flex: 1, flexDirection: 'row', gap: 9 },
  statTile: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 13, alignItems: 'center', ...shadow.inner },
  statNum: { fontFamily: 'Figtree_800ExtraBold', fontSize: 21, letterSpacing: -0.6, color: colors.ink },
  statLabel: { fontSize: 10.5, color: colors.muted, marginTop: 2 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 20, padding: 15, ...shadow.inner },
  cardMeta: { fontSize: 12, color: colors.muted },
  chevron: { fontFamily: 'Figtree_700Bold', fontSize: 16, color: '#C3B8AD' },
  label: { fontFamily: 'Figtree_700Bold', fontSize: 10.5, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.faint },
  section: {},
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editLink: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 12 },
  outlinePill: { borderWidth: 1, borderColor: colors.borderSoft, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 13 },
  outlinePillLabel: { color: colors.inkSecondary, fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
  reviewBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.ink, borderRadius: 20, padding: 17 },
  reviewTitle: { color: colors.ground, fontFamily: 'Figtree_700Bold', fontSize: 15 },
  reviewSub: { color: 'rgba(251,246,240,.6)', fontFamily: 'Figtree_400Regular', fontSize: 12.5, marginTop: 4 },
  settingsLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  settingsLinkLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 13.5, color: colors.inkSecondary },
  backdrop: { flex: 1, backgroundColor: 'rgba(46,42,38,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet,
    padding: 22, paddingBottom: 34,
  },
  sheetTitle: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 17, marginBottom: 8 },
  sheetRow: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.lineCard },
  sheetRowLabel: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 15 },
});
