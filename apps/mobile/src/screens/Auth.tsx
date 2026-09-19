import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, font } from '../theme';
import { Footer, Header, Notice } from '../components/widgets';
import { ONBOARDING_STEPS, resumeOnboarding } from '../data';
import { useAppDispatch } from '../store';
import { GOOGLE_WEB_CLIENT_ID } from '../config';
import { authApi } from '../api';
import { persistSession } from '../store/authStore/service';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_REDIRECT_URI = 'https://aayush0851.github.io/companion-oauth-redirect/';
const APP_RETURN_URL = 'companion://redirect';

function parseHashParams(url: string): Record<string, string> {
  const hash = url.split('#')[1] ?? '';
  const params: Record<string, string> = {};
  for (const pair of hash.split('&')) {
    const [k, v] = pair.split('=');
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
  }
  return params;
}

export default function Auth({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [appleAvailable, setAppleAvailable] = useState(false);
  const handledRef = useRef(false);

  const handleGoogleRedirect = async (url: string) => {
    if (handledRef.current) return;
    handledRef.current = true;
    WebBrowser.dismissBrowser();
    setBusy(true);
    setError('');
    try {
      const { access_token } = parseHashParams(url);
      if (!access_token) throw new Error('missing access_token');
      const profile = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      }).then((r) => r.json());
      const { accessToken, user } = await authApi.loginWithGoogle(access_token);
      await persistSession(accessToken);
      dispatch({ type: 'SET_OAUTH_IDENTITY', email: profile.email ?? user.email ?? '', name: profile.given_name ?? user.name ?? '', provider: 'google' });
      dispatch({ type: 'AUTH_SUCCESS', userId: user.id, ...resumeOnboarding(user) });
      dispatch({ type: 'HYDRATE_PROFILE', user });
    } catch {
      setError("Couldn't sign in with Google. Try again.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'ios') AppleAuthentication.isAvailableAsync().then(setAppleAvailable);

    Linking.getInitialURL().then((url) => {
      if (url?.startsWith(APP_RETURN_URL)) handleGoogleRedirect(url);
    });
    const sub = Linking.addEventListener('url', ({ url }) => {
      if (url.startsWith(APP_RETURN_URL)) handleGoogleRedirect(url);
    });
    return () => sub.remove();
  }, []);

  const continueWithGoogle = async () => {
    handledRef.current = false;
    setError('');
    setBusy(true);
    try {
      const authUrl =
        `${GOOGLE_AUTH_ENDPOINT}?client_id=${encodeURIComponent(GOOGLE_WEB_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
        `&response_type=token&scope=${encodeURIComponent('openid profile email')}`;
      await WebBrowser.openAuthSessionAsync(authUrl, APP_RETURN_URL);
    } finally {
      if (!handledRef.current) setBusy(false);
    }
  };

  const continueWithApple = async () => {
    setError('');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ');
      const { accessToken, user } = await authApi.loginWithApple(credential.identityToken!);
      await persistSession(accessToken);
      dispatch({ type: 'SET_OAUTH_IDENTITY', email: credential.email ?? user.email ?? '', name: name || user.name || '', provider: 'apple' });
      dispatch({ type: 'AUTH_SUCCESS', userId: user.id, ...resumeOnboarding(user) });
      dispatch({ type: 'HYDRATE_PROFILE', user });
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') setError("Couldn't sign in with Apple. Try again.");
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        centerLabel={`Step 1 of ${ONBOARDING_STEPS}`}
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={1}
        title="How do you want to sign in?"
        subtitle="A connected account verifies you instantly — no code to wait for."
        onBack={() => navigation.navigate('Signup')}
      />
      <View style={styles.body}>
        {appleAvailable && (
          <ProviderRow letter="A" label="Continue with Apple" dark disabled={busy} onPress={continueWithApple} />
        )}
        <ProviderRow letter="G" label="Continue with Google" disabled={busy} onPress={continueWithGoogle} />
        {busy && <ActivityIndicator color={colors.ink} style={{ marginTop: 6 }} />}
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Notice
          tone="sky"
          title="Either way"
          style={{ marginTop: 8 }}
          items={[
            'You still show up as a first name and an initial.',
            'The face check still applies — SSO replaces the code, not the check.',
            'We never post anything, anywhere.',
          ]}
        />
      </View>
      <View style={{ flex: 1 }} />
      <Footer>
        <Text style={styles.caption}>Signing in means you accept the ground rules. Leaving early is always fine.</Text>
      </Footer>
    </View>
  );
}

function ProviderRow({ letter, label, dark, disabled, onPress }: { letter: string; label: string; dark?: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.provider, dark ? styles.providerDark : styles.providerLight]}>
      <View style={[styles.providerMark, { backgroundColor: dark ? colors.white : colors.zinc100 }]}>
        <Text style={[styles.providerLetter, { color: dark ? colors.ink : colors.zinc700 }]}>{letter}</Text>
      </View>
      <Text style={[styles.providerLabel, { color: dark ? colors.white : colors.ink }]}>{label}</Text>
      <Text style={[styles.providerChevron, { color: dark ? '#52525B' : colors.zinc300 }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { paddingTop: 6, paddingHorizontal: 20, gap: 9 },
  provider: { flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 16, minHeight: 58, paddingHorizontal: 18 },
  providerDark: { backgroundColor: colors.ink },
  providerLight: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.zinc200 },
  providerMark: { width: 24, height: 24, minWidth: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  providerLetter: { fontFamily: font.extrabold, fontSize: 12 },
  providerLabel: { flex: 1, fontFamily: font.bold, fontSize: 15 },
  providerChevron: { fontFamily: font.bold, fontSize: 15 },
  error: { fontFamily: font.semibold, fontSize: 13, color: colors.roseInk, textAlign: 'center' },
  caption: { fontFamily: font.regular, fontSize: 12, lineHeight: 18, color: colors.zinc400, textAlign: 'center' },
});
