import EventSource from 'react-native-sse';
import { API_BASE_URL } from './config';
import { getToken } from './api/client';

// Subscribes to a backend @Sse() stream and calls onMessage for each event.
// Returns an unsubscribe function. Reconnects automatically (react-native-sse's
// default behavior) — the server sends a 'ping' heartbeat so idle connections
// don't get dropped by the host's proxy.
export function connectSse<T>(path: string, onMessage: (data: T) => void): () => void {
  const token = getToken();
  const es = new EventSource(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  es.addEventListener('message', (event) => {
    if (!event.data) return;
    try {
      onMessage(JSON.parse(event.data));
    } catch {
      // ignore malformed frames
    }
  });

  return () => es.close();
}
