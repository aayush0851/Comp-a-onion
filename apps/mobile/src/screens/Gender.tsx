import React from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { OnboardingHeader, PrimaryButton, SelectTile } from '../components/ui';
import { useAppDispatch, useAppState } from '../state';
import { GENDER_OPTIONS, ONBOARDING_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Gender'>;

const SELF_DESCRIBE = 'Self-describe';

export default function Gender({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const isCustom = state.gender === SELF_DESCRIBE;
  const canContinue = !!state.gender && (!isCustom || state.genderCustom.trim().length > 0);

  const submit = () => {
    if (!canContinue) return;
    navigation.navigate('Vibe');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <OnboardingHeader
          onBack={() => navigation.navigate('Birthday')}
          step={2}
          totalSteps={ONBOARDING_STEPS}
          title="How do you identify?"
          subtitle="This is just so we get it right. You choose whether it shows on your profile."
        />

        <View style={styles.options}>
          {GENDER_OPTIONS.map((g) => (
            <SelectTile key={g} title={g} selected={state.gender === g} onPress={() => dispatch({ type: 'SET_GENDER', gender: g })} />
          ))}
          <SelectTile
            title={SELF_DESCRIBE}
            selected={isCustom}
            onPress={() => dispatch({ type: 'SET_GENDER', gender: SELF_DESCRIBE })}
          />
          {isCustom && (
            <TextInput
              value={state.genderCustom}
              onChangeText={(v) => dispatch({ type: 'SET_GENDER_CUSTOM', value: v })}
              placeholder="Type your own"
              placeholderTextColor={colors.faint}
              autoFocus
              style={styles.input}
            />
          )}
        </View>

        <View style={styles.visibleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.visibleTitle}>Show on my profile</Text>
            <Text style={styles.visibleDesc}>Off means only you can see this.</Text>
          </View>
          <Switch
            value={state.genderVisible}
            onValueChange={() => dispatch({ type: 'TOGGLE_GENDER_VISIBLE' })}
            trackColor={{ false: colors.borderSoft, true: colors.clay }}
            thumbColor="#fff"
          />
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
  options: { marginTop: 26, gap: 8 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.inner, backgroundColor: colors.surface,
    paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Figtree_500Medium', fontSize: 15, color: colors.ink,
  },
  visibleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18,
    backgroundColor: colors.surface, borderRadius: radius.inner, padding: 16, ...shadow.chip,
  },
  visibleTitle: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 14 },
  visibleDesc: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 12, marginTop: 3 },
  cta: { marginTop: 20 },
  ctaDisabled: { opacity: 0.45 },
});
