import { Pressable, StyleSheet, Text, View } from 'react-native';
import { badgeTones, colors, radius, scale, shadow, Tone } from '../../theme';
import { Btn, BtnVariant } from './Btn';
import { UserChip } from './UserChip';

export function PlanCard({
  title, blurb, venue, time, dist, badge, badgeTone = 'light', tag, kind, filled, total, cta, ctaVariant = 'primary',
  host, hostInitials, hostRating, hostCount, hostTone = 'peach', compact, onPress, onPressCta, onPressHost,
}: {
  title: string;
  blurb?: string;
  venue: string;
  time: string;
  dist: string;
  badge?: string | null;
  badgeTone?: 'light' | 'primary' | 'sage' | 'dark';
  tag?: string | null;
  kind?: string | null;
  filled: number;
  total: number;
  cta?: string | null;
  ctaVariant?: BtnVariant;
  host: string;
  hostInitials: string;
  hostRating?: number | null;
  hostCount?: number | null;
  hostTone?: Tone;
  compact?: boolean;
  onPress?: () => void;
  onPressCta?: () => void;
  onPressHost?: () => void;
}) {
  const bt = badgeTones[badgeTone];
  const seats = Array.from({ length: total }, (_, i) => i < filled);
  return (
    <Pressable onPress={onPress} style={styles.planCard}>
      <View style={[styles.planCardHero, { height: compact ? 110 : 132 }]}>
        <View style={styles.planCardVenuePill}>
          <Text style={styles.planCardVenueText} numberOfLines={1}>{venue}</Text>
        </View>
        <View style={styles.planCardTimePill}>
          <Text style={styles.planCardTimeText}>{time}</Text>
          <Text style={styles.planCardDistText}>{dist}</Text>
        </View>
        {!!badge && (
          <View style={[styles.planCardBadge, { backgroundColor: bt.bg }]}>
            <Text style={[styles.planCardBadgeText, { color: bt.fg }]} numberOfLines={1}>{badge}</Text>
          </View>
        )}
      </View>
      <View style={{ padding: 17 }}>
        <Text style={scale.card}>{title}</Text>
        {!!blurb && <Text style={[scale.body, { marginTop: 6 }]}>{blurb}</Text>}
        {!!tag && (
          <View style={{ flexDirection: 'row', marginTop: 11 }}>
            <View style={styles.tagPill}><Text style={styles.tagPillText}>{tag}</Text></View>
          </View>
        )}
        <View style={{ marginTop: 14 }}>
          <UserChip name={host} initials={hostInitials} rating={hostRating} count={hostCount} size="s" tone={hostTone} onPress={onPressHost} />
        </View>
        <View style={styles.planCardFooter}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {seats.map((on, i) => (
                <View key={i} style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: on ? colors.clay : '#E7DACD' }} />
              ))}
            </View>
            <Text style={{ fontFamily: 'Figtree_500Medium', fontSize: 12, color: colors.muted }}>{filled} of {total} going</Text>
          </View>
          {!!kind && (
            <View style={styles.tagPill}><Text style={styles.tagPillText}>{kind}</Text></View>
          )}
        </View>
        {!!cta && (
          <View style={{ marginTop: 15 }}>
            <Btn label={cta} variant={ctaVariant} onPress={onPressCta} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  planCard: { backgroundColor: colors.surface, borderRadius: radius.card, overflow: 'hidden', ...shadow.card },
  planCardHero: { backgroundColor: colors.neutralAvatar, position: 'relative' },
  planCardVenuePill: { position: 'absolute', left: 14, top: 14, backgroundColor: 'rgba(255,255,255,.86)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, maxWidth: '70%' },
  planCardVenueText: { fontFamily: 'Figtree_600SemiBold', fontSize: 8.5, letterSpacing: 0.6, color: colors.muted },
  planCardTimePill: { position: 'absolute', left: 14, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  planCardTimeText: { fontFamily: 'Figtree_700Bold', fontSize: 13, color: colors.ground },
  planCardDistText: { fontFamily: 'Figtree_500Medium', fontSize: 13, color: colors.ground, opacity: 0.55 },
  planCardBadge: { position: 'absolute', right: 14, bottom: 14, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, maxWidth: '55%' },
  planCardBadgeText: { fontFamily: 'Figtree_600SemiBold', fontSize: 11 },
  tagPill: { backgroundColor: colors.blush, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  tagPillText: { fontFamily: 'Figtree_600SemiBold', fontSize: 11, color: colors.clayPressed },
  planCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 15, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line },
});
