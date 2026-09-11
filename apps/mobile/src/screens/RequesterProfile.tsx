import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { BackPill } from '../components/ui';
import { useAppState } from '../state';

type Props = NativeStackScreenProps<RootStackParamList, 'RequesterProfile'>;

export default function RequesterProfile({ navigation, route }: Props) {
  const state = useAppState();
  const { planId, requesterId } = route.params;
  const plan = state.publishedPlans.find((p) => p.id === planId);
  const requester = plan?.requesters.find((r) => r.id === requesterId);

  if (!requester) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <BackPill onPress={() => navigation.goBack()} />
          <Text style={styles.title}>Not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <BackPill onPress={() => navigation.goBack()} />
        <View style={styles.avatar}><Text style={styles.avatarLabel}>{requester.initials}</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <Text style={styles.title}>{requester.name}</Text>
          {requester.isNew && (
            <View style={styles.newChip}><Text style={styles.newLabel}>New here</Text></View>
          )}
        </View>
        <Text style={styles.history}>{requester.history}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Their note on this plan</Text>
        <Text style={styles.intro}>{requester.intro}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  header: { padding: 20, paddingTop: 36, paddingBottom: 18 },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.neutralAvatar,
    alignItems: 'center', justifyContent: 'center', marginTop: 18,
  },
  avatarLabel: { color: colors.inkSecondary, fontFamily: 'Figtree_700Bold', fontSize: 20 },
  title: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 24, letterSpacing: -0.5 },
  newChip: { backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  newLabel: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 11 },
  history: { color: colors.faint, fontFamily: 'Figtree_500Medium', fontSize: 12.5, marginTop: 6 },
  card: {
    marginHorizontal: 20, backgroundColor: colors.surface, borderRadius: radius.inner, padding: 17, ...shadow.card,
  },
  sectionLabel: {
    fontFamily: 'Figtree_600SemiBold', fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase',
    color: colors.faint, marginBottom: 8,
  },
  intro: { color: colors.ink, fontFamily: 'Figtree_400Regular', fontSize: 14, lineHeight: 21 },
});
