import { db } from '../db/database';
import type { ChangeLog, SyncOperation } from '../db/schema';
import { assertEntityIdentities } from '../db/identity';

export interface ChangeLogInput {
  operationId: string;
  entityType: ChangeLog['entityType'];
  entityId: string;
  operation: ChangeLog['operation'];
  timestamp?: number;
  userId: string;
  treeId?: string;
  payload: Record<string, unknown> | null;
  source: ChangeLog['source'];
}

export function createChangeLog(input: ChangeLogInput): ChangeLog {
  const entry: ChangeLog = {
    id: input.operationId,
    treeId: input.treeId,
    entityType: input.entityType,
    entityId: input.entityId,
    operation: input.operation,
    timestamp: input.timestamp ?? Date.now(),
    userId: input.userId,
    payload: input.payload,
    source: input.source,
  };
  assertEntityIdentities(entry as unknown as Record<string, unknown>);
  return entry;
}

export function changeLogForMutation(
  operation: SyncOperation,
  userId: string,
  entity: Record<string, unknown>,
  source: ChangeLog['source'] = 'local',
): ChangeLog {
  return createChangeLog({
    operationId: operation.operationId,
    entityType: operation.entityType,
    entityId: operation.entityId,
    operation: operation.operationType,
    timestamp: operation.createdAt,
    userId,
    treeId: operation.entityType === 'tree'
      ? operation.entityId
      : typeof entity.treeId === 'string'
        ? entity.treeId
        : undefined,
    payload: { ...entity },
    source,
  });
}

export async function recordChangeLog(entry: ChangeLog): Promise<ChangeLog> {
  await db.changeLog.put(entry);
  return entry;
}

export async function listChangeLog(treeId?: string, limit = 100): Promise<ChangeLog[]> {
  const entries = treeId
    ? await db.changeLog.where('treeId').equals(treeId).toArray()
    : await db.changeLog.toArray();
  return entries.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}
