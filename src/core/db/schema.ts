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
  personId: string;       // The person this relationship is about
  relativeId: string;     // The related person
  type: 'parent' | 'child' | 'spouse' | 'sibling' | 'grandparent' | 'grandchild' | 'other';
  degree?: number;        // Generation distance
}

// Event store - Life events
export interface Event extends BaseEntity {
  treeId: string;
  personId: string;
  type: 'birth' | 'death' | 'marriage' | 'divorce' | 'burial' | 'christening' | 'other';
  date?: PartialDate;
  place?: Place;
  description?: string;
}

// Photo store - Family photos
export interface Photo extends BaseEntity {
  treeId: string;
  personId?: string;      // Associated person (portrait), null if tree-level
  eventId?: string;       // Associated event (wedding, etc.)
  url: string;            // Cloudflare R2 URL (signed)
  thumbnailUrl?: string;
  description?: string;
  uploadedAt: number;
  isMain?: boolean;       // Is this the main portrait photo?
}

// Sync operation store - Synchronization queue
export interface SyncOperation extends BaseEntity {
  entityType: 'tree' | 'person' | 'relationship' | 'event' | 'photo';
  entityId: string;
  status: 'synced' | 'pending' | 'conflict' | 'error';
  operationId: string;
  baseServerVersion: number;
  dependsOn?: string[];
  payload?: any;
}

// Tree memberships - User permissions on trees
export interface TreeMembership extends BaseEntity {
  treeId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'commenter';
  joinedAt: number;
}

// Tree invitations - Pending invitations
export interface TreeInvitation extends BaseEntity {
  treeId: string;
  email: string;
  tokenHash: string;
  expiresAt: number;
  accepted: boolean;
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