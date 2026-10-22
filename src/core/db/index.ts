import { Dexie, type Table } from 'dexie';
import type {
  Tree,
  Person,
  Relationship,
  Event,
  Photo,
  SyncOperation,
  TreeMembership,
  TreeInvitation,
  PhotoBlob
} from './schema';

// Base entity interface (shared with DATA-MODEL.md) - not directly used in this file
// type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

// Extend Dexie Table with BaseEntity
interface PersonTable extends Table<Person, string> {
  // Custom methods can be added here
}

export class Database extends Dexie {
  declare persons: PersonTable;
  declare trees: Table<Tree, string>;
  declare relationships: Table<Relationship, string>;
  declare events: Table<Event, string>;
  declare photos: Table<Photo, string>;
  declare syncOperations: Table<SyncOperation, string>;
  declare treeMemberships: Table<TreeMembership, string>;
  declare treeInvitations: Table<TreeInvitation, string>;
  declare photoBlobs: Table<PhotoBlob, string>;

  constructor() {
    super('arbol-gen-pro-db');
    // Version 1: Initial schema
    // (Migraciones definidas en DATA-MODEL.md §3.5)
  }
}

export const db = new Database();

// Export types for use in other modules
export type { Tree, Person, Relationship, Event, Photo, SyncOperation, TreeMembership, TreeInvitation, PhotoBlob };