import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { Btn, Header } from '../components/widgets';
import { VERIFY_STEPS } from '../data';
import { useAppState } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Verify'>;

export default function Verify({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const state = useAppState();
  const [showSkip, setShowSkip] = useState(false);
  const queued = state.selfieStatus === 'queued';
  const steps = VERIFY_STEPS.map((v) => {
    if (v.key === 'email') return { ...v, d: state.email };
    if (v.key === 'selfie' && queued) return { ...v, d: "We'll notify you once it's reviewed.", state: 'Queued' };
    return v;
  });

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        eyebrow="Verification"
        title="Prove you're a person."
        subtitle="Everyone on the board has done this. Nobody gets a seat without it."
        onBack={() => navigation.navigate('Highlights')}
      />
      <View style={styles.body}>
        {steps.map((v) => (
          <View key={v.key} style={styles.row}>
            {v.done ? (
              <View style={styles.check}><Text style={styles.checkLabel}>✓</Text></View>
            ) : (
              <View style={styles.checkEmpty} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{v.t}</Text>
              <Text style={styles.rowDesc}>{v.d}</Text>
            </View>
            <Pressable
              disabled={v.done || queued}
              onPress={() => navigation.navigate('SelfieCheck')}
              style={styles.stateChip}
            >
              <Text style={styles.stateChipLabel}>{v.state}</Text>
            </Pressable>
          </View>
        ))}
        <View style={styles.explainer}>
          <Text style={styles.explainerText}>
            Your selfie is checked and deleted. You show up as a first name and an initial — never a full name, never an address.
          </Text>
        </View>
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
        {queued ? (
          <>
            <View style={styles.queuedNote}>
              <Text style={styles.queuedNoteText}>Verification in review — we'll notify you the moment it's done.</Text>
            </View>
            <View style={{ marginTop: 12 }}><Btn label="Continue to the board" variant="primary" onPress={() => navigation.navigate('Board')} /></View>
          </>
        ) : (
          <>
            <Btn label="Do the selfie check" variant="primary" onPress={() => navigation.navigate('SelfieCheck')} />
            <View style={{ marginTop: 6 }}><Btn label="Skip for now" variant="ghost" onPress={() => setShowSkip(true)} /></View>
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
            <View style={{ marginTop: 18 }}>
              <Btn label="Verify now" variant="primary" onPress={() => { setShowSkip(false); navigation.navigate('SelfieCheck'); }} />
            </View>
            <View style={{ marginTop: 9 }}>
              <Btn label="Skip anyway" variant="secondary" onPress={() => { setShowSkip(false); navigation.navigate('Board'); }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 8, gap: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.surface,
    borderRadius: radius.inner, padding: 16, minHeight: 76, ...shadow.inner,
  },
  check: { width: 34, height: 34, minWidth: 34, borderRadius: 999, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  checkEmpty: { width: 34, height: 34, minWidth: 34, borderRadius: 999, borderWidth: 2, borderColor: colors.border },
  checkLabel: { color: '#fff', fontFamily: 'Figtree_800ExtraBold', fontSize: 15 },
  rowTitle: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 14.5 },
  rowDesc: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 12.5, marginTop: 3 },
  stateChip: { backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  stateChipLabel: { color: colors.clayPressed, fontFamily: 'Figtree_700Bold', fontSize: 11 },
  explainer: { backgroundColor: '#F8F2EC', borderRadius: radius.inner, padding: 15 },
  explainerText: { color: colors.inkSecondary, fontFamily: 'Figtree_400Regular', fontSize: 12.5, lineHeight: 19 },
  queuedNote: { backgroundColor: colors.sageBg, borderRadius: radius.inner, padding: 14 },
  queuedNoteText: { color: colors.sageInk, fontFamily: 'Figtree_500Medium', fontSize: 12.5, textAlign: 'center', lineHeight: 18 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16, backgroundColor: 'rgba(251,246,240,.98)' },
  backdrop: { flex: 1, backgroundColor: 'rgba(46,42,38,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet,
    padding: 22, paddingBottom: 34,
  },
  sheetTitle: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 19 },
  sheetBody: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 13.5, lineHeight: 20, marginTop: 9 },
});
