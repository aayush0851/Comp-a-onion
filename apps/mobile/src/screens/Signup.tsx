import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { Btn, CheckMark, useLightStatusBar } from '../components/widgets';
import { SIGNUP_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function Signup({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  useLightStatusBar();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 10 }]}>
      <View style={styles.brand}>
        <CheckMark size={30} dark={false} />
        <Text style={styles.word}>Companion</Text>
      </View>
      <View style={{ paddingTop: 64, paddingHorizontal: 24 }}>
        <Text style={styles.title}>Nobody free tonight?</Text>
        <Text style={[styles.title, { color: colors.amber }]}>Somebody is.</Text>
        <Text style={styles.lede}>Post a hangout. It goes out to strangers nearby. You handpick who comes. That's the whole app.</Text>
      </View>
      <View style={{ paddingTop: 36, paddingHorizontal: 24, gap: 13 }}>
        {SIGNUP_STEPS.map((s) => (
          <View key={s.n} style={styles.stepRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumLabel}>{s.n}</Text></View>
            <Text style={styles.stepText}>{s.t}</Text>
          </View>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: Math.max(insets.bottom, 14) + 16 }}>
        <Btn label="Get started" variant="amber" onPress={() => navigation.navigate('Auth')} />
        <Text style={styles.caption}>Not a dating app. Nothing to swipe, no faces on the board.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24 },
  word: { fontFamily: font.extrabold, fontSize: 19, letterSpacing: -0.6, color: colors.white },
  title: { fontFamily: font.extrabold, fontSize: 38, lineHeight: 43, letterSpacing: -1.7, color: colors.white },
  lede: { fontFamily: font.regular, fontSize: 14.5, lineHeight: 23, color: colors.zinc400, marginTop: 18, maxWidth: 305 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  stepNum: { width: 27, height: 27, minWidth: 27, borderRadius: 9, backgroundColor: colors.zinc800, alignItems: 'center', justifyContent: 'center' },
  stepNumLabel: { fontFamily: font.extrabold, fontSize: 12, color: colors.amber },
  stepText: { flex: 1, fontFamily: font.semibold, fontSize: 14, color: colors.zinc200 },
  caption: { marginTop: 14, textAlign: 'center', fontFamily: font.regular, fontSize: 12.5, lineHeight: 19, color: colors.zinc500 },
});
