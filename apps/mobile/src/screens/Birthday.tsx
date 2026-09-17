import { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { Btn, Footer, Header, Notice, TextField } from '../components/widgets';
import { useAppState, useAppDispatch } from '../store';
import { ONBOARDING_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Birthday'>;

function isValidDate(day: number, month: number, year: number): boolean {
  if (year < 1900 || year > new Date().getFullYear()) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day && d.getTime() <= Date.now();
}

function calcAge(day: number, month: number, year: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const hadBirthdayThisYear = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!hadBirthdayThisYear) age -= 1;
  return age;
}

export default function Birthday({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  const { day, month, year } = state.dob;
  const complete = day.length === 2 && month.length === 2 && year.length === 4;
  const validFormat = complete && isValidDate(Number(day), Number(month), Number(year));
  const age = validFormat ? calcAge(Number(day), Number(month), Number(year)) : null;
  const canContinue = validFormat && age !== null && age >= 18;

  const setField = (field: 'day' | 'month' | 'year', value: string) => dispatch({ type: 'SET_DOB', field, value });

  const submit = () => {
    if (!canContinue) return;
    navigation.navigate('Gender');
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        centerLabel={`Step 4 of ${ONBOARDING_STEPS}`}
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={4}
        title="When's your birthday?"
        subtitle="You need to be 18 or over. This never appears on your profile."
        onBack={() => navigation.navigate('Name')}
      />
      <View style={styles.body}>
        <View style={styles.row}>
          <TextField
            value={day}
            onChangeText={(t) => { const v = t.replace(/\D/g, '').slice(0, 2); setField('day', v); if (v.length === 2) monthRef.current?.focus(); }}
            placeholder="DD"
            keyboardType="number-pad"
            maxLength={2}
            autoFocus
            style={[styles.input, { flex: 1 }]}
          />
          <TextField
            ref={monthRef}
            value={month}
            onChangeText={(t) => { const v = t.replace(/\D/g, '').slice(0, 2); setField('month', v); if (v.length === 2) yearRef.current?.focus(); }}
            placeholder="MM"
            keyboardType="number-pad"
            maxLength={2}
            style={[styles.input, { flex: 1 }]}
          />
          <TextField
            ref={yearRef}
            value={year}
            onChangeText={(t) => setField('year', t.replace(/\D/g, '').slice(0, 4))}
            placeholder="YYYY"
            keyboardType="number-pad"
            maxLength={4}
            style={[styles.input, { flex: 1.4 }]}
          />
        </View>
        {complete && !validFormat && (
          <Notice tone="rose" style={{ marginTop: 12 }}>That's not a real date. Double-check it.</Notice>
        )}
        {validFormat && age !== null && age < 18 && (
          <Notice tone="rose" style={{ marginTop: 12 }}>You need to be 18 or older to use Companion.</Notice>
        )}
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
  body: { paddingTop: 6, paddingHorizontal: 20 },
  row: { flexDirection: 'row', gap: 10 },
  input: { textAlign: 'center', paddingHorizontal: 8, fontFamily: font.bold },
});
