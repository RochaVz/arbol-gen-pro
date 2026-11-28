# Estrategia de soft delete

**Fecha:** 2026-11-27  
**Fase:** 4

## 1. Regla general

Las entidades de negocio no se eliminan físicamente desde la UI, repositorios, sincronización ni APIs de aplicación. Una baja se representa mediante:

- `deletedAt: number | null`;
- `deletedBy: UUID | null`.

`deletedAt = null` significa activo. Un valor numérico indica la marca de tiempo local de baja. `deletedBy` identifica al usuario autenticado o a la identidad local estable que inició la operación.

## 2. Cobertura

La estrategia cubre:

- Tree;
- Person;
- Relationship;
- Event;
- Photo;
- TreeMembership;
- TreeInvitation;
- AuditLogEntry;
- PhotoBlob local.

SyncOperation, ProcessedOperation y ConflictSnapshot son registros técnicos internos. Se conservan o compactan según una política de infraestructura, no como entidades de negocio.

Los binarios locales se pueden purgar mediante `cleanupLocalBinaries` únicamente después de comprobar que la foto está registrada remotamente. Esa operación es garbage collection de caché; no elimina la entidad Photo ni contradice el soft delete.

## 3. Repositorios

Los métodos de consulta siguen estas reglas:

- `list()` y `getById()` excluyen tombstones por defecto;
- `list(true)` y `getById(id, true)` exponen registros eliminados sólo para auditoría, recuperación y sync;
- `update()` no modifica una entidad ya eliminada;
- `delete(id, deletedBy?)` persiste un tombstone y una operación `delete`;
- una segunda baja no crea otra operación.

El repositorio obtiene la identidad actual cuando el llamador no la proporciona. La identidad autenticada tiene prioridad; sin sesión se usa una UUID local persistente.

## 4. Cascadas

### Persona

Al eliminar una persona, dentro de una única transacción IndexedDB:

1. se desasocian relaciones activas;
2. se retira la persona de `Event.personIds`;
3. se elimina la referencia `personId` de eventos;
4. se desasocia la foto;
5. se encolan actualizaciones de cada entidad afectada;
6. se registra la persona como tombstone;
7. la operación de baja depende de las actualizaciones encoladas.

No se modifican entidades previamente eliminadas. Cuando un evento usa `personId` y `personIds` a la vez, ambas correcciones producen una sola operación.

### Árbol

Al eliminar un árbol:

1. se marcan relaciones, eventos, fotos, personas e invitaciones del árbol;
2. cada hijo produce una operación de baja;
3. el árbol produce una operación que depende de todas las bajas hijas;
4. las membresías se marcan después del árbol y dependen de su operación;
5. todo se ejecuta en una transacción local.

Esta dependencia evita que la baja de membresía remueva el permiso necesario antes de sincronizar la baja del árbol.

## 5. Sincronización

El cliente elimina mediante una operación `operationType: 'delete'` con `payload: null`.

El servidor:

- no ejecuta SQL `DELETE`;
- actualiza `deleted_at`;
- establece `deleted_by` al usuario autenticado;
- incrementa la versión;
- conserva la fila para pull, auditoría y resolución de conflictos.

Create restaura ambos campos a `null` y update tampoco permite cambiar el actor de la baja. El usuario no puede inyectar `deletedBy` desde el payload porque los metadatos se descartan.

Pull convierte `deleted_at/deleted_by` a camelCase y mantiene el tombstone local. Los listados lo ocultan sin borrar la evidencia.

## 6. Supabase

La migración `20261127000000_soft_delete.sql`:

- añade `deleted_by` a todas las tablas de negocio;
- añade tombstones a audit log;
- bloquea las políticas RLS de `DELETE`;
- instala un trigger que exige `deleted_by` cuando existe `deleted_at`;
- restablece `deleted_by` a `null` para filas activas.

Las claves foráneas `ON DELETE CASCADE` continúan existiendo sólo como salvaguarda de administración de base. La API y las políticas de aplicación no pueden provocar esa ruta.

## 7. Bajas desde la UI

Los stores temporales `personStore` y `treeStore` ya no filtran registros fuera del estado para simular baja. Registran `deletedAt` y `deletedBy`.

La capacidad `cleanAll` se retiró del store de aplicación. Las limpiezas físicas quedan limitadas a:

- pruebas;
- migraciones;
- garbage collection de blobs remotos;
- herramientas administrativas fuera de la UI.

## 8. Restauración

La restauración no se expone todavía como acción de producto. Los datos se conservan para permitir una futura operación:

1. verificar permisos;
2. comprobar que el padre/árbol sigue activo;
3. establecer `deletedAt = null` y `deletedBy = null`;
4. encolar update con nueva revisión;
5. registrar la restauración.

Hasta entonces, cualquier restauración requiere una herramienta administrativa y debe auditarse.

## 9. Riesgos residuales

- las consultas SQL de acceso aún deben excluir `trees.deleted_at` de forma explícita;
- el motor de conflictos todavía no implementa todos los pares UPDATE/DELETE;
- la retención y compactación del outbox no están definidas;
- el changelog completo se implementará en una fase posterior.

Estos riesgos no invalidan la prohibición de borrado físico, pero deben cerrarse antes de producción.
