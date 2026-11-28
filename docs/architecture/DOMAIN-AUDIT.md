# Auditoría de dominio

**Fecha:** 2026-11-27  
**Fase:** 2  
**Alcance:** entidades, agregados, repositorios, estado UI y persistencia local/remota.  
**Criterio:** describir el comportamiento implementado, no el pretendido por documentos históricos.

## 1. Mapa del dominio actual

El dominio productivo está organizado implícitamente alrededor del árbol genealógico. No existe todavía una capa `src/domain/` independiente; las definiciones viven en `src/core/db/schema.ts` y la lógica distribuida entre repositorios, stores, componentes y utilidades.

### Agregados implícitos

1. **Árbol familiar (`Tree`)**
   - raíz lógica de personas, relaciones, eventos y fotos;
   - propietario, membresías e invitaciones.
2. **Genealogía**
   - personas;
   - relaciones dirigidas o simétricas según el tipo textual;
   - eventos de vida;
   - fotos y blobs locales.
3. **Colaboración**
   - membresías;
   - invitaciones;
   - roles.
4. **Sincronización**
   - operaciones de outbox;
   - snapshots de conflicto;
   - versiones y revisiones.
5. **Trazabilidad**
   - audit log local, separado y no integrado con todas las mutaciones.

## 2. Inventario de entidades

| Concepto solicitado | Entidad implementada | Responsabilidad actual | Persistencia |
| --- | --- | --- | --- |
| Person | `Person` | Identidad, fechas parciales, estado de vida, lugares, biografía y metadatos | Dexie + PostgreSQL |
| Family | No existe | `Tree` actúa como contenedor familiar | Dexie + PostgreSQL |
| Relationship | `Relationship` | Vincula personas con tipo textual | Dexie + PostgreSQL |
| Media | No existe | `Photo` almacena metadatos y `PhotoBlob` almacena binarios | Dexie + PostgreSQL para metadatos |
| User | No existe como entidad local | Supabase Auth UUID se usa en propiedad y membresía | Supabase Auth |
| Invitation | `TreeInvitation` | Email, rol, hash de token y estado de aceptación/revocación | Dexie + PostgreSQL |
| Conflict | No existe | Estado `blocked` en `SyncOperation` + `conflictSnapshots` | Dexie |
| SyncQueue | `SyncOperation` en `syncOutbox` | Payload, versión base, reintentos, estado y dependencias | Dexie; registro remoto separado |

### Person

Contrato en `src/core/db/schema.ts`.

Campos principales:

- identidad: `id`, `treeId`;
- nombre: `firstName`, `lastName`;
- sexo y estado de vida;
- fechas parciales de nacimiento/fallecimiento;
- lugares, biografía, notas, ocupación, características;
- generación.

Responsabilidades repartidas:

- validación básica en `src/shared/utils/validation.ts`;
- persistencia en `PersonRepository`;
- cascada al borrar en `src/core/db/cascade.ts`;
- creación de parentesco y validación de formulario en `src/features/person/PersonProfileContainer.tsx`;
- representación visual en páginas y componentes;
- consultas genealógicas en `src/features/tree/utils/treeLayout.ts`.

### Tree / Family

`Tree` sustituye al concepto `Family`, pero su contrato sólo incluye nombre, descripción y propietario. No modela:

- membresía como colección invariante;
- identidad familiar;
- permisos como parte del agregado;
- reglas para transferencia de propiedad;
- regla de creación del miembro inicial.

La creación de árbol ocurre en `HomePage` con `ownerId: 'local-user'`; por tanto, el contenedor no está ligado de forma fiable a la identidad autenticada.

### Relationship

Es la entidad con mayor ambigüedad estructural. Acepta simultáneamente:

- `personId` / `relativeId`;
- `person1Id` / `person2Id`.

La semántica de `type` es texto libre. Los consumidores interpretan palabras en español e inglés (`parent`, `father`, `mother`, `padre`, `madre`, `spouse`, etc.). No existe un enum canónico ni reglas para:

- dirección por tipo;
- categorías padre/hijo, pareja y otros parentescos;
- duplicados;
- pertenencia al mismo árbol;
- existencia de ambos extremos;
- máximo de progenitores.

`TreePage` y `layoutMeasurements.ts` no usan el mismo criterio de extremos, y varios flujos sólo leen `person1Id/person2Id`. Esto hace que registros del esquema alternativo sean ignorados en partes de la UI.

### Event

Existe `personId` y `personIds[]`, ambos opcionales. No se especifica:

- si un evento personal y multipersonal pueden coexistir;
- si debe pertenecer al menos a una persona;
- cómo validar el árbol de cada persona referenciada;
- qué eventos conservan significado al desvincular una persona.

La UI filtra por ambas formas, lo que confirma que se trata de un contrato compatibilizado ad-hoc.

### Photo / Media

`Photo` mezcla:

- metadatos del contenido;
- estado de subida;
- claves remotas;
- presentación (`isPrimary`, `isMain`);
- datos físicos (`width`, `height`, tamaños).

