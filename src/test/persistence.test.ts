import { describe, it, expect, beforeEach } from 'vitest';
import { db, Database } from '../core/db';
import { uuidv7 } from '../shared/utils/uuid';

async function clearAll() {
  await db.transaction('rw', [db.trees, db.persons, db.relationships, db.events, db.photos,
    db.syncOperations, db.treeMemberships, db.treeInvitations, db.photoBlobs], async () => {
      await db.trees.clear();
      await db.persons.clear();
      await db.relationships.clear();
      await db.events.clear();
      await db.photos.clear();
      await db.syncOperations.clear();
      await db.treeMemberships.clear();
      await db.treeInvitations.clear();
      await db.photoBlobs.clear();
    });
}

describe('persistencia local (Fase 2)', () => {
  beforeEach(async () => {
    if (!db.isOpen()) await db.open();
    await clearAll();
  });

  it('expone los stores de Dexie', () => {
    expect(db.persons).toBeDefined();
    expect(db.syncOperations).toBeDefined();
    expect(typeof db.transaction).toBe('function');
  });

  it('incrementa localRevision y no toca serverVersion en create (hook)', async () => {
    const id = await db.persons.add({ treeId: 't1', firstName: 'Ana', lifeStatus: 'alive' } as any);
    const saved = await db.persons.get(id as string);
    expect(saved).toBeDefined();
    expect(saved!.localRevision).toBe(1);
    expect(saved!.serverVersion).toBe(0);
    expect(saved!.syncStatus).toBe('pending');
    expect(saved!.deletedAt).toBeNull();
  });

  it('incrementa localRevision en update (hook)', async () => {
    const id = await db.persons.add({ treeId: 't1', firstName: 'Ana', lifeStatus: 'alive' } as any);
    await db.persons.update(id as string, { firstName: 'Ana María' });
    const saved = await db.persons.get(id as string);
    expect(saved!.firstName).toBe('Ana María');
    expect(saved!.localRevision).toBe(2);
    expect(saved!.serverVersion).toBe(0);
  });

  it('atomicidad: si falla la escritura de la operación, la entidad tampoco se escribe', async () => {
    const opId = uuidv7();
    await db.syncOperations.add({
      operationId: opId,
      entityType: 'person',
      entityId: 'x',
      operationType: 'create',
      baseServerVersion: 0,
      payload: null,
      createdAt: Date.now(),
      status: 'pending',
      retryCount: 0,
      lastError: null,
      dependsOn: []
    } as any);

    const personId = uuidv7();
    await expect(
      db.transaction('rw', db.persons, db.syncOperations, async () => {
        await db.persons.add({ id: personId, treeId: 't1', firstName: 'Luis', lifeStatus: 'alive' } as any);
        // fuerza fallo por PK duplicada en syncOutbox
        await db.syncOperations.add({
          operationId: opId,
          entityType: 'person',
          entityId: personId,
          operationType: 'create',
          baseServerVersion: 0,
          payload: null,
          createdAt: Date.now(),
          status: 'pending',
          retryCount: 0,
          lastError: null,
          dependsOn: []
        } as any);
      })
    ).rejects.toThrow();

    const count = await db.persons.where('id').equals(personId).count();
    expect(count).toBe(0);
  });

  it('persistencia: una operación encolada sobrevive a la recreación del objeto Dexie', async () => {
    const opId = uuidv7();
    await db.syncOperations.add({
      operationId: opId,
      entityType: 'person',
      entityId: 'p1',
      operationType: 'create',
      baseServerVersion: 0,
      payload: { id: 'p1' },
      createdAt: Date.now(),
      status: 'pending',
      retryCount: 0,
      lastError: null,
      dependsOn: []
    } as any);

    const db2 = new Database();
    await db2.open();
    const found = await db2.syncOperations.get(opId);
    expect(found).toBeDefined();
    expect(found!.operationId).toBe(opId);
    await db2.close();
  });

  it('índices: consulta por status y por [entityType+entityId]', async () => {
    const personId = uuidv7();
    await db.syncOperations.bulkAdd([
      {
        operationId: uuidv7(),
        entityType: 'person',
        entityId: personId,
        operationType: 'create',
        baseServerVersion: 0,
        payload: null,
        createdAt: Date.now(),
        status: 'pending',
        retryCount: 0,
        lastError: null,
        dependsOn: []
      } as any,
      {
        operationId: uuidv7(),
        entityType: 'tree',
        entityId: 't1',
        operationType: 'update',
        baseServerVersion: 1,
        payload: null,
        createdAt: Date.now() + 1,
        status: 'failed',
        retryCount: 2,
        lastError: 'boom',
        dependsOn: []
      } as any
    ]);

    const pending = await db.syncOperations.where('status').equals('pending').toArray();
    expect(pending.length).toBe(1);

    const byEntity = await db.syncOperations.where('[entityType+entityId]').equals(['person', personId]).toArray();
    expect(byEntity.length).toBe(1);
  });

  it('baseServerVersion: create -> 0, update/delete -> serverVersion conocido (helper)', async () => {
    const { calculateBaseServerVersion } = await import('../core/db/operations');
    const entity = { serverVersion: 5 };
    expect(calculateBaseServerVersion('create', entity)).toBe(0);
    expect(calculateBaseServerVersion('update', entity)).toBe(5);
    expect(calculateBaseServerVersion('delete', entity)).toBe(5);
  });
});