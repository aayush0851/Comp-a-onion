import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius } from '../theme';
import { Btn, Header } from '../components/widgets';
import { ONBOARDING_STEPS } from '../data';
import { useAppDispatch } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Phone'>;

export default function Phone({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [digits, setDigits] = useState('');
  const canContinue = digits.length === 10;

  const submit = () => {
    if (!canContinue) return;
    dispatch({ type: 'SET_PHONE', phone: digits });
    navigation.navigate('Otp');
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={1}
        title="What's your number?"
        subtitle="We'll text you a code. Nobody sees this number — not even people you meet."
        onBack={() => navigation.navigate('Signup')}
      />
      <View style={styles.body}>
        <View style={styles.inputRow}>
          <View style={styles.prefix}>
            <Text style={styles.prefixLabel}>+91</Text>
          </View>
          <TextInput
            value={digits}
            onChangeText={(t) => setDigits(t.replace(/\D/g, '').slice(0, 10))}
            placeholder="98765 43210"
            placeholderTextColor={colors.faint}
            keyboardType="number-pad"
            autoFocus
            style={styles.input}
          />
        </View>
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
        <Btn label="Send code" variant={canContinue ? 'primary' : 'disabled'} onPress={submit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'stretch', gap: 10,
  },
  prefix: {
    width: 84, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.tile,
    minHeight: 56, alignItems: 'center', justifyContent: 'center',
  },
  prefixLabel: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 16 },
  input: {
    flex: 1, borderWidth: 1.5, borderColor: colors.clay, backgroundColor: colors.surface, borderRadius: radius.tile,
    minHeight: 56, paddingHorizontal: 16, fontFamily: 'Figtree_600SemiBold', fontSize: 16, color: colors.ink, letterSpacing: 0.3,
  },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16 },
});
