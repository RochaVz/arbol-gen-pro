# ARCHITECTURE.md

## Visión General

ARBOL-GEN-PRO es una aplicación de árbol genealógico colaborativa construida con React, TypeScript y Vite, diseñada para funcionar completamente offline-first y ser instalable como PWA.

### Arquitectura de Capas

```
┌─────────────────────────────────────────────────────┐
│                    Presentación (UI)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Tree View │ │ Person   │ │ Photo    │ │ Share    │ │
│  │ Component │ │ Component │ │ Component │ │ Component │ │
│  └────┬──────┘ └────┬──────┘ └────┬──────┘ └────┬──────┘ │
├─────────────────────────────────────────────────────┤
│                   Lógica de Negocio                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Person   │ │ Tree     │ │ Sync     │ │ Storage  │ │
│  │ Manager  │ │ Manager  │ │ Engine   │ │ Strategy │ │
│  └────┬──────┘ └────┬──────┘ └────┬──────┘ └────┬──────┘ │
├─────────────────────────────────────────────────────┤
│                      Persistencia                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ IndexedDB    │ │ Dexie.js     │ │ Cloudflare   │ │
│  │ (Local)      │ │ (ORM)        │ │ R2 (Remote)  │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. Tree Manager (`src/features/tree/TreeManager`)
Gestiona la estructura del árbol genealógico, incluyendo:
- Agregar/eliminar nodos (personas, relaciones)
- Cambiar generaciones y profundidad
- Navegación por árbol (ascendente/descendente)
- Visualización de ramas familiares

### 2. Person Manager (`src/features/person/PersonManager`)
Gestiona registros de personas:
- Creación, edición, eliminación
- Metadatos (nombre, edad, fecha de nacimiento, etc.)
- Relaciones (padres, hijos, pareja)
- Biografías y notas

### 3. Sync Engine (`src/core/sync/SyncEngine`)
Motor central de sincronización:
- Cola de operaciones pendientes (IndexedDB)
- Procesamiento asíncrono con retries
- Resolución de conflictos (optimistic locking)
- Sincronización con Supabase (PostgreSQL + RLS)

### 4. Storage Strategy (`src/core/storage/DexieStore`)
Gestión de datos locales:
- IndexedDB con Dexie.js
- Esquemas versionados
- Migraciones
- Optimistic updates

### 5. PWA Layer (`src/pwa/ServiceWorker`)
Experiencia instalable:
- Manifest.json
- Service Worker con Workbox
- Cache de recursos estáticos
- Sincronización offline

## Patrones de Diseño

### Result Pattern
```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

### Entity Pattern
```typescript
interface BaseEntity {
  id: string;              // UUID v7
  createdAt: number;
  updatedAt: number;
  serverVersion: number;   // Solo el servidor lo incrementa
  localRevision: number;   // Solo el cliente lo incrementa
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  deletedAt: number | null; // Tombstone. null = la entidad existe
  localOnly?: boolean;
}
```

### Operation Pattern (Sincronización)

La cola local guarda operaciones, no eventos de dominio. Los nombres de campo son
los mismos que en `DATA-MODEL.md` y `SYNC-ARCHITECTURE.md` §5.2.

```typescript
interface SyncOperation {
  operationId: string;        // UUID v7. Clave primaria e idempotencia
  entityType: string;
  entityId: string;
  operationType: 'create' | 'update' | 'delete';
  baseServerVersion: number;  // Versión del servidor sobre la que se hizo el cambio
  payload: Record<string, unknown> | null;
  createdAt: number;          // Informativo: el orden real lo fijan la cola y dependsOn
  status: 'pending' | 'in_flight' | 'confirmed' | 'failed' | 'blocked';
  retryCount: number;
  lastError: string | null;
  dependsOn: string[];        // operationIds que deben confirmarse antes
}
```

## Flujo de Datos

1. **Usuario edita** → componente emite mutación local (optimistic update)
2. **Mutación guardada** → IndexedDB (Dexie) en una **única transacción** con la operación de sync, incrementando `localRevision` (nunca `serverVersion`)
3. **Sync Engine** → envía a la cola `syncOutbox` una operación con `operationId` y `baseServerVersion`
4. **Edge Function** → valida permisos (RLS), comprueba idempotencia y versión, aplica en Postgres
5. **Conflicto?** → si `baseServerVersion` ≠ `serverVersion`, se dispara la resolución
6. **Respuesta** → el cliente actualiza `syncStatus` y, solo con ACK, `serverVersion`

## Cola de Sincronización

- **Ubicación**: store Dexie `syncOutbox` (`core/db/schema.ts`)
- **Estructura**: operaciones `SyncOperation` con `operationId` único (UUID v7) como clave primaria
- **Procesamiento**: `SyncEngine` cada 30 s o al reconectar
- **Reintentos**: Backoff exponencial con jitter (max 5 intentos)
- **Idempotencia**: Cada operación tiene `operationId` único; re-procesarla = no-op (`alreadyProcessed`)
- **Atomicidad**: la entidad y su operación se escriben en la misma transacción; nunca hay un cambio visible sin operación asociada

## Resolución de Conflictos

- **Control**: optimista por `serverVersion`, verificado por el servidor
- **Estrategia**: *siempre manual*. El usuario compara su versión con la del servidor y decide
- **Nunca Last-Write-Wins**: sobrescribir la versión del servidor automáticamente es incompatible con el principio P6
- **No Auto-Merge**: Nunca se fusionan personas basándose solo en similitud
- **Detalle completo**: `SYNC-ARCHITECTURE.md` §11

## PWA y Offline-First

- **Manifest**: Nombre, iconos, theme_color, display: standalone
- **Service Worker**: Workbox para cache de assets, network-first para API
- **BeforeInstallPrompt**: Instrucción para instalar la app
- **Online Detection**: `navigator.onLine` + Service Worker events
- **Background Sync**: Para sincronización automática cuando hay conexión

## Seguridad

- **Row Level Security** en PostgreSQL (backend)
- **Permissions** validadas en servidor (no solo frontend)
- **Secrets** nunca en frontend (VITE_* solo para claves públicas)
- **Photos**: Bucket privado R2, URLs firmadas con expiración 15 min
- **Auditoría**: Logs de acciones sensibles (share, delete, export)

## Despliegue

- **Build**: `npm run build` → genera `dist/` con bundle optimizado
- **PWA**: `npm run build` + `npm run preview` para ver en navegador
- **Production**: Deploy del `dist/` a servidor (Node/PHP/etc.)
- **CI/CD**: Tests unitarios + linting en pipeline

---

## Diagramas

### Arquitectura High-Level
*(Ver diagrama en README.md)*

### Flujo de Sincronización
*(Ver SYNC-ARCHITECTURE.md)*

### Almacenamiento Local
*(Ver STORAGE-STRATEGY.md)*

### Flujo de Datos
*(Ver ARCHITECTURE.md)*

---

*Documentación arquitectónica de ARBOL-GEN-PRO*
*Versión 1.0*
*Arquitecto: Senior Software Engineer (React, TS, PWA, Offline-First)*