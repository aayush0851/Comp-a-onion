import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { Btn, ConfirmStrip, FieldLabel, Footer, Header, Notice, TextField } from '../components/widgets';
import { useAppDispatch, useAppState } from '../store';
import { useOnboardingSave } from '../hooks/useOnboardingSave';
import { ONBOARDING_STEPS } from '../data';

type Props = NativeStackScreenProps<RootStackParamList, 'Name'>;

export default function Name({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const state = useAppState();
  const [name, setName] = useState(state.name);
  const canContinue = name.trim().length > 0;
  const { save, saving, error: saveError } = useOnboardingSave();

  const submit = () => {
    if (!canContinue) return;
    dispatch({ type: 'SET_NAME', name: name.trim() });
    save({ name: name.trim() }, () => navigation.navigate('Birthday'));
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        centerLabel={`Step 3 of ${ONBOARDING_STEPS}`}
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={3}
        title="What should people call you?"
        subtitle="Your first name — that's all anyone ever sees."
        onBack={navigation.canGoBack() ? navigation.goBack : undefined}
      />
      <View style={styles.body}>
        <FieldLabel>First name</FieldLabel>
        <TextField value={name} onChangeText={setName} placeholder="First name" autoFocus autoCapitalize="words" returnKeyType="next" onSubmitEditing={submit} />
        {canContinue && (
          <ConfirmStrip>You'll appear as <Text style={{ fontFamily: font.bold }}>{name.trim()}</Text></ConfirmStrip>
        )}
      </View>
      <View style={{ flex: 1 }} />
      <Footer>
        {!!saveError && <Notice tone="rose">{saveError}</Notice>}
        <Btn label="Continue" variant={canContinue ? 'primary' : 'disabled'} loading={saving} onPress={submit} />
      </Footer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: 20 },
});
