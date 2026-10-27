import { db } from '../db';
import type { SyncOperation, EntityType } from '../db/schema';
import type { Table } from 'dexie';
import { sendOperation } from './syncClient';
import { pullChanges } from './pullClient';
import { getAccessToken } from '../supabase/client';

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

export interface SyncProgress {
  done: number;
  total: number;
}

export interface SyncNowResult { ok: boolean; message: string; status: SyncVisualStatus; }


const MAX_RETRIES = 5;

function tableFor(entityType: EntityType): Table<any, string> | null {
  switch (entityType) {
    case 'tree': return db.trees;
    case 'person': return db.persons;
    case 'relationship': return db.relationships;
    case 'event': return db.events;
    case 'photo': return db.photos;
    case 'treeMembership': return db.treeMemberships;
    case 'treeInvitation': return db.treeInvitations;
    default: return null;
  }
}

export class SyncEngine {
  private syncing = false;
  private started = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Array<() => void> = [];
  progress: SyncProgress | null = null;
  private progressListener: ((p: SyncProgress | null) => void) | null = null;

  setProgressListener(cb: ((p: SyncProgress | null) => void) | null): void {
    this.progressListener = cb;
  }

  private emitProgress(p: SyncProgress | null): void {
    this.progress = p;
    this.progressListener?.(p);
  }

  isSyncing(): boolean { return this.syncing; }
  isStarted(): boolean { return this.started; }

  async syncNow(): Promise<SyncNowResult> {
    if (this.syncing) {
      const counts = await readSyncQueueCounts();
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
      return { ok: true, message: 'Sincronizacion ya en curso.', status: deriveSyncStatus(counts, online, true) };
    }
    this.syncing = true;
    this.emitProgress(null);
    try {
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
      const counts0 = await readSyncQueueCounts();
      if (!online) {
        return { ok: false, message: 'Sin conexion: los cambios se enviaran al recuperar la red.', status: 'offline' };
      }

      const token = await getAccessToken();
      if (!token) {
        return { ok: false, message: 'Sin sesion: inicia sesion para sincronizar.', status: deriveSyncStatus(counts0, online, false) };
      }

      const confirmedOps = await db.syncOutbox.where('status').equals('confirmed').toArray();
      const confirmedIds = new Set(confirmedOps.map((o) => o.operationId));

      const pendingOps: SyncOperation[] = await db.syncOutbox
        .where('status').equals('pending').toArray();

      const runnable = pendingOps
        .filter((op) => (op.dependsOn ?? []).every((d) => confirmedIds.has(d)))
        .sort((a, b) => a.createdAt - b.createdAt);

      if (runnable.length === 0) {
        const counts = await readSyncQueueCounts();
        return { ok: true, message: counts0.pending + counts0.inFlight > 0
          ? 'Operaciones bloqueadas por dependencias.'
          : 'Todo esta sincronizado localmente.', status: deriveSyncStatus(counts, online, false) };
      }

      this.emitProgress({ done: 0, total: runnable.length });

      for (let i = 0; i < runnable.length; i++) {
        const op = runnable[i];
        await db.syncOutbox.update(op.operationId, { status: 'in_flight' });

        const result = await sendOperation(op);

        if (result.kind === 'applied' || result.kind === 'alreadyProcessed') {
          const sv = result.serverVersion;
          const table = tableFor(op.entityType);
          if (table && sv != null) {
            const row = await table.get(op.entityId);
            if (row) {
              await table.update(op.entityId, { serverVersion: sv, syncStatus: 'synced' });
            }
          }
          await db.syncOutbox.update(op.operationId, { status: 'confirmed', lastError: null });
          confirmedIds.add(op.operationId);
        } else if (result.kind === 'conflict') {
          await db.syncOutbox.update(op.operationId, { status: 'blocked', lastError: result.conflictKind ?? 'conflict' });
          if (result.server) {
            await db.conflictSnapshots.put({ operationId: op.operationId, server: result.server, createdAt: Date.now() });
          }
          const table = tableFor(op.entityType);
          if (table) {
            const row = await table.get(op.entityId);
            if (row) await table.update(op.entityId, { syncStatus: 'conflict' });
          }
        } else if (result.kind === 'noSession') {
          await db.syncOutbox.update(op.operationId, { status: 'pending' });
          break;
        } else {
          const opRow = await db.syncOutbox.get(op.operationId);
          const newRetry = (opRow?.retryCount ?? op.retryCount) + 1;
          const terminal = newRetry >= MAX_RETRIES || (result.kind === 'failed' && !result.retryable);
          await db.syncOutbox.update(op.operationId, {
            status: terminal ? 'failed' : 'pending',
            retryCount: newRetry,
            lastError: result.kind === 'failed' ? (result.errorCode ?? 'error') : result.message,
          });
        }
        this.emitProgress({ done: i + 1, total: runnable.length });
      }

      // Descarga de cambios remotos (Fase 8).
      await pullChanges().catch(() => { /* ignore */ });

      const counts = await readSyncQueueCounts();
      const status = deriveSyncStatus(counts, online, false);
      return { ok: true, message: 'Sincronizacion completada.', status };
    } finally {
      this.emitProgress(null);
      this.syncing = false;
    }
  }
  // Recuperación tras reinicio: in_flight -> pending.
  async recover(): Promise<void> {
    const inflight = await db.syncOutbox.where('status').equals('in_flight').toArray();
    for (const op of inflight) {
      await db.syncOutbox.update(op.operationId, { status: 'pending' });
    }
    const all = await db.syncOutbox.toArray();
    for (const op of all) {
      if (!op.operationId || !op.entityType || !op.entityId || !op.operationType) {
        await db.syncOutbox.update(op.operationId, { status: 'failed', lastError: 'corrupt_operation' });
      }
    }
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    void this.recover().then(() => {
      setTimeout(() => { void this.syncNow(); }, 1000);
    });

    if (typeof window !== 'undefined') {
      const onlineHandler = () => { void this.syncNow(); };
      const focusHandler = () => { void this.syncNow(); };
      const visibilityHandler = () => {
        if (document.visibilityState === 'visible') void this.syncNow();
      };
      window.addEventListener('online', onlineHandler);
      window.addEventListener('focus', focusHandler);
      document.addEventListener('visibilitychange', visibilityHandler);
      this.listeners.push(() => window.removeEventListener('online', onlineHandler));
      this.listeners.push(() => window.removeEventListener('focus', focusHandler));
      this.listeners.push(() => document.removeEventListener('visibilitychange', visibilityHandler));

      this.intervalId = setInterval(() => { void this.syncNow(); }, 30000);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg: any) => {
          if (reg && 'sync' in reg) {
            reg.sync.register('arbol-gen-pro-sync').catch(() => { /* ignore */ });
          }
        }).catch(() => { /* ignore */ });
      }
    }
  }

  async pullNow(treeId?: string): Promise<void> {
    await pullChanges(treeId).catch(() => { /* ignore */ });
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
    for (const off of this.listeners) off();
    this.listeners = [];
  }
}

export const syncEngine = new SyncEngine();


