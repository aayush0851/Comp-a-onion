import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = 'companion:auth';

export type StoredIdentity = {
  isAuthenticated: boolean;
  onboarded: boolean;
  email: string;
  name: string;
  authProvider: 'google' | 'apple' | null;
};

export async function loadStoredAuth(): Promise<StoredIdentity> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    return {
      isAuthenticated: !!saved?.isAuthenticated,
      onboarded: !!saved?.onboarded,
      email: saved?.email ?? '',
      name: saved?.name ?? '',
      authProvider: saved?.authProvider ?? null,
    };
  } catch {
    return { isAuthenticated: false, onboarded: false, email: '', name: '', authProvider: null };
  }
}

export function persistAuth(identity: StoredIdentity): void {
  AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(identity)).catch(() => {});
}
