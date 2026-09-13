import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AntDesign } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, radius, shadow } from '../theme';
import { Header } from '../components/widgets';
import { ONBOARDING_STEPS } from '../data';
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
  const insets = useSafeAreaInsets();
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
      dispatch({ type: 'AUTH_SUCCESS', userId: user.id });
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
      dispatch({ type: 'AUTH_SUCCESS', userId: user.id });
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') setError("Couldn't sign in with Apple. Try again.");
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        variant="stack"
        stepsTotal={ONBOARDING_STEPS}
        stepsCurrent={1}
        title="Sign in to get started."
        subtitle="One tap with Google or Apple. Nobody sees this but you — not even people you meet."
        onBack={() => navigation.navigate('Signup')}
      />
      <View style={styles.body}>
        {busy && <ActivityIndicator color={colors.clay} style={{ marginBottom: 16 }} />}
        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable disabled={busy} onPress={continueWithGoogle} style={styles.googleBtn}>
          <AntDesign name="google" size={18} color={colors.ink} />
          <Text style={styles.googleLabel}>Continue with Google</Text>
        </Pressable>

        {appleAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={radius.tile}
            style={styles.appleBtn}
            onPress={continueWithApple}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  body: { paddingHorizontal: 20, paddingTop: 24, gap: 12 },
  error: { color: colors.clayPressed, fontFamily: 'Figtree_600SemiBold', fontSize: 13, marginBottom: 8, textAlign: 'center' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    minHeight: 56, borderRadius: radius.tile, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface, ...shadow.inner,
  },
  googleLabel: { fontFamily: 'Figtree_700Bold', fontSize: 15, color: colors.ink },
  appleBtn: { minHeight: 56 },
});
