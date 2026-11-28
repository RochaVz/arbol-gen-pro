import { describe, it, expect, beforeEach } from 'vitest';
import { db, treeRepository } from '../core/db';
import { uuidv7 } from '../shared/utils/uuid';
import { desvincularPerson } from '../core/db/cascade';

describe('cascade desvincular', () => {
  beforeEach(async () => {
    await db.trees.clear();
    await db.persons.clear();
    await db.relationships.clear();
    await db.events.clear();
    await db.photos.clear();
    await db.treeMemberships.clear();
    await db.treeInvitations.clear();
    await db.syncOutbox.clear();
  });

  it('orphans related entities', async () => {
    const treeId = uuidv7();
    const pid = uuidv7();
    await db.persons.add({ id: pid, treeId, firstName: 'Ana', lifeStatus: 'alive', createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as any);
    const rid = uuidv7();
    await db.relationships.add({ id: rid, treeId, personId: pid, relativeId: uuidv7(), type: 'parent', createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as any);
    const eid = uuidv7();
    await db.events.add({ id: eid, treeId, personId: pid, personIds: [pid], type: 'birth', createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as any);
    const phid = uuidv7();
    await db.photos.add({ id: phid, treeId, personId: pid, createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as any);

    await desvincularPerson(pid);

    const r = await db.relationships.get(rid);
    expect(r?.personId).toBeNull();
    const e = await db.events.get(eid);
    expect(e?.personId).toBeNull();
    expect(e?.personIds).toEqual([]);
    const ph = await db.photos.get(phid);
    expect(ph?.personId).toBeNull();
    expect((await db.syncOutbox.where('entityType').equals('event').count())).toBe(1);
  });

  it('soft deletes a tree and orders child, tree and membership operations', async () => {
    const treeId = uuidv7();
    const personId = uuidv7();
    const relationshipId = uuidv7();
    const eventId = uuidv7();
    const photoId = uuidv7();
    const membershipId = uuidv7();
    const invitationId = uuidv7();
    const actorId = uuidv7();
    const base = {
      treeId,
      createdAt: 0,
      updatedAt: 0,
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'pending' as const,
      deletedAt: null,
    };

    await db.trees.add({ ...base, id: treeId, name: 'Familia', ownerId: actorId });
    await db.persons.add({ ...base, id: personId, firstName: 'Ana', lifeStatus: 'alive' });
    await db.relationships.add({ ...base, id: relationshipId, person1Id: personId, person2Id: uuidv7(), type: 'parent' });
    await db.events.add({ ...base, id: eventId, personId, type: 'birth' });
    await db.photos.add({ ...base, id: photoId, personId });
    await db.treeMemberships.add({ ...base, id: membershipId, userId: actorId, role: 'owner' });
    await db.treeInvitations.add({
      ...base,
      id: invitationId,
      invitedEmail: 'member@example.test',
      role: 'viewer',
      tokenHash: 'hash',
      expiresAt: Date.now() + 1000,
    });

    const result = await treeRepository.delete(treeId, actorId);

    expect(result).toBeDefined();
    expect((await db.trees.get(treeId))?.deletedBy).toBe(actorId);
    expect((await db.persons.get(personId))?.deletedAt).toBeTruthy();
    expect((await db.relationships.get(relationshipId))?.deletedAt).toBeTruthy();
    expect((await db.events.get(eventId))?.deletedAt).toBeTruthy();
    expect((await db.photos.get(photoId))?.deletedAt).toBeTruthy();
    expect((await db.treeMemberships.get(membershipId))?.deletedAt).toBeTruthy();
    expect((await db.treeInvitations.get(invitationId))?.deletedAt).toBeTruthy();

    const operations = await db.syncOutbox.toArray();
    const treeOperation = operations.find((operation) =>
      operation.entityType === 'tree' && operation.operationType === 'delete'
    );
    const membershipOperation = operations.find((operation) =>
      operation.entityType === 'treeMembership' && operation.operationType === 'delete'
    );
    expect(treeOperation?.dependsOn).toHaveLength(5);
    expect(membershipOperation?.dependsOn).toEqual([treeOperation?.operationId]);
  });
});