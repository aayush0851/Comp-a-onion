import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { Btn, FilterChips, Footer, Header, Notice } from '../components/widgets';
import { useAppState, useAppDispatch } from '../store';
import { useOnboardingSave } from '../hooks/useOnboardingSave';
import { ONBOARDING_STEPS, PROFILE_TAGS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Vibe'>;

export default function Vibe({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const canContinue = state.vibeTags.length > 0;
  const { save, saving, error: saveError } = useOnboardingSave();

  const submit = () => {
    if (!canContinue) return;
    save({ vibeTags: state.vibeTags }, () => navigation.navigate('ProfilePhoto'));
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        centerLabel={`Step 6 of ${ONBOARDING_STEPS}`}
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={6}
        title="What are you up for?"
        subtitle="Up to three. This shows on your profile — no essay required."
        onBack={() => navigation.navigate('Gender')}
      />
      <View style={styles.body}>
        <FilterChips
          multi
          activeTone="amber"
          items={PROFILE_TAGS}
          active={PROFILE_TAGS.map((t, i) => (state.vibeTags.includes(t) ? i : -1)).filter((i) => i >= 0)}
          onChange={(i) => dispatch({ type: 'TOGGLE_VIBE_TAG', tag: PROFILE_TAGS[i] })}
        />
        <Text style={styles.counter}>{state.vibeTags.length} of 3 chosen</Text>
      </View>
      <View style={{ flex: 1 }} />
      <Footer>
        {!!saveError && <Notice tone="rose">{saveError}</Notice>}
        <Btn label="Continue" variant={canContinue ? 'primary' : 'disabled'} loading={saving} onPress={submit} />
      </Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: 20 },
  counter: { marginTop: 18, fontFamily: font.bold, fontSize: 12, color: colors.zinc400 },
});
