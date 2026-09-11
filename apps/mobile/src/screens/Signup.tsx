import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { PrimaryButton, text } from '../components/ui';
import { SIGNUP_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function Signup({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.blob, { top: -80, right: -70, width: 250, height: 250, backgroundColor: colors.blush }]} />
      <View style={[styles.blob, { bottom: 180, left: -100, width: 210, height: 210, backgroundColor: colors.sageBg }]} />
      <View style={styles.body}>
        <Text style={text.wordmark}>companion</Text>
        <View style={{ marginTop: 64 }}>
          <Text style={text.display1}>Nobody free tonight?</Text>
          <Text style={[text.display2, { marginTop: 2 }]}>Somebody is.</Text>
          <Text style={[text.body, { marginTop: 16, maxWidth: 290 }]}>
            Post a plan. It goes out to verified strangers nearby. You pick who comes. That’s the whole app.
          </Text>
        </View>
        <View style={{ marginTop: 26, gap: 9 }}>
          {SIGNUP_STEPS.map((s) => (
            <View key={s.n} style={styles.stepCard}>
              <View style={styles.stepNum}><Text style={styles.stepNumLabel}>{s.n}</Text></View>
              <Text style={styles.stepText}>{s.t}</Text>
            </View>
          ))}
        </View>
        <View style={{ flex: 1 }} />
        <PrimaryButton label="Start with a phone number" onPress={() => navigation.navigate('Phone')} style={{ marginTop: 20 }} />
        <Text style={styles.caption}>Not a dating app. Nothing to swipe, no faces on the board.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  blob: { position: 'absolute', borderRadius: 999 },
  body: { flex: 1, padding: 22, paddingTop: 36, paddingBottom: 34 },
  stepCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface,
    borderRadius: 18, padding: 14, ...shadow.chip,
  },
  stepNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.blush,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumLabel: { color: colors.clayPressed, fontFamily: 'Figtree_700Bold', fontSize: 12 },
  stepText: { flex: 1, color: colors.ink, fontFamily: 'Figtree_500Medium', fontSize: 13, lineHeight: 18 },
  caption: {
    marginTop: 10, textAlign: 'center', color: colors.faint, fontFamily: 'Figtree_400Regular', fontSize: 11.5,
  },
});
