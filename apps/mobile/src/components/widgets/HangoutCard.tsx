import { useState } from 'react';
import Octicons from '@expo/vector-icons/Octicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, lift, seatTones, ToneKey, tones } from '../../theme';
import { Avatar } from './Avatar';
import { ratingText } from './Stars';
import { VerifiedDot } from './UserChip';
import type { PostCard } from '../../data/postDisplay';
import { MAP_LINK_LABEL, openMapLink } from '../../data/mapLink';

export type FlagTone = 'zinc' | 'amber' | 'ink' | 'sky' | 'warn' | 'mint';
export type CtaTone = 'ink' | 'amber' | 'soft' | 'disabled';

const FLAG: Record<FlagTone, [string, string]> = {
  zinc: [colors.zinc100, colors.zinc700],
  amber: [colors.amber, colors.ink],
  ink: [colors.ink, colors.amber],
  sky: [colors.sky, colors.skyInk],
  warn: [colors.amberSoft, colors.amberInk],
  mint: [colors.mint, colors.mintInk],
};
const CTA: Record<CtaTone, [string, string]> = {
  ink: [colors.ink, colors.white],
  amber: [colors.amber, colors.ink],
  soft: [colors.white, colors.ink],
  disabled: [colors.zinc200, colors.zinc400],
};

const BLURB_LINES = 3;

// Clamps the description to three lines; "See more" opens the plan detail. A hidden unclamped copy tells us whether it overflows.
function Blurb({ text, onSeeMore }: { text: string; onSeeMore?: () => void }) {
  const [overflows, setOverflows] = useState(false);
  return (
    <View>
      <Text style={styles.blurb} numberOfLines={BLURB_LINES}>{text}</Text>
      <Text
        style={[styles.blurb, styles.blurbMeasure]}
        onTextLayout={(e) => setOverflows(e.nativeEvent.lines.length > BLURB_LINES)}
        pointerEvents="none"
      >
        {text}
      </Text>
      {overflows && (
        <Text style={styles.seeMore} onPress={onSeeMore}>See more</Text>
      )}
    </View>
  );
}

