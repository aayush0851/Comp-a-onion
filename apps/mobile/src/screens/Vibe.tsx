import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { Btn, Header } from '../components/widgets';
import { useAppState, useAppDispatch } from '../store';
import { ONBOARDING_STEPS, VIBE_TAGS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Vibe'>;

export default function Vibe({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const canContinue = state.vibeTags.length > 0;

  const submit = () => {
    if (!canContinue) return;
    navigation.navigate('ProfilePhoto');
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={6}
        title="What are you up for?"
        subtitle="Up to three. This shows on your profile — no essay required."
        onBack={() => navigation.navigate('Gender')}
      />
      <View style={styles.body}>
        <View style={styles.chips}>
          {VIBE_TAGS.map((t) => {
            const on = state.vibeTags.includes(t);
            return (
              <Pressable key={t} onPress={() => dispatch({ type: 'TOGGLE_VIBE_TAG', tag: t })} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                <Text style={[styles.chipLabel, { color: on ? colors.ground : colors.inkSecondary }]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.counter}>{state.vibeTags.length} of 3 chosen</Text>
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
        <Btn label="Continue" variant={canContinue ? 'primary' : 'disabled'} onPress={submit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { borderRadius: 999, minHeight: 44, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipOff: { backgroundColor: 'transparent', borderColor: colors.border },
  chipLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 13 },
  counter: { marginTop: 18, fontFamily: 'Figtree_600SemiBold', fontSize: 12, color: colors.faint },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16 },
});
