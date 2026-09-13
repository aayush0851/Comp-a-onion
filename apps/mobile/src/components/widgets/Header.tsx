import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, scale, shadow } from '../../theme';
import { SERVER_STATUS_INDICATOR_ENABLED } from '../../data';
import { BackButton } from './BackButton';
import { ServerStatusDot, useServerStatus } from './ServerStatusDot';
import { Steps } from './Steps';

export type HeaderVariant = 'home' | 'stack' | 'convo';

export function Header({
  variant = 'stack', title, subtitle, eyebrow, action, actionDot, onAction, onBack,
  stepsTotal, stepsCurrent, ink = colors.ink,
}: {
  variant?: HeaderVariant;
  title: string;
  subtitle?: string | null;
  eyebrow?: string | null;
  action?: string | null;
  actionDot?: boolean;
  onAction?: () => void;
  onBack?: () => void;
  stepsTotal?: number;
  stepsCurrent?: number;
  ink?: string;
}) {
  const insets = useSafeAreaInsets();
  const convo = variant === 'convo';
  const showBack = variant === 'stack' || convo;
  const showWordmark = variant === 'home';

  return (
    <View style={[{ paddingTop: insets.top + 16 }, !convo && styles.headerBottom, convo && styles.headerConvoBar]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {showBack && <BackButton onPress={onBack} />}
          {showWordmark && (SERVER_STATUS_INDICATOR_ENABLED ? <Wordmark ink={ink} /> : <Text style={[scale.inline, styles.wordmark, { color: ink }]}>companion</Text>)}
          {convo && (
            <View style={{ minWidth: 0, flex: 1 }}>
              <Text numberOfLines={1} style={scale.inline}>{title}</Text>
              {!!subtitle && <Text numberOfLines={1} style={styles.convoSubtitle}>{subtitle}</Text>}
            </View>
          )}
        </View>
        {!!action && (
          <Pressable onPress={onAction} style={styles.actionPill}>
            {actionDot && <View style={styles.actionDot} />}
            <Text style={styles.actionLabel} numberOfLines={1}>{action}</Text>
          </Pressable>
        )}
      </View>
      {!!stepsTotal && (
        <View style={{ marginTop: 14, paddingHorizontal: 20 }}>
          <Steps total={stepsTotal} current={stepsCurrent ?? 1} />
        </View>
      )}
      {!convo && (
        <View style={{ marginTop: 14, paddingHorizontal: 20 }}>
          {!!eyebrow && <Text style={scale.eyebrow}>{eyebrow}</Text>}
          <Text style={[scale.display, { color: ink, marginTop: eyebrow ? 8 : 0 }]}>{title}</Text>
          {!!subtitle && <Text style={[scale.accent, { marginTop: 7 }]}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
}

function Wordmark({ ink }: { ink: string }) {
  const { status, wake } = useServerStatus();
  return (
    <Pressable onPress={wake} hitSlop={8} style={styles.wordmarkRow}>
      <ServerStatusDot status={status} />
      <Text style={[scale.inline, styles.wordmark, { color: ink }]}>companion</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 44, paddingHorizontal: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0, flexShrink: 1 },
  headerConvoBar: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line, ...shadow.inner, paddingBottom: 16 },
  headerBottom: { paddingBottom: 16 },
  convoSubtitle: { fontFamily: 'Figtree_500Medium', fontSize: 12, color: colors.muted, marginTop: 2 },
  wordmark: { fontFamily: 'Figtree_800ExtraBold', fontSize: 20, letterSpacing: -0.3 },
  wordmarkRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  actionPill: {
    flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line,
    borderRadius: 999, paddingHorizontal: 14, minHeight: 40, ...shadow.inner,
  },
  actionDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: colors.clay },
  actionLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12, color: colors.inkSecondary },
});
