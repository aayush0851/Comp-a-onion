import { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { Btn, Footer, Header, Notice, TextField } from '../components/widgets';
import { useAppState, useAppDispatch } from '../store';
import { ONBOARDING_STEPS } from '../data';
import { isDefined } from '@companion/common';

type Props = NativeStackScreenProps<RootStackParamList, 'Birthday'>;

function isValidDate(day: number, month: number, year: number): boolean {
  if (year < 1900 || year > new Date().getFullYear()) return false;
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day && d.getTime() <= Date.now();
}

// Feb 29 only exists in leap years — default to one (2000) while the year isn't typed yet
// so day entry stays permissive instead of guessing wrong.
function daysInMonth(month: string, year: string): number {
  const m = Number(month);
  if (month.length < 2 || m < 1 || m > 12) return 31;
  const y = year.length === 4 ? Number(year) : 2000;
  return new Date(y, m, 0).getDate();
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
  const canContinue = validFormat && isDefined(age) && age >= 18;

  const setField = (field: 'day' | 'month' | 'year', value: string) => dispatch({ type: 'SET_DOB', field, value });

  const updateField = (field: 'day' | 'month' | 'year', raw: string) => {
    const maxLen = field === 'year' ? 4 : 2;
    let v = raw.replace(/\D/g, '').slice(0, maxLen);
    if (field === 'month' && v.length === maxLen) v = String(Math.min(Math.max(Number(v), 1), 12)).padStart(2, '0');
    if (field === 'day' && v.length === maxLen) v = String(Math.min(Math.max(Number(v), 1), daysInMonth(month, year))).padStart(2, '0');
    setField(field, v);

    // Changing month/year can invalidate an already-typed day (e.g. day 30 + Feb) — clamp it back in step.
    if (field !== 'day' && day.length === 2) {
      const max = daysInMonth(field === 'month' ? v : month, field === 'year' ? v : year);
      if (Number(day) > max) setField('day', String(max).padStart(2, '0'));
    }

    if (v.length === maxLen) {
      if (field === 'day') monthRef.current?.focus();
      if (field === 'month') yearRef.current?.focus();
    }
  };

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
            onChangeText={(t) => updateField('day', t)}
            placeholder="DD"
            hidePlaceholderOnFocus
            keyboardType="number-pad"
            maxLength={2}
            autoFocus
            selectTextOnFocus
            style={[styles.input, { flex: 1 }]}
          />
          <TextField
            ref={monthRef}
            value={month}
            onChangeText={(t) => updateField('month', t)}
            placeholder="MM"
            hidePlaceholderOnFocus
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
            style={[styles.input, { flex: 1 }]}
          />
          <TextField
            ref={yearRef}
            value={year}
            onChangeText={(t) => updateField('year', t)}
            placeholder="YYYY"
            hidePlaceholderOnFocus
            keyboardType="number-pad"
            maxLength={4}
            selectTextOnFocus
            style={[styles.input, { flex: 1.4 }]}
          />
        </View>
        {complete && !validFormat && (
          <Notice tone="rose" style={{ marginTop: 12 }}>That's not a real date. Double-check it.</Notice>
        )}
        {validFormat && isDefined(age) && age < 18 && (
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
