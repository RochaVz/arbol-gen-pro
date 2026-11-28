# Reporte técnico y roadmap - Arbol Gen Pro

Fecha: 26 de noviembre de 2026  
Rama: `main`  
Base registrada: commit `3bd1c1b` — `fundamentos, navegacion, rediseno y mejoras visuales`

## 1. Objetivo del producto

Arbol Gen Pro está dirigido principalmente a adultos de entre 40 y 80 años. El producto debe permitir construir y enriquecer una historia familiar de forma sencilla, intuitiva y emotiva.

Objetivos actuales:

- Crear y cambiar entre varios árboles familiares.
- Incorporar familiares vivos y fallecidos.
- Registrar fotos, relaciones, eventos e información biográfica.
- Visualizar generaciones y recorridos familiares.
- Compartir y colaborar sin interfaces técnicas innecesarias.
- Funcionamiento offline con sincronización posterior.

## 2. Estado general

Estado: proyecto funcional en desarrollo avanzado.

Verificaciones realizadas:

- 15 archivos de pruebas.
- 63 pruebas unitarias y de componentes aprobadas.
- Compilación TypeScript y build de Vite aprobados.
- Árbol ReactFlow probado visualmente con una persona sin relaciones.
- Navegación principal y creación de árboles probadas en navegador.
- El repositorio Git quedó limpio al finalizar las sesiones visibles.

El proyecto cuenta con una base sólida, pero todavía requiere QA funcional y mejoras de contenido antes de considerarse estable para lanzamiento público.

## 3. Implementaciones completadas hoy

### Página de inicio

- Identidad visual cálida y familiar.
- Hero verde bosque con acentos dorados.
- Acciones principales grandes y directas.
- Árbol activo destacado.
- Listado visible de árboles creados.
- Acciones para abrir o activar cada árbol.
- Creación guiada mediante modal.
- Acciones rápidas para familiares, fotos, eventos y compartir.
- Navegación lateral con objetivos táctiles mínimos de 48 px.

### Gestión de estilos del árbol

- Ocho estilos disponibles.
- Selección separada de aplicación efectiva.
- Botón `Aplicar estilo`.
- Botón `Restaurar`.
- Persistencia por árbol mediante `localStorage`.
- Orientaciones vertical, horizontal y radial.
- Cambio de forma, separación y colores de nodos.
- Controles de fotos, fechas, etiquetas, relaciones y cuadrícula.
- Eliminación de conexiones cuando se desactiva su visualización.

### ReactFlow

- Contenedor con altura mínima y flexible.
- Layout de respaldo para personas sin relaciones.
- Ajuste automático del viewport con `fitView`.
- Tipos de nodos y conexiones reutilizados fuera del render loop.
- Corrección del problema que mostraba una leyenda vacía sin tarjeta.
- Soporte para un nodo inicial cuando el árbol todavía no tiene relaciones.

### Sistema de diseño

- Tipografía más legible para usuarios adultos mayores.
- Iconografía clara y consistente.
- Contraste y estados de foco visibles.
- Tarjetas redondeadas y métricas visuales con menos densidad.
- Paleta verde bosque, dorado cálido, terracota y neutros.

## 4. Arquitectura actual

```text
src/
├── core/
│   ├── db/                 Dexie, esquemas, repositorios y cascadas
│   ├── sync/               motor, cola, conflicto y sincronización
│   └── supabase/           cliente y autenticación remota
├── features/
│   ├── family-tree/        plantillas y motor de operaciones
│   ├── person/             perfiles y acciones sobre personas
│   ├── photo/              almacenamiento y compresión
│   ├── relationship/       operaciones familiares
│   └── tree/               layout genealógico
├── pages/                  Inicio, árbol, familia, fotos y ajustes
├── shared/
│   ├── components/         layout, navegación y componentes compartidos
│   ├── design-system/     tokens, tipografía y utilidades
│   ├── hooks/             notificaciones y estado de sincronización
│   └── utils/             gráficos, fechas, búsqueda y validación
└── store.ts                Zustand para el estado central
```

### Persistencia

- Dexie/IndexedDB como fuente local.
- Tablas separadas para árboles, personas, relaciones, eventos, fotos, blobs y operaciones de sincronización.
- Tombstones mediante `deletedAt`.
- Revisión local, versión remota y cola de operaciones.

### Estado

