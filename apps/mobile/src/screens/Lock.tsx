import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { Btn } from '../components/widgets';

type Props = NativeStackScreenProps<RootStackParamList, 'Lock'>;

export default function Lock({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <View style={[styles.blob, { top: -40, left: -70, width: 280, height: 280, backgroundColor: colors.darkBlob1 }]} />
      <View style={[styles.blob, { bottom: 130, right: -90, width: 240, height: 240, backgroundColor: colors.darkBlob2 }]} />
      <View style={[styles.body, { paddingTop: insets.top + 34, paddingBottom: insets.bottom + 30 }]}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.date}>Tuesday 7 April</Text>
          <Text style={styles.clock}>19:04</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.icon}><Text style={styles.iconLabel}>c</Text></View>
            <Text style={styles.appName}>Companion</Text>
            <Text style={styles.now}>now</Text>
          </View>
          <Text style={styles.cardTitle}>Priya needs one more for ramen</Text>
          <Text style={styles.cardBody}>
            19:30 · 0.4 mi · Japantown. She approves who comes, so asking costs you nothing.
          </Text>
          <View style={styles.actions}>
            <View style={{ flex: 1 }}>
              <Btn label="Ask to join" variant="primary" onPress={() => navigation.navigate('Detail', { id: 'ramen' })} />
            </View>
            <View style={{ flex: 1 }}>
              <Btn label="Not tonight" variant="secondary" onPress={() => navigation.navigate('Board')} />
            </View>
          </View>
        </View>
        <View style={styles.reach}>
          <Text style={styles.reachText}>Sent to 214 verified people within a mile. Three seats, first three approved.</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Text style={styles.hint}>Swipe up to open</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.darkGround },
  blob: { position: 'absolute', borderRadius: 999 },
  body: { flex: 1, paddingHorizontal: 16 },
  date: { color: 'rgba(251,246,240,.6)', fontFamily: 'Figtree_500Medium', fontSize: 15 },
  clock: { color: '#FBF6F0', fontFamily: 'Figtree_400Regular', fontSize: 74, marginTop: 4, letterSpacing: -3 },
  card: {
    marginTop: 34, backgroundColor: colors.surfaceRaised, borderRadius: radius.sheet,
    padding: 18, paddingBottom: 16, ...shadow.dark,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 13 },
  icon: { width: 22, height: 22, borderRadius: 7, backgroundColor: colors.clay, alignItems: 'center', justifyContent: 'center' },
  iconLabel: { color: '#fff', fontFamily: 'Figtree_800ExtraBold', fontSize: 12 },
  appName: { flex: 1, color: colors.inkSecondary, fontFamily: 'Figtree_700Bold', fontSize: 12.5 },
  now: { color: colors.faint, fontFamily: 'Figtree_500Medium', fontSize: 11.5 },
  cardTitle: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 17, letterSpacing: -0.3, marginTop: 12 },
  cardBody: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 13, lineHeight: 19, marginTop: 6 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 16 },
  reach: { marginTop: 16, paddingHorizontal: 8 },
  reachText: {
    color: 'rgba(251,246,240,.45)', fontFamily: 'Newsreader_400Regular_Italic', fontSize: 12.5, lineHeight: 19, textAlign: 'center',
  },
  hint: { textAlign: 'center', color: 'rgba(251,246,240,.5)', fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
});
