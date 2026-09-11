import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, stripe } from '../theme';
import { BackPill, PrimaryButton } from '../components/ui';
import { useAppDispatch } from '../state';
import { SELFIE_POSES } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'SelfieCheck'>;

type Phase = 'frame' | 'capturing' | 'queued';

export default function SelfieCheck({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [poseIndex, setPoseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('frame');

  const lastPose = poseIndex === SELFIE_POSES.length - 1;
  const pose = SELFIE_POSES[poseIndex];

  useEffect(() => {
    if (phase !== 'capturing') return;
    const id = setTimeout(() => {
      if (lastPose) {
        dispatch({ type: 'SET_SELFIE_QUEUED' });
        setPhase('queued');
      } else {
        setPoseIndex((i) => i + 1);
        setPhase('frame');
      }
    }, 900);
    return () => clearTimeout(id);
  }, [phase, lastPose]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <BackPill onPress={() => navigation.navigate('Verify')} />

        <View style={styles.frameWrap}>
          <View style={[stripe(230), styles.frame, phase === 'queued' && styles.frameDone]}>
            {phase === 'capturing' && (
              <View style={styles.overlay}>
                <ActivityIndicator size="large" color={colors.clay} />
              </View>
            )}
            {phase === 'queued' && (
              <View style={styles.overlay}>
                <View style={styles.check}><Text style={styles.checkLabel}>✓</Text></View>
              </View>
            )}
          </View>
        </View>

        {phase !== 'queued' ? (
          <>
            <Text style={styles.kicker}>Photo {poseIndex + 1} of {SELFIE_POSES.length}</Text>
            <Text style={styles.title}>{pose.label}</Text>
            <Text style={styles.subtitle}>{pose.body}</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>Verification queued</Text>
            <Text style={styles.subtitle}>
              We're checking your three photos. This usually takes a few minutes — we'll notify you the moment you're verified.
            </Text>
          </>
        )}

        <View style={{ flex: 1 }} />

        {phase === 'frame' && (
          <PrimaryButton label={lastPose ? 'Take the last photo' : 'Take the photo'} onPress={() => setPhase('capturing')} />
        )}
        {phase === 'queued' && (
          <PrimaryButton label="Continue" onPress={() => navigation.navigate('Board')} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { flex: 1, padding: 22, paddingTop: 36, paddingBottom: 34 },
  frameWrap: { marginTop: 30, marginBottom: 22, alignSelf: 'center' },
  frame: {
    width: 230, borderRadius: 115, borderWidth: 3, borderColor: colors.clay,
    alignItems: 'center', justifyContent: 'center',
  },
  frameDone: { borderColor: colors.sage },
  overlay: {
    ...StyleSheet.absoluteFill, borderRadius: 115,
    backgroundColor: 'rgba(46,42,38,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  check: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  checkLabel: { color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 24 },
  kicker: {
    fontFamily: 'Figtree_600SemiBold', fontSize: 11.5, letterSpacing: 0.8, textTransform: 'uppercase',
    color: colors.clayPressed, textAlign: 'center',
  },
  title: {
    fontFamily: 'Figtree_700Bold', fontSize: 22, letterSpacing: -0.4, color: colors.ink,
    textAlign: 'center', paddingHorizontal: 10, marginTop: 6,
  },
  subtitle: {
    fontFamily: 'Figtree_400Regular', fontSize: 13.5, lineHeight: 20, color: colors.muted,
    textAlign: 'center', marginTop: 10, maxWidth: 300, alignSelf: 'center',
  },
});