- Zustand para datos cargados y árbol activo.
- Estado local de React para formularios y vistas temporales.
- `localStorage` para preferencias visuales y modo de interfaz.

### Sincronización

- Cola de operaciones pendientes.
- Resolución de conflictos.
- Sincronización realtime.
- Separación entre operaciones confirmadas y no confirmadas.

### Presentación

- React 19 y React Router.
- ReactFlow para la visualización.
- Vite 8 para desarrollo y build.
- Tailwind y componentes propios para el design system.

## 5. Riesgos y deuda técnica pendientes

### Alta prioridad

- Centralizar la configuración de estilo en Zustand o IndexedDB en vez de dejarla solo en `localStorage`.
- Implementar layouts vertical, horizontal y radial con lógica propia en vez de transformar el layout básico.
- Completar controles del diseñador para que sean persistentes y visibles.
- Incorporar acciones reales de compartir en vez de navegación de placeholder.
- Corregir cualquier flujo que todavía muestre filtros o controles sin efecto funcional.
- Validar relaciones complejas y prevenir posiciones inconsistentes con muchas generaciones.

### Prioridad media

- Reducir el bundle principal mediante code splitting.
- Revisar advertencias de hooks y variables sin uso en el lint.
- Añadir pruebas de interacción para aplicar/restaurar estilo y cambiar de árbol.
- Añadir pruebas para árboles con personas sin relaciones y múltiples generaciones.
- Definir una estrategia para fotos vacías, fallecidos y ausencia de fechas.
- Mejorar el bloqueo de envío de formularios y mensajes de error.

### Prioridad baja

- Internacionalización.
- Analítica de uso.
- Soporte para temas personalizados.
- Exportaciones y resúmenes imprimibles.

## 6. Checklist de calidad mañana

### Día 27 de noviembre

1. QA móvil real:
   - Controles táctiles.
   - Jerarquía visual.
   - Modal de creación.
   - Galería de estilos.
   - Página de perfil.

2. Persistencia de configuración:
   - Mover estilos a IndexedDB.
   - Restaurar configuración al cambiar de árbol.
   - No perder configuraciones al recargar.

3. Construcción completa del árbol:
   - Crear primer familiar.
   - Agregar padres.
   - Agregar pareja.
   - Agregar hijos.
   - Agregar hermanos.
   - Agregar fallecidos.

4. Corrección visual:
   - Quitar elementos administrativos sobrantes.
   - Evitar textos diminutos.
   - Mantener botones principales visibles.
   - Validar contraste en modo claro y oscuro.

5. Completar perfil familiar:
   - Datos personales.
   - Fecha y lugar.
   - Estado vivo/fallecido.
   - Fotografías.
   - Biografía.
   - Eventos.
   - Relaciones.

6. QA de datos:
   - Relaciones duplicadas.
   - Ciclos.
   - Eliminación con cascada.
   - Conflictos offline.
   - Sincronización Supabase.

## 7. Roadmap recomendado

### Sprint A - Estabilización

- Corregir todos los flujos visibles con callbacks vacíos.
- Completar persistencia de estilos.
- Mejorar estados vacíos y errores.
- Normalizar nombres, mensajes y tamaños de interfaz.

### Sprint B - Experiencia familiar

- Simplificar creación de personas.
- Mejorar recorrido por generaciones.
- Mostrar fallecidos con un tratamiento visual respetuoso.
- Crear álbum familiar por persona.
- Añadir historia y eventos relevantes.

### Sprint C - Compartir

- Invitaciones familiares.
- Permisos de edición.
- Actividades recientes.
- Comentarios o recuerdos.
- Resolución de conflictos comprensible para usuarios no técnicos.

### Sprint D - Producción

- Pruebas E2E.
- Auditoría de accesibilidad.
- Optimización del bundle.
- Hardening offline.
- Despliegue y monitoreo.

## 8. Criterios de salida para mañana

El proyecto podrá pasar a fase de producción interna cuando:

- Crear, abrir y cambiar árboles sea estable.
- Agregar familiares funcione sin pasos confusos.
- El árbol se vea correctamente con uno o muchas personas.
- Los estilos aplicados y restaurados sean persistentes.
- Fotos y datos personales puedan conservarse sin pérdida.
- Las páginas principales tengan una navegación clara y coherente.
- Todas las acciones visibles tengan efecto real.
- Las pruebas automatizadas cubran los flujos críticos.
