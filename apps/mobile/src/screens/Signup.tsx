import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { Btn } from '../components/widgets';
import { SIGNUP_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function Signup({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <View style={[styles.blob, { top: -80, right: -70, width: 250, height: 250, backgroundColor: colors.blush }]} />
      <View style={[styles.blob, { bottom: 180, left: -100, width: 210, height: 210, backgroundColor: colors.sageBg }]} />
      <View style={[styles.body, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 30 }]}>
        <Text style={styles.wordmark}>companion</Text>
        <View style={{ marginTop: 56 }}>
          <Text style={styles.title1}>Nobody free tonight?</Text>
          <Text style={styles.title2}>Somebody is.</Text>
          <Text style={styles.lede}>
            Post a plan. It goes out to verified strangers nearby. You pick who comes. That's the whole app.
          </Text>
        </View>
        <View style={{ marginTop: 34, gap: 14 }}>
          {SIGNUP_STEPS.map((s) => (
            <View key={s.n} style={styles.stepRow}>
              <View style={styles.stepNum}><Text style={styles.stepNumLabel}>{s.n}</Text></View>
              <Text style={styles.stepText}>{s.t}</Text>
            </View>
          ))}
        </View>
        <View style={{ flex: 1 }} />
        <Btn label="Start with a phone number" variant="primary" onPress={() => navigation.navigate('Phone')} />
        <Text style={styles.caption}>Not a dating app. Nothing to swipe, no faces on the board.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  blob: { position: 'absolute', borderRadius: 999 },
  body: { flex: 1, paddingHorizontal: 22 },
  wordmark: { fontFamily: 'Figtree_800ExtraBold', fontSize: 20, letterSpacing: -0.3, color: colors.ink },
  title1: { fontFamily: 'Figtree_700Bold', fontSize: 34, lineHeight: 39, letterSpacing: -1.1, color: colors.ink },
  title2: { fontFamily: 'Newsreader_400Regular_Italic', fontSize: 34, lineHeight: 39, color: colors.clayPressed },
  lede: { fontFamily: 'Figtree_400Regular', fontSize: 14.5, lineHeight: 22, color: colors.muted, marginTop: 16, maxWidth: 300 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  stepNum: { width: 26, height: 26, minWidth: 26, borderRadius: 999, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' },
  stepNumLabel: { color: colors.clayPressed, fontFamily: 'Figtree_700Bold', fontSize: 12 },
  stepText: { flex: 1, color: '#453F39', fontFamily: 'Figtree_600SemiBold', fontSize: 14 },
  caption: { marginTop: 14, textAlign: 'center', color: colors.muted, fontFamily: 'Newsreader_400Regular_Italic', fontSize: 13, lineHeight: 19 },
});
