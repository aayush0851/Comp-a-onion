import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { Btn, Footer, Header, RadioRow, TextField, ToggleRow } from '../components/widgets';
import { useAppDispatch, useAppState } from '../store';
import { GENDER_OPTIONS, ONBOARDING_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Gender'>;

const SELF_DESCRIBE = 'Self-describe';
const OPTIONS = [...GENDER_OPTIONS, SELF_DESCRIBE];
const LABELS: Record<string, string> = { Nonbinary: 'Non-binary' };

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
    <View style={styles.screen}>
      <Header
        variant="stack"
        centerLabel={`Step 5 of ${ONBOARDING_STEPS}`}
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={5}
        title="How do you identify?"
        subtitle="Just so we get it right. You choose whether it shows."
        onBack={() => navigation.navigate('Birthday')}
      />
      <View style={styles.body}>
        {OPTIONS.map((g) => (
          <RadioRow key={g} label={LABELS[g] ?? g} selected={state.gender === g} onPress={() => dispatch({ type: 'SET_GENDER', gender: g })} />
        ))}
        {isCustom && (
          <TextField
            value={state.genderCustom}
            onChangeText={(v) => dispatch({ type: 'SET_GENDER_CUSTOM', value: v })}
            placeholder="Type your own"
            autoFocus
          />
        )}
        <ToggleRow
          style={{ marginTop: 5 }}
          title="Show on my profile"
          sub="Off means only you can see it."
          value={state.genderVisible}
          onChange={() => dispatch({ type: 'TOGGLE_GENDER_VISIBLE' })}
        />
      </View>
      <View style={{ flex: 1 }} />
      <Footer>
        <Btn label="Continue" variant={canContinue ? 'primary' : 'disabled'} onPress={submit} />
      </Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: 20, gap: 9 },
});
