# DATA-MODEL.md

## Modelo de Datos - ARBOL-GEN-PRO (Reingenerizado)

> **Basado en la reingeniería FASE 2 de `ROADMAP-REINGENIERIA.md`**: esquema simplificado a 5 tablas máx, cada entidad con ≤7 campos base (sin campos de sync).

Este documento define las entidades, sus relaciones, restricciones y el esquema de base de datos para IndexedDB (Dexie.js) y PostgreSQL (Supabase).

> **Reconciliado con `SYNC-ARCHITECTURE.md`** (ROADMAP.md, Fase 1). La terminología de versiones e identidad de operaciones es ahora **idéntica** en ambos documentos. En caso de duda, manda `SYNC-ARCHITECTURE.md` para todo lo relativo a sincronización.

---

## Tipos Base

```typescript
// shared/types/common.ts

type UUID = string;  // Formato UUID v7

/**
 * Campos comunes a toda entidad sincronizable.
 *
 * `serverVersion` y `localRevision` NO son intercambiables:
 * - `serverVersion` solo lo incrementa el SERVIDOR.
 * - `localRevision` solo lo incrementa el CLIENTE.
 * Ver "Versionado y Control de Concurrencia".
 */
interface BaseEntity {
  id: UUID;
  createdAt: number;        // Informativo: reloj local, no ordena nada
  updatedAt: number;        // Informativo: reloj local, no ordena nada
}

interface Result<T, E = AppError> {
  ok: boolean;
  value?: T;
  error?: E;
}

class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### PartialDate (Fecha Parcial)

```typescript
interface PartialDate {
  year: number;                  // Obligatorio
  month?: number;                // 1-12
  day?: number;                  // 1-31
  qualifier?: 'circa' | 'before' | 'after';
  rangeEnd?: PartialDate;        // Para rangos (ej. 1900-1910)
  calendar?: 'gregorian' | 'julian' | 'hebrew' | 'islamic';
}
```

### Place (Lugar)

```typescript
interface Place {
  name: string;                  // Nombre completo del lugar
  city?: string;
  parish?: string;
  region?: string;               // Estado, provincia
  country?: string;              // Código ISO 3166-1 alpha-2
  coordinates?: [number, number]; // [lat, lng]
  geonamesId?: string;
}
```

---

## Entidades

### Tree (Árbol genealógico (simplificado))

```typescript
interface Tree extends BaseEntity {
  name: string;
  description?: string;
}
```

### Person (Persona)

```typescript
/**
 * Estado de vida. Deliberadamente explícito: NUNCA se infiere a partir
 * de la ausencia de `deathDate`. Una persona de la que no se sabe si
 * falleció es 'unknown', no 'alive'.
 */
interface Person extends BaseEntity {
  treeId: UUID;
  firstName: string;
  lastName?: string;
  sex?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: PartialDate;
  deathDate?: PartialDate;
  // lifeStatus ya no es un campo separado; se infiere de la presencia/ausencia de deathDate
  birthplace?: Place;
  deathPlace?: Place;
  biography?: string;
  notes?: string;
}
```

### Relationship (Relación familiar)

```typescript
type RelationshipType =
  | 'parent-child'
  | 'spouse'
  | 'sibling'
  | 'adoptive'
  | 'stepparent'
  | 'adoptive';

interface Relationship extends BaseEntity {
  treeId: UUID;
  person1Id: UUID;
  person2Id: UUID;
  type: RelationshipType;
  startDate?: PartialDate;
}
```

### Event (Evento de vida (simplificado))

```typescript
type EventType =
  | 'birth' | 'baptism' | 'marriage' | 'death' | 'burial';

interface Event extends BaseEntity {
  treeId: UUID;
  personIds: UUID[];
  type: EventType;
  title?: string;
  date?: PartialDate;
  place?: Place;
}
```

### Photo (Fotografía (simplificado))

```typescript
type PhotoKind = 'optimized' | 'thumbnail';

