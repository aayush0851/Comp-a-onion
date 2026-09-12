import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, scale } from '../theme';
import { FilterChips, Header, PlanCard, TabBar, TabKey } from '../components/widgets';
import {
  ACTIVITIES, FILTER_LABELS, formatProximityKm, GREETINGS, parseDistKm,
} from '../data';
import { useAppState, useAppDispatch } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Board'>;

export default function Board({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!state.onboarded) dispatch({ type: 'SET_ONBOARDED' });
  }, [state.onboarded]);

  const visibleActivities = ACTIVITIES.filter((c) => parseDistKm(c.dist) <= state.proximityKm);

  const onTab = (key: TabKey) => {
    if (key === 'plans') navigation.navigate('MyPlans');
    else if (key === 'chats') navigation.navigate('ChatList');
    else if (key === 'me') navigation.navigate('Profile');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.blob, { top: -70, right: -60, width: 230, height: 230, backgroundColor: colors.blush }]} />
      <View style={[styles.blob, { top: 70, left: -90, width: 180, height: 180, backgroundColor: colors.sageBg }]} />
      <Header
        variant="home"
        title={GREETINGS[state.filter]}
        subtitle="Nobody's committed yet. Neither are you."
        action={`SoMa · ${formatProximityKm(state.proximityKm)}`}
        actionDot
        onAction={() => navigation.navigate('SearchFilters')}
      />
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <FilterChips
          items={[...FILTER_LABELS]}
          active={state.filter}
          onChange={(i) => dispatch({ type: 'SET_FILTER', filter: i as 0 | 1 | 2 })}
        />
      </View>
      <ScrollView contentContainerStyle={styles.cards}>
        {visibleActivities.map((c) => {
          const full = c.seatsFilled >= c.seatsTotal;
          const badge = full ? `${c.host} approves` : c.entry === 'open' ? 'Open seats' : `${c.host} approves`;
          const cta = c.entry === 'open' ? 'Take a seat' : 'Ask to join';
          return (
            <PlanCard
              key={c.id}
              title={c.title}
              blurb={c.venueLine}
              venue={c.slot}
              time={c.time}
              dist={c.dist}
              badge={badge}
              badgeTone={c.entry === 'open' && !full ? 'primary' : 'light'}
              tag={c.genderRestriction !== 'anyone' ? `${c.genderRestriction === 'women' ? 'Women' : 'Men'} only` : null}
              kind={c.shapeLabel}
              filled={c.seatsFilled}
              total={c.seatsTotal}
              cta={cta}
              host={c.host}
              hostInitials={c.hostInitials}
              onPress={() => navigation.navigate('Detail', { id: c.id })}
              onPressCta={() => navigation.navigate('Detail', { id: c.id })}
            />
          );
        })}
        <Text style={[scale.accent, { fontSize: 15, paddingHorizontal: 6 }]}>
          Nothing here for you? Post your own — twenty seconds, and 214 people see it.
        </Text>
      </ScrollView>
      <View style={styles.tabBar}>
        <TabBar active="explore" unread={false} onPress={onTab} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  blob: { position: 'absolute', borderRadius: 999 },
  cards: { paddingHorizontal: 16, paddingTop: 2, paddingBottom: 100, gap: 14 },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
