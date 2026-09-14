import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { Header, Stars } from '../components/widgets';
import { initialsOf } from '../data/eventDisplay';
import { usersApi } from '../api';
import type { ApiUser } from '../api/types';

const TILE_TONES = [colors.blush, colors.sageBg, '#F4EEE7'];

type Props = NativeStackScreenProps<RootStackParamList, 'RequesterProfile'>;

export default function RequesterProfile({ navigation, route }: Props) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError(false);
      usersApi.getPublicProfile(route.params.userId)
        .then(setUser)
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, [route.params.userId]),
  );

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header variant="stack" title="Profile" onBack={() => navigation.goBack()} />
        <ActivityIndicator color={colors.clay} style={{ marginTop: 40 }} />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.screen}>
        <Header variant="stack" title="Not found" onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const name = user.name ?? 'Someone';
  const highlightCount = Math.min(6, user.highlights.length);

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        title={name}
        subtitle={user.aggregatedRating ? `★ ${user.aggregatedRating.toFixed(1)}` : 'No ratings yet'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 34, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, paddingHorizontal: 4 }}>
          <View style={[styles.avatar, { backgroundColor: TILE_TONES[0] }]}>
            <Text style={styles.avatarLabel}>{initialsOf(user.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            {!!user.aggregatedRating && (
              <View style={{ marginTop: 7 }}><Stars value={user.aggregatedRating} size="m" /></View>
            )}
          </View>
        </View>

        {user.vibeTags.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Up for</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              {user.vibeTags.map((t) => (
                <View key={t} style={styles.wordPill}><Text style={styles.wordLabel}>{t}</Text></View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.highlightsLabel}>Peek into their personality</Text>
        {highlightCount > 0 ? (
          <View style={styles.highlightsGrid}>
            {user.highlights.slice(0, highlightCount).map((uri, i) => (
              <View key={i} style={[styles.highlightTile, { backgroundColor: TILE_TONES[i % TILE_TONES.length] }]}>
                <Image source={{ uri }} style={styles.highlightImage} resizeMode="cover" />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Feather name="image" size={38} color={colors.faint} />
            <Text style={[styles.emptyText, { marginTop: 10 }]}>No highlights yet.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  avatar: { width: 68, height: 68, minWidth: 68, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: colors.clayPressed, fontFamily: 'Figtree_700Bold', fontSize: 22 },
  name: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 19, letterSpacing: -0.4 },
  highlightsLabel: { fontFamily: 'Newsreader_400Regular_Italic', fontSize: 15, color: colors.muted, paddingHorizontal: 4 },
  highlightsGrid: { flexDirection: 'row', gap: 10 },
  highlightTile: { flex: 1, aspectRatio: 3 / 4, borderRadius: radius.tile, overflow: 'hidden' },
  highlightImage: { width: '100%', height: '100%' },
  card: { backgroundColor: colors.surface, borderRadius: radius.inner, padding: 17, ...shadow.card },
  sectionLabel: {
    fontFamily: 'Figtree_600SemiBold', fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase',
    color: colors.faint, marginBottom: 8,
  },
  wordPill: {
    backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14,
  },
  wordLabel: { color: colors.blushInk, fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36 },
  emptyText: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 13.5 },
});
