import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../../theme';

const WHEN = ['tonight', 'tomorrow', 'this week'];

export function FeaturedCard({ filter, filterLabel, onPost }: { filter: 0 | 1 | 2; filterLabel: string; onPost: () => void }) {
  return (
    <View style={styles.featured}>
      <View style={styles.top}>
        <View style={styles.pill}><Text style={styles.pillLabel}>FEATURED HANGOUT</Text></View>
        <Text style={styles.when}>{filterLabel}</Text>
      </View>
      <Text style={styles.title}>What's happening near you {WHEN[filter]}</Text>
      <Pressable onPress={onPost} style={styles.prompt}>
        <Text style={styles.promptText}>What are you doing tonight?</Text>
      </Pressable>
      <View style={styles.foot}>
        <Text style={styles.note}>And you, too — post yours in 30 seconds.</Text>
        <Pressable onPress={onPost} style={styles.postBtn}>
          <Text style={styles.postLabel}>Post</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  featured: { backgroundColor: colors.amber, borderRadius: 24, padding: 17 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  pill: { backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 },
  pillLabel: { fontFamily: font.extrabold, fontSize: 9.5, letterSpacing: 1, color: colors.amber },
  when: { fontFamily: font.bold, fontSize: 11, color: colors.amberInk },
  title: { fontFamily: font.extrabold, fontSize: 19, lineHeight: 24, letterSpacing: -0.6, color: colors.ink, marginTop: 13 },
  prompt: { backgroundColor: colors.white, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 15, marginTop: 13 },
  promptText: { fontFamily: font.semibold, fontSize: 13.5, color: colors.zinc700 },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 11 },
  note: { flex: 1, fontFamily: font.semibold, fontSize: 12, color: colors.amberInk },
  postBtn: { backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 15, minHeight: 40, justifyContent: 'center' },
  postLabel: { fontFamily: font.bold, fontSize: 12, color: colors.white },
});
