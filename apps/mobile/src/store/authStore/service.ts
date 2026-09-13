import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadToken, setToken } from '../../api/client';

const AUTH_STORAGE_KEY = 'companion:auth';

export type StoredIdentity = {
  isAuthenticated: boolean;
  onboarded: boolean;
  email: string;
  name: string;
  authProvider: 'google' | 'apple' | null;
  userId: string | null;
};

export async function loadStoredAuth(): Promise<StoredIdentity> {
  const token = await loadToken();
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    return {
      isAuthenticated: !!token && !!saved?.isAuthenticated,
      onboarded: !!saved?.onboarded,
      email: saved?.email ?? '',
      name: saved?.name ?? '',
      authProvider: saved?.authProvider ?? null,
      userId: saved?.userId ?? null,
    };
  } catch {
    return { isAuthenticated: false, onboarded: false, email: '', name: '', authProvider: null, userId: null };
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
