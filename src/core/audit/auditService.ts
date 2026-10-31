import { db } from '../db';
import type { AuditLogEntry } from '../db/schema';
import { uuidv7 } from '../../shared/utils/uuid';

export async function recordAudit(params: {
  treeId?: string;
  entityType: string;
  entityId?: string;
  action: AuditLogEntry['action'];
  actorId?: string;
  payload?: Record<string, unknown> | null;
}): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
    id: uuidv7(),
    treeId: params.treeId,
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
    actorId: params.actorId,
    payload: params.payload ?? null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverVersion: 0,
    localRevision: 1,
    syncStatus: 'pending',
    deletedAt: null,
  } as AuditLogEntry;
  await db.auditLog.add(entry as any);
  return entry;
}

export async function listAudit(treeId?: string, limit = 100): Promise<AuditLogEntry[]> {
  let q = db.auditLog.orderBy('createdAt').reverse();
  const all = await q.toArray();
  const filtered = treeId ? all.filter((e) => e.treeId === treeId) : all;
  return filtered.slice(0, limit);
}
