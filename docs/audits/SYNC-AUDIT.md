# Auditoría del motor de sincronización

**Fecha:** 2026-11-27  
**Fase:** 5  
**Alcance:** Dexie, IndexedDB, Supabase, outbox, Edge Functions, pull, realtime, reintentos, recuperación y conflictos.

## 1. Arquitectura trazada

### Push

1. Repositorio o servicio modifica una entidad local.
2. `writeLocal` guarda entidad y `SyncOperation` en una transacción Dexie.
3. `SyncEngine` selecciona operaciones `pending` cuyas dependencias están confirmadas.
4. La operación pasa a `in_flight`.
5. `syncClient` envía la operación a `/functions/v1/sync`.
6. La Edge Function valida token, tipo, UUID, membresía, versión y aplica la fila con service role.
7. Registra un `processed_operations`.
8. El ACK actualiza entidad, nuevas operaciones base y outbox en una transacción local.

### Pull

1. El cliente obtiene token y cursor.
2. `/pull` determina árboles activos accesibles.
3. Consulta `processed_operations` por `tree_id` y `feed_sequence`.
4. Devuelve páginas ordenadas y recoge las entidades afectadas.
5. El cliente aplica cada fila dentro de una transacción con comprobación de outbox pendiente.
6. Persiste el cursor por árbol o el cursor global.
7. Si `hasMore`, repite hasta agotar la página o avanzar.

### Disparadores

- arranque/recovery;
- intervalo de 30 segundos;
- conexión online;
- focus/visibility;
- background sync del service worker;
- realtime.

## 2. Garantías implementadas

| Garantía | Estado | Evidencia |
| --- | --- | --- |
| Entidad + outbox local atómicos | Sí | `writeLocal` usa transacción Dexie |
| IDs de operación y entidad UUID | Sí | hooks Dexie y validación Edge Function |
| Operaciones `in_flight` recuperables | Sí | `recover()` las vuelve `pending` |
| Dependencias de creación | Sí | `dependsOn` y filtro antes de envío |
| Versión optimista | Sí | `baseServerVersion` contra versión remota |
| Idempotencia por operación | Parcial | `processed_operations` existe; mutación + registro no son una transacción remota |
| Cursor estable | Sí | `feed_sequence` monotónico, no timestamp |
| Filtro antes de paginar | Sí | `.in(tree_id).gt(feed_sequence)` |
| Cursor por árbol | Sí | clave v2 separada en localStorage |
| Paginación completa | Sí | cliente consume `hasMore` |
| ACK con edición concurrente local | Sí | transacción, detección de operación posterior, nueva base |
| Pull con edición concurrente local | Sí | outbox y put dentro de una transacción |
| Reintento con backoff | Sí | exponencial hasta 60 s |
| Fallo pull visible | Sí | `syncNow` retorna `ok:false` |
| Soft delete replicado | Sí | el feed incluye tombstones y `deletedBy` |

## 3. Cambios de endurecimiento

### Cursor y feed

Se añadió:

- `processed_operations.tree_id`;
- `processed_operations.feed_sequence` generado como identity;
- índices por secuencia y árbol;
- backfill de operaciones históricas;
- consulta filtrada antes del limit;
- cursor local v2 separado por árbol;
- consumo de páginas sucesivas.

Esto elimina los principales fallos del diseño anterior:

- empate de timestamps;
- páginas globales sin datos accesibles;
- pull de árbol A avanzando el cursor global de árbol B;
- cursor detenido por una página filtrada.

### ACK local

Cuando llega un ACK:

- se marca la operación original como confirmada;
- se actualiza la versión del servidor;
- si existe una nueva operación pendiente para la misma entidad, se rebasa su `baseServerVersion`;
- la entidad sigue `pending`, evitando que el ACK oculte el cambio más reciente;
- outbox y entidad se actualizan juntos.

### Reintentos

Cada fallo retryable incrementa `retryCount` y programa `nextRetryAt`:

`min(2^retryCount segundos, 60 segundos)`.

