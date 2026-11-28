# Auditoría inicial

**Fecha:** 2026-11-27  
**Alcance:** repositorio completo, aplicación React/TypeScript, persistencia local Dexie/IndexedDB y backend Supabase.  
**Método:** inspección del código versionado, migraciones, configuración y ejecución de lint, pruebas y build. Los documentos históricos se trataron como contexto, no como evidencia de comportamiento.

## 1. Resumen ejecutivo

El proyecto es una aplicación genealógica offline-first basada en React 19, TypeScript, Zustand, Dexie/IndexedDB y Supabase. La arquitectura local incorpora UUID v7, revisiones locales, outbox transaccional, tombstones, sincronización, realtime y resolución manual de conflictos.

La base funcional es aprovechable, pero no está preparada para producción. Existen riesgos críticos de autorización en la función de sincronización y riesgos altos de pérdida u omisión de cambios en el protocolo de pull. También hay divergencias de modelo, cascadas incompletas, escritura directa desde UI/estado, telemetría insuficiente, ausencia de CI y cobertura no medida.

### Línea base verificada

| Área | Resultado |
| --- | --- |
| Archivos versionados | 233 |
| Pruebas | 15 archivos, 63 pruebas, todas aprobadas |
| Duración de pruebas | 63,33 s |
| Build TypeScript + Vite | Aprobado |
| Bundle JS principal | 1.034,72 kB minificado / 315,05 kB gzip |
| Precache PWA | 11 entradas / 1.102,27 KiB |
| Lint | Aprobado con 9 advertencias |
| Cobertura | No configurada ni medida |
| CI | No se encontró workflow |

## 2. Arquitectura actual

### 2.1 Cliente

- React y React Flow para UI y visualización del árbol.
- Zustand para estado global y operación del historial UI.
- Repositorios y operaciones Dexie para persistencia local.
- IndexedDB contiene árboles, personas, relaciones, eventos, fotos, blobs, membresías, invitaciones, outbox, snapshots de conflicto y audit log.
- Los hooks de Dexie asignan timestamps, revisiones, estado de sincronización y tombstones.

Evidencia principal:

- `src/core/db/database.ts`
- `src/core/db/schema.ts`
- `src/core/db/operations.ts`
- `src/core/db/repositories.ts`
- `src/store.ts`
- `src/store/personStore.ts`

### 2.2 Sincronización

1. Una mutación local escribe entidad y operación de outbox en una transacción IndexedDB.
2. `SyncEngine` selecciona operaciones pendientes con dependencias confirmadas.
3. Marca una operación como `in_flight` y la envía a la Edge Function `/sync`.
4. La función valida el token, comprueba versiones y membresía, escribe mediante service role y registra la operación.
5. El cliente obtiene cambios mediante `/pull`.
6. La carga se dispara también por realtime, intervalos, eventos online y focus.

Evidencia principal:

- `src/core/db/operations.ts`
- `src/core/sync/syncEngine.ts`
- `src/core/sync/syncClient.ts`
- `src/core/sync/pullClient.ts`
- `src/core/sync/realtime.ts`
- `supabase/functions/sync/index.ts`
- `supabase/functions/pull/index.ts`

### 2.3 Modelo de dominio

| Concepto solicitado | Implementación actual |
| --- | --- |
| Person | `Person` local y tabla `persons` remota |
| Family | Modelado como `Tree`; no existe una entidad `Family` separada |
| Relationship | `Relationship`; admite dos pares incompatibles de extremos |
| Media | `Photo` más `PhotoBlob`; no existe una entidad `Media` única |
| User | Supabase Auth; no existe modelo de usuario de aplicación |
| Invitation | `TreeInvitation` y `tree_invitations` |
| Conflict | Estado bloqueado de outbox + `conflictSnapshots`; no es entidad de dominio |
| SyncQueue | `SyncOperation` en `syncOutbox` |

## 3. Fortalezas

1. **Persistencia offline-first real.** Las escrituras locales y el outbox se realizan en una transacción.
2. **UUID v7 implementado.** La base usa identificadores aptos para generación distribuida, aunque existen excepciones en llamadas de UI.
3. **Control de concurrencia optimista.** Las entidades llevan versiones de servidor y revisiones locales.
4. **Tombstones presentes.** La mayoría de entidades incluye `deletedAt` y los listados principales filtran eliminados.
5. **Recuperación básica de sync.** Las operaciones `in_flight` pasan a pendientes al reiniciar.
6. **RLS habilitado.** Las migraciones contienen políticas para árboles y entidades principales.
7. **Idempotencia prevista.** Existe `processed_operations` con operación como identidad lógica.
8. **Tests funcionales existentes.** Hay pruebas de repositorios, cascada, conflictos, persistencia, UUID, fotos y UI.
9. **TypeScript estricto.** La configuración activa comprobaciones estrictas y detección de variables y parámetros sin uso.
10. **Build reproducible en baseline.** Lint, tests y build terminan sin errores en el estado inspeccionado.

