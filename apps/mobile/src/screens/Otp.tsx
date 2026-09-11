import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { BackPill, PrimaryButton, text } from '../components/ui';
import { maskPhone } from '../data';
import { useAppDispatch, useAppState } from '../state';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

function OtpBoxes({ value, onChangeText }: { value: string; onChangeText: (t: string) => void }) {
  const inputRef = useRef<TextInput>(null);
  const cells = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] ?? '');

  return (
    <View style={{ position: 'relative' }}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChangeText(t.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        autoFocus
        style={styles.hiddenInput}
      />
      <View pointerEvents="none" style={styles.boxRow}>
        {cells.map((c, i) => (
          <View key={i} style={[styles.box, c ? styles.boxFilled : null, i === value.length && styles.boxActive]}>
            <Text style={styles.boxLabel}>{c}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function Otp({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const canVerify = code.length === CODE_LENGTH;

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <BackPill onPress={() => navigation.navigate('Phone')} />
        <Text style={[text.title28, { marginTop: 26 }]}>Enter the code.</Text>
        <Text style={[text.body, { marginTop: 11 }]}>
          We sent six digits to {maskPhone(state.phone)}.
        </Text>

        <View style={{ marginTop: 26 }}>
          <OtpBoxes value={code} onChangeText={setCode} />
        </View>

        <Text
          onPress={() => seconds === 0 && setSeconds(RESEND_SECONDS)}
          style={[styles.resend, seconds > 0 && styles.resendDisabled]}
        >
          {seconds > 0 ? `Resend code in 0:${seconds.toString().padStart(2, '0')}` : 'Resend code'}
        </Text>

        <View style={{ flex: 1 }} />
        <PrimaryButton
          label="Verify"
          onPress={() => canVerify && dispatch({ type: 'AUTH_SUCCESS' })}
          style={[styles.cta, !canVerify && styles.ctaDisabled]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { flex: 1, padding: 22, paddingTop: 36, paddingBottom: 34 },
  hiddenInput: { position: 'absolute', inset: 0, opacity: 0 },
  boxRow: { flexDirection: 'row', gap: 10 },
  box: {
    width: 46, height: 56, borderRadius: radius.tile, borderWidth: 1.5, borderColor: colors.borderSoft,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.chip,
  },
  boxFilled: { borderColor: colors.clay, backgroundColor: colors.blush },
  boxActive: { borderColor: colors.clayPressed },
  boxLabel: { fontFamily: 'Figtree_700Bold', fontSize: 20, color: colors.ink },
  resend: {
    marginTop: 18, color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 13,
  },
  resendDisabled: { color: colors.faint },
  cta: { marginTop: 20 },
  ctaDisabled: { opacity: 0.45 },
});
