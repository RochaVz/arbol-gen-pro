# ROADMAP DE REINGENIERÍA — Simplificación de ARBOL-GEN-PRO

**Objetivo:** Simplificar al máximo la arquitectura, hacer la app más ligera y muy fácil de usar. Eliminar duplicación, reducir complejidad innecesaria y dejar solo lo esencial.

---

## 1. ESTADO ACTUAL — Problemas Identificados

Tras revisar todos los componentes del repositorio, se detectaron los siguientes problemas de arquitectura:

### 1.1 Duplicación de componentes (V1 vs V2)

| Componente | V1 (legacy) | V2 (nuevo) | Estado |
|------------|-------------|------------|--------|
| Button | `src/shared/components/ui/Button.tsx` | `src/shared/components/ui/ButtonV2.tsx` | Duplicado |
| Card | `src/shared/components/ui/Card.tsx` | `src/shared/components/ui/CardV2.tsx` | Duplicado |
| Input | `src/shared/components/ui/Input.tsx` | `src/shared/components/ui/InputV2.tsx` | Duplicado |
| Drawer | `src/shared/components/ui/Drawer.tsx` | `src/shared/components/ui/Drawer.tsx.fixed` | Duplicado |
| Sidebar | `src/shared/components/SideNav.tsx` | `src/shared/components/ui/SidebarV2.tsx` | Duplicado |
| ReactFlowTree | `src/shared/components/ReactFlowTree.tsx` (444 líneas, funcional) | `src/features/family-tree/components/ReactFlowTree.tsx` (stub, devuelve null) | Duplicado |

### 1.2 Dos sistemas de diseño

- **CSS custom**: `tokens.css`, `typography.css`, `utilities.css`, `reset.css` con variables CSS propias.
- **Tailwind CSS**: clases de utilidad usadas en la mayoría de componentes.
- Resultado: inconsistencia visual y bundle más grande.

### 1.3 Capa de datos sobre-ingenierizada (Dexie/IndexedDB)

- 11 tablas: `trees`, `persons`, `relationships`, `events`, `photos`, `syncOutbox`, `treeMemberships`, `treeInvitations`, `photoBlobs`, `auditLog`, `conflictSnapshots`.
- Cada entidad lleva: `serverVersion`, `localRevision`, `syncStatus`, `deletedAt`, `localOnly`, `createdAt`, `updatedAt`.
- Escritura transaccional obligatoria (entidad + operación de sincronización juntas).
- Lógica de cascada/desvinculación compleja (`desvincularPerson`).

### 1.4 Motor de sincronización sobre-ingenierizado

- 6 archivos: `syncClient.ts`, `syncEngine.ts`, `conflictResolution.ts`, `pullClient.ts`, `realtime.ts`, `index.ts`.
- Cola de operaciones con estados: `pending`, `in_flight`, `confirmed`, `failed`, `blocked`.
- Resolución manual de conflictos con snapshots del servidor.
- Suscripciones en tiempo real (realtime) que disparan `pullChanges`.
- Background sync, retry con backoff exponencial, idempotencia por `operationId`.

### 1.5 Store monolítico (Zustand)

`src/store.ts` hace demasiado a la vez:
- Estado de árboles, personas, relaciones, eventos, fotos.
- Operaciones CRUD (`addParent`, `addChild`, `cleanAll`, `load`).
- Gestión de URLs de fotos (blobs de IndexedDB).
- Historial de deshacer/rehacer (`HistoryService`).
- Estados de carga y error globales.

### 1.6 Dependencias pesadas

- `reactflow` (bundle grande).
- `framer-motion` (animaciones en todo el layout).
- `i18next` + `react-i18next` + `i18next-browser-languagedetector`.
- `dexie` (IndexedDB con esquema complejo).
- `@supabase/supabase-js`.
- `workbox` / `vite-plugin-pwa` (PWA con Service Worker).

### 1.7 UI sobre-cargada

- `PremiumLayout` con `framer-motion`, modal de autenticación, wizard de creación, dos layouts (desktop sidebar + mobile).
- Animaciones en entrada/salida de páginas, colapso de sidebar, etc.

---

## 2. PRINCIPIOS DE LA REINGENIERÍA

