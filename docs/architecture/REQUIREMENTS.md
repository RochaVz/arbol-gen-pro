# REQUIREMENTS.md

## Requisitos Funcionales

### RF-01: Gestión de Árboles Genealógicos
- **RF-01.1** Crear un nuevo árbol genealógico con nombre y descripción.
- **RF-01.2** Listar árboles propios y compartidos.
- **RF-01.3** Editar metadatos del árbol (nombre, descripción, configuración).
- **RF-01.4** Eliminar árbol (con confirmación y cascade opcional).
- **RF-01.5** Exportar árbol a GEDCOM / JSON / PDF.

### RF-02: Registro de Personas
- **RF-02.1** Crear persona con: nombre completo, sexo, fecha/lugar de nacimiento, fecha/lugar de fallecimiento, biografía, notas.
- **RF-02.2** Editar cualquier campo de una persona existente.
- **RF-02.3** Eliminar persona (validar que no tenga relaciones dependientes o confirmar cascade).
- **RF-02.4** Buscar personas por nombre, fechas, lugares, texto libre en biografía/notas.
- **RF-02.5** Ver perfil completo con línea de tiempo de eventos.

### RF-03: Relaciones Familiares
- **RF-03.1** Registrar padres (padre y madre) de una persona.
- **RF-03.2** Registrar hijos de una persona.
- **RF-03.3** Registrar cónyuge/pareja (con fechas de inicio/fin, tipo: matrimonio, unión civil, convivencia, etc.).
- **RF-03.4** Registrar hermanos (comparten al menos un padre).
- **RF-03.5** Soportar relaciones complejas: adopción, padrastros, medio-hermanos, parejas múltiples.
- **RF-03.6** Validar coherencia (no ciclos, fechas lógicas).

### RF-04: Profundidad Generacional
- **RF-04.1** Representar al menos 10 generaciones (bisabuelos, tatarabuelos, etc.).
- **RF-04.2** Navegación visual por generaciones (árbol ascendente/descendente).
- **RF-04.3** Vista de "rama familiar" centrada en una persona.

### RF-05: Fechas, Lugares, Biografías y Notas
- **RF-05.1** Fechas: soporte para fechas parciales (solo año, año-mes), rangos, "circa", "antes de", "después de".
- **RF-05.2** Lugares: jerarquía (país, región, ciudad, parroquia), geocodificación opcional.
- **RF-05.3** Biografía: texto enriquecido (Markdown) con soporte para enlaces internos a otras personas.
- **RF-05.4** Notas privadas vs. notas compartidas (visibilidad configurable).

### RF-06: Fotografías
- **RF-06.1** Subir fotografías desde dispositivo (cámara, galería, archivo).
- **RF-06.2** Asociar foto a una persona (retrato principal) y/o a eventos (boda, bautizo, etc.).
- **RF-06.3** Compresión automática en navegador (max 1920px, calidad 0.85 WebP).
- **RF-06.4** Generar miniatura (thumbnail 200px) y versión optimizada (800px) en cliente.
- **RF-06.5** Original conservado en Cloudflare R2 (bucket privado).
- **RF-06.6** No descargar originales automáticamente a todos los dispositivos.
- **RF-06.7** Metadatos EXIF preservados en original, removidos en versiones web.

### RF-07: Consulta y Edición de Perfiles
- **RF-07.1** Vista detalle de persona con toda la información.
- **RF-07.2** Edición inline / modal para campos rápidos.
- **RF-07.3** Historial de cambios (auditoría local + servidor).
- **RF-08.1** Búsqueda global en el árbol actual (nombre, fechas, lugares).
- **RF-08.2** Filtros avanzados: por sexo, generación, vivos/fallecidos, con/sin foto.
- **RF-08.3** Resultados paginados con resaltado de coincidencias.

### RF-09: Compartir Árboles con Permisos
- **RF-09.1** Invitar por email a familiares (genera token de invitación).
- **RF-09.2** Roles: `owner`, `admin`, `editor`, `viewer`, `commenter`.
- **RF-09.3** Permisos granulares por rama (sub-árbol) opcional.
- **RF-09.4** Revocar acceso en cualquier momento.
- **RF-09.5** Registro de auditoría de invitaciones y cambios de rol.

