import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow, stripe } from '../theme';
import { BackButton, Btn, UserChip } from '../components/widgets';
import {
  ACTIVITIES, costModeLabel, GENDER_COLORS, genderIconSymbol, genderRestrictionLabel, HOUSE_RULES,
} from '../data';
import { useAppState, useAppDispatch } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function Detail({ navigation, route }: Props) {
  const activity = ACTIVITIES.find((a) => a.id === route.params.id) ?? ACTIVITIES[0];
  const state = useAppState();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [asking, setAsking] = useState(false);
  const [message, setMessage] = useState('');
  const [showGoing, setShowGoing] = useState(false);
  const sent = state.requested.includes(activity.id);
  const cta = activity.entry === 'open' ? 'Take a seat' : 'Ask to join';
  const ctaNote = activity.entry === 'open'
    ? 'No approval on this one. The chat opens straight away.'
    : `${activity.hostFirst} reads one line and decides. No chat until then.`;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[stripe(212), styles.hero]}>
          <View style={{ position: 'absolute', top: insets.top + 2, left: 18 }}>
            <BackButton onPress={() => navigation.navigate('Board')} />
          </View>
          <View style={styles.slotChip}><Text style={styles.slotLabel}>{activity.slot}</Text></View>
          <View style={styles.timeChip}>
            <Text style={styles.timeLabel}>{activity.time} today</Text>
            <Text style={styles.distLabel}>{activity.dist}</Text>
          </View>
        </View>

        <View style={{ padding: 20 }}>
          <Text style={styles.title}>{activity.title}</Text>
          <View style={styles.tagRow}>
            {activity.tags.map((tg) => (
              <View key={tg} style={styles.tag}><Text style={styles.tagLabel}>{tg}</Text></View>
            ))}
            <View style={styles.shapeTag}><Text style={styles.shapeTagLabel}>{activity.shapeLabel}</Text></View>
          </View>

          <View style={styles.hostCard}>
            <View style={{ flex: 1 }}>
              <UserChip name={activity.host} initials={activity.hostInitials} size="m" meta={`Hosting · ${activity.hosted} plans · everyone turned up`} />
            </View>
            <View style={styles.verifiedChip}>
              <View style={styles.verifiedDot} />
              <Text style={styles.verifiedLabel}>ID verified</Text>
            </View>
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionLabel}>Who's going</Text>
            <Pressable onPress={() => setShowGoing(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <View style={{ flexDirection: 'row' }}>
                {activity.going.map((g, i) => (
                  <View key={i} style={[styles.goingAvatar, { backgroundColor: g.bg, marginLeft: i === 0 ? 0 : -8 }]}>
                    <Text style={[styles.goingLabel, { color: g.fg }]}>{g.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.goingLine}>{activity.goingLine}</Text>
              <Text style={styles.goingArrow}>›</Text>
            </Pressable>
          </View>

          <View style={styles.specCard}>
            {[
              ['When', activity.when],
              ['Where', activity.where],
              ['Getting in', activity.gettingIn],
              ['Who can join', genderRestrictionLabel(activity.genderRestriction)],
              ...(activity.costMode ? [['Cost', costModeLabel(activity.costMode) as string]] : []),
            ].map(([k, v], i, arr) => (
              <View key={k} style={[styles.specRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.specKey}>{k}</Text>
                <Text style={styles.specVal}>{v}</Text>
              </View>
            ))}
          </View>

          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>Same three rules on every plan</Text>
            {HOUSE_RULES.map((r) => (
              <View key={r} style={styles.ruleRow}>
                <View style={styles.ruleDot} />
                <Text style={styles.ruleText}>{r}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {!asking && !sent && (
        <View style={styles.bottomIdle}>
          <Btn label={cta} onPress={() => setAsking(true)} />
          <Text style={styles.ctaNote}>{ctaNote}</Text>
        </View>
      )}
      {asking && !sent && (
        <View style={styles.bottomAsk}>
          <Text style={styles.askTitle}>One line for {activity.hostFirst}</Text>
          <Text style={styles.askSub}>Not a bio. Just why tonight.</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            placeholder="Three weeks in this city and I can eat an unreasonable amount of ramen."
            placeholderTextColor={colors.faint}
            style={styles.textarea}
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Btn
                label="Send request"
                onPress={() => { dispatch({ type: 'REQUEST_JOIN', id: activity.id }); setAsking(false); }}
              />
            </View>
            <Btn label="Cancel" variant="secondary" full={false} onPress={() => setAsking(false)} />
          </View>
        </View>
      )}
      {sent && (
        <View style={styles.bottomSent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <View style={styles.sentCheck}><Text style={styles.sentCheckLabel}>✓</Text></View>
            <Text style={styles.sentTitle}>Sent. Sit tight.</Text>
          </View>
          <Text style={styles.sentBody}>
            {activity.hostFirst} has people to look at. You'll get a push either way — including if it's a no.
          </Text>
          <View style={{ marginTop: 13 }}>
            <Btn label="Back to the board" variant="secondary" onPress={() => navigation.navigate('Board')} />
          </View>
        </View>
      )}

      <Modal visible={showGoing} transparent animationType="fade" onRequestClose={() => setShowGoing(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowGoing(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Who's going</Text>
            {activity.going.map((g, i) => (
              <View key={i} style={[styles.goingRow, i === activity.going.length - 1 && { borderBottomWidth: 0 }]}>
                {g.photo ? (
                  <Image source={{ uri: g.photo }} style={styles.goingRowAvatar} />
                ) : (
                  <View style={[styles.goingRowAvatar, { backgroundColor: g.bg, alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={[styles.goingLabel, { color: g.fg }]}>{g.label}</Text>
                  </View>
                )}
                <Text style={styles.goingRowName}>{g.name}</Text>
                <View style={[styles.genderBadge, { backgroundColor: GENDER_COLORS[g.gender].bg }]}>
                  <Text style={[styles.genderBadgeIcon, { color: GENDER_COLORS[g.gender].fg }]}>{genderIconSymbol(g.gender)}</Text>
                </View>
              </View>
            ))}
            <View style={{ marginTop: 8 }}><Btn label="Close" variant="secondary" onPress={() => setShowGoing(false)} /></View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  hero: { borderRadius: 0, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  slotChip: {
    position: 'absolute', left: 18, bottom: 52, backgroundColor: 'rgba(255,255,255,.86)',
    borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10,
  },
  slotLabel: { color: colors.muted, fontFamily: 'Figtree_600SemiBold', fontSize: 8.5, letterSpacing: 0.6 },
  timeChip: {
    position: 'absolute', left: 18, bottom: 18, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.ink, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14,
  },
  timeLabel: { color: colors.ground, fontFamily: 'Figtree_700Bold', fontSize: 13.5 },
  distLabel: { color: colors.ground, opacity: 0.55, fontFamily: 'Figtree_500Medium', fontSize: 13.5 },
  title: { fontFamily: 'Figtree_700Bold', fontSize: 28, letterSpacing: -0.6, color: colors.ink },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 13 },
  tag: { backgroundColor: colors.blush, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  tagLabel: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 11.5 },
  shapeTag: { backgroundColor: colors.sageBg, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  shapeTagLabel: { color: colors.sageInk, fontFamily: 'Figtree_600SemiBold', fontSize: 11.5 },
  hostCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface,
    borderRadius: radius.inner, padding: 15, marginTop: 16, ...shadow.inner,
  },
  hostAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' },
  hostAvatarLabel: { color: colors.clayPressed, fontFamily: 'Figtree_700Bold', fontSize: 14 },
  hostName: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 15 },
  hostSub: { color: colors.muted, fontFamily: 'Figtree_500Medium', fontSize: 12, marginTop: 3 },
  verifiedChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.sageBg, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 10 },
  verifiedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.sage },
  verifiedLabel: { color: colors.sageInk, fontFamily: 'Figtree_600SemiBold', fontSize: 10.5 },
  sectionLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: colors.faint, marginBottom: 11 },
  goingAvatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
  goingLabel: { fontFamily: 'Figtree_700Bold', fontSize: 11 },
  goingLine: { color: colors.muted, fontFamily: 'Figtree_500Medium', fontSize: 13, marginLeft: 4 },
  goingArrow: { color: colors.faint, fontFamily: 'Figtree_700Bold', fontSize: 16, marginLeft: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(46,42,38,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet,
    padding: 22, paddingBottom: 34,
  },
  sheetTitle: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 17, marginBottom: 8 },
  goingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.lineCard,
  },
  goingRowAvatar: { width: 42, height: 42, borderRadius: 21 },
  goingRowName: { flex: 1, color: colors.ink, fontFamily: 'Figtree_600SemiBold', fontSize: 14 },
  genderBadge: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: colors.blush,
    alignItems: 'center', justifyContent: 'center',
  },
  genderBadgeIcon: { color: colors.clayPressed, fontFamily: 'Figtree_700Bold', fontSize: 14 },
  specCard: { marginTop: 18, backgroundColor: colors.surface, borderRadius: radius.inner, paddingHorizontal: 16, ...shadow.inner },
  specRow: { flexDirection: 'row', gap: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.lineCard },
  specKey: { width: 64, color: colors.faint, fontFamily: 'Figtree_600SemiBold', fontSize: 12 },
  specVal: { flex: 1, color: colors.ink, fontFamily: 'Figtree_500Medium', fontSize: 13.5, lineHeight: 18 },
  rulesCard: { marginTop: 16, backgroundColor: colors.blush, borderRadius: radius.inner, padding: 17 },
  rulesTitle: { color: colors.blushInk, fontFamily: 'Figtree_700Bold', fontSize: 13.5, marginBottom: 10 },
  ruleRow: { flexDirection: 'row', gap: 9, paddingVertical: 4, alignItems: 'flex-start' },
  ruleDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.clay, marginTop: 7 },
  ruleText: { flex: 1, color: colors.blushInk, fontFamily: 'Figtree_400Regular', fontSize: 13, lineHeight: 19 },
  bottomIdle: { backgroundColor: 'rgba(251,246,240,.95)', padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.line },
  ctaNote: { color: colors.faint, fontFamily: 'Figtree_400Regular', fontSize: 11.5, textAlign: 'center', marginTop: 9 },
  bottomAsk: { backgroundColor: colors.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 32, ...shadow.sheet },
  askTitle: { color: colors.ink, fontFamily: 'Figtree_700Bold', fontSize: 16 },
  askSub: { color: colors.muted, fontFamily: 'Figtree_400Regular', fontSize: 12.5, marginTop: 5 },
  textarea: {
    marginTop: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.inner, backgroundColor: colors.ground,
    padding: 14, fontFamily: 'Figtree_400Regular', fontSize: 13.5, color: colors.ink, height: 78, textAlignVertical: 'top',
  },
  bottomSent: { backgroundColor: colors.sageBg, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 32 },
  sentCheck: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  sentCheckLabel: { color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 13 },
  sentTitle: { color: colors.sageInk2, fontFamily: 'Figtree_700Bold', fontSize: 16 },
  sentBody: { color: '#54604B', fontFamily: 'Figtree_400Regular', fontSize: 13, lineHeight: 20, marginTop: 9 },
});