`PhotoBlob` replica parte de las tres variantes binaria/local. Ambos comparten `BaseEntity`, aunque los blobs no son entidades sincronizadas por `EntityType`. Hay campos duplicados (`url/thumbnailUrl/r2Key`, `size/sizeBytes`, `kind` en foto y blob, `isPrimary/isMain`).

La regla de ciclo de vida entre:

1. guardado local;
2. subida remota;
3. registro sincronizado;
4. eliminación de binarios;

está en servicios de infraestructura y usa respuestas alternativas en camelCase/snake_case.

### User / Membership / Invitation

No hay modelo `User` ni repositorio de usuario. La identidad es un UUID de Supabase Auth.

Problemas:

- `Tree.ownerId` puede recibir un identificador local inválido;
- `TreeMembership` no contiene snapshot de usuario;
- invitaciones duplican `email` e `invitedEmail`;
- el rol usa strings repetidos en varias definiciones;
- no existe un servicio de dominio para invitar, aceptar, revocar, expulsar o cambiar rol.

### Conflict

Un conflicto es actualmente una operación `blocked` y un snapshot remoto sin normalización. No se clasifica como:

- `UPDATE_UPDATE`;
- `UPDATE_DELETE`;
- `DELETE_UPDATE`;
- `DELETE_DELETE`.

La resolución mezcla decisiones, persistencia, creación de operación y acceso a tablas dentro de un único módulo. La fusión se limita a elegir una entidad suministrada por el llamador; no existe detector ni política de seguridad por campo.

### SyncQueue

La cola es un detalle de infraestructura que conoce tipos de entidades mediante un union manual. No está modelada como repositorio de dominio y permite:

- varias operaciones pendientes por entidad sin una clave de coalescencia documentada;
- dependencias no verificadas por referencialidad;
- payload completo duplicado respecto a la entidad local;
- operaciones terminales retenidas sin política de compactación.

## 3. Consistencia local/remota

| Divergencia | Impacto |
| --- | --- |
| `Person.occupation` y `characteristics` sólo existen en TypeScript | Pérdida silenciosa al sincronizar |
| `Photo` y SQL duplican nombres alternativos | Semántica dependiente del consumidor |
| `Invitation.email` e `invitedEmail` se aceptan a la vez | Identidad de destinatario ambigua |
| `Relationship` tiene dos pares de extremos | Consultas pueden omitir relaciones válidas |
| `Event` tiene `personId` y `personIds` | Cascadas y filtros no uniformes |
| `AuditLogEntry` existe localmente, pero no tiene tabla remota equivalente en la migración inicial | Trazabilidad incompleta |
| `deletedAt` existe, pero no `deletedBy` | No se puede atribuir una baja lógica |
| TypeScript requiere `localRevision`, `serverVersion` y `syncStatus`; muchos llamadores crean entidades con `as any` | Contratos estructurales debilitados |

## 4. Referencias e invariantes

Invariantes actualmente verificadas de forma parcial:

- nombre de persona no vacío;
- árbol requerido;
- fechas parciales válidas y año de fallecimiento no anterior;
- extremos requeridos en relación;
- ausencia de autorrelación;
- tipo de evento requerido;
- nombre y propietario de árbol requeridos.

Invariantes ausentes:

- UUID válido en toda entidad y referencia;
- todas las referencias apuntan al mismo árbol;
- el extremo de una relación existe y no está eliminado;
- tipo de relación cerrado y dirección canónica;
- no duplicar relaciones semánticamente equivalentes;
- un evento multipersonal no repite una persona;
- foto vinculada a un árbol y, si aplica, a una persona/evento del mismo árbol;
- sólo un propietario por árbol;
- rol válido y transición de rol autorizada;
- una invitación tiene destinatario canónico, expiración válida y token hasheado;
- toda mutación genera changelog;
- baja lógica requiere actor y motivo de política.

## 5. Entidades anémicas y duplicación

Todas las entidades son interfaces de datos. No encapsulan:

- invariantes;
- transiciones válidas;
- creación completa;
- eliminación lógica;
- serialización local/remota;
- comparación de versiones.

La lógica está repartida de esta forma:

- validación en `shared/utils/validation.ts`;
- persistencia y validación en `core/db/repositories.ts`;
- cascada en `core/db/cascade.ts`;
- operaciones de sync en `core/db/operations.ts`;
- creación de datos y dependencias en `PersonProfileContainer`;
- mutaciones locales sin persistencia en `personStore` y `treeStore`;
- cálculos genealógicos en `treeLayout.ts`, `FamilyPage` y layout del componente React Flow.

### Duplicaciones observables

- `PersonStore` redefine `Person` con fechas diferentes y sin metadatos.
- `TreeStore` redefine `Tree` y permite eliminación física de memoria.
- se exportan repositorios principales y wrappers de features que sólo reexportan el núcleo;
- `tableForEntity` se repite en sync/conflictos/pull;
- la conversión snake_case/camelCase existe en módulos separados;
- los tipos de rol se repiten en schema local y SQL;
- la comprobación de estado eliminado se repite en repositorios, páginas y componentes.

