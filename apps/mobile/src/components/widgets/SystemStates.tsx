import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../../theme';
import { Wordmark } from './Wordmark';

function Bar({ w, h, bg = colors.zinc200, r = 5, mt = 0 }: { w: `${number}%` | number; h: number; bg?: string; r?: number; mt?: number }) {
  return <View style={{ width: w, height: h, borderRadius: r, backgroundColor: bg, marginTop: mt }} />;
}

export function CardSkeleton({ faded }: { faded?: boolean }) {
  return (
    <View style={[styles.card, faded && { opacity: 0.6 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: colors.zinc200 }} />
        <View style={{ flex: 1 }}>
          <Bar w="42%" h={14} />
          <Bar w="28%" h={11} bg="#EAEAEC" mt={7} />
        </View>
      </View>
      <Bar w="74%" h={22} r={8} mt={14} />
      {!faded && (
        <>
          <Bar w="92%" h={15} r={6} bg="#EAEAEC" mt={9} />
          <View style={styles.cardFoot}>
            <Bar w="36%" h={13} />
            <View style={{ width: 104, height: 44, borderRadius: 999, backgroundColor: colors.zinc200 }} />
          </View>
        </>
      )}
    </View>
  );
}

export function ListSkeleton() {
  return (
    <View style={{ paddingHorizontal: 18, gap: 11 }}>
      <CardSkeleton />
      <CardSkeleton faded />
    </View>
  );
}

export function LoadingScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.white, paddingTop: insets.top + 2 }}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View style={{ minHeight: 44, justifyContent: 'center' }}><Wordmark /></View>
        <Bar w="44%" h={14} r={6} bg={colors.zinc100} mt={14} />
        <Bar w="76%" h={30} r={9} mt={10} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 14 }}>
        <View style={[styles.chip, { width: 94, backgroundColor: colors.zinc200 }]} />
        <View style={[styles.chip, { width: 118 }]} />
        <View style={[styles.chip, { width: 108 }]} />
      </View>
      <ListSkeleton />
    </View>
  );
}

export function OfflineBanner({ onRetry, lastLoaded }: { onRetry?: () => void; lastLoaded?: string | null }) {
  return (
    <View>
      <View style={styles.banner}>
        <View style={styles.bannerDot} />
        <Text style={styles.bannerText}>No connection — showing what we had</Text>
        <Pressable onPress={onRetry} style={styles.retry}>
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </View>
      {!!lastLoaded && <Text style={styles.lastLoaded}>Last loaded at {lastLoaded}.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.zinc100, borderRadius: 24, padding: 16 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.zinc200 },
  chip: { height: 42, borderRadius: 999, backgroundColor: colors.zinc100 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.ink, borderRadius: 18, padding: 15 },
  bannerDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: colors.amber },
  bannerText: { flex: 1, fontFamily: font.bold, fontSize: 12.5, color: colors.white },
  retry: { minHeight: 34, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.amber, justifyContent: 'center' },
  retryLabel: { fontFamily: font.bold, fontSize: 11.5, color: colors.ink },
  lastLoaded: { fontFamily: font.semibold, fontSize: 12, color: colors.zinc400, marginTop: 10 },
});