### RF-10: Trabajo Sin Conexión (Offline-First)
- **RF-10.1** Todas las operaciones CRUD funcionan sin internet.
- **RF-10.2** Indicador visual de estado: online / offline / sincronizando.
- **RF-10.3** Cola de cambios pendientes persistente (IndexedDB).
- **RF-10.4** Sincronización automático al recuperar conexión.
- **RF-10.5** Sincronización manual (botón "Sincronizar ahora").

### RF-11: Sincronización y Conflictos
- **RF-11.1** Sincronización bidireccional (local ↔ servidor).
- **RF-11.2** Detección de conflictos por versionado (optimistic locking).
- **RF-11.3** UI de resolución de conflictos: comparar versiones, elegir ganador, merge manual.
- **RF-11.4** No fusión automática sin intervención del usuario.
- **RF-11.5** Reintentos con backoff exponencial (max 5 reintentos).

### RF-12: Prevención de Duplicados por Reintentos
- **RF-12.1** Cada operación tiene ID único global (UUID v7).
- **RF-12.2** Servidor idempotente: re-procesar misma operación = no-op.
- **RF-12.3** Cliente marca operación como "synced" solo tras ACK del servidor.

### RF-13: Estado de Sincronización
- **RF-13.1** Icono global en header: synced / pending / conflict / error.
- **RF-13.2** Detalle por entidad: botón "Ver conflictos" en perfiles con conflicto.
- **RF-13.3** Barra de progreso durante sync batch.

### RF-14: PWA Instalable
- **RF-14.1** Manifest.json completo (name, icons, theme_color, display: standalone).
- **RF-14.2** Service Worker con Workbox (cache first para assets, network first para API).
- **RF-14.3** Prompt de instalación nativo (beforeinstallprompt).
- **RF-14.4** Funcionamiento offline completo tras instalación.
- **RF-14.5** Actualización automática del SW (skipWaiting + clients.claim).

---

## Requisitos No Funcionales

### RNF-01: Rendimiento
- **RNF-01.1** Carga inicial < 3s en 3G (Lighthouse Performance > 90).
- **RNF-01.2** Interacciones locales (CRUD) < 100ms (p95).
- **RNF-01.3** Árboles de 5000+ personas navegables sin lag (virtualización).

### RNF-02: Escalabilidad Local
- **RNF-02.1** IndexedDB soporta > 100k entidades sin degradación.
- **RNF-02.2** Fotos: miniaturas en IndexedDB, originales solo en R2.

### RNF-03: Seguridad
- **RNF-03.1** RLS en 100% de tablas Postgres.
- **RNF-03.2** Sin secretos en frontend (ver SECURITY.md).
- **RNF-03.3** Fotos servidas via URLs firmadas (expiración 15 min).

### RNF-04: Accesibilidad
- **RNF-04.1** WCAG 2.1 AA (contraste, focus visible, ARIA labels).
- **RNF-04.2** Navegación por teclado completa.
- **RNF-04.3** Soporte lectores de pantalla (semántica HTML).

### RNF-05: Internacionalización
- **RNF-05.1** i18n ready (es-ES, en-US como base).
- **RNF-05.2** Fechas/formatos locales via Intl API.

### RNF-06: Mantenibilidad
- **RNF-06.1** Cobertura de tests > 80% (unit + integration).
- **RNF-06.2** ESLint + TypeScript strict sin errores.
- **RNF-06.3** Documentación de arquitectura actualizada (este repo).

---

## Criterios de Aceptación (Definition of Done)

Un requisito se considera **Done** cuando:

1. Código implementado y passing `npm run lint` + `npm run build`.
2. Tests unitarios e integración cubren el happy path + 2 edge cases.
3. Funciona offline (desconectar red, operar, reconectar, sync OK).
4. Documentado en archivo correspondiente (DATA-MODEL, SYNC, etc.).
5. Revisado por peer (o validado por checklist AI-CONTEXT.md).