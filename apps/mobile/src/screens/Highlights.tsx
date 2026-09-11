import { useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius } from '../theme';
import { Btn, Header } from '../components/widgets';
import { useAppDispatch, useAppState } from '../store';
import { ONBOARDING_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Highlights'>;

const SLOTS = 6;
const GRID_COLUMNS = 3;
const GRID_GAP = 10;
const BODY_PADDING = 20;
const SLOT_SIZE = (Dimensions.get('window').width - BODY_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

export default function Highlights({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
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
    <View style={styles.screen}>
      <Header
        variant="stack"
        stepsTotal={isEdit ? undefined : ONBOARDING_STEPS}
        stepsCurrent={isEdit ? undefined : 8}
        title="Show a bit of your personality"
        subtitle="5–10s clips or photos — you doing the thing you're actually into. Up to six."
        onBack={() => navigation.goBack()}
      />
      <View style={styles.body}>
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
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
        <Btn
          label={isEdit ? 'Save' : canContinue ? 'Continue' : 'Skip for now'}
          variant={canContinue ? 'primary' : 'secondary'}
          onPress={() => (isEdit ? navigation.goBack() : navigation.navigate('Verify'))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: GRID_GAP, rowGap: GRID_GAP },
  slot: { width: SLOT_SIZE, height: SLOT_SIZE },
  thumbWrap: { width: '100%', height: '100%', borderRadius: radius.tile, overflow: 'hidden' },
  addSlot: {
    width: SLOT_SIZE, height: SLOT_SIZE, borderRadius: radius.tile, borderWidth: 1.5, borderColor: colors.borderSoft,
    borderStyle: 'dashed', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  addIcon: { color: '#C3B8AD', fontFamily: 'Figtree_700Bold', fontSize: 20 },
  thumb: { width: '100%', height: '100%', backgroundColor: colors.surface },
  videoThumb: { backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: '#fff', fontSize: 20 },
  removeBadge: {
    position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 999,
    backgroundColor: 'rgba(46,42,38,.75)', alignItems: 'center', justifyContent: 'center',
  },
  removeLabel: { color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 12, lineHeight: 14 },
  error: { marginTop: 16, color: colors.clayPressed, fontFamily: 'Figtree_500Medium', fontSize: 12.5 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16 },
});
