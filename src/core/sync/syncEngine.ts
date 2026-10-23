import { db } from '../db';
import type { SyncOperation } from '../db/schema';

export type SyncVisualStatus = 'offline' | 'synced' | 'pending' | 'syncing' | 'conflict' | 'error';

export interface SyncQueueCounts {
  pending: number;
  inFlight: number;
  failed: number;
  blocked: number;
  confirmed: number;
  total: number;
}

export async function readSyncQueueCounts(): Promise<SyncQueueCounts> {
  const ops: SyncOperation[] = await db.syncOutbox.toArray();
  const counts: SyncQueueCounts = {
    pending: 0,
    inFlight: 0,
    failed: 0,
    blocked: 0,
    confirmed: 0,
    total: ops.length,
  };
  for (const op of ops) {
    switch (op.status) {
      case 'pending': counts.pending += 1; break;
      case 'in_flight': counts.inFlight += 1; break;
      case 'failed': counts.failed += 1; break;
      case 'blocked': counts.blocked += 1; break;
      case 'confirmed': counts.confirmed += 1; break;
      default: break;
    }
  }
  return counts;
}

export function deriveSyncStatus(counts: SyncQueueCounts, online: boolean, syncing = false): SyncVisualStatus {
  if (!online) return 'offline';
  if (syncing) return 'syncing';
  if (counts.blocked > 0) return 'conflict';
  if (counts.failed > 0) return 'error';
  if (counts.pending > 0 || counts.inFlight > 0) return 'pending';
  return 'synced';
}

export interface SyncNowResult { ok: boolean; message: string; status: SyncVisualStatus; }

export class SyncEngine {
  private syncing = false;
  isSyncing(): boolean { return this.syncing; }
  async syncNow(): Promise<SyncNowResult> {
    this.syncing = true;
    try {
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
      const counts = await readSyncQueueCounts();
      if (!online) {
        return { ok: false, message: 'Sin conexion: los cambios se enviaran al recuperar la red.', status: 'offline' };
      }
      const pending = counts.pending + counts.inFlight;
      const message = pending > 0
        ? 'Sincronizacion manual solicitada. ' + pending + ' operacion(es) en cola; backend no disponible en esta fase.'
        : 'Todo esta sincronizado localmente. Backend no disponible en esta fase.';
      return { ok: true, message, status: deriveSyncStatus(counts, online, false) };
    } finally {
      this.syncing = false;
    }
  }
}

export const syncEngine = new SyncEngine();

