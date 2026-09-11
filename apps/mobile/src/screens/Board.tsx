import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow, stripe } from '../theme';
import { text } from '../components/ui';
import {
  ACTIVITIES, costModeLabel, FILTER_LABELS, formatProximityKm, genderRestrictionColors, genderRestrictionLabel,
  GREETINGS, TABS, parseDistKm,
} from '../data';
import { useAppState, useAppDispatch } from '../state';

type Props = NativeStackScreenProps<RootStackParamList, 'Board'>;

export default function Board({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!state.onboarded) dispatch({ type: 'SET_ONBOARDED' });
  }, [state.onboarded]);

  const visibleActivities = ACTIVITIES.filter((c) => parseDistKm(c.dist) <= state.proximityKm);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View style={styles.header}>
          <View style={[styles.blob, { top: -70, right: -60, width: 230, height: 230, backgroundColor: colors.blush }]} />
          <View style={[styles.blob, { top: 40, left: -90, width: 180, height: 180, backgroundColor: colors.sageBg }]} />
          <View style={styles.headerRow}>
            <Text style={text.wordmark}>companion</Text>
            <View style={styles.locChip}>
              <View style={styles.locDot} />
              <Text style={styles.locLabel}>SoMa · {formatProximityKm(state.proximityKm)}</Text>
            </View>
          </View>
          <Text style={styles.greeting}>{GREETINGS[state.filter]}</Text>
          <Text style={text.aside}>Nobody's committed yet. Neither are you.</Text>
          <View style={styles.filterRow}>
            {FILTER_LABELS.map((label, i) => {
              const active = state.filter === i;
              return (
                <Pressable
                  key={label}
                  onPress={() => dispatch({ type: 'SET_FILTER', filter: i as 0 | 1 | 2 })}
                  style={[styles.filterPill, active ? styles.filterActive : styles.filterInactive]}
                >
                  <Text style={[styles.filterLabel, { color: active ? colors.ground : colors.inkSecondary }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.cards}>
          {visibleActivities.map((c) => {
            const full = c.seatsFilled >= c.seatsTotal;
            const entryLabel = full ? `${c.host} approves` : c.entry === 'open' ? 'Open seats' : `${c.host} approves`;
            const cta = c.entry === 'open' ? 'Take a seat' : 'Ask to join';
            const seatLine = full ? 'Full' : c.seatsTotal - c.seatsFilled === 1 ? '1 seat left' : `${c.seatsFilled} of ${c.seatsTotal} going`;
            return (
              <Pressable key={c.id} onPress={() => navigation.navigate('Detail', { id: c.id })} style={styles.card}>
                <View style={[stripe(132)]}>
                  <View style={styles.slotChip}><Text style={styles.slotLabel}>{c.slot}</Text></View>
                  <View style={styles.timeChip}>
                    <Text style={styles.timeLabel}>{c.time}</Text>
                    <Text style={styles.distLabel}>{c.dist}</Text>
                  </View>
                  <View style={[styles.entryChip, { backgroundColor: c.entry === 'open' && !full ? colors.clay : 'rgba(255,255,255,.9)' }]}>
                    <Text style={[styles.entryLabel, { color: c.entry === 'open' && !full ? '#fff' : colors.inkSecondary }]}>{entryLabel}</Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                  <Text style={styles.cardVenue}>{c.venueLine}</Text>
                  {(c.genderRestriction !== 'everyone' || c.costMode === 'host') && (
                    <View style={styles.noteRow}>
                      {c.genderRestriction !== 'everyone' && (
                        <View style={[styles.noteChip, { backgroundColor: genderRestrictionColors(c.genderRestriction).bg }]}>
                          <Text style={[styles.noteLabel, { color: genderRestrictionColors(c.genderRestriction).fg }]}>
                            {genderRestrictionLabel(c.genderRestriction)}
                          </Text>
                        </View>
                      )}
                      {c.costMode === 'host' && (
                        <View style={styles.noteChip}><Text style={styles.noteLabel}>{costModeLabel(c.costMode)}</Text></View>
                      )}
                    </View>
                  )}
                  <View style={styles.hostRow}>
                    <View style={styles.hostAvatar}><Text style={styles.hostAvatarLabel}>{c.hostInitials}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hostName}>{c.host}</Text>
                      <Text style={styles.hostMeta}>✓ verified</Text>
                    </View>
                  </View>
                  <View style={styles.seatRule}>
                    <View style={styles.seatLeft}>
                      <View style={styles.dots}>
                        {Array.from({ length: Math.min(6, c.seatsTotal) }).map((_, i) => (
                          <View key={i} style={[styles.dot, { backgroundColor: i < c.seatsFilled ? colors.clay : '#E7DACD' }]} />
                        ))}
                      </View>
                      <Text style={styles.seatLine}>{seatLine}</Text>
                    </View>
                    <View style={styles.shapeChip}><Text style={styles.shapeLabel}>{c.shapeLabel}</Text></View>
                  </View>
                  <Pressable onPress={() => navigation.navigate('Detail', { id: c.id })} style={styles.cardCta}>
                    <Text style={styles.cardCtaLabel}>{cta}</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
          <Text style={[text.aside, { fontSize: 15, paddingHorizontal: 6 }]}>
            Nothing here for you? Post your own — twenty seconds, and 214 people see it.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = t === 'Explore';
          return (
            <Pressable
              key={t}
              onPress={() => {
                if (t === 'Plans') navigation.navigate('MyPlans');
                else if (t === 'Chats') navigation.navigate('ChatList');
                else if (t === 'Me') navigation.navigate('Profile');
                else navigation.navigate('Board');
              }}
              style={[styles.tabPill, active ? { backgroundColor: colors.ink } : { backgroundColor: 'transparent' }]}
            >
              <Text style={[styles.tabLabel, { color: active ? colors.ground : colors.muted }]}>{t}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  header: { padding: 20, paddingTop: 36, overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: 999 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface,
    borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12, ...shadow.chip,
  },
  locDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.clay },
  locLabel: { color: colors.inkSecondary, fontFamily: 'Figtree_600SemiBold', fontSize: 11 },
  greeting: { fontFamily: 'Figtree_700Bold', fontSize: 29, letterSpacing: -0.6, color: colors.ink, marginTop: 22, marginBottom: 6 },
  filterRow: { flexDirection: 'row', gap: 7, marginTop: 20 },
  filterPill: { borderRadius: 999, paddingVertical: 10, paddingHorizontal: 15, borderWidth: 1 },
  filterActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterInactive: { backgroundColor: 'transparent', borderColor: colors.border },
  filterLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
  cards: { paddingHorizontal: 16, paddingTop: 2, gap: 14 },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, overflow: 'hidden', ...shadow.card },
  slotChip: {
    position: 'absolute', left: 14, top: 14, backgroundColor: 'rgba(255,255,255,.86)',
    borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9,
  },
  slotLabel: { color: colors.muted, fontFamily: 'Figtree_600SemiBold', fontSize: 8.5, letterSpacing: 0.6 },
  timeChip: {
    position: 'absolute', left: 14, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.ink, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 13,
  },
  timeLabel: { color: colors.ground, fontFamily: 'Figtree_700Bold', fontSize: 13 },
  distLabel: { color: colors.ground, opacity: 0.55, fontFamily: 'Figtree_500Medium', fontSize: 13 },
  entryChip: { position: 'absolute', right: 14, bottom: 14, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  entryLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 11 },
  cardBody: { padding: 17 },
  noteRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 9 },
  noteChip: { backgroundColor: colors.sageBg, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  noteLabel: { color: colors.sageInk, fontFamily: 'Figtree_600SemiBold', fontSize: 10.5 },
  cardTitle: { fontFamily: 'Figtree_700Bold', fontSize: 21, letterSpacing: -0.4, color: colors.ink },
  cardVenue: { fontFamily: 'Figtree_400Regular', fontSize: 13.5, lineHeight: 19, color: colors.muted, marginTop: 6 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  hostAvatar: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.blush,
    alignItems: 'center', justifyContent: 'center',
  },
  hostAvatarLabel: { color: colors.clayPressed, fontFamily: 'Figtree_700Bold', fontSize: 11 },
  hostName: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 13 },
  hostMeta: { color: colors.sage, fontFamily: 'Figtree_500Medium', fontSize: 11, marginTop: 2 },
  seatRule: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15,
    paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line,
  },
  seatLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 9, height: 9, borderRadius: 4.5 },
  seatLine: { color: colors.muted, fontFamily: 'Figtree_500Medium', fontSize: 12 },
  shapeChip: { backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 11 },
  shapeLabel: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 11.5 },
  cardCta: {
    marginTop: 15, backgroundColor: colors.clay, borderRadius: 999, paddingVertical: 15, alignItems: 'center',
  },
  cardCtaLabel: { color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 14 },
  tabBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(251,246,240,.94)',
    borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 18, paddingBottom: 24,
  },
  tabPill: { borderRadius: 999, paddingVertical: 9, paddingHorizontal: 15 },
  tabLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
});
