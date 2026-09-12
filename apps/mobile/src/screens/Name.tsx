import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius } from '../theme';
import { Btn, Header } from '../components/widgets';
import { useAppDispatch, useAppState } from '../store';
import { ONBOARDING_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Name'>;

export default function Name({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const state = useAppState();
  const [name, setName] = useState(state.name);
  const canContinue = name.trim().length > 0;

  const submit = () => {
    if (!canContinue) return;
    dispatch({ type: 'SET_NAME', name: name.trim() });
    navigation.navigate('Birthday');
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={3}
        title="What should people call you?"
        subtitle="Just a first name — that's all anyone ever sees."
      />
      <View style={styles.body}>
        <Text style={styles.label}>First name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Priya"
          placeholderTextColor={colors.faint}
          autoFocus
          autoCapitalize="words"
          style={styles.input}
        />
        {canContinue && (
          <View style={styles.confirm}>
            <View style={styles.confirmCheck}><Text style={styles.confirmCheckLabel}>✓</Text></View>
            <Text style={styles.confirmText}>You'll appear as <Text style={styles.confirmStrong}>{name.trim()}</Text></Text>
          </View>
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
  label: { fontFamily: 'Figtree_700Bold', fontSize: 10.5, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.faint, marginBottom: 8 },
  input: {
    borderWidth: 1.5, borderColor: colors.clay, borderRadius: radius.tile,
    backgroundColor: colors.surface, paddingHorizontal: 16, minHeight: 56,
    fontFamily: 'Figtree_600SemiBold', fontSize: 16, color: colors.ink,
  },
  confirm: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, backgroundColor: '#F8F2EC', borderRadius: 14 },
  confirmCheck: { width: 18, height: 18, minWidth: 18, borderRadius: 999, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  confirmCheckLabel: { color: '#fff', fontFamily: 'Figtree_800ExtraBold', fontSize: 10 },
  confirmText: { flex: 1, fontSize: 12.5, lineHeight: 18, color: colors.inkSecondary },
  confirmStrong: { fontFamily: 'Figtree_700Bold' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16 },
});
