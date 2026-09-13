import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { API_BASE_URL } from '../../config';

type Status = 'unknown' | 'up' | 'down' | 'booting';

const DOT_COLOR: Record<Status, string> = {
  unknown: '#C3B8AD',
  up: '#4F9A5C',
  down: '#C0392B',
  booting: '#D9A441',
};

const POLL_MS = 3000;
const TIMEOUT_MS = 8000;

async function pingServer(timeoutMs: number): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(API_BASE_URL, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// Dev-only helper for a free-tier Render server that cold-starts — shows a dot
// next to the wordmark and lets tapping it kick off a wake-up poll.
export function useServerStatus() {
  const [status, setStatus] = useState<Status>('unknown');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    pingServer(TIMEOUT_MS).then((ok) => setStatus(ok ? 'up' : 'down'));
    return stopPolling;
  }, [stopPolling]);

  const wake = useCallback(() => {
    setStatus((s) => (s === 'up' || s === 'booting' ? s : 'booting'));
    stopPolling();
    const attempt = () => pingServer(TIMEOUT_MS).then((ok) => { if (ok) { setStatus('up'); stopPolling(); } });
    attempt();
    pollRef.current = setInterval(attempt, POLL_MS);
  }, [stopPolling]);

  return { status, wake };
}

export function ServerStatusDot({ status }: { status: Status }) {
  return <View style={[styles.dot, { backgroundColor: DOT_COLOR[status] }]} />;
}

const styles = StyleSheet.create({
  dot: { width: 8, height: 8, borderRadius: 999 },
});