1. **Una sola versión de cada cosa**: eliminar V1/V2, quedarse con la más limpia (V2).
2. **Una sola fuente de estilos**: Tailwind CSS, eliminar CSS custom.
3. **Datos simples**: eliminar versionado, sincronización de operaciones, conflictos y tombstones. Solo `createdAt` / `updatedAt`.
4. **Estado dividido**: store separado por dominio (árbol, persona, UI) en vez de un store monolítico.
5. **Sincronización simple o ausente**: para el MVP, local-first puro. Sincronización remota opcional y simple (timestamp-based).
6. **UI ligera**: eliminar `framer-motion` donde no sea crítico, layout simple.
7. **Menos dependencias**: eliminar lo que no se use activamente.

---

## 3. ROADMAP DE IMPLEMENTACIÓN

Cada fase tiene un criterio de aceptación verificable con `npm run lint`, `npm run build` y `npm run test`.

---

### FASE 1 — Auditoría y eliminación de duplicación

**Objetivo:** Quedarse con una sola versión de cada componente y un solo sistema de diseño.

| Tarea | Descripción |
|-------|-------------|
| 1.1 | Eliminar `Button.tsx`, `Card.tsx`, `Input.tsx` (V1). Mantener solo V2. |
| 1.2 | Eliminar `Drawer.tsx.fixed`, mantener `Drawer.tsx`. |
| 1.3 | Eliminar `SideNav.tsx`, mantener solo `SidebarV2.tsx`. |
| 1.4 | Eliminar `src/features/family-tree/components/ReactFlowTree.tsx` (stub). Mantener solo el de `shared/components`. |
| 1.5 | Eliminar CSS custom del design-system (`tokens.css`, `typography.css`, `utilities.css`, `reset.css`) o reducir a variables de color mínimas. Usar Tailwind para todo. |
| 1.6 | Limpiar `src/shared/components/ui/index.ts` para exportar solo los componentes finales. |
| 1.7 | Revisar `package.json` y eliminar dependencias no usadas (ver Fase 5). |

**Criterio de aceptación:**
- No hay archivos `*V1.tsx` ni `*.fixed` ni duplicados funcionales.
- `npm run build` pasa sin errores.
- `npm run lint` pasa con 0 errores.

---

### FASE 2 — Simplificación de la capa de datos

**Objetivo:** Reducir el esquema de Dexie a lo esencial para una app local-first simple.

| Tarea | Descripción |
|-------|-------------|
| 2.1 | Reducir tablas a: `trees`, `persons`, `relationships`, `events`, `photos`. Eliminar `syncOutbox`, `treeMemberships`, `treeInvitations`, `photoBlobs`, `auditLog`, `conflictSnapshots`. |
| 2.2 | Simplificar interfaz `BaseEntity`: solo `id`, `createdAt`, `updatedAt`, `deletedAt` (tombstone suave opcional). Eliminar `serverVersion`, `localRevision`, `syncStatus`, `localOnly`. |
| 2.3 | Simplificar `Person`, `Relationship`, `Event`, `Photo`, `Tree` quitando campos de sincronización. |
| 2.4 | Simplificar repositorios: `getById`, `list`, `create`, `update`, `delete` (soft delete con `deletedAt`). Eliminar la escritura transaccional entidad+operación. |
| 2.5 | Eliminar `desvincularPerson` (cascade) o simplificarlo a borrado suave de la persona sin tocar relaciones. |
| 2.6 | Eliminar `writeLocal`, `writeEntityWithOperation`, `enqueueOperation` de `operations.ts`. |
| 2.7 | Actualizar `src/core/db/index.ts` para exportar solo lo simplificado. |

**Criterio de aceptación:**
- El esquema Dexie tiene ≤ 5 tablas.
- Cada entidad tiene ≤ 7 campos base (sin campos de sync).
- `npm run build` y `npm run test` pasan.

---

### FASE 3 — Simplificación del estado (Zustand)

**Objetivo:** Dividir el store monolítico en stores enfocados por dominio.

| Tarea | Descripción |
|-------|-------------|
| 3.1 | Crear `src/store/treeStore.ts`: árboles activos, lista de árboles. |
| 3.2 | Crear `src/store/personStore.ts`: personas, relaciones, eventos, fotos del árbol activo. CRUD simple. |
| 3.3 | Crear `src/store/uiStore.ts`: modo oscuro, árbol activo seleccionado, toasts/notificaciones, estado de carga global. |
| 3.4 | Eliminar `HistoryService` (deshacer/rehacer) o dejarlo como opcional fuera del store principal. |
| 3.5 | Eliminar gestión de blob URLs de fotos del store. Manejar fotos como URLs simples. |
| 3.6 | Eliminar `src/store.ts` (el monolítico). |
| 3.7 | Actualizar todos los componentes y páginas para usar los nuevos stores. |

