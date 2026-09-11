import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius } from '../theme';
import { Btn, Header } from '../components/widgets';
import { useAppDispatch, useAppState } from '../store';
import { ONBOARDING_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfilePhoto'>;

export default function ProfilePhoto({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');

  const pick = async () => {
    setError('');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Companion needs photo access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      dispatch({ type: 'SET_PROFILE_PHOTO', uri: result.assets[0].uri });
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={7}
        title="Add your main photo"
        subtitle="This is the one people see first. You can crop it after choosing."
        onBack={() => navigation.navigate('Vibe')}
      />
      <View style={styles.body}>
        <Pressable onPress={pick} style={styles.frame}>
          {state.profilePhoto ? (
            <Image source={{ uri: state.profilePhoto }} style={styles.image} />
          ) : (
            <>
              <View style={styles.plusBadge}><Text style={styles.plusLabel}>+</Text></View>
              <Text style={styles.frameHint}>main profile photo · 4:5</Text>
            </>
          )}
        </Pressable>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
        {state.profilePhoto ? (
          <>
            <Btn label="Continue" variant="primary" onPress={() => navigation.navigate('Highlights')} />
            <View style={{ marginTop: 9 }}><Btn label="Choose a different photo" variant="secondary" onPress={pick} /></View>
          </>
        ) : (
          <Btn label="Choose a photo" variant="primary" onPress={pick} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 8 },
  frame: {
    height: 300, borderRadius: radius.card, backgroundColor: colors.neutralAvatar, borderWidth: 1.5, borderColor: colors.borderSoft,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  plusBadge: { width: 44, height: 44, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.8)', alignItems: 'center', justifyContent: 'center' },
  plusLabel: { fontFamily: 'Figtree_700Bold', fontSize: 20, color: colors.clayPressed },
  frameHint: { fontFamily: 'Figtree_500Medium', fontSize: 11, letterSpacing: 0.4, color: colors.muted },
  error: { marginTop: 16, color: colors.clayPressed, fontFamily: 'Figtree_500Medium', fontSize: 12.5, textAlign: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16 },
});
