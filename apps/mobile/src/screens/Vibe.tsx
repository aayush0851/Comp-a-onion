import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { Chip, OnboardingHeader, PrimaryButton } from '../components/ui';
import { useAppState, useAppDispatch } from '../state';
import { ONBOARDING_STEPS, VIBE_TAGS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Vibe'>;

export default function Vibe({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const canContinue = state.vibeTags.length > 0;

  const submit = () => {
    if (!canContinue) return;
    navigation.navigate('ProfilePhoto');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <OnboardingHeader
          onBack={() => navigation.navigate('Gender')}
          step={3}
          totalSteps={ONBOARDING_STEPS}
          title="What are you up for?"
          subtitle="Up to three. This shows on your profile — no essay required."
        />
        <View style={styles.chips}>
          {VIBE_TAGS.map((t) => (
            <Chip key={t} label={t} selected={state.vibeTags.includes(t)} onPress={() => dispatch({ type: 'TOGGLE_VIBE_TAG', tag: t })} />
          ))}
        </View>
        <View style={{ flex: 1 }} />
        <PrimaryButton label="Continue" onPress={submit} style={[styles.cta, !canContinue && styles.ctaDisabled]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { flex: 1, padding: 22, paddingTop: 36, paddingBottom: 34 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 26 },
  cta: { marginTop: 20 },
  ctaDisabled: { opacity: 0.45 },
});
