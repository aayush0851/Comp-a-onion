import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Slider from '@react-native-community/slider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { Btn, FieldLabel, Header, Sheet, TextField, Toggle, StatusScrim } from '../components/widgets';
import { formatProximityKm, PROXIMITY_MAX_KM, PROXIMITY_MIN_KM } from '../data';
import { useAppDispatch, useAppState } from '../store';
import { usersApi } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

function Row({
  title, sub, onPress, danger, value, toggle, last,
}: { title: string; sub?: string; onPress?: () => void; danger?: boolean; value?: string; toggle?: { on: boolean; set: (v: boolean) => void }; last?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.row, !last && styles.rowRule]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, danger && { color: colors.roseInk }]}>{title}</Text>
        {!!sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {!!value && <Text style={styles.rowValue}>{value}</Text>}
      {toggle ? <Toggle value={toggle.on} onChange={toggle.set} /> : !!onPress && <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}

const openLink = (url: string) => WebBrowser.openBrowserAsync(url);

export default function Settings({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [newPlans, setNewPlans] = useState(true);
  const [joinRequests, setJoinRequests] = useState(true);
  const [chatMessages, setChatMessages] = useState(true);
  const [preciseLocation, setPreciseLocation] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [proximityDraft, setProximityDraft] = useState(state.proximityKm);
  const [showEditName, setShowEditName] = useState(false);
  const [nameDraft, setNameDraft] = useState(state.name);

  const toggleGender = () => {
    dispatch({ type: 'TOGGLE_GENDER_VISIBLE' });
    usersApi.updateMe({ genderVisible: !state.genderVisible }).catch((e) => console.error('Gender visibility save failed', e));
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Header variant="stack" title="Settings" onBack={() => navigation.navigate('Profile')} />
        <View style={styles.body}>
          <Group label="Who can find you">
            <View style={[styles.row, styles.rowRule, { flexDirection: 'column', alignItems: 'stretch', gap: 0 }]}>
              <Text style={styles.rowTitle}>Showing hangouts within {formatProximityKm(proximityDraft)}</Text>
              <Text style={styles.rowSub}>How far away a hangout can be and still show up on your board.</Text>
              <Slider
                style={{ marginTop: 10, marginHorizontal: -10 }}
                minimumValue={PROXIMITY_MIN_KM}
                maximumValue={PROXIMITY_MAX_KM}
                step={1}
                value={state.proximityKm}
                onValueChange={setProximityDraft}
                onSlidingComplete={(km) => { dispatch({ type: 'SET_PROXIMITY', km }); usersApi.updateMe({ proximityKm: Math.round(km) }).catch((e) => console.error('Proximity save failed', e)); }}
                minimumTrackTintColor={colors.ink}
                maximumTrackTintColor={colors.zinc300}
                thumbTintColor={colors.amber}
              />
            </View>
            <Row title="Show my identity on profile" sub="Off means only you can see it." toggle={{ on: state.genderVisible, set: toggleGender }} />
            <Row title="Precise location" sub="Off shows your area, not your exact spot." toggle={{ on: preciseLocation, set: setPreciseLocation }} last />
          </Group>

          <Group label="Notifications">
            <Row title="Hangouts near me" toggle={{ on: newPlans, set: setNewPlans }} />
            <Row title="Requests & approvals" toggle={{ on: joinRequests, set: setJoinRequests }} />
            <Row title="Chat messages" toggle={{ on: chatMessages, set: setChatMessages }} last />
          </Group>

          <Group label="Account">
            <Row title="Signed in with" sub={`${state.authProvider === 'apple' ? 'Apple' : 'Google'} · ${state.email}`} />
            <Row title="Name" value={state.name || 'Not set'} onPress={() => { setNameDraft(state.name); setShowEditName(true); }} last />
          </Group>

          <Group label="Safety & account">
            <Row title="Safety centre" onPress={() => navigation.navigate('Safety')} />
            <Row title="Community guidelines" onPress={() => openLink('https://companion.app/guidelines')} />
            <Row title="Delete account" danger onPress={() => setShowDelete(true)} last />
          </Group>

          <Group label="Support & legal">
            <Row title="Report a problem" onPress={() => openLink('https://companion.app/report')} />
            <Row title="Terms of service" onPress={() => openLink('https://companion.app/terms')} />
            <Row title="Privacy policy" onPress={() => openLink('https://companion.app/privacy')} last />
          </Group>

          <Btn label="Log out" variant="secondary" onPress={() => dispatch({ type: 'LOG_OUT' })} />
        </View>
      </ScrollView>
      <StatusScrim />

      <Sheet visible={showEditName} onClose={() => setShowEditName(false)} title="Your name" sub="First name — that's all anyone ever sees.">
        <TextField value={nameDraft} onChangeText={setNameDraft} placeholder="Name" autoFocus style={{ marginTop: 16 }} />
        <View style={{ gap: 5, marginTop: 16 }}>
          <Btn
            label="Save"
            onPress={() => { dispatch({ type: 'SET_NAME', name: nameDraft.trim() }); usersApi.updateMe({ name: nameDraft.trim() }).catch((e) => console.error('Name save failed', e)); setShowEditName(false); }}
          />
          <Btn label="Cancel" variant="ghost" onPress={() => setShowEditName(false)} />
        </View>
      </Sheet>

      <Sheet visible={showDelete} onClose={() => setShowDelete(false)} title="Delete your account?" sub="This removes your profile, hangouts and history for good. Nobody can undo this — including us.">
        <View style={{ gap: 5, marginTop: 18 }}>
          <Btn label="Delete everything" variant="danger" onPress={() => { setShowDelete(false); usersApi.deleteMe().catch(() => {}); dispatch({ type: 'LOG_OUT' }); }} />
          <Btn label="Never mind" variant="ghost" onPress={() => setShowDelete(false)} />
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: 20, gap: 17 },
  group: { backgroundColor: colors.zinc100, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15 },
  rowRule: { borderBottomWidth: 1, borderBottomColor: colors.zinc200 },
  rowTitle: { fontFamily: font.bold, fontSize: 14, color: colors.ink },
  rowSub: { fontFamily: font.regular, fontSize: 12, color: colors.zinc500, marginTop: 3 },
  rowValue: { fontFamily: font.semibold, fontSize: 12.5, color: colors.zinc400 },
  chevron: { fontFamily: font.bold, fontSize: 15, color: colors.zinc300 },
});