export function HangoutCard({
  card, hostRating, hostTone = 'amber', verified = true, flag, flagIcon, flagTone = 'zinc', updated, tags = [], cta, ctaTone = 'ink',
  featured, onSurface, dimmed, onPress, onPressHost, onPressCta,
}: {
  card: PostCard;
  hostRating?: number | null;
  hostTone?: ToneKey;
  verified?: boolean;
  flag?: string | null;
  flagIcon?: 'zap' | 'lock';
  // Something changed on this hangout since it was last opened; shows a dot on the card's corner.
  updated?: boolean;
  flagTone?: FlagTone;
  tags?: string[];
  cta?: string | null;
  ctaTone?: CtaTone;
  featured?: boolean;
  onSurface?: boolean;
  dimmed?: boolean;
  onPress?: () => void;
  onPressHost?: () => void;
  onPressCta?: () => void;
}) {
  const { host, hostInitials, hostPhoto, whenShort, venue, mapUrl, title, description: blurb, going, goingLine: seatText } = card;
  const cardBg = featured ? colors.amber : onSurface ? colors.zinc100 : colors.white;
  const [flagBg, flagFg] = FLAG[flagTone];
  const [ctaBg, ctaFg] = CTA[ctaTone];
  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: cardBg }, dimmed && { opacity: 0.55 }]}>
      {updated && <View style={styles.updatedBadge} accessibilityLabel="New update" />}
      <View style={styles.top}>
        <Pressable onPress={onPressHost ?? onPress} style={styles.hostTap}>
          <Avatar initials={hostInitials} photo={hostPhoto} size={44} colorsOverride={tones[hostTone]} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.host} numberOfLines={1}>{host}</Text>
              {!!hostRating && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Text style={styles.star}>★</Text>
                  <Text style={styles.rating}>{ratingText(hostRating)}</Text>
                </View>
              )}
              {verified && <VerifiedDot size={14} />}
            </View>
            <Text style={styles.where} numberOfLines={1}>
              {mapUrl ? <Text style={styles.mapLink} onPress={() => openMapLink(mapUrl)}>{MAP_LINK_LABEL}</Text> : venue ?? 'Anywhere'}
              {` · ${whenShort}`}
            </Text>
          </View>
        </Pressable>
        {(!!flag || !!flagIcon) && (
          <View style={[styles.flag, !!flag && { backgroundColor: flagBg }, !!flagIcon && styles.flagWithIcon]}>
            {!!flagIcon && <Octicons name={flagIcon} size={flag ? 12 : 16} color={flag ? flagFg : colors.zinc500} />}
            {!!flag && <Text style={[styles.flagLabel, { color: flagFg }]} numberOfLines={1}>{flag}</Text>}
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {!!blurb && <Blurb text={blurb} onSeeMore={onPress} />}
      {tags.length > 0 && (
        <View style={styles.tags}>
          {tags.map((t) => (
            <View key={t} style={[styles.tag, { backgroundColor: featured ? 'rgba(255,255,255,.55)' : colors.zinc100 }]}>
              <Text style={[styles.tagLabel, { color: featured ? colors.ink : colors.zinc700 }]}>{t}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={[styles.footer, { borderTopColor: featured ? 'rgba(24,24,24,.14)' : onSurface ? colors.zinc200 : colors.zinc100 }]}>
        <View style={styles.seatsWrap}>
          {going.length > 0 && (
            <View style={{ flexDirection: 'row' }}>
              {going.slice(0, 4).map((s, i) => {
                const [bg, fg] = seatTones[i % seatTones.length];
                return (
                  <View key={i} style={[styles.seat, { marginLeft: i === 0 ? 0 : -8, borderColor: cardBg, backgroundColor: bg }]}>
                    {s.photo ? (
                      <Avatar initials={s.label} photo={s.photo} size={22} />
                    ) : (
                      <Text style={[styles.seatLabel, { color: fg }]}>{s.label}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
          <Text style={styles.seatText} numberOfLines={1}>{seatText}</Text>
        </View>
        {!!cta && (
          <Pressable onPress={ctaTone === 'disabled' ? undefined : onPressCta} style={[styles.cta, { backgroundColor: ctaBg }]}>
            <Text style={[styles.ctaLabel, { color: ctaFg }]} numberOfLines={1}>{cta}</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 16 },
  updatedBadge: { position: 'absolute', top: -4, right: -4, zIndex: 1, width: 14, height: 14, borderRadius: 999, backgroundColor: colors.amber, borderWidth: 2.5, borderColor: colors.white },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  hostTap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 },
  host: { fontFamily: font.bold, fontSize: 14.5, letterSpacing: -0.3, color: colors.ink, flexShrink: 1 },
  star: { fontSize: 10, color: colors.amber },
  rating: { fontFamily: font.bold, fontSize: 11.5, color: colors.ink },
  blurbMeasure: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0 },
  seeMore: { fontFamily: font.bold, fontSize: 12.5, color: colors.zinc700, marginTop: 4 },
  mapLink: { textDecorationLine: 'underline' },
  where: { fontFamily: font.medium, fontSize: 11.5, color: colors.zinc500, marginTop: 3 },
  flagWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  flag: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7, maxWidth: 140 },
  flagLabel: { fontFamily: font.bold, fontSize: 10.5, letterSpacing: -0.1, ...lift(10.5) },
  title: { fontFamily: font.extrabold, fontSize: 18, lineHeight: 23, letterSpacing: -0.5, color: colors.ink, marginTop: 14 },
  blurb: { fontFamily: font.regular, fontSize: 13, lineHeight: 19.5, color: colors.zinc500, marginTop: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  tag: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7 },
  tagLabel: { fontFamily: font.bold, fontSize: 10.5, ...lift(10.5) },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 15, paddingTop: 14, borderTopWidth: 1 },
  seatsWrap: { flexDirection: 'row', alignItems: 'center', gap: 9, minWidth: 0, flexShrink: 1 },
  seat: { width: 26, height: 26, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  seatLabel: { fontFamily: font.bold, fontSize: 9.5 },
  seatText: { fontFamily: font.semibold, fontSize: 11.5, color: colors.zinc500, flexShrink: 1 },
  cta: { borderRadius: 999, paddingHorizontal: 17, minHeight: 44, justifyContent: 'center' },
  ctaLabel: { fontFamily: font.bold, fontSize: 12.5, ...lift(12.5) },
});