Las operaciones futuras no se envían antes de su ventana. Después de cinco fallos pasan a `failed`, sin reintento infinito.

### Recuperación

`recover()` restaura `in_flight` a `pending` y verifica que los IDs de operaciones y entidades siguen siendo UUID. Esto protege contra una base parcialmente migrada.

### Pull transparente

Un pull ya no se omite:

- se ejecuta aunque no haya push pendiente;
- se ejecuta en modo offline sólo después de validaciones previas;
- un HTTP/red inválidos se reflejan en el resultado;
- los datos descargados antes de un fallo conservan su cursor.

## 4. Matriz de pérdida y carrera

| Escenario | Resultado verificado | Riesgo residual |
| --- | --- | --- |
| Dos operaciones locales consecutivas | ACK1 rebasa base de OP2 | Bajo |
| Edición local durante pull | La transacción detecta outbox y conserva local | Bajo |
| Dos timestamps remotos iguales | Secuencia evita empate | Bajo |
| 1.000 operaciones no accesibles delante de las propias | La consulta filtra por árbol antes del limit | Bajo |
| Filtro por un árbol | cursor aislado por árbol | Bajo |
| Reinicio durante push | operación vuelve a pending | Bajo |
| Red intermitente | backoff evita tormenta | Medio: sin jitter |
| Crash entre mutación remota e idempotencia | Riesgo de parcialidad | Alto |
| Token perdido tras mutación pero antes del ACK | Retry usa idempotencia | Medio |
| Retry de una operación registrada como `failed` | El registro fallido se descarta y no se trata como aplicado | Bajo |

## 5. Hallazgos críticos pendientes

### 5.1 Atomicidad remota aún no completa

La entidad remota y `processed_operations` continúan realizándose en requests PostgreSQL separados dentro de la Edge Function. Un error o terminación entre ambas mantiene uno de estos estados:

- entidad aplicada, idempotencia no registrada;
- registro fallido aplicable a una mutación incierta.

La versión detecta la mayoría de reintentos, pero no sustituye una transacción distribuida local-remota. Antes de producción se debe migrar esta ruta a un procedimiento SQL único que aplique entidad e idempotencia en una transacción.

### 5.2 Autorización manual con service role

La función `/sync` usa service role. Su validación de membresía no es equivalente a una frontera segura para roles y transiciones de membresía/invitación. La Fase 8 tratará este riesgo como bloqueador.

### 5.3 Invitaciones y membresías en pull

La consulta del pull puede incluir filas completas para miembros del árbol. Antes de producción se debe restringir columnas, destinatario y rol.

### 5.4 Endpoint de foto no evidenciado

El cliente llama `photo-upload` y `photo-signed-url`; estos handlers no están versionados en `supabase/functions`. Su autorización y almacenamiento no pueden verificarse desde el repositorio.

## 6. Hallazgos medios

1. **Sin jitter:** varias pestañas pueden reintentar en ventanas similares.
2. **Envío secuencial:** conserva orden y simplicidad, pero escala mal en colas muy grandes.
3. **Outbox sin compactación:** crea operaciones confirmadas/fallidas indefinidamente.
4. **Feed de página entera en memoria:** 500 es límite, suficiente hoy, pero depende del tamaño medio de payload.
5. **Realtime sólo dispara pull:** no añade secuencia propia al evento; depende del feed.
6. **Conflictos manuales:** la Fase 7 clasificará y automatizará reglas seguras.

## 7. Pruebas

Se añadieron pruebas para:

- backoff transitorio;
- no reenvío antes de `nextRetryAt`;
- edición local durante el ACK;
- actualización de base server version;
- persistencia de datos locales nuevos;
- propagación visible de error pull;
- pull sin operaciones push pendientes.

La suite completa pasa con 70 pruebas.

## 8. Criterio de salida

La capa local, paginación, cursor, ACK, pull concurrente y reintentos quedaron endurecidos y cubiertos. El reporte deja explícitos los riesgos remotos que requieren cambios posteriores: atomicidad SQL, autorización service-role, exposición de invitaciones y endpoints de foto.
