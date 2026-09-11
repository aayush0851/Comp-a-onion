import React, { useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius } from '../theme';
import { OnboardingHeader, PrimaryButton } from '../components/ui';
import { useAppDispatch, useAppState } from '../state';
import { ONBOARDING_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Highlights'>;

const SLOTS = 6;

export default function Highlights({ navigation, route }: Props) {
  const isEdit = route.params?.mode === 'edit';
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');
  const canContinue = state.highlights.length > 0;

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
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <OnboardingHeader
          onBack={() => navigation.goBack()}
          step={isEdit ? undefined : 5}
          totalSteps={isEdit ? undefined : ONBOARDING_STEPS}
          title="Show a bit of your personality"
          subtitle="5-10s clips or photos — you doing the thing you're actually into. Up to six."
        />

        <View style={styles.grid}>
          {Array.from({ length: SLOTS }).map((_, i) => {
            const item = state.highlights[i];
            if (item) {
              return (
                <View key={i} style={styles.slot}>
                  <View style={styles.thumbWrap}>
                    {item.type === 'video' ? (
                      <View style={[styles.thumb, styles.videoThumb]}>
                        <Text style={styles.playIcon}>▶</Text>
                      </View>
                    ) : (
                      <Image source={{ uri: item.uri }} style={styles.thumb} resizeMode="cover" />
                    )}
                  </View>
                  <Pressable onPress={() => dispatch({ type: 'REMOVE_HIGHLIGHT', index: i })} style={styles.removeBadge}>
                    <Text style={styles.removeLabel}>×</Text>
                  </Pressable>
                </View>
              );
            }
            return (
              <Pressable key={i} onPress={addOne} style={styles.addSlot}>
                <Text style={styles.addIcon}>+</Text>
              </Pressable>
            );
          })}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <View style={{ flex: 1 }} />
        <PrimaryButton
          label={isEdit ? 'Save' : 'Continue'}
          onPress={() => canContinue && (isEdit ? navigation.goBack() : navigation.navigate('Verify'))}
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
        />
      </View>
    </SafeAreaView>
  );
}

const GRID_COLUMNS = 3;
const GRID_GAP = 12;
const BODY_PADDING = 22;
const SLOT_SIZE = (Dimensions.get('window').width - BODY_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { flex: 1, padding: 22, paddingTop: 36, paddingBottom: 34 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 12, marginTop: 26 },
  slot: { width: SLOT_SIZE, height: SLOT_SIZE },
  thumbWrap: { width: '100%', height: '100%', borderRadius: radius.tile, overflow: 'hidden' },
  addSlot: {
    width: SLOT_SIZE, height: SLOT_SIZE, borderRadius: radius.tile, borderWidth: 1.5, borderColor: colors.borderSoft,
    borderStyle: 'dashed', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  addIcon: { color: colors.faint, fontFamily: 'Figtree_600SemiBold', fontSize: 26 },
  thumb: { width: '100%', height: '100%', backgroundColor: colors.surface },
  videoThumb: { backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: '#fff', fontSize: 20 },
  removeBadge: {
    position: 'absolute', top: -7, right: -7, width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center',
  },
  removeLabel: { color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 13, lineHeight: 15 },
  error: { marginTop: 16, color: colors.clayPressed, fontFamily: 'Figtree_500Medium', fontSize: 12.5 },
  cta: { marginTop: 20 },
  ctaDisabled: { opacity: 0.45 },
});
