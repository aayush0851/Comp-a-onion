import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';
import { colors, scale, shadow } from '../theme';
import { Header } from '../components/widgets';
import { VIBE_TAGS } from '../data';
import { useAppDispatch, useAppState } from '../store';

type Props = { navigation: NavigationProp<RootStackParamList> };

export default function EditProfile({ navigation }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(state.name);
  const initials = name.trim() ? name.trim().slice(0, 2).toUpperCase() : 'YO';

  const save = () => {
    dispatch({ type: 'SET_NAME', name: name.trim() });
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        title="Edit profile"
        subtitle="Your rating and plan count can't be edited — they're earned."
        action="Save"
        onAction={save}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <View style={styles.avatar}><Text style={styles.avatarLabel}>{initials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={scale.inline}>Main photo</Text>
            <Text style={[scale.meta, { marginTop: 3, lineHeight: 18 }]}>Shown on your profile, never on the board.</Text>
          </View>
        </View>

        <View>
          <Text style={styles.label}>Display name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Your name" placeholderTextColor={colors.faint} />
        </View>

        <View>
          <Text style={styles.label}>Up for — up to three</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {state.vibeTags.map((t) => (
              <Pressable key={t} onPress={() => dispatch({ type: 'TOGGLE_VIBE_TAG', tag: t })} style={styles.tagOn}>
                <Text style={styles.tagOnLabel}>{t} <Text style={{ opacity: 0.6 }}>×</Text></Text>
              </Pressable>
            ))}
            {state.vibeTags.length < 3 && VIBE_TAGS.filter((t) => !state.vibeTags.includes(t)).slice(0, 1).map((t) => (
              <Pressable key={t} onPress={() => dispatch({ type: 'TOGGLE_VIBE_TAG', tag: t })} style={styles.tagAdd}>
                <Text style={styles.tagAddLabel}>+ Add {t}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {state.highlights.length > 0 && (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={styles.label}>Highlights</Text>
              <Text style={styles.count}>{state.highlights.length} of 6</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {state.highlights.map((_h, i) => (
                <View key={i} style={styles.highlightTile}>
                  <Pressable onPress={() => dispatch({ type: 'REMOVE_HIGHLIGHT', index: i })} style={styles.removeBadge}>
                    <Text style={styles.removeLabel}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40, gap: 16 },
  avatar: { width: 74, height: 74, borderRadius: 999, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { fontFamily: 'Figtree_700Bold', fontSize: 24, color: colors.clayPressed },
  label: { fontFamily: 'Figtree_700Bold', fontSize: 10.5, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.faint, marginBottom: 8 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, minHeight: 52, paddingHorizontal: 16, fontFamily: 'Figtree_600SemiBold', fontSize: 15, color: colors.ink },
  tagOn: { borderRadius: 999, backgroundColor: colors.ink, minHeight: 44, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  tagOnLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5, color: colors.ground },
  tagAdd: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderSoft, borderStyle: 'dashed', minHeight: 44, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  tagAddLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 12.5, color: colors.faint },
  count: { fontFamily: 'Figtree_600SemiBold', fontSize: 11.5, color: colors.muted },
  highlightTile: { width: '23%', aspectRatio: 3 / 4, borderRadius: 13, backgroundColor: colors.neutralAvatar, ...shadow.inner },
  removeBadge: { position: 'absolute', right: 4, top: 4, width: 20, height: 20, borderRadius: 999, backgroundColor: 'rgba(46,42,38,.75)', alignItems: 'center', justifyContent: 'center' },
  removeLabel: { color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 11 },
});
