import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../core/db';
import { listConflicts, resolveConflictKeepLocal, resolveConflictKeepServer } from '../core/sync';

async function clearAll() {
  await db.transaction('rw', [db.trees, db.persons, db.photos, db.photoBlobs, db.syncOperations, db.conflictSnapshots], async () => {
    await db.trees.clear();
    await db.persons.clear();
    await db.photos.clear();
    await db.photoBlobs.clear();
    await db.syncOperations.clear();
    await db.conflictSnapshots.clear();
  });
}

describe('Fase 11 - resolucion manual de conflictos', () => {
  beforeEach(async () => {
    if (!db.isOpen()) await db.open();
    await clearAll();
  });

  it('listConflicts devuelve operaciones bloqueadas con snapshot', async () => {
    const opId = 'op-1';
    await db.syncOperations.add({
      operationId: opId,
      entityType: 'person',
      entityId: 'p1',
      operationType: 'update',
      baseServerVersion: 1,
      payload: { firstName: 'Local' },
      createdAt: Date.now(),
      status: 'blocked',
      retryCount: 0,
      lastError: 'conflict',
      dependsOn: [],
    } as any);
    await db.conflictSnapshots.put({ operationId: opId, server: { first_name: 'Server', server_version: 2 }, createdAt: Date.now() });
    await db.persons.add({ id: 'p1', treeId: 't1', firstName: 'Local', lifeStatus: 'alive', createdAt: Date.now(), updatedAt: Date.now(), serverVersion: 1, localRevision: 1, syncStatus: 'conflict', deletedAt: null } as any);

    const conflicts = await listConflicts();
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].operation.operationId).toBe(opId);
    expect(conflicts[0].server?.firstName).toBe('Server');
  });

  it('resolveConflictKeepLocal crea nueva operacion y no reenvía la original', async () => {
    const opId = 'op-2';
    await db.syncOperations.add({
      operationId: opId,
      entityType: 'person',
      entityId: 'p2',
      operationType: 'update',
      baseServerVersion: 1,
      payload: { firstName: 'Local' },
      createdAt: Date.now(),
      status: 'blocked',
      retryCount: 0,
      lastError: 'conflict',
      dependsOn: [],
    } as any);
    await db.conflictSnapshots.put({ operationId: opId, server: { first_name: 'Server', server_version: 3 }, createdAt: Date.now() });
    await db.persons.add({ id: 'p2', treeId: 't1', firstName: 'Local', lifeStatus: 'alive', createdAt: Date.now(), updatedAt: Date.now(), serverVersion: 1, localRevision: 2, syncStatus: 'conflict', deletedAt: null } as any);

    const res = await resolveConflictKeepLocal(opId);
    expect(res.ok).toBe(true);
    expect(res.newOperationId).toBeTruthy();
    expect(res.newOperationId).not.toBe(opId);

    const original = await db.syncOperations.get(opId);
    expect(original?.status).toBe('confirmed');

    const newOp = await db.syncOperations.get(res.newOperationId!);
    expect(newOp?.status).toBe('pending');
    expect(newOp?.baseServerVersion).toBe(3);
    expect(newOp?.operationId).not.toBe(opId);

    const snap = await db.conflictSnapshots.get(opId);
    expect(snap).toBeUndefined();

    const pending = await db.syncOperations.where('status').equals('pending').toArray();
    expect(pending.some((o) => o.operationId === opId)).toBe(false);
  });

  it('resolveConflictKeepServer aplica version del servidor y limpia conflicto', async () => {
    const opId = 'op-3';
    await db.syncOperations.add({
      operationId: opId,
      entityType: 'person',
      entityId: 'p3',
      operationType: 'update',
      baseServerVersion: 1,
      payload: { firstName: 'Local' },
      createdAt: Date.now(),
      status: 'blocked',
      retryCount: 0,
      lastError: 'conflict',
      dependsOn: [],
    } as any);
    await db.conflictSnapshots.put({ operationId: opId, server: { first_name: 'Server', server_version: 4, tree_id: 't1', life_status: 'alive', created_at: Date.now(), updated_at: Date.now(), deleted_at: null }, createdAt: Date.now() });
    await db.persons.add({ id: 'p3', treeId: 't1', firstName: 'Local', lifeStatus: 'alive', createdAt: Date.now(), updatedAt: Date.now(), serverVersion: 1, localRevision: 2, syncStatus: 'conflict', deletedAt: null } as any);

    const res = await resolveConflictKeepServer(opId);
    expect(res.ok).toBe(true);

    const person = await db.persons.get('p3');
    expect(person?.firstName).toBe('Server');
    expect(person?.syncStatus).toBe('synced');
    expect(person?.serverVersion).toBe(4);
  });
});