## 4. Debilidades

### 4.1 Dominio y arquitectura

- No hay frontera de dominio explícita entre entidades, infraestructura y UI.
- La UI y Zustand importan repositorios Dexie directamente.
- `personStore` mantiene una segunda ruta de mutación en memoria y declara ausencia de lógica de sync.
- `Person` existe en repositorio y estado con contratos distintos.
- `Relationship` admite `personId/relativeId` y `person1Id/person2Id`; no se garantiza una representación canónica.
- El esquema TypeScript contiene campos de `Person` que no aparecen en SQL (`occupation`, `characteristics`).
- Las responsabilidades de cascada, sync y repositorio están acopladas.
- Los tipos de entidad, estados y tablas se duplican en varios módulos.

### 4.2 Identidad

- La generación de UUID no es universal. `HomePage` usa `ownerId: 'local-user'`.
- Se observan IDs construidos a partir de texto y tiempo, como relaciones `${personId}-father`, `${personId}-mother` y `child-${Date.now()}`.
- El código distribuye creación de identificadores entre hooks, stores y helpers.

### 4.3 Soft delete

- `list()` filtra tombstones, pero `getById()` puede devolver registros eliminados.
- La cascade de personas no encola todas las modificaciones relacionadas.
- Las cascadas recorren registros eliminados sin una política explícita.
- Las claves foráneas SQL de árbol siguen usando eliminación física en cascada.
- Algunos endpoints locales de limpieza ejecutan `clear()`, una operación física apropiada sólo para reset completo, no para acciones de usuario.
- `deletedBy` no existe.

### 4.4 Sincronización

- El cursor remoto usa timestamps, no una secuencia estable total.
- `/pull` limita globalmente antes de filtrar por árbol.
- Una página sin operaciones accesibles puede dejar el cursor estancado.
- Operaciones con el mismo timestamp pueden perderse al avanzar el cursor.
- El cliente usa un cursor global aunque pueda solicitar un árbol concreto.
- Escritura de entidad y registro de idempotencia son dos requests no atómicos.
- Los resultados de inserción en `processed_operations` no se verifican.
- No hay comprobación de cambios locales posteriores al ACK.
- Pull y escritura local no son una operación atómica frente a ediciones concurrentes.
- Los errores de pull se suprimen en el flujo de sync.
- No hay backoff, jitter ni agenda de reintentos.
- La lectura completa del outbox y el envío secuencial no escalan bien.

### 4.5 Seguridad

- La función `/sync` opera con service role; su autorización manual es el único límite para mutaciones privilegiadas.
- Un editor puede modificar membresías mediante sync, incluidos `role`, `user_id` y `tree_id`, porque no hay validación de campos.
- Las invitaciones remotas no aplican validación de destinatario, token, rol, expiración ni transiciones.
- La política bootstrap de membresías no exige `user_id = auth.uid()` ni limita el rol.
- Pull devuelve filas completas de membresías e invitaciones a miembros del árbol.
- Las invitaciones contienen token hash, email y metadatos; su lectura amplia aumenta exposición.
- No se encontraron en las migraciones políticas para `storage.objects`, función de aceptación de invitación ni endpoint photo-upload.
- Las políticas directas de DELETE y su efecto real dependen del despliegue y los permisos actuales, que no están verificados en este repositorio.

### 4.6 Calidad, testing y observabilidad

- Cobertura no configurada.
- `--passWithNoTests` permite pasar sin pruebas.
- No existe pipeline CI.
- Lint admite advertencias.
- No se encontró servicio central de errores o logging estructurado.
- Hay `console.log` y capturas vacías que reducen la trazabilidad.
- El dashboard técnico de sincronización, conflictos, errores y almacenamiento no existe.

### 4.7 Rendimiento

- El bundle principal supera el umbral de advertencia de Vite.
- `TreePage` filtra relaciones mediante búsquedas repetidas sobre personas, con coste aproximado O(R × P).
- El layout recorre relaciones repetidamente durante el cálculo.
- Se construyen nodos y aristas para todo el conjunto, sin virtualización ni paginación evidenciada.
- Varias operaciones materializan tablas completas con `toArray()`.
- Las tres variantes de foto pueden aumentar significativamente el almacenamiento local.

### 4.8 Repositorio y documentación

- La raíz contiene más de 15 elementos y decenas de documentos históricos, logs, scripts de corrección y salidas de build.
- Hay múltiples archivos de resumen y reportes sin clasificación.
- Parte de la documentación describe garantías no demostradas por el código actual.
- Existen artefactos temporales versionados (`build.txt`, `errors.txt`, `output.txt`, `temp.txt`, logs y scripts de corrección).