**Criterio de aceptación:**
- No existe `src/store.ts`.
- Cada store tiene una responsabilidad clara y limitada.
- `npm run build` y `npm run test` pasan.

---

### FASE 4 — Simplificación o eliminación de sincronización

**Objetivo:** Quitar la complejidad del motor de sincronización. Para el MVP, local-first puro.

| Tarea | Descripción |
|-------|-------------|
| 4.1 | Eliminar `src/core/sync/syncClient.ts`, `syncEngine.ts`, `conflictResolution.ts`, `pullClient.ts`, `realtime.ts`. |
| 4.2 | Eliminar `src/core/sync/index.ts`. |
| 4.3 | Eliminar referencias a `syncEngine`, `startRealtimeSync`, `stopRealtimeSync` en `src/App.tsx`. |
| 4.4 | Simplificar `src/core/supabase/client.ts` a solo crear el cliente (opcional, para uso futuro). |
| 4.5 | Mantener `supabase` disponible pero sin sincronización automática. El usuario puede exportar/importar JSON manualmente (ya existe en SettingsPage). |

**Criterio de aceptación:**
- La carpeta `src/core/sync/` no existe o está vacía.
- `App.tsx` no importa nada de sincronización.
- `npm run build` y `npm run test` pasan.
- La app funciona 100% offline sin configuración de Supabase.

---

### FASE 5 — Limpieza de dependencias

**Objetivo:** Reducir el tamaño del bundle eliminando dependencias innecesarias.

| Tarea | Descripción |
|-------|-------------|
| 5.1 | Evaluar si `framer-motion` es esencial. Si no, eliminarlo y usar CSS transitions simples. |
| 5.2 | Evaluar `i18next` stack. Si la app es solo en español, eliminar o dejar como opcional. |
| 5.3 | Evaluar `reactflow`: es el núcleo del árbol genealógico, mantenerlo. |
| 5.4 | Evaluar `dexie`: mantener (IndexedDB es útil para local-first). |
| 5.5 | Evaluar `@supabase/supabase-js`: mantener para uso futuro opcional. |
| 5.6 | Eliminar `browser-image-compression` si no se usa activamente. |
| 5.7 | Evaluar `vite-plugin-pwa` / `workbox`: mantener si se quiere PWA, simplificar configuración. |
| 5.8 | Actualizar `package.json` y `npm install`. |

**Criterio de aceptación:**
- `npm run build` genera un bundle más pequeño que antes.
- No hay dependencias huérfanas.
- `npm run build` pasa sin errores.

---

### FASE 6 — Simplificación de la UI y layout

**Objetivo:** Interfaz limpia, fácil de usar, sin animaciones innecesarias.

| Tarea | Descripción |
|-------|-------------|
| 6.1 | Reemplazar `PremiumLayout` por un `AppLayout` simple (sidebar + header + contenido). |
| 6.2 | Eliminar `framer-motion` del layout (motion.div, AnimatePresence, etc.). Usar CSS transitions nativas de Tailwind. |
| 6.3 | Eliminar modal de autenticación y wizard de creación de árboles del layout. Mover a páginas dedicadas simples. |
| 6.4 | Simplificar `HomePage`, `TreePage`, `PersonPage`, `FamilyPage`, `PhotosPage`, `SettingsPage`, `HelpPage`. |
| 6.5 | Unificar `TreeSelector` y lógica de árbol activo en un solo lugar. |
| 6.6 | Mantener `EmptyState`, `ErrorBoundary`, `Toast` como componentes UI simples. |

**Criterio de aceptación:**
- No hay `framer-motion` en componentes de layout (opcional en páginas específicas).
- Un solo layout (`AppLayout`) usado por todas las páginas.
- Navegación intuitiva: Inicio → Árbol → Persona/Familia/Fotos → Configuración.

---

### FASE 7 — Pruebas, validación y documentación

**Objetivo:** Asegurar que la app simplificada funciona correctamente.

