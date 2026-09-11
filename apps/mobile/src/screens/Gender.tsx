import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius } from '../theme';
import { Btn, Header } from '../components/widgets';
import { useAppDispatch, useAppState } from '../store';
import { GENDER_OPTIONS, ONBOARDING_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Gender'>;

const SELF_DESCRIBE = 'Self-describe';
const OPTIONS = [...GENDER_OPTIONS, SELF_DESCRIBE];

export default function Gender({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const isCustom = state.gender === SELF_DESCRIBE;
  const canContinue = !!state.gender && (!isCustom || state.genderCustom.trim().length > 0);

  const submit = () => {
    if (!canContinue) return;
    navigation.navigate('Vibe');
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={5}
        title="How do you identify?"
        subtitle="This is just so we get it right. You choose whether it shows on your profile."
        onBack={() => navigation.navigate('Birthday')}
      />
      <View style={styles.body}>
        {OPTIONS.map((g) => {
          const on = state.gender === g;
          return (
            <Pressable key={g} onPress={() => dispatch({ type: 'SET_GENDER', gender: g })} style={[styles.option, on && styles.optionOn]}>
              <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.radioDot} />}</View>
              <Text style={styles.optionLabel}>{g}</Text>
            </Pressable>
          );
        })}
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
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
        <Btn label="Continue" variant={canContinue ? 'primary' : 'disabled'} onPress={submit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 8, gap: 9 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.tile, minHeight: 56, paddingHorizontal: 16 },
  optionOn: { borderWidth: 1.5, borderColor: colors.clay },
  radio: { width: 20, height: 20, borderRadius: 999, borderWidth: 2, borderColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.clay },
  radioDot: { width: 9, height: 9, borderRadius: 999, backgroundColor: colors.clay },
  optionLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 15, color: colors.ink },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.tile, backgroundColor: colors.surface,
    paddingHorizontal: 16, minHeight: 52, fontFamily: 'Figtree_500Medium', fontSize: 15, color: colors.ink,
  },
  visibleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 5,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.tile, padding: 15,
  },
  visibleTitle: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 14 },
  visibleDesc: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 12, marginTop: 3 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16 },
});
