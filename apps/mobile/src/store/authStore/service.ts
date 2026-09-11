import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = 'companion:auth';

export async function loadStoredAuth(): Promise<{ isAuthenticated: boolean; onboarded: boolean }> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : null;
    return { isAuthenticated: !!saved?.isAuthenticated, onboarded: !!saved?.onboarded };
  } catch {
    return { isAuthenticated: false, onboarded: false };
  }
}

export function persistAuth(isAuthenticated: boolean, onboarded: boolean): void {
  AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isAuthenticated, onboarded })).catch(() => {});
}
