import { db } from './database';
import { calculateBaseServerVersion } from './operations';
import type { BaseEntity, EntityType, SyncOperation } from './schema';
import { uuidv7 } from '../../shared/utils/uuid';
import { changeLogForMutation } from '../audit/changeLog';
import { getCurrentUserId } from '../supabase/client';

function operationFor(
  entityType: EntityType,
  entity: BaseEntity,
  operationType: SyncOperation['operationType'],
  payload: Record<string, unknown> | null,
  dependsOn: string[] = [],
): SyncOperation {
  return {
    operationId: uuidv7(),
    entityType,
    entityId: entity.id,
    operationType,
    baseServerVersion: calculateBaseServerVersion(operationType, entity),
    payload,
    createdAt: Date.now(),
    status: 'pending',
    retryCount: 0,
    lastError: null,
    dependsOn,
  };
}

function isActive(entity: BaseEntity): boolean {
  return entity.deletedAt === null || entity.deletedAt === undefined;
}

async function unlinkPersonReferences(personId: string, userId: string): Promise<string[]> {
  const dependencies: string[] = [];

  for (const relationship of await db.relationships.toArray()) {
    if (!isActive(relationship)) continue;
    const next: any = {
      ...relationship,
      personId: relationship.personId === personId ? null : relationship.personId,
      relativeId: relationship.relativeId === personId ? null : relationship.relativeId,
      person1Id: relationship.person1Id === personId ? null : relationship.person1Id,
      person2Id: relationship.person2Id === personId ? null : relationship.person2Id,
    };
    if (
      next.personId !== relationship.personId
      || next.relativeId !== relationship.relativeId
      || next.person1Id !== relationship.person1Id
      || next.person2Id !== relationship.person2Id
    ) {
      const operation = operationFor('relationship', relationship, 'update', next);
      await db.relationships.put(next);
      await db.syncOutbox.add(operation);
      await db.changeLog.put(changeLogForMutation(operation, userId, next));
      dependencies.push(operation.operationId);
    }
  }

  for (const event of await db.events.toArray()) {
    if (!isActive(event)) continue;
    const next: any = {
      ...event,
      personId: event.personId === personId ? null : event.personId,
      personIds: Array.isArray(event.personIds)
        ? event.personIds.filter((id) => id !== personId)
        : event.personIds,
    };
    if (next.personId !== event.personId || next.personIds?.length !== event.personIds?.length) {
      const operation = operationFor('event', event, 'update', next);
      await db.events.put(next);
      await db.syncOutbox.add(operation);
      await db.changeLog.put(changeLogForMutation(operation, userId, next));
      dependencies.push(operation.operationId);
    }
  }

  for (const photo of await db.photos.toArray()) {
    if (!isActive(photo) || photo.personId !== personId) continue;
    const next: any = { ...photo, personId: null };
    const operation = operationFor('photo', photo, 'update', next);
    await db.photos.put(next);
    await db.syncOutbox.add(operation);
    await db.changeLog.put(changeLogForMutation(operation, userId, next));
    dependencies.push(operation.operationId);
  }

  return dependencies;
}

export async function desvincularPerson(personId: string): Promise<void> {
  const userId = await getCurrentUserId();
  await db.transaction('rw', db.relationships, db.events, db.photos, db.syncOutbox, db.changeLog, async () => {
    await unlinkPersonReferences(personId, userId);
  });
}

export async function softDeletePerson(
  personId: string,
  deletedBy: string,
): Promise<{ entity: any; operation: SyncOperation } | undefined> {
  return db.transaction(
    'rw',
    [db.persons, db.relationships, db.events, db.photos, db.syncOutbox, db.changeLog],
    async () => {
      const person = await db.persons.get(personId);
      if (!person || !isActive(person)) return undefined;

      const dependencies = await unlinkPersonReferences(personId, deletedBy);
      const tombstoned = { ...person, deletedAt: Date.now(), deletedBy };
      const operation = operationFor('person', person, 'delete', null, dependencies);
      await db.persons.put(tombstoned);
      await db.syncOutbox.add(operation);
      await db.changeLog.put(changeLogForMutation(operation, deletedBy, tombstoned));
      return { entity: tombstoned, operation };
    },
  );
}

export async function softDeleteTree(
  treeId: string,
  deletedBy: string,
): Promise<{ entity: any; operation: SyncOperation } | undefined> {
  return db.transaction(
    'rw',
    [
      db.trees,
      db.persons,
      db.relationships,
      db.events,
      db.photos,
      db.treeMemberships,
      db.treeInvitations,
      db.syncOutbox,
      db.changeLog,
    ],
    async () => {
      const tree = await db.trees.get(treeId);
      if (!tree || !isActive(tree)) return undefined;
      const now = Date.now();
      const contentDependencies: string[] = [];

      const entityTables: Array<{
        entityType: EntityType;
        table: any;
        rows: any[];
      }> = [
        { entityType: 'relationship', table: db.relationships, rows: await db.relationships.toArray() },
        { entityType: 'event', table: db.events, rows: await db.events.toArray() },
        { entityType: 'photo', table: db.photos, rows: await db.photos.toArray() },
        { entityType: 'person', table: db.persons, rows: await db.persons.toArray() },
        { entityType: 'treeInvitation', table: db.treeInvitations, rows: await db.treeInvitations.toArray() },
      ];

      for (const { entityType, table, rows } of entityTables) {
        for (const entity of rows.filter((row) => row.treeId === treeId && isActive(row))) {
          const tombstoned = { ...entity, deletedAt: now, deletedBy };
          const operation = operationFor(entityType, entity, 'delete', null);
          await table.put(tombstoned);
          await db.syncOutbox.add(operation);
          await db.changeLog.put(changeLogForMutation(operation, deletedBy, tombstoned));
          contentDependencies.push(operation.operationId);
        }
      }

      const tombstonedTree = { ...tree, deletedAt: now, deletedBy };
      const treeOperation = operationFor('tree', tree, 'delete', null, contentDependencies);
      await db.trees.put(tombstonedTree);
      await db.syncOutbox.add(treeOperation);
      await db.changeLog.put(changeLogForMutation(treeOperation, deletedBy, tombstonedTree));

      for (const membership of await db.treeMemberships.toArray()) {
        if (membership.treeId !== treeId || !isActive(membership)) continue;
        const tombstoned = { ...membership, deletedAt: now, deletedBy };
        const operation = operationFor('treeMembership', membership, 'delete', null, [treeOperation.operationId]);
        await db.treeMemberships.put(tombstoned);
        await db.syncOutbox.add(operation);
        await db.changeLog.put(changeLogForMutation(operation, deletedBy, tombstoned));
      }

      return { entity: tombstonedTree, operation: treeOperation };
    },
  );
}
