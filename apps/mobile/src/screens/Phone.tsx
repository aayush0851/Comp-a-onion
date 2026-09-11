import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius } from '../theme';
import { BackPill, PrimaryButton, text } from '../components/ui';
import { useAppDispatch } from '../state';

type Props = NativeStackScreenProps<RootStackParamList, 'Phone'>;

export default function Phone({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [digits, setDigits] = useState('');
  const canContinue = digits.length === 10;

  const submit = () => {
    if (!canContinue) return;
    dispatch({ type: 'SET_PHONE', phone: digits });
    navigation.navigate('Otp');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <BackPill onPress={() => navigation.navigate('Signup')} />
        <Text style={[text.title28, { marginTop: 26 }]}>What's your number?</Text>
        <Text style={[text.body, { marginTop: 11 }]}>
          We'll text you a code. Nobody sees this number — not even people you meet.
        </Text>

        <View style={styles.inputRow}>
          <View style={styles.prefix}>
            <Text style={styles.prefixLabel}>🇮🇳 +91</Text>
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

        <View style={{ flex: 1 }} />
        <PrimaryButton label="Send code" onPress={submit} style={[styles.cta, !canContinue && styles.ctaDisabled]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { flex: 1, padding: 22, paddingTop: 36, paddingBottom: 34 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 26,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.inner,
    backgroundColor: colors.surface, paddingHorizontal: 6,
  },
  prefix: { paddingVertical: 16, paddingHorizontal: 10, borderRightWidth: 1, borderRightColor: colors.line },
  prefixLabel: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 15 },
  input: { flex: 1, paddingVertical: 16, fontFamily: 'Figtree_500Medium', fontSize: 16, color: colors.ink, letterSpacing: 0.4 },
  cta: { marginTop: 20 },
  ctaDisabled: { opacity: 0.45 },
});
