import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, text } from '../../theme';
import { BackButton } from './BackButton';
import { Steps } from './Steps';
import { Wordmark } from './Wordmark';

export type HeaderVariant = 'home' | 'stack' | 'convo';

export function Header({
  variant = 'stack', title, subtitle, eyebrow, centerLabel, action, actionTone = 'zinc', actionDot, onAction, onBack,
  stepsTotal, stepsCurrent, ink = colors.ink, left, right, hideTitle,
}: {
  variant?: HeaderVariant;
  title?: string;
  subtitle?: string | null;
  eyebrow?: string | null;
  centerLabel?: string | null;
  action?: string | null;
  actionTone?: 'zinc' | 'amber';
  actionDot?: boolean;
  onAction?: () => void;
  onBack?: () => void;
  stepsTotal?: number;
  stepsCurrent?: number;
  ink?: string;
  left?: ReactNode;
  right?: ReactNode;
  hideTitle?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const convo = variant === 'convo';
  const onDark = ink !== colors.ink;

  return (
    <View style={[{ paddingTop: insets.top + 2 }, convo && styles.convoBar]}>
      <View style={styles.inner}>
        <View style={styles.row}>
          <View style={styles.left}>
            {variant !== 'home' && <BackButton onPress={onBack} dark={onDark} />}
            {variant === 'home' && <Wordmark ink={ink} onDark={onDark} />}
            {convo && (
              <View style={{ minWidth: 0, flex: 1 }}>
                {left ?? (
                  <>
                    <Text numberOfLines={1} style={styles.inlineTitle}>{title}</Text>
                    {!!subtitle && <Text numberOfLines={1} style={styles.inlineSubtitle}>{subtitle}</Text>}
                  </>
                )}
              </View>
            )}
            {variant === 'stack' && !!centerLabel && <Text style={styles.centerLabel}>{centerLabel}</Text>}
          </View>
          {right}
          {!!action && (
            <Pressable onPress={onAction} style={[styles.action, { backgroundColor: actionTone === 'amber' ? colors.amber : colors.zinc100 }]}>
              {actionDot && <View style={styles.actionDot} />}
              <Text style={styles.actionLabel} numberOfLines={1}>{action}</Text>
            </Pressable>
          )}
        </View>
        {!!stepsTotal && (
          <View style={{ marginTop: 14 }}>
            <Steps total={stepsTotal} current={stepsCurrent ?? 1} />
          </View>
        )}
        {!convo && !hideTitle && !!title && (
          <View style={{ marginTop: 14 }}>
            {!!eyebrow && <Text style={[text.eyebrow, { marginBottom: 9 }]}>{eyebrow}</Text>}
            <Text style={[text.bigTitle, { color: ink }]}>{title}</Text>
            {!!subtitle && <Text style={[text.subtitle, { marginTop: 8 }]}>{subtitle}</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  convoBar: { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.zinc200 },
  inner: { paddingTop: 2, paddingHorizontal: 20, paddingBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 44 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 },
  inlineTitle: { fontFamily: font.bold, fontSize: 16.5, letterSpacing: -0.4, color: colors.ink },
  inlineSubtitle: { fontFamily: font.medium, fontSize: 12, color: colors.zinc500, marginTop: 2 },
  centerLabel: { flex: 1, textAlign: 'center', marginRight: 42, fontFamily: font.extrabold, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.zinc400 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 999, paddingHorizontal: 15, minHeight: 42 },
  actionDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: colors.ink },
  actionLabel: { fontFamily: font.bold, fontSize: 12, letterSpacing: -0.1, color: colors.ink },
});
