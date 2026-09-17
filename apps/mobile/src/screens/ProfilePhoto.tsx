import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { Btn, Footer, Header, Notice } from '../components/widgets';
import { useAppDispatch, useAppState } from '../store';
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
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.85 });
    if (!result.canceled && result.assets[0]) dispatch({ type: 'SET_PROFILE_PHOTO', uri: result.assets[0].uri });
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        centerLabel={`Step 7 of ${ONBOARDING_STEPS}`}
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={7}
        title="Add your main photo"
        subtitle="This is the one people see first. You can crop it after."
        onBack={() => navigation.navigate('Vibe')}
      />
      <View style={styles.body}>
        <Pressable onPress={pick} style={styles.frame}>
          {state.profilePhoto ? (
            <Image source={{ uri: state.profilePhoto }} style={styles.image} />
          ) : (
            <>
              <View style={styles.plus}><Text style={styles.plusLabel}>+</Text></View>
              <Text style={styles.hint}>main profile photo · 4:5</Text>
            </>
          )}
        </Pressable>
        {!!error && <Notice tone="rose" style={{ marginTop: 12 }}>{error}</Notice>}
      </View>
      <View style={{ flex: 1 }} />
      <Footer>
        {state.profilePhoto ? (
          <>
            <Btn label="Continue" onPress={() => navigation.navigate('Highlights')} />
            <Btn label="Choose a different photo" variant="ghost" onPress={pick} />
          </>
        ) : (
          <Btn label="Choose a photo" onPress={pick} />
        )}
      </Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: 20 },
  frame: { height: 300, borderRadius: 24, backgroundColor: colors.zinc100, alignItems: 'center', justifyContent: 'center', gap: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  plus: { width: 48, height: 48, borderRadius: 999, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  plusLabel: { fontFamily: font.bold, fontSize: 21, color: colors.amber },
  hint: { fontFamily: font.mono, fontSize: 11, letterSpacing: 0.4, color: colors.zinc400 },
});
