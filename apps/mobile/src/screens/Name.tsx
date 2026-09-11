import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius } from '../theme';
import { OnboardingHeader, PrimaryButton } from '../components/ui';
import { useAppDispatch } from '../state';
import { ONBOARDING_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Name'>;

export default function Name({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const canContinue = name.trim().length > 0;

  const submit = () => {
    if (!canContinue) return;
    dispatch({ type: 'SET_NAME', name: name.trim() });
    navigation.navigate('Birthday');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <OnboardingHeader
          step={0}
          totalSteps={ONBOARDING_STEPS}
          title="What should people call you?"
          subtitle="First name and an initial — that's all anyone ever sees."
        />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Priya"
          placeholderTextColor={colors.faint}
          autoFocus
          autoCapitalize="words"
          style={styles.input}
        />
        <View style={{ flex: 1 }} />
        <PrimaryButton label="Continue" onPress={submit} style={[styles.cta, !canContinue && styles.ctaDisabled]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { flex: 1, padding: 22, paddingTop: 36, paddingBottom: 34 },
  input: {
    marginTop: 26, borderWidth: 1, borderColor: colors.border, borderRadius: radius.inner,
    backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 16,
    fontFamily: 'Figtree_600SemiBold', fontSize: 20, color: colors.ink,
  },
  cta: { marginTop: 20 },
  ctaDisabled: { opacity: 0.45 },
});
