import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { Header, RatingSummary, Stars } from '../components/widgets';
import { useAppState } from '../store';

const TILE_TONES = [colors.blush, colors.sageBg, '#F4EEE7'];

function seedHash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

type Props = NativeStackScreenProps<RootStackParamList, 'RequesterProfile'>;

export default function RequesterProfile({ navigation, route }: Props) {
  const state = useAppState();
  const { planId, requesterId } = route.params;
  const plan = state.publishedPlans.find((p) => p.id === planId);
  const requester = plan?.requesters.find((r) => r.id === requesterId);

  if (!requester) {
    return (
      <View style={styles.screen}>
        <Header variant="stack" title="Not found" onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const hash = seedHash(requester.id);
  const highlightCount = 2 + (hash % 3);
  const avatarTone = TILE_TONES[hash % TILE_TONES.length];

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        title={requester.name}
        subtitle={requester.rating ? `★ ${requester.rating.toFixed(1)} · ${requester.ratingCount} plans` : requester.history}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 34, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, paddingHorizontal: 4 }}>
          <View style={[styles.avatar, { backgroundColor: avatarTone }]}>
            <Text style={styles.avatarLabel}>{requester.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text style={styles.name}>{requester.name}</Text>
              {requester.isNew && (
                <View style={styles.newChip}><Text style={styles.newLabel}>New here</Text></View>
              )}
            </View>
            {!!requester.rating && (
              <View style={{ marginTop: 7 }}><Stars value={requester.rating} size="m" count={requester.ratingCount} /></View>
            )}
          </View>
        </View>

        {!!requester.rating && (
          <RatingSummary
            value={requester.rating}
            count={requester.ratingCount ?? 0}
            dist={[60, 40, 0, 0, 0]}
            traits={[{ label: 'Easy to talk to', n: String(requester.ratingCount ?? 0) }]}
          />
        )}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Their note on this plan</Text>
          <Text style={styles.intro}>{requester.intro}</Text>
        </View>

        <Text style={styles.highlightsLabel}>Peek into their personality</Text>
        <View style={styles.highlightsGrid}>
          {Array.from({ length: highlightCount }).map((_, i) => (
            <View key={i} style={[styles.highlightTile, { backgroundColor: TILE_TONES[i % TILE_TONES.length] }]}>
              <Feather name="image" size={22} color={colors.clayPressed} />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>What people say</Text>
          {(state.peopleTags[requester.id]?.length ?? 0) > 0 ? (
            <View style={{ gap: 8 }}>
              {state.peopleTags[requester.id].map((t) => (
                <View key={t} style={styles.wordPill}>
                  <Text style={styles.wordLabel}>{t}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No feedback yet.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  avatar: { width: 68, height: 68, minWidth: 68, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: colors.clayPressed, fontFamily: 'Figtree_700Bold', fontSize: 22 },
  name: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 19, letterSpacing: -0.4 },
  newChip: { backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  newLabel: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 11 },
  highlightsLabel: { fontFamily: 'Newsreader_400Regular_Italic', fontSize: 15, color: colors.muted, paddingHorizontal: 4 },
  highlightsGrid: { flexDirection: 'row', gap: 10 },
  highlightTile: { flex: 1, aspectRatio: 3 / 4, borderRadius: radius.tile, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.inner, padding: 17, ...shadow.card },
  sectionLabel: {
    fontFamily: 'Figtree_600SemiBold', fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase',
    color: colors.faint, marginBottom: 8,
  },
  intro: { color: colors.ink, fontFamily: 'Figtree_400Regular', fontSize: 14, lineHeight: 21 },
  wordPill: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14,
  },
  wordLabel: { color: colors.blushInk, fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
  emptyText: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 13 },
});
