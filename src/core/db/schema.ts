/**
 * Database Schema for ARBOL-GEN-PRO
 * IndexedDB (Dexie.js) - Offline First
 * 
 * Phase 1: F1 - Política de cascada
 * Decisión: "desvincular" - Al eliminar una persona, se desvinculan
 * sus relaciones, eventos y fotos (se establecen foreign keys nulas),
 * en lugar de borrar en cascada o bloquear el borrado.
 * 
 * This maintains the logical deletion pattern (deletedAt tombstones)
 * and supports offline-first operation.
 * 
 * Cascade Delete Policy (F1):
 * When a person is desvincular (deleted logically):
 * 1. Relationships where personId OR relativeId = person.id → set personId/relativeId to null (orphan)
 * 2. Events where personId = person.id → keep events but set personId to null (orphan event)
 * 3. Photos where personId = person.id → set personId to null (orphan photo, keep as tree-level)
 * 4. Tombstone (deletedAt) is set on the person, physical deletion avoided
 * 
 * This policy supports:
 * - Offline-first: No server round-trip needed for local operations
 * - Data preservation: Historical data is never lost, only disassociated
 * - Conflict resolution: No auto-merge, manual decision required
 * - RLS compatibility: Disassociated records have null foreign keys, safe for RLS
 */

/**
 * Export all entity interfaces for use in src/core/db/index.ts
 */

// Base entity interface shared across all stores
export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

export type LifeStatus = 'alive' | 'deceased' | 'unknown';

export type OperationType = 'create' | 'update' | 'delete';
export type OperationStatus = 'pending' | 'in_flight' | 'confirmed' | 'failed' | 'blocked';
export type EntityType =
  | 'tree' | 'person' | 'relationship' | 'event' | 'photo'
  | 'treeMembership' | 'treeInvitation';

export interface BaseEntity {
  id: string;  // UUID v7
  createdAt: number;
  updatedAt: number;
  serverVersion: number;  // Only server increments
  localRevision: number;  // Only client increments
  syncStatus: SyncStatus;
  deletedAt: number | null;  // Tombstone. null = la entidad existe
  localOnly?: boolean;      // Creada solo en este dispositivo, nunca sube
}

// Tree store - Genealogical trees
export interface Tree extends BaseEntity {
  name: string;
  description?: string;
  ownerId: string;
}

// Person store - Family members
export interface Person extends BaseEntity {
  treeId: string;
  firstName: string;
  lastName?: string;
  sex?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: PartialDate;
  deathDate?: PartialDate;
  lifeStatus: 'alive' | 'deceased' | 'unknown';
  birthplace?: Place;
  deathPlace?: Place;
  biography?: string;
  notes?: string;
  generation?: number;
}

// Relationship store - Family relationships
export interface Relationship extends BaseEntity {
  treeId: string;
  personId?: string;
  relativeId?: string;
  person1Id?: string;
  person2Id?: string;
  type: string;
  degree?: number;
  startDate?: PartialDate;
  endDate?: PartialDate;
}

// Event store - Life events
export interface Event extends BaseEntity {
  treeId: string;
  personId?: string;
  personIds?: string[];
  type: string;
  title?: string;
  date?: PartialDate;
  place?: Place;
  description?: string;
}

// Photo store - Family photos
export interface Photo extends BaseEntity {
  treeId: string;
  personId?: string;
  eventId?: string;
  url?: string;
  thumbnailUrl?: string;
  r2Key?: string;
  kind?: 'original' | 'optimized' | 'thumbnail';
  width?: number;
  height?: number;
  mimeType?: string;
  sizeBytes?: number;
  size?: number;
  isPrimary?: boolean;
  isMain?: boolean;
  capturedAt?: number;
  uploadedAt?: number;
  description?: string;
  exif?: Record<string, string | number>;
}

export interface SyncOperation {
  operationId: string;
  entityType: EntityType;
  entityId: string;
  operationType: OperationType;
  baseServerVersion: number;
  payload: Record<string, unknown> | null;
  createdAt: number;
  status: OperationStatus;
  retryCount: number;
  lastError: string | null;
  dependsOn: string[];
}

// Tree memberships - User permissions on trees
export interface TreeMembership extends BaseEntity {
  treeId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'commenter';
  invitedBy?: string;
  acceptedAt?: number;
  joinedAt?: number;
}

// Tree invitations - Pending invitations
export interface TreeInvitation extends BaseEntity {
  treeId: string;
  email?: string;
  invitedEmail?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'commenter';
  tokenHash: string;
  expiresAt: number;
  accepted?: boolean;
  acceptedAt?: number;
  acceptedBy?: string;
  revokedAt?: number;
}

export interface AuditLogEntry extends BaseEntity {
  treeId?: string;
  entityType: string;
  entityId?: string;
  action: 'create' | 'update' | 'delete' | 'share' | 'role_change' | 'invite' | 'revoke';
  actorId?: string;
  payload?: Record<string, unknown> | null;
}

// Photo blobs - Local image data (optimized versions)
export interface PhotoBlob extends BaseEntity {
  photoId: string;
  kind: 'thumbnail' | 'optimized' | 'original';
  blob: Blob;
  size: number;
}


/**
 * PartialDate (Fecha Parcial) - Used for partial dates (birth, death, etc.)
 */
export interface PartialDate {
  year: number;                  // Obligatorio
  month?: number;                // 1-12
  day?: number;                  // 1-31
  qualifier?: 'circa' | 'before' | 'after';
  rangeEnd?: PartialDate;        // Para rangos (ej. 1900-1910)
  calendar?: 'gregorian' | 'julian' | 'hebrew' | 'islamic';
}

/**
 * Place (Lugar) - Location information
 */
export interface Place {
  name: string;                  // Nombre completo del lugar
  city?: string;
  parish?: string;
  region?: string;               // Estado, provincia
  country?: string;              // Código ISO 3166-1 alpha-2
  coordinates?: [number, number]; // [lat, lng]
  geonamesId?: string;
}