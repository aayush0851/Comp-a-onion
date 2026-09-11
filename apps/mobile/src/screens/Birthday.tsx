import { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius } from '../theme';
import { Btn, Header } from '../components/widgets';
import { useAppState, useAppDispatch } from '../store';
import { ONBOARDING_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Birthday'>;

function calcAge(day: number, month: number, year: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const hadBirthdayThisYear = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!hadBirthdayThisYear) age -= 1;
  return age;
}

export default function Birthday({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  const { day, month, year } = state.dob;
  const complete = day.length === 2 && month.length === 2 && year.length === 4;
  const age = complete ? calcAge(Number(day), Number(month), Number(year)) : null;
  const canContinue = complete && age !== null && age >= 18;

  const setField = (field: 'day' | 'month' | 'year', value: string) =>
    dispatch({ type: 'SET_DOB', field, value });

  const submit = () => {
    if (!canContinue) return;
    navigation.navigate('Gender');
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={4}
        title="When's your birthday?"
        subtitle="You need to be 18 or over. This never appears on your profile."
        onBack={() => navigation.navigate('Name')}
      />
      <View style={styles.body}>
        <View style={styles.row}>
          <TextInput
            value={day}
            onChangeText={(t) => { const v = t.replace(/\D/g, '').slice(0, 2); setField('day', v); if (v.length === 2) monthRef.current?.focus(); }}
            placeholder="DD"
            placeholderTextColor={colors.faint}
            keyboardType="number-pad"
            maxLength={2}
            autoFocus
            style={[styles.input, { flex: 1 }]}
          />
          <TextInput
            ref={monthRef}
            value={month}
            onChangeText={(t) => { const v = t.replace(/\D/g, '').slice(0, 2); setField('month', v); if (v.length === 2) yearRef.current?.focus(); }}
            placeholder="MM"
            placeholderTextColor={colors.faint}
            keyboardType="number-pad"
            maxLength={2}
            style={[styles.input, { flex: 1 }]}
          />
          <TextInput
            ref={yearRef}
            value={year}
            onChangeText={(t) => setField('year', t.replace(/\D/g, '').slice(0, 4))}
            placeholder="YYYY"
            placeholderTextColor={colors.faint}
            keyboardType="number-pad"
            maxLength={4}
            style={[styles.input, { flex: 1.4 }]}
          />
        </View>
        {complete && age !== null && age < 18 && (
          <Text style={styles.warning}>You need to be 18 or older to use Companion.</Text>
        )}
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
  row: { flexDirection: 'row', gap: 10 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.tile,
    backgroundColor: colors.surface, minHeight: 56, textAlign: 'center',
    fontFamily: 'Figtree_600SemiBold', fontSize: 16, color: colors.ink,
  },
  warning: { marginTop: 12, color: colors.clayPressed, fontFamily: 'Figtree_500Medium', fontSize: 12.5 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16 },
});
