import { assertUuid, assertUuidArray, isUuid, uuidv7 } from '../../shared/utils/uuid';

const UUID_FIELDS = [
  'id',
  'treeId',
  'ownerId',
  'personId',
  'relativeId',
  'person1Id',
  'person2Id',
  'eventId',
  'photoId',
  'userId',
  'invitedBy',
  'acceptedBy',
  'entityId',
  'actorId',
  'deletedBy',
] as const;

export function assertEntityIdentities(entity: Record<string, unknown>): void {
  for (const field of UUID_FIELDS) {
    const value = entity[field];
    if (value !== undefined && value !== null && value !== '') {
      assertUuid(value, field);
    }
  }
  if (entity.personIds !== undefined && entity.personIds !== null) {
    assertUuidArray(entity.personIds, 'personIds');
  }
}

export function assertOperationIdentities(operation: {
  operationId?: unknown;
  entityId?: unknown;
  dependsOn?: unknown;
  payload?: unknown;
}): void {
  assertUuid(operation.operationId, 'operationId');
  assertUuid(operation.entityId, 'entityId');
  if (operation.dependsOn !== undefined && operation.dependsOn !== null) {
    assertUuidArray(operation.dependsOn, 'dependsOn');
  }
  if (operation.payload && typeof operation.payload === 'object' && !Array.isArray(operation.payload)) {
    assertEntityIdentities(operation.payload as Record<string, unknown>);
  }
}

type IdentityMap = Map<string, string>;

function remap(value: unknown, identities: IdentityMap): unknown {
  if (value === undefined || value === null || value === '') return value;
  const id = String(value);
  if (isUuid(id)) return id;
  const existing = identities.get(id);
  if (existing) return existing;
  const replacement = uuidv7();
  identities.set(id, replacement);
  return replacement;
}

function remapArray(values: unknown, identities: IdentityMap): unknown {
  if (!Array.isArray(values)) return values;
  return values.map((value) => remap(value, identities));
}

function remapFields(
  record: Record<string, unknown>,
  fields: ReadonlyArray<readonly [string, IdentityMap]>,
): Record<string, unknown> {
  const next = { ...record };
  for (const [field, identities] of fields) {
    if (next[field] !== undefined) next[field] = remap(next[field], identities);
  }
  return next;
}

function remapPayload(
  payload: unknown,
  entityType: string,
  maps: Record<string, IdentityMap>,
  userIdentities: IdentityMap,
): unknown {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload;
  const record = payload as Record<string, unknown>;
  const entityIdentities = maps[entityType];
  const next = remapFields(record, [
    ['id', entityIdentities ?? new Map()],
    ['treeId', maps.tree],
    ['ownerId', userIdentities],
    ['personId', maps.person],
    ['relativeId', maps.person],
    ['person1Id', maps.person],
    ['person2Id', maps.person],
    ['eventId', maps.event],
    ['photoId', maps.photo],
    ['userId', userIdentities],
    ['invitedBy', userIdentities],
    ['acceptedBy', userIdentities],
    ['actorId', userIdentities],
    ['entityId', entityIdentities ?? new Map()],
  ]);
  if (next.personIds !== undefined) {
    next.personIds = remapArray(next.personIds, maps.person);
  }
  return next;
}