interface Photo extends BaseEntity {
  treeId: UUID;
  personId?: UUID;
  eventId?: UUID;
  kind?: PhotoKind;       // Para blobs locales (fotoOptimizada, fotoMiniatura)
  width: number;
  height: number;
  mimeType: string;
  sizeBytes: number;
  isPrimary: boolean;     // Retrato principal de la persona
}
```

### TreeMembership (Membresía) y TreeInvitation (Invitación)

Son **entidades distintas**. La invitación es temporal y lleva un token; la membresía es permanente y referencia a un usuario ya autenticado.

```typescript
/**
 * Roles. El conjunto final está pendiente de decisión (F3 en ROADMAP.md):
 * `REQUIREMENTS.md` RF-09.2 enumera los cinco, mientras que
 * `SYNC-ARCHITECTURE.md` §17.1 asume `owner`, `editor` y `viewer`.
 */
interface TreeMembership {
  treeId: UUID;
  userId: UUID;
}

interface TreeInvitation {
  treeId: UUID;
  invitedEmail: string;
  tokenHash: string;
  expiresAt: number;
}
```

---

## SyncOperation (Operación de la cola local)

La cola local vive en el store Dexie `syncOutbox`. **No es la tabla del servidor**: el servidor mantiene un registro distinto de operaciones ya procesadas (§10.1 de `SYNC-ARCHITECTURE.md`).

```typescript
type OperationType = 'create' | 'update' | 'delete';

type OperationStatus =
  | 'pending'     // Encolada, todavía no enviada
  | 'in_flight'   // Enviada, se espera la respuesta
  | 'confirmed'   // El servidor confirmó (applied / alreadyProcessed)
  | 'failed'      // Error permanente o intentos agotados. Se conserva
  | 'blocked';    // Conflicto (409) pendiente de decisión del usuario

> **Principio FASE 4 de `ROADMAP-REINGENIERIA.md`**: simplicidad o eliminación de sincronización. Para el MVP, local-first puro.

