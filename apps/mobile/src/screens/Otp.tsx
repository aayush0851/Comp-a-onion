import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { Btn, Header } from '../components/widgets';
import { maskPhone, ONBOARDING_STEPS } from '../data';
import { useAppDispatch, useAppState } from '../store';

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
  const insets = useSafeAreaInsets();
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
    <View style={styles.screen}>
      <Header
        variant="stack"
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={2}
        title="Enter the code."
        subtitle={`We sent six digits to ${maskPhone(state.phone)}.`}
        onBack={() => navigation.navigate('Phone')}
      />
      <View style={styles.body}>
        <OtpBoxes value={code} onChangeText={setCode} />
        <Text
          onPress={() => seconds === 0 && setSeconds(RESEND_SECONDS)}
          style={[styles.resend, seconds > 0 && styles.resendDisabled]}
        >
          {seconds > 0 ? `Resend code in 0:${seconds.toString().padStart(2, '0')}` : 'Resend code'}
        </Text>
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
        <Btn label="Verify" variant={canVerify ? 'primary' : 'disabled'} onPress={() => canVerify && dispatch({ type: 'AUTH_SUCCESS' })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 8 },
  hiddenInput: { position: 'absolute', inset: 0, opacity: 0 },
  boxRow: { flexDirection: 'row', gap: 8 },
  box: {
    flex: 1, aspectRatio: 1, borderRadius: radius.tile, borderWidth: 1.5, borderColor: colors.borderSoft,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.chip,
  },
  boxFilled: { borderColor: colors.clay, backgroundColor: colors.surface },
  boxActive: { borderColor: colors.clayPressed },
  boxLabel: { fontFamily: 'Figtree_700Bold', fontSize: 24, color: colors.ink },
  resend: { marginTop: 18, color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 13 },
  resendDisabled: { color: colors.muted },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16 },
});
