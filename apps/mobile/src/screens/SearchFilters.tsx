import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';
import { colors, radius, scale } from '../theme';
import { Btn, FilterChips, Header } from '../components/widgets';
import { ACTIVITIES, FILTER_LABELS, formatProximityKm, parseDistKm, PROXIMITY_MAX_KM, PROXIMITY_MIN_KM } from '../data';
import { useAppDispatch, useAppState } from '../store';

type Props = { navigation: NavigationProp<RootStackParamList> };

export default function SearchFilters({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [when, setWhen] = useState<0 | 1 | 2>(state.filter);
  const [proximity, setProximity] = useState(state.proximityKm);
  const [hideAsked, setHideAsked] = useState(false);

  const visibleCount = ACTIVITIES.filter((a) => parseDistKm(a.dist) <= proximity && !(hideAsked && state.requested.includes(a.id))).length;

  const apply = () => {
    dispatch({ type: 'SET_FILTER', filter: when });
    dispatch({ type: 'SET_PROXIMITY', km: proximity });
    navigation.goBack();
  };

  const reset = () => {
    setWhen(0);
    setProximity(PROXIMITY_MAX_KM);
    setHideAsked(false);
  };

  return (
    <View style={styles.screen}>
      <Header variant="stack" title="Narrow the board" subtitle="Only ever four or five plans. These just reorder them." onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text style={styles.label}>When</Text>
          <FilterChips items={[...FILTER_LABELS]} active={when} onChange={(i) => setWhen(i as 0 | 1 | 2)} />
        </View>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={styles.label}>Distance</Text>
            <Text style={styles.value}>Within {formatProximityKm(proximity)}</Text>
          </View>
          <Slider
            minimumValue={PROXIMITY_MIN_KM}
            maximumValue={PROXIMITY_MAX_KM}
            value={proximity}
            onValueChange={setProximity}
            minimumTrackTintColor={colors.clay}
            maximumTrackTintColor={colors.borderSoft}
            thumbTintColor={colors.clayPressed}
          />
        </View>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[scale.body, { fontFamily: 'Figtree_600SemiBold', fontSize: 14, color: colors.ink }]}>Hide plans I've asked to join</Text>
            <Text style={[scale.meta, { marginTop: 3 }]}>Keeps the board to what's still open.</Text>
          </View>
          <Switch value={hideAsked} onValueChange={setHideAsked} trackColor={{ false: colors.borderSoft, true: colors.clay }} thumbColor="#fff" />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={{ width: 104 }}><Btn label="Reset" variant="secondary" onPress={reset} /></View>
        <View style={{ flex: 1 }}><Btn label={`Show ${visibleCount} plans`} variant="primary" onPress={apply} /></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 24 },
  label: { fontFamily: 'Figtree_700Bold', fontSize: 10.5, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.faint, marginBottom: 11 },
  value: { fontFamily: 'Figtree_700Bold', fontSize: 12.5, color: colors.clayPressed },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.inner, padding: 16 },
  footer: { flexDirection: 'row', gap: 10, padding: 20, paddingBottom: 32, backgroundColor: 'rgba(251,246,240,.95)' },
});
