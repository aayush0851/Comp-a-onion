import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';
import { colors, shadow } from '../theme';
import { Header } from '../components/widgets';

type Props = { navigation: NavigationProp<RootStackParamList> };

type Item = {
  id: string;
  dot: 'new' | 'old';
  body: React.ReactNode;
  time: string;
  actions?: { label: string; onPress: () => void }[];
};

export default function Notifications({ navigation }: Props) {
  const items: Item[] = [
    {
      id: 'n1', dot: 'new', time: '12 minutes ago',
      body: <Text style={styles.line}><Text style={styles.strong}>Tobi A.</Text> asked to join <Text style={styles.strong}>Ramen, then walk it off</Text></Text>,
      actions: [
        { label: 'Let them in', onPress: () => navigation.navigate('Queue') },
        { label: 'View', onPress: () => navigation.navigate('Queue') },
      ],
    },
    {
      id: 'n2', dot: 'new', time: '9:00 this morning',
      body: <Text style={styles.line}>Your ratings for <Text style={styles.strong}>Chess and a bad coffee</Text> are unlocked</Text>,
    },
    {
      id: 'n3', dot: 'old', time: 'Yesterday',
      body: <Text style={styles.line}><Text style={styles.strong}>Priya M.</Text> let you into <Text style={styles.strong}>Ramen, then walk it off</Text></Text>,
    },
    {
      id: 'n4', dot: 'old', time: '2 days ago',
      body: <Text style={styles.line}><Text style={styles.strong}>Maya K.</Text> rated you 5 stars</Text>,
    },
  ];

  return (
    <View style={styles.screen}>
      <Header variant="stack" title="What you missed" subtitle="Requests, approvals and ratings. Nothing else." action="Mark all read" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionLabel}>Today</Text>
        {items.slice(0, 2).map((it) => <NotificationRow key={it.id} item={it} />)}
        <Text style={[styles.sectionLabel, { marginTop: 6 }]}>Earlier</Text>
        {items.slice(2).map((it) => <NotificationRow key={it.id} item={it} />)}
      </ScrollView>
    </View>
  );
}

function NotificationRow({ item }: { item: Item }) {
  return (
    <View style={[styles.row, item.dot === 'old' && { opacity: 0.76 }]}>
      <View style={[styles.dot, { backgroundColor: item.dot === 'new' ? colors.clay : colors.borderSoft }]} />
      <View style={{ flex: 1 }}>
        {item.body}
        <Text style={styles.time}>{item.time}</Text>
        {!!item.actions && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {item.actions.map((a) => (
              <Pressable key={a.label} onPress={a.onPress} style={a.label === 'View' ? styles.viewBtn : styles.primaryBtn}>
                <Text style={a.label === 'View' ? styles.viewLabel : styles.primaryLabel}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 34, gap: 10 },
  sectionLabel: { fontFamily: 'Figtree_700Bold', fontSize: 10.5, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.faint },
  row: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, borderRadius: 20, padding: 15, ...shadow.inner },
  dot: { width: 8, height: 8, minWidth: 8, borderRadius: 999, marginTop: 6 },
  line: { fontSize: 13.5, lineHeight: 20, color: colors.ink },
  strong: { fontFamily: 'Figtree_700Bold' },
  time: { fontFamily: 'Figtree_500Medium', fontSize: 11.5, color: colors.faint, marginTop: 5 },
  primaryBtn: { flex: 1, minHeight: 40, borderRadius: 999, backgroundColor: colors.clay, alignItems: 'center', justifyContent: 'center' },
  primaryLabel: { fontFamily: 'Figtree_700Bold', fontSize: 12.5, color: '#fff' },
  viewBtn: { minHeight: 40, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  viewLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5, color: colors.inkSecondary },
});
