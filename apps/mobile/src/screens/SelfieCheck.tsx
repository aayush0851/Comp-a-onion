import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [poseIndex, setPoseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('frame');

  const lastPose = poseIndex === SELFIE_POSES.length - 1;
  const pose = SELFIE_POSES[poseIndex];

  const capture = async () => {
    if (!cameraRef.current) return;
    setPhase('capturing');
    await cameraRef.current.takePictureAsync({ quality: 0.6 });
    if (lastPose) {
      dispatch({ type: 'SET_SELFIE_QUEUED' });
      setPhase('queued');
    } else {
      setPoseIndex((i) => i + 1);
      setPhase('frame');
    }
  };

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
          {phase !== 'queued' && permission?.granted && (
            <CameraView ref={cameraRef} style={styles.camera} facing="front" />
          )}
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
          {phase === 'frame' && !permission?.granted && (
            <Text style={styles.permissionHint}>
              {permission?.canAskAgain === false
                ? 'Camera access is off. Enable it in Settings to continue.'
                : 'We need camera access for this.'}
            </Text>
          )}
        </View>
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
        {phase === 'frame' && (
          permission?.granted ? (
            <Btn label={lastPose ? 'Take the last photo' : 'Take the photo'} variant="primary" onPress={capture} />
          ) : (
            <Btn
              label={permission?.canAskAgain === false ? 'Open Settings' : 'Allow camera access'}
              variant="primary"
              onPress={permission?.canAskAgain === false ? Linking.openSettings : requestPermission}
            />
          )
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
    backgroundColor: colors.neutralAvatar, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  frameDone: { borderColor: colors.sage },
  camera: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFill, borderRadius: 999,
    backgroundColor: 'rgba(46,42,38,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  permissionHint: {
    paddingHorizontal: 20, textAlign: 'center', fontFamily: 'Figtree_500Medium', fontSize: 12.5, color: colors.muted,
  },
  check: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' },
  checkLabel: { color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 24 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16 },
});
