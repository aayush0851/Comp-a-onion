import { useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Octicons from '@expo/vector-icons/Octicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, seatTones } from '../theme';
import { Btn, Footer, Header, Notice } from '../components/widgets';
import { useAppDispatch, useAppState } from '../store';
import { ONBOARDING_STEPS, SELFIE_VERIFICATION_ENABLED } from '../data';
import { usersApi } from '../api';
import { uploadMedia } from '../firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'Highlights'>;

const SLOTS = 6;
const GRID_COLUMNS = 3;
const GRID_GAP = 10;
const BODY_PADDING = 20;
const SLOT_WIDTH = (Dimensions.get('window').width - BODY_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
const SLOT_HEIGHT = (SLOT_WIDTH * 4) / 3;

export default function Highlights({ navigation, route }: Props) {
  const isEdit = route.params?.mode === 'edit';
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const canContinue = state.highlights.length > 0;

  const uploadPendingHighlights = async (): Promise<string[]> => {
    return Promise.all(
      state.highlights.map(async (h) => {
        if (h.uri.startsWith('http')) return h.uri;
        return uploadMedia(h.uri);
      }),
    );
  };

  const continueOnboarding = async () => {
    setSaving(true);
    setError('');
    try {
      const highlights = await uploadPendingHighlights();
      const { day, month, year } = state.dob;
      await usersApi.updateMe({
        name: state.name || undefined,
        dob: day && month && year ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : undefined,
        gender: (state.gender === 'Self-describe' ? state.genderCustom : state.gender) || undefined,
        genderVisible: state.genderVisible,
        vibeTags: state.vibeTags,
        highlights,
      });
      navigation.navigate(SELFIE_VERIFICATION_ENABLED ? 'Verify' : 'Board');
    } catch (e) {
      console.error('Onboarding profile save failed', e);
      setError("Couldn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    setError('');
    try {
      const highlights = await uploadPendingHighlights();
      await usersApi.updateMe({ highlights });
      navigation.goBack();
    } catch (e) {
      console.error('Highlights save failed', e);
      setError("Couldn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const addOne = async () => {
    setError('');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Companion needs photo access to add these.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
      videoMaxDuration: 10,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      dispatch({ type: 'ADD_HIGHLIGHT', media: { uri: asset.uri, type: asset.type === 'video' ? 'video' : 'image' } });
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        centerLabel={isEdit ? null : `Step 8 of ${ONBOARDING_STEPS}`}
        stepsTotal={isEdit ? undefined : ONBOARDING_STEPS}
        stepsCurrent={isEdit ? undefined : 8}
        title="Show a bit of your personality"
        subtitle="5–10s clips or photos of you doing the thing you're into. Up to six."
        onBack={() => navigation.goBack()}
      />
      <View style={styles.body}>
        <View style={styles.grid}>
          {Array.from({ length: SLOTS }).map((_, i) => {
            const item = state.highlights[i];
            if (!item) {
              return (
                <Pressable key={i} onPress={addOne} style={[styles.slot, styles.addSlot]}>
                  <Text style={styles.addIcon}>+</Text>
                </Pressable>
              );
            }
            const [bg, fg] = [[colors.amber, colors.amberInk], seatTones[0], seatTones[2]][i % 3];
            return (
              <View key={i} style={[styles.slot, { backgroundColor: bg }]}>
                {item.type === 'image' && <Image source={{ uri: item.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />}
                <Pressable hitSlop={6} onPress={() => dispatch({ type: 'REMOVE_HIGHLIGHT', index: i })} style={styles.remove}>
                  <Octicons name="x" size={14} color={colors.amber} />
                </Pressable>
                <View style={[styles.kind, item.type === 'image' && styles.kindOnPhoto]}>
                  <Text style={[styles.kindLabel, { color: item.type === 'image' ? colors.white : fg }]}>{item.type === 'video' ? 'clip' : 'photo'}</Text>
                </View>
              </View>
            );
          })}
        </View>
        {!!error && <Notice tone="rose" style={{ marginTop: 14 }}>{error}</Notice>}
      </View>
      <View style={{ flex: 1 }} />
      <Footer>
        <Btn
          label={isEdit ? 'Save' : canContinue ? 'Continue' : 'Skip for now'}
          loading={saving}
          variant={canContinue || isEdit ? 'primary' : 'secondary'}
          onPress={() => (isEdit ? saveEdit() : continueOnboarding())}
        />
      </Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: BODY_PADDING },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  slot: { width: SLOT_WIDTH, height: SLOT_HEIGHT, borderRadius: 16, overflow: 'hidden' },
  addSlot: { backgroundColor: colors.zinc100, alignItems: 'center', justifyContent: 'center' },
  addIcon: { fontFamily: font.bold, fontSize: 20, color: colors.zinc400 },
  remove: { position: 'absolute', right: 6, top: 6, width: 24, height: 24, borderRadius: 999, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },  kind: { position: 'absolute', left: 8, bottom: 8 },
  kindOnPhoto: { backgroundColor: 'rgba(24,24,24,.55)', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  kindLabel: { fontFamily: font.monoSemibold, fontSize: 8.5 },
});
