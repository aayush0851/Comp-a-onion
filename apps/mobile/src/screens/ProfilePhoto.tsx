import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, stripe } from '../theme';
import { OnboardingHeader, OutlineButton, PrimaryButton } from '../components/ui';
import { useAppDispatch, useAppState } from '../state';
import { ONBOARDING_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfilePhoto'>;

export default function ProfilePhoto({ navigation }: Props) {
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
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      dispatch({ type: 'SET_PROFILE_PHOTO', uri: result.assets[0].uri });
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <OnboardingHeader
          onBack={() => navigation.navigate('Vibe')}
          step={4}
          totalSteps={ONBOARDING_STEPS}
          title="Add your main photo"
          subtitle="This is the one people see first. You can crop and reposition it after choosing."
        />

        <View style={styles.frameWrap}>
          {state.profilePhoto ? (
            <Image source={{ uri: state.profilePhoto }} style={styles.frame} />
          ) : (
            <View style={[stripe(230), styles.frame, styles.frameEmpty]}>
              <Text style={styles.frameHint}>No photo yet</Text>
            </View>
          )}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <View style={{ flex: 1 }} />
        {state.profilePhoto ? (
          <>
            <PrimaryButton label="Continue" onPress={() => navigation.navigate('Highlights')} />
            <OutlineButton label="Choose a different photo" onPress={pick} style={{ marginTop: 9 }} />
          </>
        ) : (
          <PrimaryButton label="Choose a photo" onPress={pick} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { flex: 1, padding: 22, paddingTop: 36, paddingBottom: 34 },
  frameWrap: { marginTop: 34, alignSelf: 'center' },
  frame: { width: 230, height: 230, borderRadius: 115, borderWidth: 3, borderColor: colors.clay },
  frameEmpty: { alignItems: 'center', justifyContent: 'center' },
  frameHint: { color: colors.muted, fontFamily: 'Figtree_500Medium', fontSize: 13 },
  error: { marginTop: 16, color: colors.clayPressed, fontFamily: 'Figtree_500Medium', fontSize: 12.5, textAlign: 'center' },
});
