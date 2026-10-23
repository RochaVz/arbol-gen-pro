import { describe, it, expect, beforeEach } from 'vitest';
import { db, PersonRepository } from '../core/db';
import { uuidv7 } from '../shared/utils/uuid';

describe('repositories', () => {
  beforeEach(async () => {
    await db.persons.clear();
    await db.syncOutbox.clear();
  });

  it('create enqueues operation', async () => {
    const repo = new PersonRepository();
    const p = {
      id: uuidv7(),
      treeId: 't1',
      firstName: 'Ana',
      lifeStatus: 'alive' as const,
      createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 0, syncStatus: 'pending' as const, deletedAt: null
    };
    const r = await repo.create(p as any);
    expect(r.operation.operationType).toBe('create');
    expect(await db.persons.count()).toBe(1);
    expect(await db.syncOutbox.count()).toBe(1);
  });

  it('update increments and enqueues', async () => {
    const repo = new PersonRepository();
    const p = { id: uuidv7(), treeId: 't1', firstName: 'Ana', lifeStatus: 'alive' as const, createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 0, syncStatus: 'pending' as const, deletedAt: null };
    await repo.create(p as any);
    await repo.update(p.id, { firstName: 'Anita' });
    const got = await db.persons.get(p.id);
    expect(got?.firstName).toBe('Anita');
    expect(await db.syncOutbox.count()).toBe(2);
  });

  it('delete tombstones', async () => {
    const repo = new PersonRepository();
    const p = { id: uuidv7(), treeId: 't1', firstName: 'Ana', lifeStatus: 'alive' as const, createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 0, syncStatus: 'pending' as const, deletedAt: null };
    await repo.create(p as any);
    await repo.delete(p.id);
    const got = await db.persons.get(p.id);
    expect(got?.deletedAt).toBeTruthy();
    expect((await repo.list()).length).toBe(0);
  });
});