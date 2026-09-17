import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { Btn, CheckDot, Footer, Header } from '../components/widgets';
import { useAppDispatch } from '../store';
import { SELFIE_POSES } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'SelfieCheck'>;

type Phase = 'frame' | 'capturing' | 'queued';

export default function SelfieCheck({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [poseIndex, setPoseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('frame');

  const lastPose = poseIndex === SELFIE_POSES.length - 1;
  const pose = SELFIE_POSES[poseIndex];
  const done = phase === 'queued';

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
        centerLabel={done ? 'Face check' : `Photo ${poseIndex + 1} of ${SELFIE_POSES.length}`}
        stepsTotal={SELFIE_POSES.length}
        stepsCurrent={done ? SELFIE_POSES.length : poseIndex + 1}
        title={done ? 'Checked and queued.' : pose.label}
        subtitle={done
          ? "We're checking your three photos. This usually takes a few minutes — we'll notify you the moment you're Checked."
          : pose.body}
        onBack={() => navigation.navigate('Verify')}
      />
      <View style={styles.body}>
        <View style={[styles.frame, { borderColor: done ? colors.mintInk : colors.amber }]}>
          {!done && permission?.granted && <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />}
          {phase === 'capturing' && (
            <View style={styles.overlay}><ActivityIndicator size="large" color={colors.amber} /></View>
          )}
          {done && <CheckDot size={56} />}
          {phase === 'frame' && !permission?.granted && (
            <Text style={styles.permissionHint}>
              {permission?.canAskAgain === false ? 'Camera access is off. Enable it in Settings to continue.' : 'We need camera access for this.'}
            </Text>
          )}
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <Footer>
        {phase === 'frame' && (permission?.granted ? (
          <Btn label={lastPose ? 'Take the last photo' : 'Take the photo'} onPress={capture} />
        ) : (
          <Btn
            label={permission?.canAskAgain === false ? 'Open Settings' : 'Allow camera access'}
            onPress={permission?.canAskAgain === false ? Linking.openSettings : requestPermission}
          />
        ))}
        {phase === 'capturing' && <Btn label="Take the photo" loading />}
        {done && <Btn label="Continue" onPress={() => navigation.navigate('Board')} />}
      </Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 14, paddingHorizontal: 20, alignItems: 'center' },
  frame: { width: 244, height: 244, borderRadius: 999, borderWidth: 4, backgroundColor: colors.zinc100, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(24,24,24,0.35)', alignItems: 'center', justifyContent: 'center' },
  permissionHint: { paddingHorizontal: 24, textAlign: 'center', fontFamily: font.medium, fontSize: 12.5, lineHeight: 18, color: colors.zinc500 },
});
