import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { Btn, Footer, Header, Notice, RadioRow, StatusScrim } from '../components/widgets';
import { REPORT_REASONS } from '../data';
import { reviewReportsApi, ApiError } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportReview'>;

export default function ReportReview({ navigation, route }: Props) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    setSending(true);
    setError('');
    try {
      await reviewReportsApi.reportPersonReview(route.params.reviewId, note.trim() ? `${reason} — ${note.trim()}` : reason);
      navigation.goBack();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't send that. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Header variant="stack" title="Report this review" subtitle="A person reads every report. Nothing is automatic." onBack={() => navigation.goBack()} />
        <View style={styles.body}>
          {REPORT_REASONS.map((r) => (
            <RadioRow key={r} label={r} selected={reason === r} onPress={() => setReason(r)} />
          ))}
          <TextInput
            value={note}
            onChangeText={setNote}
            multiline
            placeholder="Anything else we should know? Optional."
            placeholderTextColor={colors.zinc400}
            style={styles.note}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Notice tone="rose">The review stays visible while we look. If we remove it, the rating comes out of your average too.</Notice>
        </View>
      </ScrollView>
      <StatusScrim />
      <Footer>
        <Btn label="Send report" loading={sending} onPress={send} />
      </Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: 20, gap: 9 },
  note: { backgroundColor: colors.zinc100, borderRadius: 16, minHeight: 110, padding: 14, marginTop: 6, textAlignVertical: 'top', fontFamily: font.regular, fontSize: 13.5, lineHeight: 20, color: colors.ink },
  error: { fontFamily: font.semibold, fontSize: 12.5, color: colors.roseInk, textAlign: 'center' },
});
