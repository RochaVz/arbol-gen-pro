import { useEffect, useState } from 'react';
import { readSyncQueueCounts, deriveSyncStatus, syncEngine } from '../../core/sync';
import type { SyncQueueCounts, SyncVisualStatus, SyncProgress } from '../../core/sync/syncEngine';

export function useSyncStatus() {
  const [counts, setCounts] = useState<SyncQueueCounts>({
    pending: 0, inFlight: 0, failed: 0, blocked: 0, confirmed: 0, total: 0,
  });
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [status, setStatus] = useState<SyncVisualStatus>('synced');
  const [progress, setProgress] = useState<SyncProgress | null>(null);

  const refresh = async () => {
    const c = await readSyncQueueCounts();
    setCounts(c);
    const on = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setOnline(on);
    setStatus(deriveSyncStatus(c, on, syncing));
  };

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 2000);
    const handleOnline = () => { setOnline(true); void refresh(); };
    const handleOffline = () => { setOnline(false); void refresh(); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    syncEngine.setProgressListener((p) => setProgress(p));
    return () => {
      window.clearInterval(id);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      syncEngine.setProgressListener(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncing]);

  const syncNow = async () => {
    setSyncing(true);
    try {
      const res = await syncEngine.syncNow();
      await refresh();
      return res;
    } finally {
      setSyncing(false);
    }
  };

  return { status, counts, online, syncing, progress, refresh, syncNow };
}

