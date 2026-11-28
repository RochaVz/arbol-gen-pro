# AI-CONTEXT.md

Instrucciones permanentes para GitHub Copilot y agentes de IA que trabajen en este proyecto.

## Propósito

Este documento establece las reglas arquitectónicas y convenciones que deben respetarse en todo el código generado o modificado en ARBOL-GEN-PRO. Cualquier cambio que viole estas reglas debe ser rechazado o corregido.

---

## 1. Principios Arquitectónicos Inmutables

### 1.1 Offline-First Obligatorio
- **Nunca** escribir código que dependa de conectividad de red para operaciones CRUD básicas.
- Todas las escrituras van **primero** a IndexedDB (Dexie.js).
- La sincronización con Supabase es un proceso **asínnrona y desacoplada**.
- La UI debe reflejar el estado local inmediatamente (optimistic UI).

### 1.2 Privacidad por Diseño
- Los árboles son **privados por defecto**. No existe concepto de "árbol público".
- Compartir requiere invitación explícita y aceptación.
- Los permisos se validan **siempre en el servidor** (RLS).
- **Nunca** filtrar datos por permisos solo en el frontend.

### 1.3 Sin Secretos en Frontend
- **Prohibido** usar `VITE_*` para claves secretas (service_role, claves de Cloudflare R2, JWT secrets).
- Solo clas públicos (anon key) en variables VITE_*.
- Cualquier operación sensible usa Edge Functions / Supabase Functions.

### 1.4 Idempotencia en Sincronización
- Cada operación en la cola de sincronización lleva un **`operationId` único global** (UUID v7 o similar).
- El servidor debe poder recibir la misma operación múltiples veces sin efectos secundarios.
- **Nunca** aplicar Last-Write-Wins: ante una divergencia de `serverVersion` el conflicto se resuelve de forma manual.

### 1.5 No Fusión Automática de Personas
- **Prohibido** fusionar personas basándose solo en nombres, fechas o fotografías.
- La fusión es una acción **manual y explícita** del usuario con confirmación.
- Las sugerencias de duplicados son solo eso: sugerencias.

---

## 2. Convenciones de Código

### 2.1 Estructura de Archivos
```
src/
├── features/           # Módulos por funcionalidad (tree, person, photo, sync, auth, sharing)
│   └── [feature]/
│       ├── components/ # Componentes React específicos
│       ├── hooks/      # Hooks personalizados
│       ├── services/   # Lógica de negocio, Dexie, Supabase
│       ├── types/      # Tipos TypeScript del feature
│       └── index.ts    # Exportaciones públicas
├── shared/             # Código compartido entre features
│   ├── components/     # UI genérica (Button, Modal, Input, etc.)
│   ├── hooks/          # Hooks genéricos (useLocalStorage, useDebounce, etc.)
│   ├── utils/          # Utilidades puras (date, validation, crypto, etc.)
│   └── types/          # Tipos base (Entity, Result, Pagination, etc.)
├── core/               # Configuración y proveedores centrales
│   ├── db/             # Instancia Dexie, esquemas, migraciones
│   ├── supabase/       # Cliente Supabase, tipos de base de datos
│   ├── sync/           # Motor de sincronización (cola, reintentos, conflictos)
│   └── pwa/            # Service Worker, Workbox, registro
```
## 3. Reglas de Seguridad (Cumplimiento Obligatorio)

| Regla | Descripción |
|-------|-------------|
| **SEC-01** | Validar permisos en servidor (RLS) para cada query/mutation. |
| **SEC-02** | No exponer `service_role_key` ni claves de Cloudflare R2 en frontend. |
| **SEC-03** | Fotos: bucket privado, URLs firmadas con expiración corta (15 min). |
| **SEC-04** | Sanitizar inputs en Edge Functions (nunca confiar en cliente). |
| **SEC-05** | Rate limiting en Edge Functions (auth, upload, share). |
| **SEC-06** | Logs de auditoría para acciones sensibles (share, delete, export). |

---

## 4. Flujo de Sincronización (Resumen)

1. Usuario edita → escritura en Dexie (optimistic) → operación `SyncOperation` en la cola `syncOutbox`.
2. La escritura de la entidad y la encolado de la operación ocurren en la **misma transacción**.
3. `SyncEngine` procesa la cola cada 30 s o al detectar online.
4. Envía la operación a la Edge Function `/sync`. **Una operación por petición**: el reintento de una operación no reintenta las demás.
5. Edge Function valida permisos (RLS), comprueba idempotencia por `operationId` y versión, y aplica en Postgres.
6. Respuesta: `{ status: 'applied' | 'alreadyProcessed' | 'conflict' | 'error', operationId, serverVersion?, conflict? }`.
7. Cliente actualiza `syncStatus` y, solo con ACK, `serverVersion`.
8. Conflictos → UI de resolución manual (nunca auto-merge).

---

## 5. Qué NO Hacer (Anti-Patterns)

| Anti-Pattern | Por qué | Alternativa |
|--------------|---------|-------------|
| `fetch()` directo a Supabase REST en componentes | Rompe offline-first, no pasa por cola | Usar `useSyncMutation` hook |
| `localStorage` para datos estructurados | Sin índices, sin transacciones, 5MB límite | Dexie.js (IndexedDB) |
| `useEffect` para sincronización | Race conditions, difícil testear | `SyncEngine` singleton + eventos |
| Guardar blobs/base64 en IndexedDB | Infla DB, lento, bloquea UI | Guardar `File`/`Blob` en `photos` store, referenciar por id |
| `console.log` en producción | Fuga de datos sensibles | `logger` wrapper con nivel configurable |

---

## 6. Checklist para PRs Generados por IA

Antes de proponer código, verificar:

- [ ] ¿Escribe primero en Dexie y luego encola para sync?
- [ ] ¿Usa `Result<T, E>` para manejo de errores?
- [ ] ¿Incluye `version` y `syncStatus` en entidades?
- [ ] ¿Valida permisos via RLS (no solo frontend)?
- [ ] ¿Evita `any`, `!`, `console.log`?
- [ ] ¿Sigue la estructura `features/` + `shared/` + `core/`?
- [ ] ¿Incluye tipos TypeScript estrictos?
- [ ] ¿No fusiona personas automáticamente?
- [ ] ¿Maneja conflictos de sync explícitamente?
- [ ] ¿Testea con `npm run lint` y `npm run build` sin errores?

---

## 7. Referencias Rápidas

- **DATA-MODEL.md** - Entidades, relaciones, constraints
- **SYNC-ARCHITECTURE.md** - Cola, reintentos, idempotencia, conflictos
- **STORAGE-STRATEGY.md** - Almacenamiento local de fotos originales, miniaturas, versiones
- **SECURITY.md** - Medidas de seguridad y privacidad
- **ARCHITECTURE.md** - Visión general, diagramas de flujo
- **DECISIONS.md** - Decisiones tomadas y pendientes

---

## 8. Definiciones de Términos

- **Offline-First**: La aplicación funciona perfectamente sin conexión. Todo cambio se guarda localmente y se sincroniza cuando hay conexión.
- **Sync Engine**: Componente central que gestiona la cola de operaciones, reintentos y resolución de conflictos.
- **Conflict Resolution**: Mecanismo para resolver discrepancias cuando dos usuarios modifican la misma entidad simultáneamente.
- **Optimistic UI**: Mostrar cambios inmediatamente en la UI sin esperar la sincronización real.

---

*Este documento es de cumplimiento obligatorio. Cualquier desviación requiere justificación arquitectónica documentada en DECISIONS.md.*