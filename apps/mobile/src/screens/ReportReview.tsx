import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';
import { Btn, Header } from '../components/widgets';
import { REPORT_REASONS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportReview'>;

export default function ReportReview({ navigation }: Props) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [note, setNote] = useState('');

  return (
    <View style={styles.screen}>
      <Header variant="stack" title="Report this review" subtitle="A person reads every report. Nothing is automatic." onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        {REPORT_REASONS.map((r) => {
          const on = reason === r;
          return (
            <Pressable key={r} onPress={() => setReason(r)} style={[styles.option, on && styles.optionOn]}>
              <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.radioDot} />}</View>
              <Text style={styles.optionLabel}>{r}</Text>
            </Pressable>
          );
        })}
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Anything else we should know? Optional."
          placeholderTextColor={colors.faint}
          style={styles.note}
        />
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>The review stays visible while we look. If we remove it, the rating comes out of your average too.</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Btn label="Send report" variant="primary" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 9 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, minHeight: 56, paddingHorizontal: 16 },
  optionOn: { borderWidth: 1.5, borderColor: colors.clay },
  radio: { width: 20, height: 20, borderRadius: 999, borderWidth: 2, borderColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.clay },
  radioDot: { width: 9, height: 9, borderRadius: 999, backgroundColor: colors.clay },
  optionLabel: { fontFamily: 'Figtree_600SemiBold', fontSize: 14.5, color: colors.ink },
  note: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, minHeight: 110, padding: 14, fontSize: 13.5, lineHeight: 20, color: colors.ink, marginTop: 6, textAlignVertical: 'top' },
  infoBox: { backgroundColor: '#F8F2EC', borderRadius: 16, padding: 15 },
  infoText: { fontSize: 12.5, lineHeight: 19, color: colors.inkSecondary },
  footer: { padding: 20, paddingBottom: 32, backgroundColor: 'rgba(251,246,240,.95)' },
});
