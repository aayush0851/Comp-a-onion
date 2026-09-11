import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { Btn } from '../components/widgets';

type Props = NativeStackScreenProps<RootStackParamList, 'Filed'>;

export default function Filed({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <View style={[styles.blob, { top: -60, right: -70, width: 250, height: 250, backgroundColor: colors.sageBg }]} />
      <View style={[styles.body, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.check}><Text style={styles.checkLabel}>✓</Text></View>
        <Text style={styles.title}>Filed. Sealed until you both submit.</Text>
        <Text style={styles.body1}>
          Maya hasn't rated you yet. Both open at 9am tomorrow whatever happens — neither of you can see the other's first.
        </Text>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.doneBadge}><Text style={styles.doneBadgeLabel}>✓</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>You rated Maya</Text>
              <Text style={styles.statusSub}>5 stars, with a note</Text>
            </View>
          </View>
          <View style={[styles.statusRow, { borderTopWidth: 1, borderTopColor: colors.line, marginTop: 13, paddingTop: 13 }]}>
            <View style={styles.pendingBadge} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: colors.muted }]}>Maya hasn't rated you</Text>
              <Text style={styles.statusSub}>Unlocks 9am tomorrow</Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ gap: 6 }}>
          <Btn label="Back to your plans" variant="ghost" onPress={() => navigation.navigate('Board')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  blob: { position: 'absolute', borderRadius: 999 },
  body: { flex: 1, paddingHorizontal: 22 },
  check: { width: 56, height: 56, borderRadius: 999, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  checkLabel: { color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 24 },
  title: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 30, lineHeight: 35, letterSpacing: -0.9, marginTop: 22 },
  body1: { color: colors.muted, fontFamily: 'Newsreader_400Regular_Italic', fontSize: 15, lineHeight: 23, marginTop: 12 },
  statusCard: { backgroundColor: colors.surface, borderRadius: radius.inner, padding: 16, marginTop: 24, ...shadow.inner },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doneBadge: { width: 34, height: 34, borderRadius: 999, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  doneBadgeLabel: { color: '#fff', fontFamily: 'Figtree_800ExtraBold', fontSize: 15 },
  pendingBadge: { width: 34, height: 34, borderRadius: 999, borderWidth: 2, borderColor: colors.border },
  statusTitle: { fontFamily: 'Figtree_700Bold', fontSize: 13.5, color: colors.ink },
  statusSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
