import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font, seatTones } from '../theme';
import { Avatar, Btn, CheckDot, Footer, ListRow, Notice, Sheet, TextField, UserChip, StatusScrim } from '../components/widgets';
import { costModeLabel, genderIconSymbol, genderRestrictionLabel } from '../data';
import { toEventCard, type EventCard } from '../data/eventDisplay';
import { eventsApi, joinRequestsApi, ApiError } from '../api';
import type { ApiJoinRequest } from '../api/types';
import { useAppState } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function Detail({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const state = useAppState();
  const [activity, setActivity] = useState<EventCard | null>(null);
  const [myRequest, setMyRequest] = useState<ApiJoinRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [message, setMessage] = useState('');
  const [showGoing, setShowGoing] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([eventsApi.getEvent(route.params.id), joinRequestsApi.listMine()])
        .then(([event, mine]) => {
          setActivity(toEventCard(event));
          setMyRequest(mine.find((jr) => jr.eventId === route.params.id) ?? null);
        })
        .catch(() => setError("Couldn't load this hangout."))
        .finally(() => setLoading(false));
    }, [route.params.id]),
  );

  if (loading || !activity) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center', padding: 20 }]}>
        {loading ? <ActivityIndicator color={colors.ink} /> : <Notice tone="rose">{error}</Notice>}
      </View>
    );
  }

  const isHost = activity.hostId === state.userId;
  const activeRequest = myRequest && myRequest.status !== 'DECLINED' && myRequest.status !== 'EXPIRED' ? myRequest : null;
  const cta = activity.entry === 'open' ? 'Take a seat' : 'Ask to join';
  const ctaNote = activity.entry === 'open'
    ? 'No approval on this one. The chat opens straight away.'
    : `${activity.hostFirst} reads one line and decides. No chat until then.`;
  const seatsBadge = activity.isFull ? 'FULL' : `${activity.seatsLeft} SEAT${activity.seatsLeft === 1 ? '' : 'S'} LEFT`;
  const tags = [...activity.tags, activity.shapeLabel];
  const whenLabel = activity.time === 'Flexible' ? `${activity.dateLabel} · any time` : `${activity.time} · ${activity.dateLabel}`;

  const submitRequest = async () => {
    setSending(true);
    setError('');
    try {
      await joinRequestsApi.createJoinRequest(activity.id, message.trim() || undefined);
      setAsking(false);
      setSent(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't send that. Try again.");
    } finally {
      setSending(false);
    }
  };

  const specs: [string, string][] = [
    ['When', whenLabel],
    ['Where', activity.venue ?? 'Group picks in chat'],
    ['Getting in', activity.entry === 'open' ? 'Open seats' : 'Curated approval'],
    ['Who can join', genderRestrictionLabel(activity.genderRestriction)],
    ...(activity.costMode ? [['Cost', costModeLabel(activity.costMode) as string] as [string, string]] : []),
  ];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <View style={[styles.hero, { paddingTop: insets.top + 2 }]}>
          <View style={styles.heroTop}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.heroBack}>
              <Text style={styles.heroBackGlyph}>←</Text>
            </Pressable>
            <View style={styles.seatsPill}><Text style={styles.seatsPillLabel}>{seatsBadge}</Text></View>
          </View>
          <View style={{ paddingTop: 16, paddingHorizontal: 20 }}>
            <Text style={styles.heroEyebrow} numberOfLines={1}>{activity.venue ?? 'Anywhere nearby'}</Text>
            <Text style={styles.heroTitle}>{activity.title}</Text>
            {!!activity.description && <Text style={styles.heroDescription}>{activity.description}</Text>}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 13, flexWrap: 'wrap' }}>
              <View style={styles.timePill}><Text style={styles.timePillLabel}>{whenLabel}</Text></View>
              {activity.costMode && (
                <View style={styles.softPill}><Text style={styles.softPillLabel}>{costModeLabel(activity.costMode)}</Text></View>
              )}
            </View>
          </View>
        </View>

        <View style={{ paddingTop: 16, paddingHorizontal: 20 }}>
          {tags.length > 0 && (
            <View style={styles.tags}>
              {tags.map((t) => (
                <View key={t} style={styles.tag}><Text style={styles.tagLabel}>{t}</Text></View>
              ))}
            </View>
          )}

          <View style={[styles.box, { marginTop: 14 }]}>
            <UserChip
              name={activity.host}
              initials={activity.hostInitials}
              photo={activity.hostPhoto}
              meta="Hosting"
              chevron
              onPress={() => navigation.navigate('RequesterProfile', { userId: activity.hostId })}
            />
          </View>

          <Pressable onPress={() => setShowGoing(true)} style={[styles.box, styles.goingRow]}>
            {activity.going.length > 0 && (
              <View style={{ flexDirection: 'row' }}>
                {activity.going.slice(0, 4).map((g, i) => (
                  <View key={i} style={[styles.goingAvatar, { marginLeft: i === 0 ? 0 : -10 }]}>
                    <Avatar initials={g.label} photo={g.photo} size={30} colorsOverride={seatTones[i % seatTones.length]} />
                  </View>
                ))}
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.goingTitle}>Who's going</Text>
              <Text style={styles.goingSub}>{activity.goingLine}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <View style={[styles.box, styles.specs]}>
            {specs.map(([k, v], i) => (
              <View key={k} style={[styles.specRow, i < specs.length - 1 && styles.specRule]}>
                <Text style={styles.specKey}>{k}</Text>
                <Text style={styles.specVal}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <StatusScrim color={colors.amber} />

      <Footer>
        {isHost && <Btn label="Manage hangout" onPress={() => navigation.navigate('PlanManage', { id: activity.id })} />}
        {!isHost && activeRequest?.status === 'APPROVED' && (
          <Btn label="Open chat" variant="amber" onPress={() => navigation.navigate('Chat', { id: activity.id })} />
        )}
        {!isHost && activeRequest?.status === 'PENDING' && (
          <>
            <Btn
              label={`Message ${activity.hostFirst}`}
              onPress={() => navigation.navigate('RequesterChat', { planId: activity.id, requesterId: activity.hostId, name: activity.host })}
            />
            <Text style={styles.ctaNote}>Request sent — {activity.hostFirst} hasn't answered yet.</Text>
          </>
        )}
        {!isHost && !activeRequest && !sent && (activity.isFull ? (
          <>
            <Btn label="Full" variant="disabled" />
            <Text style={styles.ctaNote}>This hangout filled up — no seats left.</Text>
          </>
        ) : (
          <>
            {!!error && <Text style={[styles.ctaNote, { color: colors.roseInk, marginTop: 0, marginBottom: 8 }]}>{error}</Text>}
            <Btn label={cta} onPress={() => setAsking(true)} />
            <Text style={styles.ctaNote}>{ctaNote}</Text>
          </>
        ))}
        {sent && (
          <View style={styles.sent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <CheckDot size={26} />
              <Text style={styles.sentTitle}>Sent. Sit tight.</Text>
            </View>
            <Text style={styles.sentBody}>{activity.hostFirst} has people to look at. You'll get a push either way — including if it's a no.</Text>
            <View style={{ marginTop: 13 }}>
              <Btn label="Back to the board" variant="outlined" onPress={() => navigation.navigate('Board')} />
            </View>
          </View>
        )}
      </Footer>

      <Sheet visible={asking && !sent} onClose={() => setAsking(false)} title={`One line for ${activity.hostFirst}`} sub="Not a bio. Just why tonight.">
        <TextField
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={120}
          placeholder="Three weeks in this city and I can eat an unreasonable amount of ramen."
          style={styles.askInput}
        />
        <Text style={styles.counter}>{message.length}/120</Text>
        {!!error && <Text style={[styles.ctaNote, { color: colors.roseInk }]}>{error}</Text>}
        <View style={{ gap: 5, marginTop: 14 }}>
          <Btn label="Send request" loading={sending} onPress={submitRequest} />
          <Btn label="Cancel" variant="ghost" onPress={() => setAsking(false)} />
        </View>
      </Sheet>

      <Sheet visible={showGoing} onClose={() => setShowGoing(false)} title="Who's going" sub={activity.goingLine}>
        <View style={{ gap: 8, marginTop: 16 }}>
          {activity.going.map((g, i) => (
            <ListRow
              key={i}
              title={g.name}
              leading={<Avatar initials={g.label} photo={g.photo} size={44} colorsOverride={seatTones[i % seatTones.length]} />}
              right={genderIconSymbol(g.gender)}
            />
          ))}
          {activity.going.length === 0 && <Notice tone="zinc">Nobody yet — be the first.</Notice>}
        </View>
        <View style={{ marginTop: 14 }}><Btn label="Close" variant="secondary" onPress={() => setShowGoing(false)} /></View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  hero: { backgroundColor: colors.amber, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, paddingTop: 2, paddingHorizontal: 20 },
  heroBack: { width: 42, height: 42, borderRadius: 999, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  heroBackGlyph: { fontFamily: font.bold, fontSize: 17, color: colors.amber },
  seatsPill: { backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  seatsPillLabel: { fontFamily: font.extrabold, fontSize: 9.5, letterSpacing: 1.1, color: colors.amber },
  heroEyebrow: { fontFamily: font.extrabold, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.amberInk },
  heroTitle: { fontFamily: font.extrabold, fontSize: 26, lineHeight: 31, letterSpacing: -1, color: colors.ink, marginTop: 9 },
  heroDescription: { fontFamily: font.regular, fontSize: 13.5, lineHeight: 20, color: colors.amberInk, marginTop: 8 },
  timePill: { backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  timePillLabel: { fontFamily: font.bold, fontSize: 12.5, color: colors.white },
  softPill: { backgroundColor: 'rgba(255,255,255,.6)', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  softPillLabel: { fontFamily: font.bold, fontSize: 12.5, color: colors.ink },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tag: { backgroundColor: colors.zinc100, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  tagLabel: { fontFamily: font.bold, fontSize: 11.5, color: colors.zinc700 },
  box: { backgroundColor: colors.zinc100, borderRadius: 20, padding: 15 },
  goingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 9 },
  goingAvatar: { borderWidth: 2, borderColor: colors.zinc100, borderRadius: 999 },
  goingTitle: { fontFamily: font.bold, fontSize: 13.5, color: colors.ink },
  goingSub: { fontFamily: font.regular, fontSize: 12, color: colors.zinc500, marginTop: 2 },
  chevron: { fontFamily: font.bold, fontSize: 16, color: colors.zinc300 },
  specs: { marginTop: 9, paddingVertical: 4 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 13 },
  specRule: { borderBottomWidth: 1, borderBottomColor: colors.zinc200 },
  specKey: { fontFamily: font.regular, fontSize: 12.5, color: colors.zinc500 },
  specVal: { flexShrink: 1, textAlign: 'right', fontFamily: font.bold, fontSize: 12.5, color: colors.ink },
  ctaNote: { textAlign: 'center', fontFamily: font.regular, fontSize: 12.5, color: colors.zinc500, marginTop: 12 },
  askInput: { marginTop: 16, minHeight: 96, paddingTop: 14, textAlignVertical: 'top', fontFamily: font.semibold, fontSize: 15, lineHeight: 21 },
  counter: { alignSelf: 'flex-end', fontFamily: font.extrabold, fontSize: 9.5, letterSpacing: 1.1, color: colors.zinc400, marginTop: 8 },
  sent: { backgroundColor: colors.mint, borderRadius: 20, padding: 16 },
  sentTitle: { fontFamily: font.extrabold, fontSize: 16, color: colors.mintInk },
  sentBody: { fontFamily: font.regular, fontSize: 13, lineHeight: 20, color: colors.mintInk, marginTop: 9 },
});
