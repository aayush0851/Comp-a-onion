import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';
import { colors, font, text } from '../theme';
import { Btn, FieldLabel, FilterChips, Footer, Header, TextField, ToggleRow } from '../components/widgets';
import { FILTER_LABELS, formatProximityKm, PROXIMITY_MAX_KM, PROXIMITY_MIN_KM, GROUP_SIZE_LABELS, PLAN_TYPES, WHO_THERE_LABELS } from '../data';
import { useAppDispatch, useAppState } from '../store';

type Props = { navigation: NavigationProp<RootStackParamList> };

export default function SearchFilters({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState(state.searchQuery);
  const [when, setWhen] = useState<0 | 1 | 2 | 3>(state.filter);
  const [groupSize, setGroupSize] = useState<0 | 1 | 2>(state.groupSize);
  const [types, setTypes] = useState<string[]>(state.typeFilters);
  const [whoThere, setWhoThere] = useState<0 | 1 | 2>(state.whoThere);
  const [proximity, setProximity] = useState(state.proximityKm);
  const [hideAsked, setHideAsked] = useState(state.hideAsked);

  const apply = () => {
    dispatch({ type: 'SET_SEARCH_QUERY', query });
    dispatch({ type: 'SET_FILTER', filter: when });
    dispatch({ type: 'SET_GROUP_SIZE', groupSize });
    dispatch({ type: 'SET_TYPE_FILTERS', types });
    dispatch({ type: 'SET_WHO_THERE', whoThere });
    dispatch({ type: 'SET_PROXIMITY', km: proximity });
    dispatch({ type: 'SET_HIDE_ASKED', value: hideAsked });
    navigation.goBack();
  };

  const reset = () => {
    setQuery('');
    setWhen(0);
    setGroupSize(2);
    setTypes([]);
    setWhoThere(2);
    setProximity(PROXIMITY_MAX_KM);
    setHideAsked(false);
  };

  return (
    <View style={styles.screen}>
      <Header variant="stack" title="Narrow the board" subtitle="Only ever four or five hangouts. These just reorder them." onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <TextField
          placeholder="Search ramen, chess, anything…"
          value={query}
          onChangeText={setQuery}
        />
        <View>
          <FieldLabel>When</FieldLabel>
          <FilterChips items={FILTER_LABELS} active={when} onChange={(i) => setWhen(i as 0 | 1 | 2 | 3)} />
        </View>
        <View>
          <FieldLabel>Kind of plan</FieldLabel>
          <FilterChips
            multi
            items={PLAN_TYPES}
            active={PLAN_TYPES.map((tp, i) => (types.includes(tp) ? i : -1)).filter((i) => i >= 0)}
            onChange={(i) => setTypes((prev) => (prev.includes(PLAN_TYPES[i]) ? prev.filter((x) => x !== PLAN_TYPES[i]) : [...prev, PLAN_TYPES[i]]))}
          />
        </View>
        <View>
          <FieldLabel>Group size</FieldLabel>
          <FilterChips items={GROUP_SIZE_LABELS} active={groupSize} onChange={(i) => setGroupSize(i as 0 | 1 | 2)} />
        </View>
        <View>
          <FieldLabel>Who's there</FieldLabel>
          <FilterChips items={WHO_THERE_LABELS} active={whoThere} onChange={(i) => setWhoThere(i as 0 | 1 | 2)} />
        </View>
        <View>
          <View style={styles.distanceRow}>
            <Text style={text.fieldLabel}>Distance</Text>
            <Text style={styles.distanceValue}>Within {formatProximityKm(proximity)}</Text>
          </View>
          <Slider
            style={{ marginTop: 6, marginHorizontal: -10 }}
            minimumValue={PROXIMITY_MIN_KM}
            maximumValue={PROXIMITY_MAX_KM}
            value={proximity}
            onValueChange={setProximity}
            minimumTrackTintColor={colors.ink}
            maximumTrackTintColor={colors.zinc200}
            thumbTintColor={colors.amber}
          />
        </View>
        <ToggleRow title="Hide ones I've asked to join" sub="Keeps the board to what's still open." value={hideAsked} onChange={setHideAsked} />
      </ScrollView>
      <Footer style={{ flexDirection: 'row', gap: 10 }}>
        <Btn label="Reset" variant="secondary" full={false} style={{ width: 104 }} onPress={reset} />
        <Btn label="Show hangouts" style={{ flex: 1 }} onPress={apply} />
      </Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: 20, paddingBottom: 24, gap: 20 },
  distanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  distanceValue: { fontFamily: font.extrabold, fontSize: 12.5, color: colors.ink },
});
