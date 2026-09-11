import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { Chip, OutlineButton, PencilIcon, UploadIcon, text } from '../components/ui';
import {
  PROFILE_HISTORY, PROFILE_WORDS, TABS, VIBE_TAGS,
} from '../data';
import { useAppDispatch, useAppState } from '../state';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function Profile({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [editingVibe, setEditingVibe] = useState(false);

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
      dispatch({ type: 'SET_PROFILE_PHOTO', uri: result.assets[0].uri });
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            {state.profilePhoto ? (
              <Image source={{ uri: state.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}><Text style={styles.avatarLabel}>YO</Text></View>
            )}
            <Pressable onPress={() => setShowPhotoSheet(true)} style={styles.avatarEditBadge}>
              <UploadIcon size={13} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>You</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeIcon}>✓</Text>
            </View>
          </View>

        </View>

        <View style={styles.statsRow}>
          <Pressable onPress={() => navigation.navigate('Highlights', { mode: 'edit' })} style={[styles.statCard, styles.editButtonRow]}>
            <Text style={styles.editButtonLabel}>Edit highlights</Text>
            <PencilIcon size={13} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>What I'm up for</Text>
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
              <Text style={styles.rowSub}>Nothing yet — tap Edit to add a few.</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Showed up for</Text>
          <View style={styles.card}>
            {PROFILE_HISTORY.map((h, i) => (
              <View key={h.title} style={[styles.historyRow, i === PROFILE_HISTORY.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.historyTitle}>{h.title}</Text>
                <Text style={styles.historyDate}>{h.date}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What people say about you</Text>
          <View style={[styles.card, { padding: 10 }]}>
            {PROFILE_WORDS.map((w) => (
              <View key={w.label} style={styles.wordPill}>
                <Text style={styles.wordLabel}>{w.label}</Text>
                <Text style={styles.wordCount}>{w.count}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.footnote}>Words only, and only once three people have said the same thing. No score, no stars, no ranking against anyone else.</Text>
        </View>

        <Text style={[text.aside, { paddingHorizontal: 20, marginTop: 20 }]}>
          Setups get scored. People get described. That asymmetry is the whole point.
        </Text>

        <Pressable style={styles.reviewCard} onPress={() => navigation.navigate('Review')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.reviewTitle}>Two reviews waiting</Text>
            <Text style={styles.reviewSub}>Last night at Marufuku — the setup and the three of them</Text>
          </View>
          <Text style={styles.reviewArrow}>→</Text>
        </Pressable>

        <View style={[styles.statsRow, { marginTop: 22 }]}>
          <Pressable onPress={() => navigation.navigate('Settings')} style={[styles.statCard, styles.editButtonRow]}>
            <Text style={styles.editButtonLabel}>Settings</Text>
            <Text style={styles.settingsIcon}>⚙︎</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = t === 'Me';
          return (
            <Pressable
              key={t}
              onPress={() => {
                if (t === 'Plans') navigation.navigate('MyPlans');
                else if (t === 'Chats') navigation.navigate('ChatList');
                else if (t === 'Me') navigation.navigate('Profile');
                else navigation.navigate('Board');
              }}
              style={[styles.tabPill, active ? { backgroundColor: colors.ink } : { backgroundColor: 'transparent' }]}
            >
              <Text style={[styles.tabLabel, { color: active ? colors.ground : colors.muted }]}>{t}</Text>
            </Pressable>
          );
        })}
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  header: { padding: 20, paddingTop: 36, alignItems: 'center' },
  settingsIcon: { fontSize: 15, color: colors.ink },
  avatarWrap: { marginTop: 18 },
  avatar: { width: 92, height: 92, borderRadius: 46, borderWidth: 1.5, borderColor: colors.clay },
  avatarPlaceholder: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  avatarLabel: { color: colors.clayPressed, fontFamily: 'Figtree_700Bold', fontSize: 26 },
  avatarEditBadge: {
    position: 'absolute', right: -2, bottom: -2, width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.clay, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.ground,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  name: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 26, letterSpacing: -0.6 },
  verifiedBadge: { width: 21, height: 21, borderRadius: 11, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  verifiedBadgeIcon: { color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 11 },
  editButtonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  editButtonLabel: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 13, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 9, paddingHorizontal: 20, marginTop: 18 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.inner, padding: 15, ...shadow.inner },
  statNum: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 26, letterSpacing: -0.6 },
  statLabel: { color: colors.muted, fontFamily: 'Figtree_500Medium', fontSize: 11.5, marginTop: 6 },
  section: { paddingHorizontal: 20, marginTop: 22 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: colors.faint, marginBottom: 10 },
  editLink: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 12 },
  rowSub: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 12.5 },
  outlinePill: { borderWidth: 1, borderColor: colors.borderSoft, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 13 },
  outlinePillLabel: { color: colors.inkSecondary, fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
  card: { backgroundColor: colors.surface, borderRadius: radius.inner, ...shadow.inner, overflow: 'hidden' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.lineCard },
  historyTitle: { flex: 1, color: colors.ink, fontFamily: 'Figtree_500Medium', fontSize: 13.5 },
  historyDate: { color: colors.faint, fontFamily: 'Figtree_500Medium', fontSize: 11.5 },
  wordPill: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.blush, borderRadius: 999, padding: 12, marginBottom: 6 },
  wordLabel: { color: colors.blushInk, fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
  wordCount: { color: colors.faint, fontFamily: 'Figtree_500Medium', fontSize: 11.5 },
  footnote: { color: colors.faint, fontFamily: 'Figtree_400Regular', fontSize: 12, lineHeight: 18, marginTop: 8 },
  reviewCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.ink, borderRadius: radius.inner + 2,
    padding: 17, marginHorizontal: 20, marginTop: 16,
  },
  reviewTitle: { color: colors.ground, fontFamily: 'Figtree_700Bold', fontSize: 15 },
  reviewSub: { color: 'rgba(251,246,240,.6)', fontFamily: 'Figtree_400Regular', fontSize: 12.5, marginTop: 4 },
  reviewArrow: { color: colors.clay, fontFamily: 'Figtree_700Bold', fontSize: 18, marginLeft: 10 },
  tabBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(251,246,240,.94)',
    borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 18, paddingBottom: 24,
  },
  tabPill: { borderRadius: 999, paddingVertical: 9, paddingHorizontal: 15 },
  tabLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
  backdrop: { flex: 1, backgroundColor: 'rgba(46,42,38,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet,
    padding: 22, paddingBottom: 34,
  },
  sheetTitle: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 17, marginBottom: 8 },
  sheetRow: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.lineCard },
  sheetRowLabel: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 15 },
});
