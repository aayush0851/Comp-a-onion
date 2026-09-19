import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { CheckMark, useLightStatusBar } from '../components/widgets';

type Props = NativeStackScreenProps<RootStackParamList, 'Lock'>;

export default function Lock({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  useLightStatusBar();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 36, paddingBottom: Math.max(insets.bottom, 14) + 16 }]}>
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.date}>Tuesday 7 April</Text>
        <Text style={styles.clock}>19:04</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <CheckMark size={22} dark={false} />
          <Text style={styles.appName}>Companion</Text>
          <Text style={styles.now}>now</Text>
        </View>
        <Text style={styles.cardTitle}>Maya needs one more for ramen</Text>
        <Text style={styles.cardBody}>8:15 PM · 0.4 mi · Japantown. She handpicks who comes, so asking costs you nothing.</Text>
        <View style={styles.actions}>
          <Pressable onPress={() => navigation.navigate('Detail', { id: 'ramen' })} style={[styles.action, { backgroundColor: colors.amber }]}>
            <Text style={[styles.actionLabel, { color: colors.ink }]}>Ask to join</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Board')} style={[styles.action, { backgroundColor: colors.zinc800 }]}>
            <Text style={[styles.actionLabel, { color: colors.zinc200 }]}>Not tonight</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.reach}>Sent to 214 people within a mile. Three seats, host picks.</Text>
      <View style={{ flex: 1 }} />
      <Text style={styles.hint}>Swipe up to open</Text>
      <View style={styles.homeBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.inkPressed },
  date: { fontFamily: font.semibold, fontSize: 15, color: colors.zinc500 },
  clock: { fontFamily: font.regular, fontSize: 78, lineHeight: 88, letterSpacing: -2.5, color: colors.white },
  card: { marginTop: 46, marginHorizontal: 16, backgroundColor: '#18181B', borderWidth: 1, borderColor: colors.zinc800, borderRadius: 24, padding: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  appName: { flex: 1, fontFamily: font.bold, fontSize: 12.5, color: colors.zinc200 },
  now: { fontFamily: font.medium, fontSize: 11.5, color: colors.zinc500 },
  cardTitle: { fontFamily: font.extrabold, fontSize: 17, letterSpacing: -0.5, color: colors.white, marginTop: 12 },
  cardBody: { fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: colors.zinc400, marginTop: 6 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 16 },
  action: { flex: 1, minHeight: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontFamily: font.bold, fontSize: 13.5 },
  reach: { paddingTop: 16, paddingHorizontal: 26, textAlign: 'center', fontFamily: font.regular, fontSize: 12.5, lineHeight: 19, color: '#52525B' },
  hint: { textAlign: 'center', fontFamily: font.semibold, fontSize: 12.5, color: '#52525B' },
  homeBar: { width: 132, height: 5, borderRadius: 999, backgroundColor: colors.zinc700, alignSelf: 'center', marginTop: 14 },
});
