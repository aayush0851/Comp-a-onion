import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, scale, shadow, Tone } from '../../theme';
import { Stars } from './Stars';
import { UserChip } from './UserChip';

export function ReviewCard({
  reviewer, initials, tone = 'sage', reviewerRating, reviewerCount, rating, date, body, tags, plan, reply,
  showActions, onPress, onPressReviewer, onReply, onReport,
}: {
  reviewer: string;
  initials: string;
  tone?: Tone;
  reviewerRating?: number | null;
  reviewerCount?: number | null;
  rating: number;
  date: string;
  body: string;
  tags?: string[];
  plan?: string | null;
  reply?: string | null;
  showActions?: boolean;
  onPress?: () => void;
  onPressReviewer?: () => void;
  onReply?: () => void;
  onReport?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.reviewCard} disabled={!onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <UserChip name={reviewer} initials={initials} tone={tone} size="s" rating={reviewerRating} count={reviewerCount} onPress={onPressReviewer} />
        </View>
        <Text style={{ fontFamily: 'Figtree_500Medium', fontSize: 11, color: colors.faint, paddingTop: 4 }}>{date}</Text>
      </View>
      <View style={{ marginTop: 12 }}><Stars value={rating} size="s" showValue={false} /></View>
      <Text style={[scale.body, { fontSize: 13.5, marginTop: 10, color: '#453F39' }]}>{body}</Text>
      {!!tags?.length && (
        <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
          {tags.map((t) => (
            <View key={t} style={styles.miniTag}><Text style={styles.miniTagLabel}>{t}</Text></View>
          ))}
        </View>
      )}
      {!!plan && (
        <View style={styles.reviewPlanRow}>
          <View style={styles.reviewPlanThumb} />
          <Text numberOfLines={1} style={{ fontFamily: 'Figtree_600SemiBold', fontSize: 11.5, color: colors.muted, flex: 1 }}>{plan}</Text>
        </View>
      )}
      {!!reply && (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Your reply</Text>
          <Text style={styles.replyBody}>{reply}</Text>
        </View>
      )}
      {showActions && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          <Pressable onPress={onReply} style={styles.actionBtn}>
            <Text style={styles.actionBtnLabel}>Reply</Text>
          </Pressable>
          <Pressable onPress={onReport} style={[styles.actionBtn, { flex: 0, paddingHorizontal: 16 }]}>
            <Text style={[styles.actionBtnLabel, { color: colors.muted }]}>Report</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  reviewCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, ...shadow.inner },
  miniTag: { backgroundColor: '#F8F2EC', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 },
  miniTagLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 10.5, color: colors.inkSecondary },
  reviewPlanRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 13, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
  reviewPlanThumb: { width: 22, height: 22, borderRadius: 7, backgroundColor: colors.neutralAvatar },
  replyBox: { marginTop: 13, backgroundColor: '#F8F5F0', borderRadius: 14, padding: 13 },
  replyLabel: { fontFamily: 'Figtree_700Bold', fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.clayPressed },
  replyBody: { fontFamily: 'Newsreader_400Regular_Italic', fontSize: 13.5, lineHeight: 19, color: colors.inkSecondary, marginTop: 5 },
  actionBtn: { flex: 1, minHeight: 40, borderRadius: 999, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  actionBtnLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12, color: colors.inkSecondary },
});
