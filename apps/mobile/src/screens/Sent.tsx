import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { Btn } from '../components/widgets';

type Props = NativeStackScreenProps<RootStackParamList, 'Sent'>;

export default function Sent({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <View style={[styles.blob, { top: -60, left: -80, width: 260, height: 260, backgroundColor: colors.blush }]} />
      <View style={[styles.body, { paddingTop: insets.top + 44 }]}>
        <Text style={styles.kicker}>It's out there</Text>
        <Text style={styles.title}>Ramen, then walk it off</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>214</Text>
            <Text style={styles.statLabel}>people pinged</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.blush }]}>
            <Text style={[styles.statNum, { color: colors.clayPressed }]}>4</Text>
            <Text style={[styles.statLabel, { color: colors.blushInk2 }]}>asking to join</Text>
          </View>
        </View>
        <Text style={styles.body1}>
          You said approval required, so nobody's in yet. Have a look at who's asking — you can say no without saying anything.
        </Text>
        <View style={{ flex: 1 }} />
        <Btn label="See who's asking" onPress={() => navigation.navigate('Queue')} />
        <View style={{ marginTop: 9 }}><Btn label="Later" variant="ghost" onPress={() => navigation.navigate('Board')} /></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  blob: { position: 'absolute', borderRadius: 999 },
  body: { flex: 1, padding: 22, paddingTop: 36, paddingBottom: 34 },
  kicker: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 12 },
  title: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 32, letterSpacing: -0.8, marginTop: 12 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 22 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.inner, padding: 16, ...shadow.inner },
  statNum: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 30, letterSpacing: -0.6 },
  statLabel: { color: colors.muted, fontFamily: 'Figtree_500Medium', fontSize: 11.5, marginTop: 6 },
  body1: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 14, lineHeight: 22, marginTop: 20 },
});
