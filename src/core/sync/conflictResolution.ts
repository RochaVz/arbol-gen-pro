import { db } from '../db';
import type { SyncOperation, EntityType } from '../db/schema';
import { uuidv7 } from '../../shared/utils/uuid';

// Re-export tableFor lookup for convenience.
function tableForEntity(entityType: EntityType): any {
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

function snakeToCamelKey(k: string): string {
  return k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function rowToEntity(row: any): any {
  if (!row || typeof row !== 'object') return row;
  const out: any = {};
  for (const [k, v] of Object.entries(row)) {
    out[snakeToCamelKey(k)] = v;
  }
  if (out.deletedAt === undefined && row.deleted_at !== undefined) out.deletedAt = row.deleted_at;
  return out;
}

export interface ConflictInfo {
  operation: SyncOperation;
  entityType: EntityType;
  entityId: string;
  local: any | null;
  server: any | null;
}

export async function listConflicts(): Promise<ConflictInfo[]> {
  const blocked: SyncOperation[] = await db.syncOutbox.where('status').equals('blocked').toArray();
  const result: ConflictInfo[] = [];
  for (const op of blocked) {
    const table = tableForEntity(op.entityType);
    const local = table ? await table.get(op.entityId) : null;
    const snap = await db.conflictSnapshots.get(op.operationId);
    const server = snap?.server ? rowToEntity(snap.server) : null;
    result.push({ operation: op, entityType: op.entityType, entityId: op.entityId, local, server });
  }
  return result;
}

export type ConflictDecision = 'keep_local' | 'keep_server' | 'merge';

export async function resolveConflict(
  operationId: string,
  decision: ConflictDecision,
  mergedEntity?: any
): Promise<{ ok: boolean; reason?: string; newOperationId?: string }> {
  const op = await db.syncOutbox.get(operationId);
  if (!op) return { ok: false, reason: 'not_found' };
  if (op.status !== 'blocked') return { ok: false, reason: 'not_blocked' };

  const table = tableForEntity(op.entityType);
  const snap = await db.conflictSnapshots.get(operationId);
  const server = snap?.server ? rowToEntity(snap.server) : null;
  const serverVersion = server?.serverVersion ?? server?.server_version ?? op.baseServerVersion;

  if (decision === 'keep_server') {
    if (table && server) {
      const local = await table.get(op.entityId);
      const applied = { ...(local ?? {}), ...server, id: op.entityId, syncStatus: 'synced' };
      await table.put(applied);
    }
    await db.syncOutbox.update(operationId, { status: 'confirmed', lastError: 'resolved_keep_server' });
    if (snap) await db.conflictSnapshots.delete(operationId);
    return { ok: true };
  }

  // keep_local or merge
  const localEntity = decision === 'merge'
    ? (mergedEntity ?? (table ? await table.get(op.entityId) : null))
    : (table ? await table.get(op.entityId) : null);

  if (!localEntity) return { ok: false, reason: 'missing_local' };

  const newOpId = uuidv7();
  const newOp: SyncOperation = {
    operationId: newOpId,
    entityType: op.entityType,
    entityId: op.entityId,
    operationType: op.operationType,
    baseServerVersion: serverVersion,
    payload: op.operationType === 'delete' ? null : localEntity,
    createdAt: Date.now(),
    status: 'pending',
    retryCount: 0,
    lastError: null,
    dependsOn: op.dependsOn ?? [],
  };

  if (table) {
    await db.transaction('rw', table, db.syncOutbox, async () => {
      await table.update(op.entityId, { syncStatus: 'pending' });
      await db.syncOutbox.add(newOp);
      await db.syncOutbox.update(operationId, { status: 'confirmed', lastError: `resolved_${decision}` });
    });
  } else {
    await db.syncOutbox.add(newOp);
    await db.syncOutbox.update(operationId, { status: 'confirmed', lastError: `resolved_${decision}` });
  }
  if (snap) await db.conflictSnapshots.delete(operationId);

  return { ok: true, newOperationId: newOpId };
}

export const resolveConflictKeepLocal = (id: string) => resolveConflict(id, 'keep_local');
export const resolveConflictKeepServer = (id: string) => resolveConflict(id, 'keep_server');
export const resolveConflictMerge = (id: string, merged: any) => resolveConflict(id, 'merge', merged);

export default {
  listConflicts,
  resolveConflict,
  resolveConflictKeepLocal,
  resolveConflictKeepServer,
  resolveConflictMerge,
};