## 5. Riesgos de producción

| Prioridad | Riesgo | Impacto | Evidencia |
| --- | --- | --- | --- |
| Crítica | Escalación de privilegios mediante sync de membresías | Acceso, modificación o administración indebida de árboles | `supabase/functions/sync/index.ts`, `supabase/migrations/20261027035735_fase5_schema.sql` |
| Crítica | Bootstrap RLS de membresía no ligado a `auth.uid()` | Asignación indebida de pertenencia/rol | `supabase/migrations/20261027035735_fase5_schema.sql` |
| Alta | Pull puede perder, repetir o estancar cambios | Datos remotos omitidos o estado divergente | `supabase/functions/pull/index.ts`, `src/core/sync/pullClient.ts` |
| Alta | ACK e idempotencia no atómicos | Repetición de mutaciones o conflicto tras crash | `supabase/functions/sync/index.ts` |
| Alta | Condición de carrera entre ACK/pull y edición local | Sobrescritura de cambios más recientes | `src/core/sync/syncEngine.ts`, `src/core/sync/pullClient.ts` |
| Alta | Cascadas incompletas de persona | Relaciones, eventos o fotos remotos inconsistentes | `src/core/db/cascade.ts` |
| Alta | Pull de invitaciones y membresías expone metadatos sensibles | Revelación de emails, roles y hashes | `supabase/functions/pull/index.ts` |
| Alta | Identidad `local-user` no equivalente a identidad Supabase | Creación/sync inválidos o aislamiento incorrecto | `src/pages/HomePage.tsx` |
| Alta | Sin CI ni cobertura | Regresiones y cambios inseguros llegan a producción | `package.json`, ausencia de `.github/workflows` |
| Alta | Render y layout no escalables para árboles grandes | Bloqueo de UI y alto consumo de memoria | `src/pages/TreePage.tsx`, `src/features/tree/utils/treeLayout.ts` |
| Media | Contratos local/remoto divergen | Datos truncados o no reconciliables | `src/core/db/schema.ts`, migración inicial |
| Media | El reintento carece de backoff | Tormenta de requests o recuperación lenta | `src/core/sync/syncEngine.ts` |
| Media | Logs/errors suprimidos | Diagnóstico incompleto y fallos invisibles | `src/core/sync/syncEngine.ts`, servicios de foto |

## 6. Deuda técnica priorizada

### P0 — Bloqueadores

1. Corregir autorización de membresías e invitaciones.
2. Rediseñar idempotencia y cursor de pull con pruebas de concurrencia y paginación.
3. Eliminar carreras entre ACK/pull y cambios locales.
4. Sustituir identidades placeholders y no UUID.
5. Proteger cascadas y propagación completa de soft delete.

### P1 — Integridad y consistencia

1. Unificar contrato de relaciones.
2. Sincronizar esquema TypeScript/SQL.
3. Centralizar reglas y tipos de dominio.
4. Hacer que las UI escriban exclusivamente mediante repositorios/interfaces.
5. Añadir `deletedBy` y políticas uniformes para `getById`, repositorios, consultas y sync.
6. Implementar changelog transaccional.
7. Reforzar el motor de conflictos para los cuatro pares update/delete.

### P2 — Calidad y operación

1. Cobertura de dominio con umbral mínimo del 80 %.
2. CI con lint, test y build bloqueantes.
3. ErrorService y LoggingService estructurados.
4. Métricas de sync, conflictos, errores y almacenamiento.
5. Optimización basada en benchmarks de árboles grandes.
6. División de bundle/lazy loading.
7. Limpieza y reorganización documental.

## 7. Prioridades para las fases siguientes

La secuencia debe respetar dependencias de riesgo:

1. Limpiar el repositorio sin tocar comportamiento.
2. Fijar y documentar el modelo de dominio y sus contratos.
3. Unificar identidad UUID.
4. Completar soft delete antes de extender sync.
5. Rediseñar el protocolo de sync y sus pruebas.
6. Incorporar changelog y motor de conflictos sobre un modelo estable.
7. Endurecer RLS y funciones de servicio.
8. Extraer validadores independientes de React.
9. Desacoplar infraestructura/UI mediante interfaces.
10. Elevar cobertura, rendimiento y observabilidad.
11. Añadir CI y cerrar producción con evidencia reproducible.

## 8. Criterio de salida de Fase 0

La arquitectura actual fue identificada mediante código; las fortalezas, debilidades, riesgos, deuda y prioridades quedaron registrados antes de cualquier refactorización. Esta auditoría no modifica comportamiento ni corrige los hallazgos. Su publicación habilita el inicio de Fase 1.
