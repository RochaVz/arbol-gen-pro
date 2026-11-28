import { describe, expect, it } from 'vitest';
import { migrateLegacyIdentities } from '../core/db/identity';
import { isUuid } from '../shared/utils/uuid';

class MemoryTable {
  private readonly key: string;
  private rows: Array<Record<string, unknown>>;

  constructor(key: string, rows: Array<Record<string, unknown>>) {
    this.key = key;
    this.rows = rows;
  }

  async toArray(): Promise<Array<Record<string, unknown>>> {
    return this.rows.map((row) => ({ ...row }));
  }

  async bulkDelete(keys: string[]): Promise<void> {
    this.rows = this.rows.filter((row) => !keys.includes(String(row[this.key])));
  }

  async bulkPut(rows: Array<Record<string, unknown>>): Promise<void> {
    const byKey = new Map(this.rows.map((row) => [String(row[this.key]), row]));
    for (const row of rows) byKey.set(String(row[this.key]), row);
    this.rows = Array.from(byKey.values());
  }

  values(): Array<Record<string, unknown>> {
    return this.rows;
  }
}

describe('legacy identity migration', () => {
  it('remapea claves, referencias, payloads y dependencias de forma consistente', async () => {
    const tables = {
      trees: new MemoryTable('id', [{ id: 'tree-old', ownerId: 'local-user', name: 'Familia' }]),
      persons: new MemoryTable('id', [{ id: 'person-old', treeId: 'tree-old', firstName: 'Ana' }]),
      relationships: new MemoryTable('id', [{
        id: 'relationship-old', treeId: 'tree-old', personId: 'person-old', relativeId: 'person-missing',
      }]),
      events: new MemoryTable('id', [{
        id: 'event-old', treeId: 'tree-old', personId: 'person-old', personIds: ['person-old', 'person-missing'],
      }]),
      photos: new MemoryTable('id', [{
        id: 'photo-old', treeId: 'tree-old', personId: 'person-old', eventId: 'event-old',
      }]),
      treeMemberships: new MemoryTable('id', [{
        id: 'membership-old', treeId: 'tree-old', userId: 'local-user',
      }]),
      treeInvitations: new MemoryTable('id', [{
        id: 'invitation-old', treeId: 'tree-old', acceptedBy: 'local-user',
      }]),
      photoBlobs: new MemoryTable('id', [{
        id: 'blob-old', photoId: 'photo-old',
      }]),
      syncOutbox: new MemoryTable('operationId', [{
        operationId: 'operation-old',
        entityType: 'person',
        entityId: 'person-old',
        dependsOn: [],
        payload: { id: 'person-old', treeId: 'tree-old', firstName: 'Ana' },
      }]),
      conflictSnapshots: new MemoryTable('operationId', [{ operationId: 'operation-old' }]),
      auditLog: new MemoryTable('id', [{
        id: 'audit-old', treeId: 'tree-old', entityType: 'person', entityId: 'person-old', actorId: 'local-user',
      }]),
    };
    const transaction = { table: (name: keyof typeof tables) => tables[name] };

    await migrateLegacyIdentities(transaction);

    const tree = tables.trees.values()[0];
    const person = tables.persons.values()[0];
    const relationship = tables.relationships.values()[0];
    const event = tables.events.values()[0];
    const photo = tables.photos.values()[0];
    const membership = tables.treeMemberships.values()[0];
    const invitation = tables.treeInvitations.values()[0];
    const blob = tables.photoBlobs.values()[0];
    const operation = tables.syncOutbox.values()[0];
    const snapshot = tables.conflictSnapshots.values()[0];
    const audit = tables.auditLog.values()[0];

    for (const value of [
      tree.id, tree.ownerId, person.id, person.treeId, relationship.id, event.id, photo.id,
      membership.id, membership.userId, invitation.id, invitation.acceptedBy, blob.id,
      operation.operationId, operation.entityId, snapshot.operationId, audit.id,
    ]) {
      expect(isUuid(value)).toBe(true);
    }
    expect(person.treeId).toBe(tree.id);
    expect(relationship.personId).toBe(person.id);
    expect(event.personIds).toContain(person.id);
    expect(photo.personId).toBe(person.id);
    expect(photo.eventId).toBe(event.id);
    expect(blob.photoId).toBe(photo.id);
    expect(operation.entityId).toBe(person.id);
    expect(operation.payload).toMatchObject({ id: person.id, treeId: tree.id });
    expect(snapshot.operationId).toBe(operation.operationId);
    expect(audit.entityId).toBe(person.id);
    expect(membership.userId).toBe(tree.ownerId);
  });
});
