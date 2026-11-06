# FASE 1 — AUDITORÍA COMPLETA DE ARBOL-GEN-PRO
**Fecha:** 2026-11-05  
**Equipo:** Senior Frontend Architect + Senior UX/UI Designer + React/TS Specialist  
**Objetivo:** Diagnóstico técnico y visual antes de rediseño UX/UI  

---

## 📋 RESUMEN EJECUTIVO

**Estado Actual:** Aplicación funcional pero con **problemas críticos de accesibilidad, navegación y diseño visual** que afectan la experiencia de usuarios de 30-80 años.

**Problemas Críticos Identificados:** 8  
**Problemas Altos:** 12  
**Mejoras Medianas:** 11  

**Recomendación:** Implementar rediseño modular sin tocar lógica de negocio. La funcionalidad es sólida, pero la presentación y UX son mejorables.

---

## 🔍 ETAPA 1: AUDITORÍA DETALLADA

### 1. ARQUITECTURA Y ESTRUCTURA DEL CÓDIGO

#### ✅ Fortalezas
- Separación clara entre `core/db` (Supabase + IndexedDB), `features` (módulos), `shared` (componentes reutilizables)
- PWA configurada correctamente (service workers, offline-first)
- Sistema de sincronización Offline-First bien estructurado

#### ❌ Problemas

| Severidad | Problema | Ubicación | Impacto |
|-----------|----------|-----------|--------|
| **HIGH** | `App.tsx` monolítico (457 líneas) — toda lógica de estado centralizada | `src/App.tsx:1-100` | Difícil de mantener, testing complicado, rendimiento |
| **HIGH** | Múltiples componentes de vista (Home, EmotionalTree, PersonProfilePage) pero sin Layout claro | `src/App.tsx:17-20, 350-410` | UI desordenada, superposición de responsabilidades |
| **MEDIUM** | AuthContext o useAuth hook ausente — auth state disperso | `src/App.tsx:83-87` | 4 variables de auth (sessionEmail, authEmail, authPassword, authMsg) |
| **MEDIUM** | TreeWorkspace importado pero nunca usado correctamente en layout | `src/App.tsx:18` | Componente aparentemente huérfano |

**Recomendación Arquitectura:**
```
App
├── AppLayout (header, nav, main, footer)
│   ├── Header (auth, sync status, theme)
│   ├── Sidebar o Nav (navegación principal)
│   └── MainView (enrutador de vistas)
│       ├── HomeView
│       ├── TreeView
│       └── PersonView
├── AuthContext (centralizar toda auth)
└── DataContext (acceso a repositories)
```

---

### 2. NAVEGACIÓN Y FLUJO DE USUARIO

#### ❌ Problemas Críticos

| Problema | Severidad | Impacto |
|----------|-----------|--------|
| Navegación confusa — botones en header + nav + sidebar selector | **CRITICAL** | Usuarios perdidos, especialmente personas mayores |
| Botones con solo emoji (🏠 🌳 👤) sin etiquetas claras | **CRITICAL** | Inaceptable para accesibilidad WCAG |
| No hay onboarding — primera vez usuario ve pantalla vacía | **HIGH** | Abandono inmediato |
| Selector de árbol en nav horizontal, no integrado visualmente | **HIGH** | Confusión entre "navegación" y "selector de dato" |
| No hay "volver" claro desde PersonView → TreeView | **MEDIUM** | Desorientación en navegación |

#### Flujo Actual (Confuso)
```
Home (treeName, memories, recent activity)
  ↓ [Botón 🌳 Árbol]
TreeView (EmotionalTree + selector)
  ↓ [Click nodo]
PersonView (Perfil)
  ↓ [Botón 👤 Persona]
```

