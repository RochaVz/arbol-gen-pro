import { describe, it, expect, beforeEach } from 'vitest';
import { db, PersonRepository } from '../core/db';
import { uuidv7 } from '../shared/utils/uuid';

const treeId = uuidv7();

describe('repositories', () => {
  beforeEach(async () => {
    await db.persons.clear();
    await db.syncOutbox.clear();
    await db.changeLog.clear();
  });

  it('create enqueues operation', async () => {
    const repo = new PersonRepository();
    const p = {
      id: uuidv7(),
      treeId,
      firstName: 'Ana',
      lifeStatus: 'alive' as const,
      createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 0, syncStatus: 'pending' as const, deletedAt: null
    };
    const r = await repo.create(p as any);
    expect(r.operation.operationType).toBe('create');
    expect(await db.persons.count()).toBe(1);
    expect(await db.syncOutbox.count()).toBe(1);
    const [change] = await db.changeLog.toArray();
    expect(change).toMatchObject({
      id: r.operation.operationId,
      entityType: 'person',
      entityId: p.id,
      operation: 'create',
      source: 'local',
    });
    expect(change.payload).toMatchObject({ id: p.id, firstName: 'Ana' });
  });

  it('update increments and enqueues', async () => {
    const repo = new PersonRepository();
    const p = { id: uuidv7(), treeId, firstName: 'Ana', lifeStatus: 'alive' as const, createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 0, syncStatus: 'pending' as const, deletedAt: null };
    await repo.create(p as any);
    await repo.update(p.id, { firstName: 'Anita' });
    const got = await db.persons.get(p.id);
    expect(got?.firstName).toBe('Anita');
    expect(await db.syncOutbox.count()).toBe(2);
    expect(await db.changeLog.count()).toBe(2);
  });

  it('delete tombstones', async () => {
    const repo = new PersonRepository();
    const p = { id: uuidv7(), treeId, firstName: 'Ana', lifeStatus: 'alive' as const, createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 0, syncStatus: 'pending' as const, deletedAt: null };
    await repo.create(p as any);
    const actorId = uuidv7();
    await repo.delete(p.id, actorId);
    const got = await db.persons.get(p.id);
    expect(got?.deletedAt).toBeTruthy();
    expect(got?.deletedBy).toBe(actorId);
    expect(await repo.getById(p.id)).toBeUndefined();
    expect(await repo.getById(p.id, true)).toBeDefined();
    expect((await repo.list()).length).toBe(0);
    expect((await repo.list(true)).length).toBe(1);
    expect(await db.changeLog.count()).toBe(2);
  });
});