import { db } from './database';
import type { SyncOperation } from './schema';
import { uuidv7 } from '../../shared/utils/uuid';

export function calculateBaseServerVersion(
  operationType: 'create' | 'update' | 'delete',
  entity?: { serverVersion?: number } | null
): number {
  if (operationType === 'create') return 0;
  return entity?.serverVersion ?? 0;
}

export function incrementLocalRevision<T extends { localRevision?: number }>(entity: T): T {
  return { ...entity, localRevision: (entity.localRevision ?? 0) + 1 };
}

export async function writeEntityWithOperation(
  entityTable: any,
  entity: any,
  operation: SyncOperation
): Promise<void> {
  await db.transaction('rw', entityTable, db.syncOperations, async () => {
    await entityTable.put(entity);
    await db.syncOperations.add(operation);
  });
}

export async function enqueueOperation(operation: SyncOperation): Promise<void> {
  await db.syncOperations.add(operation);
}

export async function writeLocal(
  entityTable: any,
  entity: any,
  params: {
    entityType: SyncOperation['entityType'];
    operationType: SyncOperation['operationType'];
    dependsOn?: string[];
    payload?: Record<string, unknown> | null;
  }
): Promise<{ entity: any; operation: SyncOperation }> {
  const operation: SyncOperation = {
    operationId: uuidv7(),
    entityType: params.entityType,
    entityId: entity.id,
    operationType: params.operationType,
    baseServerVersion: calculateBaseServerVersion(params.operationType, entity),
    payload: params.payload ?? (params.operationType === 'delete' ? null : entity),
    createdAt: Date.now(),
    status: 'pending',
    retryCount: 0,
    lastError: null,
    dependsOn: params.dependsOn ?? []
  };
  await db.transaction('rw', entityTable, db.syncOperations, async () => {
    await entityTable.put(entity);
    await db.syncOperations.add(operation);
  });
  return { entity, operation };
}

export { db };
export default { writeLocal, writeEntityWithOperation, enqueueOperation, calculateBaseServerVersion, incrementLocalRevision };