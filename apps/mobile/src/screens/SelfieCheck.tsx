import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { Btn, Header } from '../components/widgets';
import { useAppDispatch } from '../store';
import { SELFIE_POSES } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'SelfieCheck'>;

type Phase = 'frame' | 'capturing' | 'queued';

export default function SelfieCheck({ navigation }: Props) {
  const insets = useSafeAreaInsets();
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
    <View style={styles.screen}>
      <Header
        variant="stack"
        stepsTotal={phase === 'queued' ? undefined : SELFIE_POSES.length}
        stepsCurrent={poseIndex + 1}
        eyebrow={phase === 'queued' ? undefined : `Photo ${poseIndex + 1} of ${SELFIE_POSES.length}`}
        title={phase === 'queued' ? 'Verification queued' : pose.label}
        subtitle={phase === 'queued'
          ? "We're checking your three photos. This usually takes a few minutes — we'll notify you the moment you're verified."
          : pose.body}
        onBack={() => navigation.navigate('Verify')}
      />
      <View style={styles.body}>
        <View style={[styles.frame, phase === 'queued' && styles.frameDone]}>
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
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
        {phase === 'frame' && (
          <Btn label={lastPose ? 'Take the last photo' : 'Take the photo'} variant="primary" onPress={() => setPhase('capturing')} />
        )}
        {phase === 'queued' && (
          <Btn label="Continue" variant="primary" onPress={() => navigation.navigate('Board')} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 14, alignItems: 'center' },
  frame: {
    width: 240, height: 240, borderRadius: 999, borderWidth: 3, borderColor: colors.clay,
    backgroundColor: colors.neutralAvatar, alignItems: 'center', justifyContent: 'center',
  },
  frameDone: { borderColor: colors.sage },
  overlay: {
    ...StyleSheet.absoluteFill, borderRadius: 999,
    backgroundColor: 'rgba(46,42,38,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  check: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  checkLabel: { color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 24 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16 },
});
