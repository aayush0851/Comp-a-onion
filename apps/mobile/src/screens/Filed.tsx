import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { Btn, CheckDot, Footer } from '../components/widgets';

type Props = NativeStackScreenProps<RootStackParamList, 'Filed'>;

export default function Filed({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const rated = route.params?.rated ?? 0;
  const name = route.params?.firstName;
  const stars = route.params?.stars;
  const who = rated === 1 && name ? name : rated > 1 ? 'Everyone' : 'They';
  const ratedLine = rated === 0
    ? 'You reviewed the hangout'
    : rated === 1 && name ? `You rated ${name}` : `You rated ${rated} people`;
  const ratedSub = [stars ? `${stars} star${stars === 1 ? '' : 's'}` : null, route.params?.withNote ? 'with a note' : null].filter(Boolean).join(', ') || 'Filed and sealed';

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 56 }]}>
      <View style={{ paddingHorizontal: 24 }}>
        <View style={styles.mark}><Text style={styles.markGlyph}>✓</Text></View>
        <Text style={styles.title}>Filed. Sealed until you both submit.</Text>
        <Text style={styles.body}>
          Nobody sees anything until everyone's in — neither of you sees the other's first.
        </Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <CheckDot size={34} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{ratedLine}</Text>
              <Text style={styles.rowSub}>{ratedSub}</Text>
            </View>
          </View>
          {rated > 0 && (
            <View style={[styles.row, styles.rowRule]}>
              <View style={styles.pending} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.zinc500 }]}>{rated > 1 ? 'Not everyone has rated you yet' : `${who} hasn't rated you yet`}</Text>
                <Text style={[styles.rowSub, { color: colors.zinc400 }]}>Unlocks at the same moment for both</Text>
              </View>
            </View>
          )}
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <Footer transparent>
        <Btn label="Back to my hangouts" variant="amber" onPress={() => navigation.navigate('MyPlans')} />
        <Btn label="Back to the board" variant="ghost" onPress={() => navigation.navigate('Board')} />
      </Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  mark: { width: 58, height: 58, borderRadius: 20, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  markGlyph: { fontFamily: font.extrabold, fontSize: 25, color: colors.mintInk },
  title: { fontFamily: font.extrabold, fontSize: 30, lineHeight: 36, letterSpacing: -1.2, color: colors.ink, marginTop: 22 },
  body: { fontFamily: font.regular, fontSize: 14.5, lineHeight: 23, color: colors.zinc500, marginTop: 12 },
  card: { backgroundColor: colors.zinc100, borderRadius: 20, padding: 16, marginTop: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowRule: { marginTop: 13, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.zinc200 },
  pending: { width: 34, height: 34, borderRadius: 999, borderWidth: 2, borderColor: colors.zinc300 },
  rowTitle: { fontFamily: font.extrabold, fontSize: 13.5, color: colors.ink },
  rowSub: { fontFamily: font.regular, fontSize: 12, color: colors.zinc500, marginTop: 2 },
});
