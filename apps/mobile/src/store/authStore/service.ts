import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadToken, setToken } from '../../api/client';
import { usersApi } from '../../api';
import type { ApiUser } from '../../api/types';
import { resumeOnboarding, type OnboardingRoute } from '../../data/onboarding';

const AUTH_STORAGE_KEY = 'companion:auth';

export type StoredIdentity = {
  isAuthenticated: boolean;
  onboarded: boolean;
  email: string;
  name: string;
  authProvider: 'google' | 'apple' | null;
  userId: string | null;
};

export async function loadStoredAuth(): Promise<StoredIdentity & { onboardingRoute: OnboardingRoute; me: ApiUser | null }> {
  const token = await loadToken();
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    const isAuthenticated = !!token && !!saved?.isAuthenticated;
    // Mid-onboarding: ask the server which step was last saved.
    const me = isAuthenticated && !saved?.onboarded ? await usersApi.getMe().catch(() => null) : null;
    const resume = me ? resumeOnboarding(me) : { onboarded: !!saved?.onboarded, onboardingRoute: saved?.onboarded ? 'Board' as const : 'Name' as const };
    return {
      isAuthenticated,
      ...resume,
      me,
      email: saved?.email ?? '',
      name: saved?.name ?? '',
      authProvider: saved?.authProvider ?? null,
      userId: saved?.userId ?? null,
    };
  } catch {
    return { isAuthenticated: false, onboarded: false, onboardingRoute: 'Name', me: null, email: '', name: '', authProvider: null, userId: null };
  }
}

export function persistAuth(identity: StoredIdentity): void {
  AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(identity)).catch(() => {});
}

export async function persistSession(accessToken: string): Promise<void> {
  await setToken(accessToken);
}

export async function clearSession(): Promise<void> {
  await setToken(null);
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}