No hay operación `SyncOperation` definida en el esquema base.
  operationId: UUID;                    // CLAVE PRIMARIA. Clave de idempotencia
  entityType: EntityType;
  entityId: UUID;
  operationType: OperationType;
  baseServerVersion: number;            // 0 = la entidad aún no existe en el servidor
  payload: Record<string, unknown> | null; // null en 'delete'
  createdAt: number;                    // Informativo: el orden real lo fijan la cola y dependsOn
  status: OperationStatus;
  retryCount: number;
  lastError: string | null;             // Sin datos personales
  dependsOn: UUID[];                    // Operaciones que deben confirmarse antes
}
```

> `operationId` es la **única** clave. No existe un `id` adicional ni un `eventId`: dos identificadores para la misma operación obligarían a decidir cuál es la clave y complicarían la deduplicación en el servidor.

---

## Diagrama Entidad-Relación (Mermaid)

```mermaid
erDiagram
    TREE ||--o{ PERSON : contains \
    TREE ||--o{ RELATIONSHIP : has \
    TREE ||--o{ PHOTO : stores \
    TREE ||--o{ EVENT : contains \

    PERSON ||--o{ RELATIONSHIP : person1 \
    PERSON ||--o{ RELATIONSHIP : person2 \
    PERSON ||--o{ PHOTO : portrait \
    PERSON ||--o{ EVENT : participant \

    PHOTO }|--|| EVENT : event_photos
```

### Constraints de Negocio (simplificado)

| Entidad | Constraint | Descripción |
|---------|------------|-------------|
| Person | `treeId` + `id` único | Una persona pertenece a un solo árbol |
| Relationship | `person1Id` + `person2Id` distintos | No auto-relación |
| Relationship | Tipo `parent-child` → `person1` es padre/madre | Dirección semántica |
| Photo | `treeId` + `id` único | Cada foto pertenece a un árbol |


### Índices Recomendados (PostgreSQL / Dexie - simplificado)

```sql
-- PostgreSQL (Supabase)
CREATE INDEX idx_person_tree_id ON person(tree_id);
CREATE INDEX idx_person_name ON person USING gin(to_tsvector('spanish', first_name || ' ' || last_name));
CREATE INDEX idx_relationship_tree ON relationship(tree_id);
CREATE INDEX idx_relationship_persons ON relationship(person1_id, person2_id);
CREATE INDEX idx_photo_tree ON photo(tree_id);
CREATE INDEX idx_photo_person ON photo(person_id);
CREATE INDEX idx_event_tree ON event(tree_id);

-- Dexie.js (IndexedDB) - definido en stores
```

---

## Esquema Dexie.js (IndexedDB - simplificado)

> **Basado en la reingeniería FASE 2**: esquema reducido a 5 tablas máx, sin campos de sync (`serverVersion`, `syncStatus`, `deletedAt`, `localRevision`).

```typescript
// core/db/schema.ts
import { Dexie, type Table } from 'dexie';

export const db = new Dexie('arbol-gen-pro');

db.version(1).stores({
  trees: 'id, name, createdAt, updatedAt',
  persons: 'id, treeId, firstName, lastName, birthDate, deathDate, createdAt, updatedAt',
  relationships: 'id, treeId, person1Id, person2Id, type, createdAt, updatedAt',
  events: 'id, treeId, type, createdAt, updatedAt',
  photos: 'id, treeId, personId, eventId, kind, createdAt, updatedAt',
  // Ya no hay treeMemberships, treeInvitations, syncOutbox, photoBlobs
  // Sincronización: local-first puro, no cola de operaciones compleja
});
```

**Notas sobre los índices:**

---

## Migraciones de Esquema

| Versión | Cambios |
|---------|---------|
| 1 | Esquema inicial simplificado (trees, persons, relationships, events, photos) |
| 2 | *Futuro*: posible añadir `branchRestriction` a `trees` (si es necesario) |

---

## Versionado y Control de Concurrencia (simplificado)

> **Principio FASE 2 de `ROADMAP-REINGENIERIA.md`**: Datos simples. Eliminar versionado, sincronización de operaciones, conflictos y tombstones. Solo `createdAt` / `updatedAt`.

Para el MVP local-first, **no hay versionado ni control de concurrencia en el esquema Dexie**. El control de concurrencia se delega al servidor cuando haya sincronización remota, pero para la operación offline:

- `localRevision`: contador opcional que el cliente puede usar internamente para detectar escrituras locales encadenadas, **no** se persiste en el esquema base.
- `serverVersion`: **no** forma parte del esquema Dexie del MVP. Se añadiría solo si se conecta con Supabase.
- `syncStatus`: **no** forma parte del esquema Dexie del MVP. La app funciona completamente offline.
- `deletedAt`: **no** forma parte del esquema Dexie del MVP. El borrado lógico no es necesario cuando los datos se quedan en el dispositivo.

> **Ya no hay "Nombres canónicos"** sincronizados entre `DATA-MODEL.md` y `SYNC-ARCHITECTURE.md` para el MVP: el esquema es simple y no requiere campos de sincronización.

---

*Modelo de datos de ARBOL-GEN-PRO*
*Versión 2.0 — reconciliado con `SYNC-ARCHITECTURE.md` (ROADMAP.md, Fase 1)*
*Compatible con IndexedDB (Dexie.js) y PostgreSQL (Supabase)*


- `syncOutbox` se indexa por `operationId` (clave primaria), por `status` (recuperar pendientes y fallidas), por el compuesto `[entityType+entityId]` (operaciones que afectan a una entidad) y por `createdAt` (ordenación cronológica de la cola).
- El índice `[entityType+entityId]` **no garantiza unicidad**: ese papel es de `operationId`.
- `localRevision` **no se indexa**: nunca se consulta, solo se usa para detectar escrituras locales encadenadas.
- `deletedAt` se indexa para localizar tombstones pendientes de purga.

