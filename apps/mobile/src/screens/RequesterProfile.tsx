import { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, seatTones, text } from '../theme';
import { Avatar, BackButton, Badge, Btn, EmptyState, Footer, Header, ListSkeleton, ratingText, StatTiles, StatusScrim } from '../components/widgets';
import { initialsOf } from '../data/eventDisplay';
import { useAppState } from '../store';
import { usersApi } from '../api';
import type { ApiUser } from '../api/types';
import { memberSince } from './Profile';

type Props = NativeStackScreenProps<RootStackParamList, 'RequesterProfile'>;

export default function RequesterProfile({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const state = useAppState();
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

  if (loading || error || !user) {
    return (
      <View style={styles.screen}>
        <Header variant="stack" title={loading ? undefined : 'Not found'} onBack={() => navigation.goBack()} />
        {loading ? <ListSkeleton /> : <EmptyState tone="zinc" title="This profile isn't available" body="They may have deleted their account." />}
      </View>
    );
  }

  const name = user.name ?? 'Someone';
  const isMe = user.id === state.userId;
  const since = memberSince(user.createdAt);
  const highlights = user.highlights.slice(0, 6);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={[styles.topRow, { paddingTop: insets.top + 2 }]}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.id}>ID # {user.id.slice(-4).toUpperCase()}</Text>
        </View>

        <View style={styles.identity}>
          <Avatar initials={initialsOf(user.name)} photo={user.profilePicture} size={80} rounded={24} tone="amber" />
          <Text style={styles.name}>{name}</Text>
          <Text style={[text.eyebrow, { fontSize: 10, marginTop: 6 }]}>#Checked member{since ? ` · since ${since}` : ''}</Text>
        </View>

        <View style={styles.section}>
          <StatTiles
            highlight={2}
            tiles={[
              { value: user.aggregatedRating ? `★ ${ratingText(user.aggregatedRating)}` : '—', label: 'Rating' },
              { value: String(user.highlights.length), label: 'Highlights' },
              { value: String(user.vibeTags.length), label: 'Up for' },
            ]}
          />
        </View>

        {user.vibeTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Up for</Text>
            <View style={styles.tags}>
              {user.vibeTags.map((t) => (
                <View key={t} style={styles.tag}><Text style={styles.tagLabel}>{t}</Text></View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>A peek into their personality</Text>
          {highlights.length > 0 ? (
            <View style={styles.grid}>
              {highlights.map((uri, i) => (
                <View key={i} style={[styles.tile, { backgroundColor: seatTones[i % seatTones.length][0] }]}>
                  <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}><Text style={styles.emptyText}>No highlights yet.</Text></View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checked Badges</Text>
          <View style={styles.tags}>
            <Badge label="Verified Identity" tone="sky" />
            {user.aggregatedRating >= 4.5 && <Badge label="Highly rated" tone="amber" glyph="★" />}
          </View>
        </View>
      </ScrollView>
      <StatusScrim />

      {!isMe && (
        <Footer>
          <Btn label={`Say hi to ${name.split(' ')[0]}`} glyph="✓" variant="amber" onPress={() => navigation.navigate('RequesterChat', { requesterId: user.id, name })} />
        </Footer>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 44, paddingHorizontal: 20 },
  id: { fontFamily: font.monoSemibold, fontSize: 11, color: colors.zinc400 },
  identity: { alignItems: 'center', paddingTop: 12, paddingHorizontal: 20 },
  name: { fontFamily: font.extrabold, fontSize: 24, letterSpacing: -0.9, color: colors.ink, marginTop: 14, textAlign: 'center' },
  section: { paddingTop: 18, paddingHorizontal: 20 },
  sectionTitle: { fontFamily: font.extrabold, fontSize: 14.5, letterSpacing: -0.3, color: colors.ink, marginBottom: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tag: { backgroundColor: colors.zinc100, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  tagLabel: { fontFamily: font.bold, fontSize: 11.5, color: colors.zinc700 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '31%', aspectRatio: 3 / 4, borderRadius: 16, overflow: 'hidden' },
  emptyBox: { backgroundColor: colors.zinc100, borderRadius: 20, padding: 18, alignItems: 'center' },
  emptyText: { fontFamily: font.semibold, fontSize: 13, color: colors.zinc500 },
});
