import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { isDefined } from '@companion/common';

const TOKEN_KEY = 'companion:token';

let token: string | null = null;

export async function loadToken(): Promise<string | null> {
  token = await AsyncStorage.getItem(TOKEN_KEY);
  return token;
}

export async function setToken(next: string | null): Promise<void> {
  token = next;
  etagCache.clear();
  if (next) await AsyncStorage.setItem(TOKEN_KEY, next);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return token;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// GET responses by path with their ETag; a 304 hands back the same parsed object so React sees no change.
const etagCache = new Map<string, { etag: string; body: unknown }>();

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isGet = !options.method || options.method === 'GET';
  const cached = isGet ? etagCache.get(path) : undefined;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(cached ? { 'If-None-Match': cached.etag } : {}),
      ...options.headers,
    },
  });

  if (res.status === 304 && cached) return cached.body as T;

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = (Array.isArray(body?.message) ? body.message.join(', ') : body?.message) ?? res.statusText;
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  // Nest sends an empty body (not the string "null") when a handler returns
  // null/undefined, e.g. a "does this exist" lookup with nothing found.
  const text = await res.text();
  const body = text ? JSON.parse(text) : undefined;
  const etag = res.headers.get('etag');
  if (isGet && etag) etagCache.set(path, { etag, body });
  return body as T;
}

export const get = <T>(path: string) => apiFetch<T>(path);
export const post = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: 'POST', body: isDefined(body) ? JSON.stringify(body) : undefined });
export const patch = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: 'PATCH', body: isDefined(body) ? JSON.stringify(body) : undefined });
export const del = <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' });