#### Flujo Propuesto (Intuitivo)
```
┌─────────────────────────────────────┐
│  HEADER: Logo + Sync + Auth + Theme │
├─────────────────────────────────────┤
│ NAV  │  MAIN                        │
│ Home │  [Vista actual]              │
│ Árbol│  - Home muestra intro        │
│ Perfil (si hay persona)│  - Árbol muestra tree      │
│      │  - Perfil muestra detalles   │
├─────────────────────────────────────┤
│ SELECTOR ÁRBOL (dropdown)           │
└─────────────────────────────────────┘
```

---

### 3. DISEÑO VISUAL Y PALETA CROMÁTICA

#### ❌ Problemas

| Problema | Severidad | Evidencia |
|----------|-----------|-----------|
| **Paleta SATURADA** | **CRITICAL** | 8 colores primarios (tangerine, cerulean, charcoal, ivory, red, amber, green, gray) simultáneamente activos |
| **Tipografía indefinida** | **HIGH** | `font-serif-titles`, `font-serif-content` sin fallbacks en typography.css |
| **Espaciados inconsistentes** | **HIGH** | py-4, py-6, py-8, py-12 ad-hoc; sin escala sistema |
| **Sombras no sistemáticas** | **MEDIUM** | `shadow-sm` usado pero no definido en tokens.css |
| **Contraste WCAG incumplido** | **CRITICAL** | Tangerine (#FF6B35) sobre fondo claro: ratio ~3.5:1 (requiere 4.5:1) |
| **Botones no consistentes** | **HIGH** | Tamaños: sm, md sin documentación clara |
| **Iconografía mixta** | **MEDIUM** | Emojis (🏠🌳👤) + SVG inline sin sistema |

#### Paleta Actual (Problemática)
```css
🟠 Tangerine #FF6B35     — Acentos primarios
🔵 Cerulean #0891B2      — Acentos secundarios  
🔴 Red #EF4444           — Vivos (personas)
🟡 Amber #F59E0B         — Pendiente
🟢 Green #10B981         — Sincronizado
⚫ Charcoal #2D3748       — Textos
⚪ Ivory #FFF9E8          — Secundarios
🩶 Gray #6B7280          — Fallecidos
```

**Problema:** Demasiados colores compitiendo. Usuarios mayores necesitan jerarquía clara.

---

### 4. ACCESIBILIDAD (CRÍTICA PARA 30-80 AÑOS)

#### 🔴 PROBLEMAS CRÍTICOS

| Problema | WCAG | Impacto |
|----------|------|---------|
| **Textos pequeños** (text-xs, text-sm) | **Level AAA FAIL** | Ilegibles para usuarios 60+. Mínimo debe ser 16px. |
| **Contraste insuficiente** | **Level AA FAIL** | Tangerine sobre blanco: ~3.5:1 (requiere 4.5:1 para normal, 7:1 para AAA) |
| **Sin aria-label** | **Level A FAIL** | Botones emoji (🏠) sin descripción: `aria-label="Inicio"` |
| **Focus states invisibles** | **Level A FAIL** | :focus-visible no definido; usuarios keyboard-only perdidos |
| **No hay indicador de estado actual** | **Level A FAIL** | Nav tab activo no resalta claramente (solo variant="primary") |

#### Recomendaciones WCAG AA (Mínimo obligatorio)

1. **Tipografía:**
   - Mínimo: `16px` (text-base)
   - Recomendado: `18px` (text-lg) para cuerpo
   - Encabezados: `24px` (text-2xl) o mayores

2. **Contraste:**
   - Texto normal: 4.5:1
   - Texto grande: 3:1
   - Componentes UI: 3:1

3. **Interactividad:**
   - Todos los botones: aria-label + aria-describedby si es necesario
   - :focus-visible: outline 2-3px en color alto contraste
   - Estados activos: visualmente distintos (no solo color)

4. **Motor de búsqueda (SEO):**
   - Agregar semantic HTML: `<nav>`, `<main>`, `<header>`, `<footer>`
   - Etiquetas <label> en formularios

---

### 5. DISEÑO RESPONSIVO

#### ❌ Problemas

| Problema | Severidad | Dispositivos Afectados |
|----------|-----------|------------------------|
| **EmotionalTree requiere scroll horizontal** | **CRITICAL** | Mobile <600px |
| **Header nav overflow** | **HIGH** | Mobile <640px |
| **Home title no escala fluidamente** | **MEDIUM** | iPad, teléfono pequeño |
| **Modal ancho fijo** | **MEDIUM** | Mobile pequeño (<375px) |

#### Dispositivos Objetivo
- **iPhone SE (375px)** ← Peor caso
- **iPhone 13 (390px)** 
- **Android 5" (480px)**
- **iPad (768px)**
- **Desktop (1440px+)**

#### Problemas Específicos

**Mobile (<640px):**
```
Header: OK (flex-wrap)
Nav: ❌ 4 botones + selector = overflow horizontal
Tree: ❌ Ancho fijo, scroll obligatorio
Home: ❌ Tipografía no responsiva
```

**Tablet (768px):**
```
Bien en general, pero EmotionalTree aún ancho fijo
```

**Desktop (1440px+):**
```
max-w-4xl (1024px) limita contenido
EmotionalTree bien
```

---

### 6. COMPONENTES REUTILIZABLES

#### ✅ Componentes Existentes
- `Button` (variants: primary, ghost; sizes: sm, md)
- `Card` (radius: sm, md, lg)
- `Modal` (basic)
- `Input` (basic)

#### ❌ Problemas y Faltas
| Componente | Problema | Prioridad |
|-----------|----------|-----------|
| Button | Sin documentación de variantes; focus-visible falta | **MEDIUM** |
| Card | Sin propiedades de padding automatizadas | **MEDIUM** |
| Modal | Sin header/body/footer slots; contenido no escalable | **HIGH** |
| Input | Sin label integrado; sin error state visual | **MEDIUM** |
| TabNav | **NO EXISTE** — nav buttons ad-hoc | **CRITICAL** |
| SideNav | **NO EXISTE** — layout horizontal confuso | **CRITICAL** |
| EmptyState | **NO EXISTE** — componentes vacíos sin CTA | **HIGH** |
| Toast/Alert | **NO EXISTE** — feedback de acciones invisible | **MEDIUM** |

---

### 7. SINCRONIZACIÓN Y DATOS

#### ✅ Fortalezas
- Sync status badge en header (✅ Sincronizado, ⏳ Pendiente, 🔄 Sincronizando, ❌ Error)
- Offline-first architecture sólida
- Caché en IndexedDB

#### ❌ Problemas
| Problema | Severidad |
|----------|-----------|
| Conflictos (conflictOps) nunca mostrados al usuario | **HIGH** |
| Sin indicador visual en nodos sincronizando | **MEDIUM** |
| Sin toast/notificación de "Cambios guardados" | **MEDIUM** |

---

### 8. FLUJOS Y FUNCIONALIDAD

#### Wizard (Crear Árbol)
- **Estado:** Existe, pero sin confirmación clara
- **Problema:** Pasos no visuales; usuario no ve progreso
- **Recomendación:** Agregar step indicators

#### QuickAdd (Agregar familiar)
- **Estado:** Existe modal simple
- **Problema:** No guía al usuario en tipos de relación
- **Recomendación:** Campos dinámicos según tipo (padre/madre/hijo/pareja)

#### PersonProfilePage
- **Estado:** Básico, solo muestra personId
- **Problema:** No implementado; falta galería, documentos, eventos
- **Recomendación:** Usar datos ya disponibles (personGallery, personDocuments, personEvents)

---

## 🎨 ETAPA 2: NUEVO SISTEMA DE DISEÑO (PROPUESTO)

### A. PALETA CROMÁTICA SIMPLIFICADA

```css
/* Light mode */
--color-primary: #2D5A3D        /* Verde bosque (familiar, confianza) */
--color-primary-light: #4A7C56  /* Verde claro hover */
--color-primary-dark: #1F3D2A   /* Verde oscuro focus */

--color-accent: #D4A574         /* Dorado cálido (fotografía antigua, legado) */
--color-accent-hover: #C4955E   /* Dorado oscuro */

--color-neutral-50: #FAFAF8     /* Casi blanco (papel) */
--color-neutral-100: #F5F5F2    /* Blanco roto */
--color-neutral-200: #E8E8E5    /* Gris muy claro */
--color-neutral-400: #9CA3A3    /* Gris medio */
--color-neutral-600: #5A6A6A    /* Gris oscuro */
--color-neutral-900: #1A1A1A    /* Casi negro */

--color-text-primary: #1A1A1A   /* Alto contraste para legibilidad */
--color-text-secondary: #5A6A6A /* Textos secundarios */

--color-success: #059669        /* Verde éxito (WCAG AA compatible) */
--color-warning: #D97706        /* Ámbar advertencia */
--color-error: #DC2626          /* Rojo error */
--color-info: #0891B2           /* Azul información */

/* Dark mode */
.dark {
  --color-primary: #7CB98C
  --color-accent: #E8C8A0
  --color-neutral-50: #1A1A1A
  --color-neutral-100: #2D2D2D
  --color-neutral-900: #F5F5F2
  --color-text-primary: #F5F5F2
}
```

**Justificación:**
- Verde + Dorado = familiaridad, álbum antiguo, naturaleza
- Colores accesibles: ratios WCAG AA mínimo 4.5:1
- Menos de 3 colores principales activos simultáneamente

---

### B. TIPOGRAFÍA

```css
/* Fuentes */
--font-serif: 'Lora', 'Georgia', serif          /* Títulos: familiaridad, calidez */
--font-sans: 'Inter', 'Segoe UI', sans-serif    /* Cuerpo: legibilidad moderna */
--font-mono: 'JetBrains Mono', monospace        /* Código/timestamps */

/* Escala */
--text-xs: 12px              /* NO USAR en interfaces principales */
--text-sm: 14px              /* UI secundaria, helper text */
--text-base: 16px            /* Cuerpo estándar (mínimo WCAG) */
--text-lg: 18px              /* Cuerpo recomendado (accesibilidad++) */
--text-xl: 20px              /* Subtítulos */
--text-2xl: 24px             /* Encabezados secundarios */
--text-3xl: 32px             /* Encabezados principales */
--text-4xl: 40px             /* Hero titles */

/* Weights */
--font-light: 300            /* Subtítulos, decorativo */
--font-normal: 400           /* Cuerpo estándar */
--font-semibold: 600         /* Énfasis, labels */
--font-bold: 700             /* Encabezados, buttons */

/* Line heights */
--leading-tight: 1.2         /* Encabezados */
--leading-normal: 1.5        /* Cuerpo estándar */
--leading-relaxed: 1.75      /* Párrafos largos */
```

---

### C. ESPACIADO Y GRID

```css
/* Escala (4px base) */
--space-0: 0
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px

/* Contenedores */
--container-xs: 576px        /* Mobile */
--container-sm: 640px        /* Mobile landscape */
--container-md: 768px        /* Tablet */
--container-lg: 1024px       /* Desktop pequeño */
--container-xl: 1280px       /* Desktop grande */

/* Padding global */
--padding-xs: 12px
--padding-sm: 16px
--padding-md: 24px
--padding-lg: 32px
```

---

### D. COMPONENTES (NUEVOS + MEJORADOS)

#### 1. **TabNav** (Navegación Principal)
```tsx
<TabNav
  tabs={[
    { id: 'home', label: 'Inicio', icon: 'Home' },
    { id: 'tree', label: 'Mi Árbol', icon: 'Tree' },
    { id: 'person', label: 'Perfil', icon: 'User' }
  ]}
  active="home"
  onChange={setView}
  className="sticky-top"
/>
```

#### 2. **SideNav** (Alternativa para desktop)
```tsx
<SideNav width="280px" className="flex-none">
  <SideNavItem>Inicio</SideNavItem>
  <SideNavItem>Mi Árbol</SideNavItem>
  <SideNavDivider />
  <SideNavLabel>Árbol Actual</SideNavLabel>
  <SideNavDropdown />
</SideNav>
```

#### 3. **EmptyState** (Vistas vacías)
```tsx
<EmptyState
  icon="Tree"
  title="No hay árbol creado"
  description="Comienza creando tu primer árbol familiar"
  action={<Button>Crear Árbol</Button>}
/>
```

#### 4. **Button** (Mejorado)
```tsx
<Button
  variant="primary" | "secondary" | "ghost" | "danger"
  size="sm" | "md" | "lg"
  state="default" | "loading" | "disabled"
  fullWidth={true}
  icon="Plus"
  aria-label="Crear"
/>
```

#### 5. **Card** (Con slots)
```tsx
<Card>
  <CardHeader title="Título" subtitle="Subtítulo" />
  <CardBody>Contenido</CardBody>
  <CardFooter>
    <Button>Acción</Button>
  </CardFooter>
</Card>
```

#### 6. **Modal** (Mejorado)
```tsx
<Modal isOpen onClose>
  <ModalHeader>Título</ModalHeader>
  <ModalBody>Contenido</ModalBody>
  <ModalFooter>
    <Button>Cancelar</Button>
    <Button variant="primary">Confirmar</Button>
  </ModalFooter>
</Modal>
```

#### 7. **Toast/Alert**
```tsx
<Toast
  type="success" | "error" | "warning" | "info"
  message="Cambios guardados"
  action={<Button>Deshacer</Button>}
  autoClose={3000}
/>
```

---

## 🎯 ETAPA 3: EXPERIENCIA DE USUARIO

### Flujo Principal Propuesto

#### Pantalla 1: Home
```
┌──────────────────────────────┐
│ Árbol Gen Pro                │
│ ─────────────────────────────│
│                              │
│  🌳 Tu Familia               │
│  Mi familia                  │
│  ────────────────────────    │
│                              │
│  [Explorar Árbol]  [Agregar] │
│                              │
│  ────────────────────────────│
│  Actividad Reciente:         │
│  • Abuela agregó foto        │
│  • Papá actualizó perfil     │
│                              │
│  ────────────────────────────│
│  Recuerdos Destacados:       │
│  [Foto] [Foto] [Foto]        │
│                              │
└──────────────────────────────┘
```

#### Pantalla 2: Árbol
```
┌──────────────────────────────┐
│ 🌳 Mi Árbol                  │
│ ────────────────────────────|
│ Generaciones: [Selector]    │
│                              │
│   [Abuelo] ─── [Abuela]      │
│       │                       │
│       └─→ [Papá] ── [Mamá]   │
│             │                 │
│             └─→ [Yo] ── [Esp] │
│                   │           │
│                   └─→ [Hijo]  │
│                              │
│ [+] Agregar Familiar         │
│                              │
└──────────────────────────────┘
```

#### Pantalla 3: Perfil de Persona
```
┌──────────────────────────────┐
│ ← Papá García                │
│ ────────────────────────────|
│                              │
│ [Foto] (1955 - 2024)         │
│                              │
│ Familia:                     │
│ • Padres: Abuelo, Abuela     │
│ • Pareja: Mamá               │
│ • Hijos: Yo, Tía             │
│                              │
│ Eventos:                     │
│ • Nacimiento: 15/03/1955     │
│ • Muerte: 02/11/2024         │
│                              │
│ Galería: [4 fotos]           │
│ Documentos: [Partida]        │
│                              │
│ [Editar] [Agregar Foto]      │
│                              │
└──────────────────────────────┘
```

---

## ✅ ETAPA 4: PLAN DE IMPLEMENTACIÓN

### Fase 1a: Preparación (No toca código)
- ✅ Auditoría completada (ESTE DOCUMENTO)
- Define constantes en `tokens.css`
- Crea componentes nuevos (TabNav, SideNav, EmptyState, Toast)

### Fase 1b: Componentes Nuevos (Módulo UI)
- [ ] Crear `src/shared/components/ui/TabNav.tsx`
- [ ] Crear `src/shared/components/ui/EmptyState.tsx`
- [ ] Crear `src/shared/components/ui/Toast.tsx`
- [ ] Mejorar `src/shared/components/ui/Button.tsx` (focus-visible)
- [ ] Mejorar `src/shared/components/ui/Modal.tsx` (slots)

### Fase 2: Refactorización Arquitectura
- [ ] Crear `src/layout/AppLayout.tsx`
- [ ] Crear `src/context/AuthContext.tsx`
- [ ] Crear `src/context/DataContext.tsx`
- [ ] Refactorizar `src/App.tsx` (reducir a 150 líneas)

### Fase 3: Rediseño Visual
- [ ] Actualizar `tokens.css` con nueva paleta + tipografía
- [ ] Actualizar `App.tsx` layout con nuevo nav
- [ ] Actualizar `Home.tsx` con EmptyState
- [ ] Mejora responsive en `EmotionalTree.tsx`

### Fase 4: Validación
- [ ] `npm run lint` ✅
- [ ] `npm run build` ✅
- [ ] WCAG AA contrast check ✅
- [ ] Test responsive (mobile, tablet, desktop) ✅

---

## 🔐 PROTECCIÓN DE FUNCIONALIDADES

### NO TOCAR (Mantener intacto)
```
✅ Supabase auth (toda la lógica en core/supabase)
✅ IndexedDB y almacenamiento local
✅ Sincronización Offline-First
✅ Datos: Person, Relationship, Event, Photo, Tree
✅ Repositories: personRepository, relationshipRepository, etc.
✅ Modelos de datos y rutas sync
✅ PWA (service workers, manifest)
```

### REFACTORIZAR (Solo UI/UX, lógica igual)
```
✅ App.tsx — separar en componentes
✅ Navegación — mejorar UX
✅ Estilos — nuevo diseño system
✅ Componentes UI — mejorar accesibilidad
✅ Modales/Formularios — mejorar claridad
```

---

## 📊 RESUMEN DE HALLAZGOS

| Categoría | CRITICAL | HIGH | MEDIUM | LOW | Total |
|-----------|----------|------|--------|-----|-------|
| Accesibilidad | 3 | 2 | 1 | 0 | **6** |
| Diseño Visual | 2 | 3 | 3 | 2 | **10** |
| Navegación | 2 | 2 | 1 | 0 | **5** |
| Responsive | 1 | 2 | 1 | 0 | **4** |
| Arquitectura | 0 | 1 | 2 | 0 | **3** |
| Componentes | 0 | 2 | 2 | 1 | **5** |
| Funcionalidad | 0 | 1 | 1 | 1 | **3** |
| **TOTAL** | **8** | **13** | **11** | **4** | **36** |

---

## 🎬 PRÓXIMOS PASOS

1. **Aprobación:** ¿Aprueban el diagnóstico y el nuevo sistema de diseño?
2. **FASE 2:** Proponer estructura de componentes nuevos
3. **FASE 3:** Definir tokens y estilos
4. **FASE 4:** Implementación modular con validación en cada paso

**Responsable:** Equipo Senior Frontend + UX/UI  
**Tiempo estimado:** 3-4 sprints (modular, sin urgencia)  
**Riesgo:** Bajo (no toca lógica, solo presentación)  

---

*Fin de Auditoría — Lista para siguiente fase*
