import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { BackPill, OutlineButton, PrimaryButton } from '../components/ui';
import { formatProximityKm, maskPhone, PROXIMITY_MAX_KM, PROXIMITY_MIN_KM } from '../data';
import { useAppDispatch, useAppState } from '../state';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function Row({
  title, sub, onPress, danger, trailing, last,
}: { title: string; sub?: string; onPress?: () => void; danger?: boolean; trailing?: React.ReactNode; last?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, danger && styles.rowTitleDanger]}>{title}</Text>
        {!!sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {trailing ?? (onPress && <Text style={styles.chevron}>›</Text>)}
    </Pressable>
  );
}

function SwitchRow({
  title, sub, value, onValueChange, last,
}: { title: string; sub?: string; value: boolean; onValueChange: (v: boolean) => void; last?: boolean }) {
  return (
    <Row
      title={title}
      sub={sub}
      last={last}
      trailing={
        <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.borderSoft, true: colors.clay }} thumbColor="#fff" />
      }
    />
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

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <BackPill onPress={() => navigation.navigate('Profile')} />
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
        <SectionLabel>Account</SectionLabel>
        <View style={styles.card}>
          <Row title="Phone number" sub={maskPhone(state.phone)} />
          <Row
            title="Name"
            sub={state.name || 'Not set'}
            onPress={() => { setNameDraft(state.name); setShowEditName(true); }}
            last
          />
        </View>

        <SectionLabel>Discovery</SectionLabel>
        <View style={styles.card}>
          <View style={styles.proximityRow}>
            <Text style={styles.rowTitle}>Showing plans within {formatProximityKm(proximityDraft)}</Text>
            <Text style={styles.rowSub}>How far from you a plan can be and still show up on the board.</Text>
            <Slider
              style={{ marginTop: 14 }}
              minimumValue={PROXIMITY_MIN_KM}
              maximumValue={PROXIMITY_MAX_KM}
              step={1}
              value={state.proximityKm}
              onValueChange={setProximityDraft}
              onSlidingComplete={(km) => dispatch({ type: 'SET_PROXIMITY', km })}
              minimumTrackTintColor={colors.clay}
              maximumTrackTintColor={colors.borderSoft}
              thumbTintColor={colors.clayPressed}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.proximityEdgeLabel}>&lt;1 km</Text>
              <Text style={styles.proximityEdgeLabel}>100 km</Text>
            </View>
          </View>
        </View>

        <SectionLabel>Notifications</SectionLabel>
        <View style={styles.card}>
          <SwitchRow title="New plans nearby" value={newPlans} onValueChange={setNewPlans} />
          <SwitchRow title="Someone asks to join" value={joinRequests} onValueChange={setJoinRequests} />
          <SwitchRow title="Chat messages" value={chatMessages} onValueChange={setChatMessages} last />
        </View>

        <SectionLabel>Privacy</SectionLabel>
        <View style={styles.card}>
          <SwitchRow
            title="Show gender on profile"
            sub="Off means only you can see it"
            value={state.genderVisible}
            onValueChange={() => dispatch({ type: 'TOGGLE_GENDER_VISIBLE' })}
          />
          <SwitchRow title="Precise location" sub="Off shows your area, not your exact spot" value={preciseLocation} onValueChange={setPreciseLocation} last />
        </View>

        <SectionLabel>Safety & support</SectionLabel>
        <View style={styles.card}>
          <Row title="Report a problem" onPress={() => openLink('https://companion.app/report')} />
          <Row title="Community guidelines" onPress={() => openLink('https://companion.app/guidelines')} last />
        </View>

        <SectionLabel>Legal</SectionLabel>
        <View style={styles.card}>
          <Row title="Terms of service" onPress={() => openLink('https://companion.app/terms')} />
          <Row title="Privacy policy" onPress={() => openLink('https://companion.app/privacy')} last />
        </View>

        <View style={{ marginTop: 24, gap: 8 }}>
          <OutlineButton label="Log out" onPress={() => dispatch({ type: 'LOG_OUT' })} />
          <Pressable onPress={() => setShowDelete(true)} style={styles.deleteRow}>
            <Text style={styles.deleteLabel}>Delete account</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={showEditName} transparent animationType="fade" onRequestClose={() => setShowEditName(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Your name</Text>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Name"
              placeholderTextColor={colors.faint}
              style={styles.input}
              autoFocus
            />
            <PrimaryButton
              label="Save"
              onPress={() => { dispatch({ type: 'SET_NAME', name: nameDraft.trim() }); setShowEditName(false); }}
              style={{ marginTop: 18 }}
            />
            <OutlineButton label="Cancel" onPress={() => setShowEditName(false)} style={{ marginTop: 9 }} />
          </View>
        </View>
      </Modal>

      <Modal visible={showDelete} transparent animationType="fade" onRequestClose={() => setShowDelete(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Delete your account?</Text>
            <Text style={styles.sheetBody}>
              This removes your profile, plans, and history for good. Nobody can undo this — including us.
            </Text>
            <PrimaryButton
              label="Delete everything"
              onPress={() => { setShowDelete(false); dispatch({ type: 'LOG_OUT' }); }}
              style={{ marginTop: 18, backgroundColor: colors.clayPressed }}
            />
            <OutlineButton label="Never mind" onPress={() => setShowDelete(false)} style={{ marginTop: 9 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  header: { padding: 20, paddingTop: 36, paddingBottom: 8 },
  title: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 26, letterSpacing: -0.6, marginTop: 18 },
  body: { flex: 1, paddingHorizontal: 20 },
  sectionLabel: {
    fontFamily: 'Figtree_600SemiBold', fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase',
    color: colors.faint, marginTop: 22, marginBottom: 10,
  },
  card: { backgroundColor: colors.surface, borderRadius: radius.inner, ...shadow.inner, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: colors.lineCard,
  },
  rowTitle: { color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 14.5 },
  rowTitleDanger: { color: colors.clayPressed },
  rowSub: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 12, marginTop: 3 },
  chevron: { color: colors.faint, fontFamily: 'Figtree_600SemiBold', fontSize: 20 },
  proximityRow: { padding: 16 },
  proximityEdgeLabel: { color: colors.faint, fontFamily: 'Figtree_500Medium', fontSize: 11 },
  deleteRow: { alignItems: 'center', padding: 10 },
  deleteLabel: { color: colors.faint, fontFamily: 'Figtree_600SemiBold', fontSize: 13 },
  backdrop: { flex: 1, backgroundColor: 'rgba(46,42,38,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet,
    padding: 22, paddingBottom: 34,
  },
  sheetTitle: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 19 },
  sheetBody: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 13.5, lineHeight: 20, marginTop: 9 },
  input: {
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.ground, borderRadius: 999,
    paddingVertical: 14, paddingHorizontal: 16, fontFamily: 'Figtree_400Regular', fontSize: 14.5, color: colors.ink,
    marginTop: 14,
  },
});
