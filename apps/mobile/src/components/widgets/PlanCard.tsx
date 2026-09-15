import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { badgeTones, colors, radius, scale, shadow, Tone } from '../../theme';
import { Btn, BtnVariant } from './Btn';
import { UserChip } from './UserChip';

export function PlanCard({
  title, blurb, venue, time, dist, badge, badgeTone = 'light', badgeIcon, tag, kind, filled, total, cta, ctaVariant = 'primary',
  host, hostInitials, hostPhoto, hostRating, hostCount, hostTone = 'peach', compact, disabled, youSignedUp, onPress, onPressCta, onPressHost,
}: {
  title: string;
  blurb?: string;
  venue?: string | null;
  time: string;
  dist: string;
  badge?: string | null;
  badgeTone?: 'light' | 'primary' | 'sage' | 'dark';
  badgeIcon?: keyof typeof Feather.glyphMap;
  tag?: string | null;
  kind?: string | null;
  filled: number;
  total: number;
  cta?: string | null;
  ctaVariant?: BtnVariant;
  host: string;
  hostInitials: string;
  hostPhoto?: string | null;
  hostRating?: number | null;
  hostCount?: number | null;
  hostTone?: Tone;
  compact?: boolean;
  disabled?: boolean;
  youSignedUp?: boolean;
  onPress?: () => void;
  onPressCta?: () => void;
  onPressHost?: () => void;
}) {
  const bt = badgeTones[badgeTone];
  return (
    <Pressable onPress={onPress} style={[styles.planCard, disabled && styles.planCardDisabled]}>
      <View style={[styles.planCardHero, { height: compact ? 110 : 132 }]}>
        {!!venue && (
          <View style={styles.planCardVenuePill}>
            <Text style={styles.planCardVenueText} numberOfLines={1}>{venue}</Text>
          </View>
        )}
        <View style={styles.planCardTimePill}>
          <Feather name="clock" size={12} color={colors.ground} style={{ marginTop: -1 }} />
          <Text style={styles.planCardTimeText}>{time}</Text>
          {!!dist && <Text style={styles.planCardDistText}>{dist}</Text>}
        </View>
        {(!!badge || !!badgeIcon) && (
          <View style={[styles.planCardBadge, { backgroundColor: bt.bg }]}>
            {!!badgeIcon && <Feather name={badgeIcon} size={11} color={bt.fg} />}
            {!!badge && <Text style={[styles.planCardBadgeText, { color: bt.fg }]} numberOfLines={1}>{badge}</Text>}
          </View>
        )}
      </View>
      <View style={{ padding: 17 }}>
        <Text style={scale.card}>{title}</Text>
        {!!blurb && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 }}>
            <Feather name="map-pin" size={12} color={colors.muted} />
            <Text style={[scale.body, { flexShrink: 1 }]} numberOfLines={1}>{blurb}</Text>
          </View>
        )}
        {!!tag && (
          <View style={{ flexDirection: 'row', marginTop: 11 }}>
            <View style={styles.tagPill}><Text style={styles.tagPillText}>{tag}</Text></View>
          </View>
        )}
        <View style={{ marginTop: 14 }}>
          <UserChip name={host} initials={hostInitials} photo={hostPhoto} rating={hostRating} count={hostCount} size="s" tone={hostTone} onPress={onPressHost} />
        </View>
        <View style={styles.planCardFooter}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: 'Figtree_500Medium', fontSize: 12, color: colors.muted }} numberOfLines={1}>
              {filled === 0
                ? 'Be the first to sign up'
                : youSignedUp && filled === 1
                  ? 'You signed up for this'
                  : `${host} + ${filled} ${filled === 1 ? 'person' : 'people'} signed up for this`}
            </Text>
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
  planCardDisabled: { opacity: 0.55 },
  planCardHero: { backgroundColor: colors.neutralAvatar, position: 'relative' },
  planCardVenuePill: { position: 'absolute', left: 14, top: 14, backgroundColor: 'rgba(255,255,255,.86)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, maxWidth: '70%' },
  planCardVenueText: { fontFamily: 'Figtree_600SemiBold', fontSize: 8.5, letterSpacing: 0.6, color: colors.muted },
  planCardTimePill: { position: 'absolute', left: 14, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  planCardTimeText: { fontFamily: 'Figtree_700Bold', fontSize: 13, color: colors.ground },
  planCardDistText: { fontFamily: 'Figtree_500Medium', fontSize: 13, color: colors.ground, opacity: 0.55 },
  planCardBadge: { position: 'absolute', right: 14, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, maxWidth: '55%' },
  planCardBadgeText: { fontFamily: 'Figtree_600SemiBold', fontSize: 11 },
  tagPill: { backgroundColor: colors.blush, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  tagPillText: { fontFamily: 'Figtree_600SemiBold', fontSize: 11, color: colors.clayPressed },
  planCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 15, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line },
});
