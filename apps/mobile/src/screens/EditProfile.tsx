import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';
import { colors, font, seatTones, text } from '../theme';
import { Avatar, FieldLabel, FilterChips, Header, TextField, StatusScrim } from '../components/widgets';
import { VIBE_TAGS } from '../data';
import { initialsOf } from '../data/eventDisplay';
import { useAppDispatch, useAppState } from '../store';
import { usersApi } from '../api';
import { uploadMedia } from '../firebase';

type Props = { navigation: NavigationProp<RootStackParamList> };

export default function EditProfile({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(state.name);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [addingTags, setAddingTags] = useState(false);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (result.canceled) return;
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
  };

  const save = () => {
    dispatch({ type: 'SET_NAME', name: name.trim() });
    usersApi.updateMe({ name: name.trim(), vibeTags: state.vibeTags }).catch((e) => console.error('Profile save failed', e));
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Header
          variant="stack"
          title="Edit profile"
          subtitle="Your rating and meetups can't be edited — they're earned."
          action="Save"
          actionTone="amber"
          onAction={save}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.body}>
          <Pressable onPress={pickPhoto} disabled={uploadingPhoto} style={styles.photoRow}>
            <View>
              <Avatar initials={initialsOf(name || null)} photo={state.profilePhoto} size={74} rounded={22} tone="amber" />
              <View style={styles.pencil}><Text style={styles.pencilGlyph}>✎</Text></View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.photoTitle}>Main photo</Text>
              <Text style={styles.photoSub}>{uploadingPhoto ? 'Uploading…' : 'Shown on your profile, never on the board.'}</Text>
            </View>
          </Pressable>

          <View>
            <FieldLabel>Display name</FieldLabel>
            <TextField value={name} onChangeText={setName} placeholder="Your name" style={{ fontSize: 15 }} />
          </View>

          <View>
            <FieldLabel>Up for — up to three</FieldLabel>
            {addingTags ? (
              <FilterChips
                multi
                activeTone="amber"
                items={VIBE_TAGS}
                active={VIBE_TAGS.map((t, i) => (state.vibeTags.includes(t) ? i : -1)).filter((i) => i >= 0)}
                onChange={(i) => dispatch({ type: 'TOGGLE_VIBE_TAG', tag: VIBE_TAGS[i] })}
              />
            ) : (
              <View style={styles.tags}>
                {state.vibeTags.map((t) => (
                  <Pressable key={t} onPress={() => dispatch({ type: 'TOGGLE_VIBE_TAG', tag: t })} style={styles.tagOn}>
                    <Text style={styles.tagOnLabel}>{t}</Text>
                    <Text style={[styles.tagOnLabel, { opacity: 0.7 }]}>×</Text>
                  </Pressable>
                ))}
                {state.vibeTags.length < 3 && (
                  <Pressable onPress={() => setAddingTags(true)} style={styles.tagAdd}>
                    <Text style={styles.tagAddLabel}>+ Add</Text>
                  </Pressable>
                )}
              </View>
            )}
            {addingTags && (
              <Pressable onPress={() => setAddingTags(false)} style={{ marginTop: 10 }}>
                <Text style={styles.done}>Done</Text>
              </Pressable>
            )}
          </View>

          <View>
            <View style={styles.hlHead}>
              <Text style={text.fieldLabel}>Highlights</Text>
              <Text style={styles.count}>{state.highlights.length} of 6</Text>
            </View>
            <View style={styles.grid}>
              {state.highlights.map((h, i) => (
                <View key={i} style={[styles.tile, { backgroundColor: [colors.amber, seatTones[0][0], seatTones[2][0]][i % 3] }]}>
                  {h.type === 'image' && <Image source={{ uri: h.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />}
                  <Pressable hitSlop={6} onPress={() => dispatch({ type: 'REMOVE_HIGHLIGHT', index: i })} style={styles.remove}>
                    <Text style={styles.removeGlyph}>×</Text>
                  </Pressable>
                </View>
              ))}
              {state.highlights.length < 6 && (
                <Pressable onPress={() => navigation.navigate('Highlights', { mode: 'edit' })} style={[styles.tile, styles.addTile]}>
                  <Text style={styles.addGlyph}>+</Text>
                </Pressable>
              )}
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
  body: { paddingTop: 6, paddingHorizontal: 20, gap: 17 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  pencil: { position: 'absolute', right: -3, bottom: -3, width: 28, height: 28, borderRadius: 999, backgroundColor: colors.ink, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  pencilGlyph: { fontFamily: font.bold, fontSize: 12, color: colors.amber },
  photoTitle: { fontFamily: font.extrabold, fontSize: 14, color: colors.ink },
  photoSub: { fontFamily: font.regular, fontSize: 12, lineHeight: 18, color: colors.zinc500, marginTop: 3 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagOn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.ink, borderRadius: 999, minHeight: 44, paddingHorizontal: 15 },
  tagOnLabel: { fontFamily: font.bold, fontSize: 12.5, color: colors.amber },
  tagAdd: { backgroundColor: colors.zinc100, borderRadius: 999, minHeight: 44, paddingHorizontal: 15, justifyContent: 'center' },
  tagAddLabel: { fontFamily: font.bold, fontSize: 12.5, color: colors.zinc400 },
  done: { fontFamily: font.bold, fontSize: 12.5, color: colors.ink },
  hlHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 11 },
  count: { fontFamily: font.bold, fontSize: 11.5, color: colors.zinc500 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '23%', aspectRatio: 3 / 4, borderRadius: 14, overflow: 'hidden' },
  addTile: { backgroundColor: colors.zinc100, alignItems: 'center', justifyContent: 'center' },
  addGlyph: { fontFamily: font.bold, fontSize: 18, color: colors.zinc400 },
  remove: { position: 'absolute', right: 4, top: 4, width: 20, height: 20, borderRadius: 999, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  removeGlyph: { fontFamily: font.bold, fontSize: 11, lineHeight: 13, color: colors.amber },
});
