# Auditoría de identidad

**Fecha:** 2026-11-27  
**Fase:** 3  
**Objetivo:** todas las claves y referencias persistidas deben ser UUID válidos.

## 1. Superficie auditada

Se revisaron las escrituras de:

- entidades locales Dexie;
- outbox y dependencias;
- snapshots de conflicto;
- audit log;
- blobs locales;
- payloads enviados a Supabase;
- claves PostgreSQL;
- creación desde Home, perfil, foto y stores;
- datos de seed.

Los IDs visuales (`faq-1`, IDs de navegación, categorías) y IDs sintéticos de presentación no se consideran identidades persistidas. Los registros locales y remotos sí quedan cubiertos.

## 2. Estrategia

### Generación

Las entidades locales nuevas y las operaciones utilizan UUID v7 RFC 9562 mediante `uuidv7()`.

El generador:

- usa `crypto.getRandomValues`;
- no recurre a `Math.random`;
- falla explícitamente si no existe entropía criptográfica;
- mantiene timestamp de 48 bits, versión 7 y variante RFC.

### Validación

Se acepta cualquier UUID RFC válido en campos provenientes de sistemas externos, porque Supabase Auth puede entregar UUID de otra versión. El sistema exige:

- clave `id` UUID;
- referencias de árbol, persona, relación, evento, foto, usuario y autor UUID;
- `operationId`, `entityId` y `dependsOn` UUID;
- arrays `personIds` compuestos exclusivamente por UUID.

La validación se aplica en:

- hooks Dexie antes de crear o actualizar;
- repositorios mediante `writeLocal`;
- outbox directo;
- payloads de Edge Function `/sync`.

## 3. Claves e identificadores

| Tipo | Clave primaria | Referencias |
| --- | --- | --- |
| Tree | UUID | `ownerId` UUID |
| Person | UUID | `treeId` UUID |
| Relationship | UUID | `treeId`, cuatro extremos compatibles posibles |
| Event | UUID | `treeId`, `personId`, `personIds` |
| Photo | UUID | `treeId`, `personId`, `eventId` |
| PhotoBlob | UUID | `photoId` |
| Membership | UUID | `treeId`, `userId`, `invitedBy` |
| Invitation | UUID | `treeId`, `invitedBy`, `acceptedBy` |
| SyncOperation | `operationId` UUID | `entityId`, `dependsOn` |
| ConflictSnapshot | `operationId` UUID | correlación con outbox |
| AuditLogEntry | UUID | árbol, entidad y actor |

PostgreSQL usa tipos `uuid` para claves y referencias, y la Edge Function ahora rechaza operaciones con IDs inválidos antes de consultar la base.

## 4. Correcciones realizadas

1. `HomePage` dejó de usar `ownerId: 'local-user'`.
2. Se añadió una identidad local estable en `localStorage`.
3. Si existe sesión Supabase, se usa su UUID como propietario; si no, se usa el UUID local estable.
4. Las relaciones creadas por el store dejaron de usar `${personId}-father/mother`.
5. Los hijos sin ID recibieron UUID v7, no `child-${Date.now()}`.
6. El seed de prueba dejó de usar `test-user-local`.
7. Los fixtures persistentes de pruebas ahora usan UUID reales.
8. La función de sync valida IDs externos antes de usar service role.

## 5. Migración local v4

La versión 4 de Dexie migra datos existentes sin perderlos:

- remapea claves primarias legacy;
- mantiene el mismo reemplazo para todas las referencias al ID antiguo;
- actualiza árbol/persona/evento/foto en FK locales;
- actualiza arrays `personIds`;
- remapea miembros e invitaciones;
- remapea outbox, dependencias, payloads y snapshots;
- remapea audit log;
- mantiene una identidad única por usuario local legacy.

La migración no adivina una identidad remota. Al sincronizar una creación de árbol, el servidor conserva el UUID del árbol y establece `owner_id` al usuario autenticado.

## 6. Enfoques que no son migrables automáticamente

- Una referencia legacy huérfana se convierte a UUID válido y consistente dentro de ese nombre, pero no crea una entidad inexistente. La integridad referencial se reforzará en la auditoría/validación de dominio.
- El mapeo local de usuario no puede convertirse en identidad Supabase sin sesión. El servidor la sustituye para árboles nuevos; la membresía se validará en la fase de seguridad.
- Los IDs visuales no se alteran porque no cruzan los límites de persistencia.

## 7. Pruebas

Se cubren:

- formato y variante UUID v7;
- unicidad;
- aceptación de UUID externos no-v7;
- rechazo de IDs temporales y compuestos;
- remapeo completo de claves y referencias legacy;
- consistencia de payload y snapshots.

## 8. Resultado

Las nuevas escrituras y payloads remotos sólo aceptan UUID. Los datos locales existentes se remapean al abrir la base en versión 4. No quedan generadores de IDs persistidos basados en timestamp, cadena compuesta o propietario simbólico en código de aplicación.
