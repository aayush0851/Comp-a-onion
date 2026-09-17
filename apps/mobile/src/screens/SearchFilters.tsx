import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';
import { colors, font, text } from '../theme';
import { Btn, FieldLabel, FilterChips, Footer, Header, ToggleRow } from '../components/widgets';
import { FILTER_LABELS, formatProximityKm, PROXIMITY_MAX_KM, PROXIMITY_MIN_KM } from '../data';
import { useAppDispatch, useAppState } from '../store';

type Props = { navigation: NavigationProp<RootStackParamList> };

export default function SearchFilters({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [when, setWhen] = useState<0 | 1 | 2>(state.filter);
  const [proximity, setProximity] = useState(state.proximityKm);
  const [hideAsked, setHideAsked] = useState(false);

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
      <Header variant="stack" title="Narrow the board" subtitle="Only ever four or five hangouts. These just reorder them." onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <FieldLabel>When</FieldLabel>
          <FilterChips items={FILTER_LABELS} active={when} onChange={(i) => setWhen(i as 0 | 1 | 2)} />
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