| Tarea | Descripción |
|-------|-------------|
| 7.1 | Ejecutar `npm run lint`, `npm run build`, `npm run test` — todos deben pasar. |
| 7.2 | Probar flujo completo: crear árbol → agregar persona → agregar relación → ver en árbol → ver perfil → editar → eliminar. |
| 7.3 | Probar offline: desconectar red, operar, verificar que todo funciona localmente. |
| 7.4 | Probar exportación/importación de JSON (SettingsPage). |
| 7.5 | Medir tamaño del bundle y comparar con versión original. |
| 7.6 | Actualizar `README.md` con la arquitectura simplificada. |
| 7.7 | Crear `ARCHITECTURE-SIMPLE.md` documentando la nueva arquitectura. |

**Criterio de aceptación:**
- Todos los comandos pasan en verde.
- Flujo completo funcional sin errores de consola.
- Documentación actualizada.

---

## 4. CRITERIOS DE ACEPTACIÓN GLOBALES (Definition of Done)

| # | Criterio | Comando de verificación |
|---|----------|------------------------|
| 1 | Sin componentes duplicados (V1/V2) | `grep -r "V1\|V2\|\.fixed" src/` debe estar vacío |
| 2 | Un solo sistema de estilos (Tailwind) | `src/shared/design-system/` reducido o sin CSS custom |
| 3 | Esquema de datos simple (≤5 tablas, sin campos de sync) | Revisar `src/core/db/schema.ts` y `database.ts` |
| 4 | Sin motor de sincronización complejo | Carpeta `src/core/sync/` eliminada |
| 5 | Store dividido por dominio, sin store monolítico | `src/store.ts` no existe |
| 6 | Build, lint y test en verde | `npm run lint && npm run build && npm run test` |
| 7 | App funciona 100% offline | Desconectar red, crear/editar/eliminar, verificar |
| 8 | Bundle más ligero que la versión original | Comparar `dist/` antes y después |

---

## 5. CAMINO CRÍTICO (orden de ejecución)

```
FASE 1 (Duplicación) → FASE 2 (Datos) → FASE 3 (Estado) → FASE 4 (Sync) → FASE 5 (Dependencias) → FASE 6 (UI) → FASE 7 (Validación)
```

- **Fase 1** debe ir primero porque elimina código que las fases posteriores no deberían tocar.
- **Fase 2** simplifica los datos antes de tocar el estado (Fase 3).
- **Fase 4** elimina la sincronización que depende del esquema de datos (Fase 2).
- **Fase 5** puede ejecutarse en paralelo con la 6, pero es mejor después de saber qué dependencias se usan realmente.
- **Fase 6** depende de que los stores y datos estén simplificados (Fases 2 y 3).
- **Fase 7** valida todo al final.

---

## 6. ESTIMACIÓN DE ESFUERZO

| Fase | Complejidad | Tiempo estimado |
|------|-------------|-----------------|
| Fase 1 — Duplicación | Baja | 1-2 días |
| Fase 2 — Datos | Media | 2-3 días |
| Fase 3 — Estado | Media | 2-3 días |
| Fase 4 — Sincronización | Baja | 1-2 días |
| Fase 5 — Dependencias | Baja | 1 día |
| Fase 6 — UI | Media | 3-5 días |
| Fase 7 — Validación | Baja | 1-2 días |
| **Total** | | **~11-18 días** |

---

## 7. RIESGOS Y MITACIONES

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Perder funcionalidad de sincronización remota | Medio | La app sigue funcionando local-first. La sincronización se puede añadir después como capa separada. |
| Perder deshacer/rehacer (undo/redo) | Bajo | Es funcionalidad avanzada que no es esencial para el MVP. Se puede reañadir después. |
| Romper páginas existentes al cambiar stores | Alto | Probar cada página después de migrarla al nuevo store. |
| Perder animaciones de entrada | Bajo | Se reemplazan por CSS transitions simples de Tailwind. |

---

## 8. PRÓXIMOS PASOS INMEDIATOS

1. **Revisar y aprobar este roadmap** con el equipo/producto.
2. **Iniciar Fase 1**: eliminar componentes duplicados (V1/V2).
3. **Crear rama** `refactor/simplificacion` para trabajar aislado de `main`.
4. **Validar después de cada fase** con `npm run lint && npm run build && npm run test`.

---

*Documento generado como parte de la reingeniería de arquitectura de ARBOL-GEN-PRO. Fecha: 23/11/2026.*
