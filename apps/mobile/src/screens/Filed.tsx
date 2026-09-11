import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { PrimaryButton } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Filed'>;

export default function Filed({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.blob, { top: -60, right: -70, width: 250, height: 250, backgroundColor: colors.sageBg }]} />
      <View style={styles.body}>
        <View style={styles.check}><Text style={styles.checkLabel}>✓</Text></View>
        <Text style={styles.title}>Both reviews are in.</Text>
        <Text style={styles.body1}>
          Priya's host scores updated tonight. Yours unlock tomorrow at nine, at the same moment as everyone else's — and two of the three said they'd meet you again, which you now know because you said it back.
        </Text>
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>Twelve nights out with people you didn't know in March. That used to be zero.</Text>
        </View>
        <View style={{ flex: 1 }} />
        <PrimaryButton label="Back to the board" onPress={() => navigation.navigate('Board')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  blob: { position: 'absolute', borderRadius: 999 },
  body: { flex: 1, padding: 22, paddingTop: 40, paddingBottom: 34 },
  check: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  checkLabel: { color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 19 },
  title: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 32, letterSpacing: -0.7, marginTop: 18 },
  body1: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 14, lineHeight: 22, marginTop: 14 },
  quoteCard: { backgroundColor: colors.surface, borderRadius: radius.inner, padding: 18, marginTop: 20, ...shadow.inner },
  quoteText: { color: colors.muted, fontFamily: 'Newsreader_400Regular_Italic', fontSize: 16, lineHeight: 24 },
});
