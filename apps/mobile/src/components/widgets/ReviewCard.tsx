import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, ToneKey, tones } from '../../theme';
import { Avatar } from './Avatar';
import { Stars } from './Stars';

export function ReviewCard({
  plan, date, rating, body, reviewer, initials, photo, tone = 'sky', tags = [], reply, showStars = true, showActions,
  onWhite, onPress, onPressReviewer, onReply, onReport,
}: {
  plan: string;
  date: string;
  rating: number;
  body?: string | null;
  reviewer: string;
  initials: string;
  photo?: string | null;
  tone?: ToneKey;
  tags?: string[];
  reply?: string | null;
  showStars?: boolean;
  showActions?: boolean;
  onWhite?: boolean;
  onPress?: () => void;
  onPressReviewer?: () => void;
  onReply?: () => void;
  onReport?: () => void;
}) {
  const bg = onWhite ? colors.white : colors.zinc100;
  const rule = onWhite ? colors.zinc100 : colors.zinc200;
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.card, { backgroundColor: bg }]}>
      <View style={styles.top}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.plan} numberOfLines={1}>{plan}</Text>
          {showStars && <View style={{ marginTop: 7 }}><Stars value={rating} size="s" showValue={false} /></View>}
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>
      {!!body && <Text style={styles.body}>“{body}”</Text>}
      <View style={[styles.footer, { borderTopColor: rule }]}>
        <Pressable onPress={onPressReviewer} disabled={!onPressReviewer} style={styles.reviewerTap}>
          <Avatar initials={initials} photo={photo} size={26} colorsOverride={tones[tone]} />
          <Text style={styles.reviewer} numberOfLines={1}>{reviewer}</Text>
        </Pressable>
        {tags.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {tags.slice(0, 2).map((t) => (
              <View key={t} style={styles.tag}><Text style={styles.tagLabel} numberOfLines={1}>{t}</Text></View>
            ))}
          </View>
        )}
      </View>
      {!!reply && (
        <View style={styles.reply}>
          <Text style={styles.replyLabel}>Your reply</Text>
          <Text style={styles.replyBody}>{reply}</Text>
        </View>
      )}
      {showActions && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          {!reply && (
            <Pressable onPress={onReply} style={[styles.action, { flex: 1 }]}>
              <Text style={styles.actionLabel}>Reply once</Text>
            </Pressable>
          )}
          <Pressable onPress={onReport} style={[styles.action, { paddingHorizontal: 17 }, !!reply && { flex: 1 }]}>
            <Text style={[styles.actionLabel, { color: colors.zinc500 }]}>Report</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  plan: { fontFamily: font.bold, fontSize: 13.5, letterSpacing: -0.2, color: colors.ink },
  date: { fontFamily: font.extrabold, fontSize: 9.5, letterSpacing: 0.9, textTransform: 'uppercase', color: colors.zinc400, paddingTop: 2 },
  body: { fontFamily: font.italic, fontSize: 13.5, lineHeight: 20, color: colors.zinc700, marginTop: 11 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 13, paddingTop: 12, borderTopWidth: 1 },
  reviewerTap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
  reviewer: { flex: 1, fontFamily: font.semibold, fontSize: 12, color: colors.zinc500 },
  tag: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.zinc200, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  tagLabel: { fontFamily: font.bold, fontSize: 10, color: colors.zinc700 },
  reply: { marginTop: 12, backgroundColor: colors.white, borderRadius: 14, padding: 13 },
  replyLabel: { fontFamily: font.extrabold, fontSize: 9.5, letterSpacing: 0.9, textTransform: 'uppercase', color: colors.amberInk },
  replyBody: { fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: colors.zinc700, marginTop: 5 },
  action: { minHeight: 44, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.zinc200, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontFamily: font.bold, fontSize: 12.5, color: colors.ink },
});
