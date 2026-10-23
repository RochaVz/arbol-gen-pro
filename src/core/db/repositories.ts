import { db } from './database';
import { writeLocal } from './operations';
import type { BaseEntity, Person, Relationship, Event, Photo, Tree, TreeMembership, TreeInvitation } from './schema';
import type { SyncOperation } from './schema';
import { validatePerson, validateRelationship, validateEvent, validateTree } from '../../shared/utils/validation';
import { searchPersons } from '../../shared/utils/search';
import { desvincularPerson } from './cascade';

export interface Repository<T extends BaseEntity> {
  getById(id: string): Promise<T | undefined>;
  list(includeDeleted?: boolean): Promise<T[]>;
  create(entity: T): Promise<{ entity: T; operation: SyncOperation }>;
  update(id: string, changes: Partial<T>): Promise<{ entity: T; operation: SyncOperation } | undefined>;
  delete(id: string): Promise<{ entity: T; operation: SyncOperation } | undefined>;
  get(id: string): Promise<T | undefined>;
  find(id: string): Promise<T | undefined>;
  findAll(includeDeleted?: boolean): Promise<T[]>;
  save(entity: T): Promise<{ entity: T; operation: SyncOperation }>;
  remove(id: string): Promise<{ entity: T; operation: SyncOperation } | undefined>;
}

function notDeleted<T extends BaseEntity>(e: T): boolean {
  return e.deletedAt === null || e.deletedAt === undefined;
}

class BaseRepository<T extends BaseEntity> implements Repository<T> {
  protected table: any;
  protected entityType: SyncOperation['entityType'];
  constructor(table: any, entityType: SyncOperation['entityType']) {
    this.table = table;
    this.entityType = entityType;
  }
  async getById(id: string): Promise<T | undefined> { return this.table.get(id); }
  async get(id: string): Promise<T | undefined> { return this.getById(id); }
  async find(id: string): Promise<T | undefined> { return this.getById(id); }
  async list(includeDeleted = false): Promise<T[]> {
    const all = await this.table.toArray();
    return includeDeleted ? all : all.filter(notDeleted);
  }
  async findAll(includeDeleted = false): Promise<T[]> { return this.list(includeDeleted); }
  async create(entity: T): Promise<{ entity: T; operation: SyncOperation }> {
    return writeLocal(this.table, entity, { entityType: this.entityType, operationType: 'create' });
  }
  async save(entity: T): Promise<{ entity: T; operation: SyncOperation }> {
    const existing = await this.table.get(entity.id);
    if (existing) return this.update(entity.id, entity) as any;
    return this.create(entity);
  }
  async update(id: string, changes: Partial<T>): Promise<{ entity: T; operation: SyncOperation } | undefined> {
    const existing = await this.table.get(id);
    if (!existing) return undefined;
    const merged = { ...existing, ...changes, id };
    return writeLocal(this.table, merged, { entityType: this.entityType, operationType: 'update' });
  }
  async delete(id: string): Promise<{ entity: T; operation: SyncOperation } | undefined> {
    const existing = await this.table.get(id);
    if (!existing) return undefined;
    const tombstoned = { ...existing, deletedAt: Date.now() };
    return writeLocal(this.table, tombstoned, { entityType: this.entityType, operationType: 'delete' });
  }
  async remove(id: string) { return this.delete(id); }
}

export class PersonRepository extends BaseRepository<Person> {
  constructor(table: any = db.persons) { super(table, 'person'); }
  async search(criteria: any): Promise<Person[]> {
    const all = await this.list();
    return searchPersons(all, criteria);
  }
  async create(entity: Person) {
    const v = validatePerson(entity);
    if (!v.ok) throw new Error(v.error as string);
    return super.create(entity);
  }
  async update(id: string, changes: Partial<Person>) {
    if (changes && Object.keys(changes).length) {
      const existing = await this.getById(id);
      const merged = { ...(existing ?? {}), ...changes } as Person;
      const v = validatePerson(merged);
      if (!v.ok) throw new Error(v.error as string);
    }
    return super.update(id, changes);
  }
  async delete(id: string) {
    await desvincularPerson(id);
    return super.delete(id);
  }
}

export class RelationshipRepository extends BaseRepository<Relationship> {
  constructor(table: any = db.relationships) { super(table, 'relationship'); }
  async create(entity: Relationship, existingEdges?: { from: string; to: string }[]) {
    const v = validateRelationship(entity, existingEdges);
    if (!v.ok) throw new Error(v.error as string);
    return super.create(entity);
  }
  async update(id: string, changes: Partial<Relationship>, existingEdges?: { from: string; to: string }[]) {
    const existing = await this.getById(id);
    const merged = { ...(existing ?? {}), ...changes } as Relationship;
    const v = validateRelationship(merged, existingEdges);
    if (!v.ok) throw new Error(v.error as string);
    return super.update(id, changes);
  }
}

export class EventRepository extends BaseRepository<Event> {
  constructor(table: any = db.events) { super(table, 'event'); }
  async create(entity: Event) {
    const v = validateEvent(entity);
    if (!v.ok) throw new Error(v.error as string);
    return super.create(entity);
  }
  async update(id: string, changes: Partial<Event>) {
    const existing = await this.getById(id);
    const merged = { ...(existing ?? {}), ...changes } as Event;
    const v = validateEvent(merged);
    if (!v.ok) throw new Error(v.error as string);
    return super.update(id, changes);
  }
}

export class PhotoRepository extends BaseRepository<Photo> {
  constructor(table: any = db.photos) { super(table, 'photo'); }
}

export class TreeRepository extends BaseRepository<Tree> {
  constructor(table: any = db.trees) { super(table, 'tree'); }
  async create(entity: Tree) {
    const v = validateTree(entity);
    if (!v.ok) throw new Error(v.error as string);
    return super.create(entity);
  }
  async update(id: string, changes: Partial<Tree>) {
    const existing = await this.getById(id);
    const merged = { ...(existing ?? {}), ...changes } as Tree;
    const v = validateTree(merged);
    if (!v.ok) throw new Error(v.error as string);
    return super.update(id, changes);
  }
}

export class TreeMembershipRepository extends BaseRepository<TreeMembership> {
  constructor(table: any = db.treeMemberships) { super(table, 'treeMembership'); }
}

export class TreeInvitationRepository extends BaseRepository<TreeInvitation> {
  constructor(table: any = db.treeInvitations) { super(table, 'treeInvitation'); }
}

export const personRepository = new PersonRepository();
export const relationshipRepository = new RelationshipRepository();
export const eventRepository = new EventRepository();
export const photoRepository = new PhotoRepository();
export const treeRepository = new TreeRepository();
export const treeMembershipRepository = new TreeMembershipRepository();
export const treeInvitationRepository = new TreeInvitationRepository();
export default {
  PersonRepository, RelationshipRepository, EventRepository, PhotoRepository,
  TreeRepository, TreeMembershipRepository, TreeInvitationRepository,
  personRepository, relationshipRepository, eventRepository, photoRepository,
  treeRepository, treeMembershipRepository, treeInvitationRepository
};