export async function migrateLegacyIdentities(transaction: any): Promise<void> {
  const tables = ['trees', 'persons', 'relationships', 'events', 'photos', 'treeMemberships', 'treeInvitations', 'photoBlobs'] as const;
  const records: Record<string, Array<Record<string, unknown>>> = {};
  const maps: Record<string, IdentityMap> = {};

  for (const [index, tableName] of tables.entries()) {
    const entityType = index < 5
      ? ['tree', 'person', 'relationship', 'event', 'photo'][index]
      : tableName === 'treeMemberships'
        ? 'treeMembership'
        : tableName === 'treeInvitations'
          ? 'treeInvitation'
          : 'photoBlob';
    records[entityType] = await transaction.table(tableName).toArray();
    const identities: IdentityMap = new Map();
    for (const record of records[entityType]) {
      remap(record.id, identities);
    }
    maps[entityType] = identities;
  }

  const userIdentities: IdentityMap = new Map();
  for (const record of [
    ...records.tree,
    ...records.treeMembership,
    ...records.treeInvitation,
  ]) {
    for (const field of ['ownerId', 'userId', 'invitedBy', 'acceptedBy']) {
      if (record[field] !== undefined) remap(record[field], userIdentities);
    }
  }

  const replacePrimaryKeys = async (tableName: string, values: Array<Record<string, unknown>>, entityType: string) => {
    const table = transaction.table(tableName);
    const legacyKeys = values
      .map((record) => record.id)
      .filter((id): id is string => typeof id === 'string' && !isUuid(id));
    if (legacyKeys.length) await table.bulkDelete(legacyKeys);
    const transformed = values.map((record) => remapFields(record, [['id', maps[entityType]]]));
    await table.bulkPut(transformed);
  };

  const treeRows = records.tree.map((record) => remapFields(record, [
    ['ownerId', userIdentities],
  ]));
  await replacePrimaryKeys('trees', treeRows, 'tree');

  const personRows = records.person.map((record) => remapFields(record, [
    ['treeId', maps.tree],
  ]));
  await replacePrimaryKeys('persons', personRows, 'person');

  const relationshipRows = records.relationship.map((record) => remapFields(record, [
    ['treeId', maps.tree],
    ['personId', maps.person],
    ['relativeId', maps.person],
    ['person1Id', maps.person],
    ['person2Id', maps.person],
  ]));
  await replacePrimaryKeys('relationships', relationshipRows, 'relationship');

  const eventRows = records.event.map((record) => {
    const next = remapFields(record, [
      ['treeId', maps.tree],
      ['personId', maps.person],
    ]);
    if (next.personIds !== undefined) next.personIds = remapArray(next.personIds, maps.person);
    return next;
  });
  await replacePrimaryKeys('events', eventRows, 'event');

  const photoRows = records.photo.map((record) => remapFields(record, [
    ['treeId', maps.tree],
    ['personId', maps.person],
    ['eventId', maps.event],
  ]));
  await replacePrimaryKeys('photos', photoRows, 'photo');

  const membershipRows = records.treeMembership.map((record) => remapFields(record, [
    ['treeId', maps.tree],
    ['userId', userIdentities],
    ['invitedBy', userIdentities],
  ]));
  await replacePrimaryKeys('treeMemberships', membershipRows, 'treeMembership');

  const invitationRows = records.treeInvitation.map((record) => remapFields(record, [
    ['treeId', maps.tree],
    ['invitedBy', userIdentities],
    ['acceptedBy', userIdentities],
  ]));
  await replacePrimaryKeys('treeInvitations', invitationRows, 'treeInvitation');

  const blobRows = records.photoBlob.map((record) => remapFields(record, [
    ['photoId', maps.photo],
  ]));
  await replacePrimaryKeys('photoBlobs', blobRows, 'photoBlob');

  const operations = await transaction.table('syncOutbox').toArray() as Array<Record<string, unknown>>;
  const operationIdentities: IdentityMap = new Map();
  for (const operation of operations) remap(operation.operationId, operationIdentities);
  const legacyOperationKeys = operations
    .map((operation) => operation.operationId)
    .filter((id): id is string => typeof id === 'string' && !isUuid(id));
  const syncOutbox = transaction.table('syncOutbox');
  if (legacyOperationKeys.length) await syncOutbox.bulkDelete(legacyOperationKeys);
  await syncOutbox.bulkPut(operations.map((operation) => {
    const entityType = String(operation.entityType);
    const next = remapFields(operation, [
      ['operationId', operationIdentities],
      ['entityId', maps[entityType] ?? new Map()],
    ]);
    next.dependsOn = remapArray(next.dependsOn, operationIdentities);
    next.payload = remapPayload(next.payload, entityType, maps, userIdentities);
    return next;
  }));

  const snapshots = await transaction.table('conflictSnapshots').toArray() as Array<Record<string, unknown>>;
  const conflictSnapshots = transaction.table('conflictSnapshots');
  const legacySnapshotKeys = snapshots
    .map((snapshot) => snapshot.operationId)
    .filter((id): id is string => typeof id === 'string' && !isUuid(id));
  if (legacySnapshotKeys.length) await conflictSnapshots.bulkDelete(legacySnapshotKeys);
  await conflictSnapshots.bulkPut(snapshots.map((snapshot) => remapFields(snapshot, [
    ['operationId', operationIdentities],
  ])));

  const auditEntries = await transaction.table('auditLog').toArray() as Array<Record<string, unknown>>;
  const auditIdentities: IdentityMap = new Map();
  for (const entry of auditEntries) remap(entry.id, auditIdentities);
  const auditLog = transaction.table('auditLog');
  const legacyAuditKeys = auditEntries
    .map((entry) => entry.id)
    .filter((id): id is string => typeof id === 'string' && !isUuid(id));
  if (legacyAuditKeys.length) await auditLog.bulkDelete(legacyAuditKeys);
  await auditLog.bulkPut(auditEntries.map((entry) => {
    const entityType = String(entry.entityType);
    return remapFields(entry, [
      ['id', auditIdentities],
      ['treeId', maps.tree],
      ['entityId', maps[entityType] ?? new Map()],
      ['actorId', userIdentities],
    ]);
  }));
}
