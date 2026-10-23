import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../core/db';
import { uuidv7 } from '../shared/utils/uuid';
import { desvincularPerson } from '../core/db/cascade';

describe('cascade desvincular', () => {
  beforeEach(async () => {
    await db.persons.clear();
    await db.relationships.clear();
    await db.events.clear();
    await db.photos.clear();
    await db.syncOutbox.clear();
  });

  it('orphans related entities', async () => {
    const pid = uuidv7();
    await db.persons.add({ id: pid, treeId: 't', firstName: 'Ana', lifeStatus: 'alive', createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as any);
    const rid = uuidv7();
    await db.relationships.add({ id: rid, treeId: 't', personId: pid, relativeId: 'other', type: 'parent', createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as any);
    const eid = uuidv7();
    await db.events.add({ id: eid, treeId: 't', personId: pid, type: 'birth', createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as any);
    const phid = uuidv7();
    await db.photos.add({ id: phid, treeId: 't', personId: pid, createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as any);

    await desvincularPerson(pid);

    const r = await db.relationships.get(rid);
    expect(r?.personId).toBeNull();
    const e = await db.events.get(eid);
    expect(e?.personId).toBeNull();
    const ph = await db.photos.get(phid);
    expect(ph?.personId).toBeNull();
  });
});