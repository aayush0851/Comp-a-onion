import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { text } from '../components/ui';
import { costModeLabel, formatDateKey, genderRestrictionLabel, TABS } from '../data';
import { isPlanArchived, planArchiveReason, useAppState } from '../state';

type Props = NativeStackScreenProps<RootStackParamList, 'MyPlans'>;

const FILTERS = ['Upcoming', 'Archived'] as const;

export default function MyPlans({ navigation }: Props) {
  const state = useAppState();
  const [filter, setFilter] = useState<typeof FILTERS[number]>('Upcoming');
  const plans = state.publishedPlans.filter((p) => (filter === 'Archived' ? isPlanArchived(p) : !isPlanArchived(p)));

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View style={styles.header}>
          <Text style={text.wordmark}>companion</Text>
          <Text style={styles.title}>Your plans</Text>
          <Text style={text.aside}>Everything you've posted, in one place.</Text>

          <View style={styles.filterRow}>
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[styles.filterPill, active ? styles.filterActive : styles.filterInactive]}
                >
                  <Text style={[styles.filterLabel, { color: active ? colors.ground : colors.inkSecondary }]}>{f}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {plans.length === 0 ? (
          <View style={styles.empty}>
            <Feather name={filter === 'Archived' ? 'archive' : 'clipboard'} size={42} color={colors.faint} />
            <Text style={[styles.emptyTitle, { marginTop: 14 }]}>{filter === 'Archived' ? 'Nothing archived' : 'Nothing posted yet'}</Text>
            <Text style={styles.emptyBody}>
              {filter === 'Archived'
                ? 'Plans land here once they wrap up or you archive them.'
                : "When you publish a plan, it'll show up here."}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {plans.map((p) => {
              const when = p.date ? `${formatDateKey(p.date)}${p.time ? ` · ${p.time}` : ''}` : p.time ?? 'No time set';
              const shapeLabel = p.shape === 'duo' ? 'Just me + one' : p.shape === 'group' ? `Up to ${p.size} people` : 'Group size not set';
              const pending = p.approvalRequired ? p.requesters.filter((r) => !p.decided[r.id]).length : 0;
              const archived = isPlanArchived(p);
              return (
                <Pressable key={p.id} onPress={() => navigation.navigate('PlanManage', { id: p.id })} style={styles.card}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={[styles.cardTitle, { flex: 1 }]}>{p.title}</Text>
                    {pending > 0 && (
                      <View style={styles.pendingChip}><Text style={styles.pendingLabel}>{pending} asking</Text></View>
                    )}
                  </View>
                  <Text style={styles.cardWhen}>{when}</Text>
                  {!!p.venue && <Text style={styles.cardVenue}>{p.venue}</Text>}
                  {archived && <Text style={styles.archiveReason}>{planArchiveReason(p)}</Text>}
                  {p.tags.length > 0 && (
                    <View style={styles.tagRow}>
                      {p.tags.map((t) => (
                        <View key={t} style={styles.tagChip}><Text style={styles.tagLabel}>{t}</Text></View>
                      ))}
                    </View>
                  )}
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{shapeLabel}</Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={styles.metaText}>{p.approvalRequired ? 'You approve' : 'Open seats'}</Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={styles.metaText}>{genderRestrictionLabel(p.genderRestriction)}</Text>
                    {!!costModeLabel(p.costMode) && (
                      <>
                        <Text style={styles.metaDot}>·</Text>
                        <Text style={styles.metaText}>{costModeLabel(p.costMode)}</Text>
                      </>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Pressable onPress={() => navigation.navigate('Create')} style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = t === 'Plans';
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
  header: { padding: 20, paddingTop: 36 },
  title: { fontFamily: 'Figtree_700Bold', fontSize: 29, letterSpacing: -0.6, color: colors.ink, marginTop: 22, marginBottom: 6 },
  filterRow: { flexDirection: 'row', gap: 7, marginTop: 18 },
  filterPill: { borderRadius: 999, paddingVertical: 10, paddingHorizontal: 15, borderWidth: 1 },
  filterActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterInactive: { backgroundColor: 'transparent', borderColor: colors.border },
  filterLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
  empty: { flex: 1, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 18 },
  emptyBody: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 13.5, marginTop: 6, textAlign: 'center' },
  list: { paddingHorizontal: 16, gap: 12, marginTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 17, ...shadow.card },
  cardTitle: { fontFamily: 'Figtree_700Bold', fontSize: 19, letterSpacing: -0.3, color: colors.ink },
  cardWhen: { fontFamily: 'Figtree_600SemiBold', fontSize: 13, color: colors.clayPressed, marginTop: 6 },
  cardVenue: { fontFamily: 'Figtree_400Regular', fontSize: 13, color: colors.muted, marginTop: 4 },
  archiveReason: { fontFamily: 'Figtree_500Medium', fontSize: 11.5, color: colors.faint, marginTop: 6 },
  pendingChip: { backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  pendingLabel: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 10.5 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tagChip: { backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  tagLabel: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 10.5 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
  metaText: { color: colors.muted, fontFamily: 'Figtree_500Medium', fontSize: 11.5 },
  metaDot: { color: colors.faint, fontSize: 11.5 },
  fab: {
    position: 'absolute', right: 20, bottom: 96, width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.clay, alignItems: 'center', justifyContent: 'center', ...shadow.card,
  },
  fabIcon: { color: '#fff', fontFamily: 'Figtree_600SemiBold', fontSize: 28, lineHeight: 30 },
  tabBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(251,246,240,.94)',
    borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 18, paddingBottom: 24,
  },
  tabPill: { borderRadius: 999, paddingVertical: 9, paddingHorizontal: 15 },
  tabLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5 },
});
