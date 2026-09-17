import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { Btn, Header, ListRow, Notice, StatusScrim } from '../components/widgets';

type Props = NativeStackScreenProps<RootStackParamList, 'Safety'>;

function Glyph({ glyph, bg, fg }: { glyph: string; bg: string; fg: string }) {
  return (
    <View style={[styles.glyph, { backgroundColor: bg }]}>
      <Text style={[styles.glyphText, { color: fg }]}>{glyph}</Text>
    </View>
  );
}

const GROUND_RULES = [
  'Everyone here has passed a face check.',
  "Meet in public. The exact spot appears once you're in.",
  'Leaving early is fine, and never counts against you.',
];

export default function Safety({ navigation }: Props) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 34 }}>
        <Header
          variant="stack"
          title="Safety centre"
          subtitle="You're meeting a stranger in public. Here's what's on your side."
          onBack={() => navigation.goBack()}
        />
        <View style={styles.body}>
          <View style={styles.share}>
            <Text style={styles.shareTitle}>Share your evening</Text>
            <Text style={styles.shareBody}>Sends a friend the place, the time and who you're meeting. They get a nudge if you don't check in.</Text>
            <View style={{ marginTop: 15 }}>
              <Btn label="Pick a contact" variant="amber" small onPress={() => WebBrowser.openBrowserAsync('https://companion.app/safety')} />
            </View>
          </View>
          <ListRow
            title="Report someone"
            meta="A person reads it, usually within the hour."
            leading={<Glyph glyph="!" bg={colors.rose} fg={colors.roseInk} />}
            chevron
            onPress={() => WebBrowser.openBrowserAsync('https://companion.app/report')}
          />
          <ListRow
            title="Block someone"
            meta="They stop seeing your hangouts. No notification."
            leading={<Glyph glyph="⊘" bg={colors.zinc200} fg={colors.zinc700} />}
            chevron
            onPress={() => WebBrowser.openBrowserAsync('https://companion.app/report')}
          />
          <Notice tone="mint" title="Ground rules" items={GROUND_RULES} />
        </View>
      </ScrollView>
      <StatusScrim />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: 20, gap: 10 },
  share: { backgroundColor: colors.ink, borderRadius: 20, padding: 18 },
  shareTitle: { fontFamily: font.extrabold, fontSize: 16, letterSpacing: -0.4, color: colors.white },
  shareBody: { fontFamily: font.regular, fontSize: 13, lineHeight: 20, color: colors.zinc400, marginTop: 6 },
  glyph: { width: 40, height: 40, minWidth: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  glyphText: { fontFamily: font.extrabold, fontSize: 16 },
});