## 6. Lógica incluida en UI

### `HomePage`

- crea árbol;
- fija un propietario ficticio;
- crea persona inicial;
- cambia estado activo;
- recarga repositorios;
- navega y comunica.

Esto mezcla caso de uso, autenticación, persistencia y presentación.

### `PersonProfileContainer`

- valida entradas;
- crea entidades base;
- asigna dependencias de sync;
- abre transacciones Dexie;
- crea persona/relación/evento;
- guarda fotos;
- transforma datos para presentación.

La UI conoce Dexie, outbox y sincronización, incumpliendo desacoplamiento.

### Stores

`src/store/personStore.ts` realiza CRUD puramente en memoria. `src/store/treeStore.ts` elimina árboles con `filter`, mientras `src/store.ts` usa repositorios. Ambas vías pueden divergir.

## 7. Acoplamientos

### UI → infraestructura

Encontrados:

- `PersonProfileContainer` importa `db`;
- `HomePage` importa repositorios de core;
- `App` importa cliente Supabase para auth;
- `store.ts` importa Dexie y repositorios.

### Dominio → infraestructura

`schema.ts` mezcla modelo y metadatos de sincronización. No existe una entidad de dominio pura. Todas las entidades dependen de:

- `syncStatus`;
- `serverVersion`;
- `localRevision`;
- `deletedAt`;
- tipos de outbox.

### Sync → dominio

El motor usa tablas concretas y una enumeración de entidades. Cambiar un agregado exige modificar mappings, SQL, funciones y el cliente.

## 8. Hallazgos priorizados

### Críticos

1. **No existe una identidad de usuario de dominio confiable.** El UI usa `local-user` donde PostgreSQL exige UUID.
2. **La representación de relación no es única.** Esto puede omitir relaciones en filtros, layouts y exportación.
3. **La UI puede crear operaciones Dexie sin atravesar una capa de casos de uso.** No hay un punto único para invariantes, changelog y transacciones.

### Altos

1. Las referencias no se validan contra árbol, existencia ni soft delete.
2. Dos stores representan entidades incompatibles con el esquema persistido.
3. La creación de persona/relación usa `as any` para evitar campos obligatorios.
4. La baja de persona modifica eventos de lista sin encolar sincronización.
5. El dominio de invitaciones/membresías no valida transiciones ni autorización.
6. Conflicto carece de clasificación y detector.
7. Audit log no cubre mutaciones automáticamente.

### Medios

1. Campos duplicados y legacy aumentan ambigüedad.
2. Tipos de relación y rol deberían ser vocabulario cerrado.
3. Repositorios wrappers de feature no añaden interfaces o comportamiento.
4. Las consultas concretas materializan tablas completas y pueden degradarse en árboles grandes.

## 9. Decisiones de diseño recomendadas

1. Mantener `Tree` como agregado familiar en vez de crear una `Family` duplicada.
2. Introducir entidades de dominio independientes, inicialmente como tipos/value objects sin métodos dependientes de persistencia.
3. Canonicalizar relaciones a `sourcePersonId/targetPersonId` de dominio y aplicar traducción de compatibilidad a datos legacy.
4. Restringir `relationship.type` a valores cerrados con semántica direccional.
5. Unificar `PartialDate`, `Place`, `Person`, `Event`, `Photo`, roles y estados en un único contrato.
6. Modelar User como identidad externa explícita, no como perfil incompleto.
7. Crear interfaces de repositorios por agregado.
8. Convertir la creación de árbol, persona/relación, evento y foto en casos de uso del servicio.
9. Eliminar stores paralelos o hacerlos proyecciones de sólo lectura.
10. Mantener metadatos de sync en adaptadores/persistencia o en un envoltorio infraestructural explícito.
11. Tratar `ChangeLog` y `Conflict` como registros de infraestructura transversales con contrato estable.

## 10. Deuda a remediar por fase

| Fase posterior | Trabajo derivado |
| --- | --- |
| Identidad | Validar UUID en entidades/referencias y sustituir IDs legacy |
| Soft delete | Añadir `deletedBy`, repositorio y cascadas transaccionales |
| Sync | Usar mappings y serialización única; resolver divergencias |
| Changelog | Convertir toda mutación en operación auditada |
| Conflictos | Clasificar los cuatro escenarios y detectar por entidad/campo |
| Validadores | Centralizar reglas independientes de React |
| Refactor | Interfaces y separación domain/infrastructure/services |
| Testing | Probar invariantes, referencias y contratos |

## 11. Criterio de salida

Se documentaron las entidades implementadas, su correspondencia con el dominio solicitado, divergencias, referencias, acoplamientos, lógica duplicada y presencia en UI. No se modificó el modelo en esta fase; las correcciones se implementarán de forma incremental a partir del contrato aquí registrado.
