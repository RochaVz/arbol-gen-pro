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
  id: string;           // UUID v7
  createdAt: number;
  updatedAt: number;
  version: number;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  localOnly?: boolean;
}
```

### Event Pattern (Synchronization)
```typescript
interface DomainEvent<T = unknown> {
  eventId: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: T;
  timestamp: number;
  userId: string;
  vectorClock?: Record<string, number>;
}
```

## Flujo de Datos

1. **Usuario edita** → componente emite mutación local (optimistic update)
2. **Mutación guardada** → IndexedDB (Dexie) con `version` incrementada
3. **Sync Engine** → detecta cambio, envía a cola `outbox`
4. **Edge Function** → valida permisos (RLS), aplica en Postgres
5. **Conflicto?** → Si versión no coincide, se dispara resolución
6. **Respuesta** → Client actualiza `syncStatus` y `version`

## Cola de Sincronización

- **Ubicación**: `src/shared/store/syncOutbox` (IndexedDB)
- **Estructura**: Array de `DomainEvent` con `id` único (UUID v7)
- **Procesamiento**: `SyncEngine.processBatch()` cada 30s o al reconectar
- **Reintentos**: Backoff exponencial (max 5 intentos)
- **Idempotencia**: Cada evento tiene `eventId` único; re-procesar = no-op

## Resolución de Conflictos

- **Vector Clock**: Para detectar orden causal entre operaciones concurrentes
- **Strategies**:
  - *Last-Write-Wins*: Si version del servidor > versión local
  - *Merge Manual*: UI para elegir versión ganadora
  - *Reject Local*: Si local está desactualizado
- **No Auto-Merge**: Nunca se fusionan personas basándose solo en similitud

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