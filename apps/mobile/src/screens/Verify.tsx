import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { OnboardingHeader, OutlineButton, PrimaryButton } from '../components/ui';
import { VERIFY_STEPS, maskPhone, ONBOARDING_STEPS } from '../data';
import { useAppState } from '../state';

type Props = NativeStackScreenProps<RootStackParamList, 'Verify'>;

export default function Verify({ navigation }: Props) {
  const state = useAppState();
  const [showSkip, setShowSkip] = useState(false);
  const queued = state.selfieStatus === 'queued';
  const steps = VERIFY_STEPS.map((v) => {
    if (v.key === 'phone') return { ...v, d: maskPhone(state.phone) };
    if (v.key === 'selfie' && queued) return { ...v, d: "We'll notify you once it's reviewed.", state: 'Queued' };
    return v;
  });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <OnboardingHeader
          onBack={() => navigation.navigate('Highlights')}
          step={6}
          totalSteps={ONBOARDING_STEPS}
          title="Prove you're a person."
          subtitle="Everyone on the board has done this. Nobody gets a seat without it."
        />
        <View style={{ marginTop: 22, gap: 9 }}>
          {steps.map((v) => (
            <View key={v.key} style={styles.row}>
              {v.done && (
                <View style={styles.check}><Text style={styles.checkLabel}>✓</Text></View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{v.t}</Text>
                <Text style={styles.rowDesc}>{v.d}</Text>
              </View>
              <View style={styles.stateChip}><Text style={styles.stateChipLabel}>{v.state}</Text></View>
            </View>
          ))}
        </View>
        <View style={styles.explainer}>
          <Text style={styles.explainerText}>
            Your selfie is checked and deleted. You show up as a first name and an initial — never a full name, never an address.
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        {queued ? (
          <>
            <View style={styles.queuedNote}>
              <Text style={styles.queuedNoteText}>Verification in review — we'll notify you the moment it's done.</Text>
            </View>
            <PrimaryButton label="Continue to the board" onPress={() => navigation.navigate('Board')} style={{ marginTop: 12 }} />
          </>
        ) : (
          <>
            <PrimaryButton label="Do the selfie check" onPress={() => navigation.navigate('SelfieCheck')} style={{ marginTop: 20 }} />
            <Pressable onPress={() => setShowSkip(true)} style={styles.skipLink}>
              <Text style={styles.skipLabel}>Skip for now</Text>
            </Pressable>
          </>
        )}
      </View>

      <Modal visible={showSkip} transparent animationType="fade" onRequestClose={() => setShowSkip(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Skip verification?</Text>
            <Text style={styles.sheetBody}>
              You can still browse and post without it. But a checkmark gets noticed — verified people get more responses.
            </Text>
            <PrimaryButton
              label="Verify now"
              onPress={() => { setShowSkip(false); navigation.navigate('SelfieCheck'); }}
              style={{ marginTop: 18 }}
            />
            <OutlineButton
              label="Skip anyway"
              onPress={() => { setShowSkip(false); navigation.navigate('Board'); }}
              style={{ marginTop: 9 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { flex: 1, padding: 22, paddingTop: 36, paddingBottom: 34 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.surface,
    borderRadius: radius.inner, padding: 16, ...shadow.chip,
  },
  check: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: colors.sage,
    alignItems: 'center', justifyContent: 'center',
  },
  checkLabel: { color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 13 },
  rowTitle: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 14 },
  rowDesc: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 12, marginTop: 3 },
  stateChip: { backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 11 },
  stateChipLabel: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 11.5 },
  explainer: { marginTop: 16, backgroundColor: colors.sageBg, borderRadius: radius.inner, padding: 16 },
  explainerText: { color: colors.sageInk, fontFamily: 'Figtree_400Regular', fontSize: 12.5, lineHeight: 19 },
  queuedNote: { backgroundColor: colors.sageBg, borderRadius: radius.inner, padding: 14 },
  queuedNoteText: { color: colors.sageInk, fontFamily: 'Figtree_500Medium', fontSize: 12.5, textAlign: 'center', lineHeight: 18 },
  skipLink: { alignSelf: 'center', marginTop: 13, padding: 6 },
  skipLabel: { color: colors.faint, fontFamily: 'Figtree_600SemiBold', fontSize: 13 },
  backdrop: { flex: 1, backgroundColor: 'rgba(46,42,38,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet,
    padding: 22, paddingBottom: 34,
  },
  sheetTitle: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 19 },
  sheetBody: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 13.5, lineHeight: 20, marginTop: 9 },
});
