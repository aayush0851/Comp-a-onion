import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { Badge, Btn, Footer, Header, Notice, Sheet, StatusRow } from '../components/widgets';
import { useAppState } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'Verify'>;

export default function Verify({ navigation }: Props) {
  const state = useAppState();
  const [showSkip, setShowSkip] = useState(false);
  const queued = state.selfieStatus === 'queued';

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        eyebrow="Verification"
        title="Get Checked."
        subtitle="Everyone on the board has done this. Nobody gets a seat without it."
        onBack={() => navigation.navigate('Highlights')}
      />
      <View style={styles.body}>
        <StatusRow state="done" title="Signed in" sub={state.email || 'Account connected'} pill="DONE" />
        <StatusRow
          state={queued ? 'later' : 'next'}
          title="Face check"
          sub={queued ? "In review — we'll notify you once it's done." : 'Three quick photos, checked and deleted'}
          pill={queued ? 'QUEUED' : 'NEXT'}
          onPress={queued ? undefined : () => navigation.navigate('SelfieCheck')}
        />
        <Notice tone="sky">
          Your selfie is checked and deleted. You show up as a first name — never a full name, never an address.
        </Notice>
        <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap', marginTop: 4 }}>
          <Badge label="Verified Identity" tone="sky" />
          <Badge label={queued ? 'In review' : 'Unlocks at check'} tone="zinc" glyph="◷" />
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <Footer>
        {queued ? (
          <Btn label="Continue to the board" onPress={() => navigation.navigate('Board')} />
        ) : (
          <>
            <Btn label="Do the face check" onPress={() => navigation.navigate('SelfieCheck')} />
            <Btn label="Skip for now" variant="ghost" onPress={() => setShowSkip(true)} />
          </>
        )}
      </Footer>

      <Sheet
        visible={showSkip}
        onClose={() => setShowSkip(false)}
        title="Skip the face check?"
        sub="You can still browse and post without it. But a Checked badge gets noticed — Checked people get more yeses."
      >
        <View style={{ gap: 5, marginTop: 18 }}>
          <Btn label="Do it now" onPress={() => { setShowSkip(false); navigation.navigate('SelfieCheck'); }} />
          <Btn label="Skip anyway" variant="ghost" onPress={() => { setShowSkip(false); navigation.navigate('Board'); }} />
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: 20, gap: 10 },
});
