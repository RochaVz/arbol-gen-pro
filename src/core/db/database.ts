import { Dexie, type Table } from 'dexie';
import type {
  Tree, Person, Relationship, Event, Photo, SyncOperation,
  TreeMembership, TreeInvitation, PhotoBlob
} from './schema';
import { uuidv7 } from '../../shared/utils/uuid';

export class Database extends Dexie {
  declare trees: Table<Tree, string>;
  declare persons: Table<Person, string>;
  declare relationships: Table<Relationship, string>;
  declare events: Table<Event, string>;
  declare photos: Table<Photo, string>;
  declare syncOutbox: Table<SyncOperation, string>;
  declare syncOperations: Table<SyncOperation, string>;
  declare treeMemberships: Table<TreeMembership, string>;
  declare treeInvitations: Table<TreeInvitation, string>;
  declare photoBlobs: Table<PhotoBlob, string>;

  constructor() {
    super('arbol-gen-pro-db');
    this.version(1).stores({
      trees: 'id, ownerId, deletedAt',
      persons: 'id, treeId, deletedAt',
      relationships: 'id, treeId, deletedAt',
      events: 'id, treeId, deletedAt',
      photos: 'id, treeId, personId, deletedAt',
      syncOutbox: 'operationId, status, [entityType+entityId], createdAt',
      treeMemberships: 'id, treeId, userId',
      treeInvitations: 'id, treeId',
      photoBlobs: 'id, photoId, kind'
    });
    this.syncOperations = this.syncOutbox;

    const entityTables: Array<Table<any, string>> = [
      this.trees, this.persons, this.relationships, this.events, this.photos,
      this.treeMemberships, this.treeInvitations, this.photoBlobs
    ];
    for (const table of entityTables) {
      table.hook('creating', (_primKey, obj) => {
        const now = Date.now();
        if (!obj.id) obj.id = uuidv7();
        obj.createdAt = obj.createdAt ?? now;
        obj.updatedAt = now;
        obj.serverVersion = obj.serverVersion ?? 0;
        obj.localRevision = (obj.localRevision ?? 0) + 1;
        obj.syncStatus = obj.syncStatus ?? 'pending';
        obj.deletedAt = obj.deletedAt ?? null;
      });
      table.hook('updating', (mods: any, _primKey, obj: any) => {
        const now = Date.now();
        return {
          ...mods,
          updatedAt: now,
          localRevision: (obj?.localRevision ?? 0) + 1,
          syncStatus: mods?.syncStatus ?? 'pending'
        };
      });
    }
  }
}

export const db = new Database();