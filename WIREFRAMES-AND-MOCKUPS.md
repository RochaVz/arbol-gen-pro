# WIREFRAMES Y MOCKUPS — NUEVO DISEÑO

**Arbol Gen Pro — FASE 2 Visual Preview**

---

## WIREFRAME 1: HOME VIEW (Desktop)

```
┌────────────────────────────────────────────────────────────────┐
│ Árbol Gen Pro          [Sync: ✅] [👤 User] [🌙] [Inst]        │  HEADER
├────────────────────────────────────────────────────────────────┤
│ [🏠 Inicio] [🌳 Mi Árbol] [👤 Perfil]                          │  TAB NAV
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │         🌳 BIENVENIDO A ÁRBOL GEN PRO                   │ │ EMPTY STATE
│  │                                                          │ │
│  │  Tu espacio para preservar y compartir la historia      │ │
│  │  familiar. Crea tu árbol, agrega familiares y          │ │
│  │  captura momentos especiales.                           │ │
│  │                                                          │ │
│  │  ┌──────────────────────┐    ┌──────────────┐          │ │
│  │  │ → Crear primer árbol │    │ Ver guía     │          │ │
│  │  └──────────────────────┘    └──────────────┘          │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Árbol Actual: [Mi familia              ▼] [Cambiar]          │  SELECTOR
│                                                                │
└────────────────────────────────────────────────────────────────┘

COLORES:
- Header BG: Verde primario #2D5A3D
- Texto header: Blanco
- Tab activo: Dorado #D4A574
- Botón primario: Verde #2D5A3D
- Botón secundario: Gris #9CA3A3
- Text principal: #1A1A1A
```

---

## WIREFRAME 2: HOME VIEW CON CONTENIDO (Desktop)

```
┌────────────────────────────────────────────────────────────────┐
│ Árbol Gen Pro                    [Sync] [User] [🌙]            │  HEADER
├────────────────────────────────────────────────────────────────┤
│ [🏠 Inicio] [🌳 Mi Árbol] [👤 Perfil]                          │  TAB NAV (Inicio activo)
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  HERO                                                          │
│  ═══════════════════════════════════════════════════════════  │
│  Tu historia familiar                                         │
│                                                                │
│  Un lugar para preservar el legado, las fotografías y los     │
│  recuerdos de generaciones pasadas, presentes y futuras.      │
│                                                                │
│                                                                │
│  FEATURED TREE                                                 │
│  ═══════════════════════════════════════════════════════════  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🌳 Mi familia                                           │ │
│  │                                                         │ │
│  │ 4 personas, 3 generaciones                              │ │
│  │                                                         │ │
│  │ [→ Explorar Árbol]          [+ Agregar Familiar]       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
│  RECENT ACTIVITY                                               │
│  ═══════════════════════════════════════════════════════════  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Actividad Reciente                                      │ │
│  │                                                         │ │
│  │ • Abuela agregó una foto (hace 2 horas)                 │ │
│  │ • Papá actualizó su perfil (ayer)                       │ │
│  │ • Mamá agregó evento (hace 3 días)                      │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
│  FEATURED MEMORIES                                             │
│  ═══════════════════════════════════════════════════════════  │
│  Recuerdos Destacados                                         │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │             │  │             │  │             │         │
│  │ [FOTO 1]    │  │ [FOTO 2]    │  │ [FOTO 3]    │         │
│  │             │  │             │  │             │         │
│  │ Descripción │  │ Descripción │  │ Descripción │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Árbol: [Mi familia ▼] [Cambiar]                              │
└────────────────────────────────────────────────────────────────┘

TIPOGRAFÍA:
- "Tu historia familiar" = h1 (32px, serif, bold)
- "Párrafo" = p (16px, sans, normal)
- "Títulos secciones" = h2 (24px, serif, bold)
- Labels = 14px (text-sm, sans)
```

---

## WIREFRAME 3: TREE VIEW (Desktop)

```
┌────────────────────────────────────────────────────────────────┐
│ Árbol Gen Pro          [Sync: ✅ Sincronizado]                 │
├────────────────────────────────────────────────────────────────┤
│ [🏠 Inicio] [🌳 Mi Árbol] [👤 Perfil] ← "Mi Árbol" ACTIVO      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  TREE TOOLBAR                                                  │
│  ═════════════════════════════════════════════════════════   │
│  Generaciones: [⊖ -] [3] [+ ⊕]   [Descargar] [Compartir]     │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │  ÁRBOL GENEALÓGICO (SVG Responsivo)                   │  │
│  │                                                        │  │
│  │       ┌─────────────────────────────┐                 │  │
│  │       │ Abuelo 🏠 │ Abuela 🏠       │                 │  │
│  │       │ (1930-2010)                 │                 │  │
│  │       └─────────────────────────────┘                 │  │
│  │               │                                        │  │
│  │       ┌───────┴──────────┬──────────────────┐         │  │
│  │       │                  │                  │         │  │
│  │   ┌─────────┐         ┌──────────┐     ┌──────┐       │  │
│  │   │ Papá 🏠 │         │ Tía 🏠   │     │Tío 🏠│       │  │
│  │   └─────────┘         └──────────┘     └──────┘       │  │
│  │       │                                                │  │
│  │   ┌─────────┴─────────────────┬──────────────┐        │  │
│  │   │                           │              │        │  │
│  │ ┌──────┐  ┌──────┐ ┌──────┐  ┌──────┐   ┌──────┐     │  │
│  │ │ Yo ✓ │─ │Pareja│ │Mamá 🏠  │ Primo│   │Prima │     │  │
│  │ └──────┘  └──────┘ └──────┘  └──────┘   └──────┘     │  │
│  │   │        │                                          │  │
│  │   └────────┬──────────────────┐                      │  │
│  │            │                  │                      │  │
│  │        ┌────────┐          ┌────────┐               │  │
│  │        │Hijo 1🏠│          │Hijo 2🏠│               │  │
│  │        └────────┘          └────────┘               │  │
│  │                                                      │  │
│  │  [+ Agregar Padre] [+ Agregar Madre]               │  │
│  │  [+ Agregar Pareja] [+ Agregar Hijo]               │  │
│  │                                                      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Árbol: [Mi familia ▼] [Cambiar]                              │
└────────────────────────────────────────────────────────────────┘

ICONOGRAFÍA EN NODOS:
- 🏠 = Persona viva (icono casa verde)
- ✓ = Persona activa/seleccionada
- ✝ = Persona fallecida (color gris)
- ⏳ = Sincronizando (spinner sutil)
- ❌ = Error sincronización
```

---

## WIREFRAME 4: PERSON VIEW (Desktop)

```
┌────────────────────────────────────────────────────────────────┐
│ Árbol Gen Pro          [Sync: ✅]                              │
├────────────────────────────────────────────────────────────────┤
│ [🏠 Inicio] [🌳 Mi Árbol] [👤 Perfil] ← "Perfil" ACTIVO        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [← Volver]                                                    │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ HEADER DE PERFIL                                        │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  [FOTO PERFIL 200x200px]    PAPÁ GARCÍA López          │ │
│  │                             1955 - 2024  (✝ Fallecido)  │ │
│  │                                                          │ │
│  │                             [Editar] [Eliminar]         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────────┬──────────────────────────────────┐  │
│  │ FAMILIA              │ EVENTOS Y DOCUMENTOS             │  │
│  ├─────────────────────┼──────────────────────────────────┤  │
│  │                     │                                  │  │
│  │ PADRES              │ EVENTOS                          │  │
│  │ • Abuelo (fallecido)│ • Nacimiento: 15/03/1955        │  │
│  │ • Abuela            │ • Matrimonio: 12/06/1980        │  │
│  │ [+ Agregar padre]   │ • Fallecimiento: 02/11/2024     │  │
│  │                     │ [+ Agregar evento]               │  │
│  │ PAREJA              │                                  │  │
│  │ • Mamá García       │ DOCUMENTOS                       │  │
│  │ [+ Agregar pareja]  │ • Partida de nacimiento         │  │
│  │                     │ • Certificado matrimonio        │  │
│  │ HIJOS               │ • Testamento                    │  │
│  │ • Yo                │ [+ Agregar documento]            │  │
│  │ • Tía               │                                  │  │
│  │ [+ Agregar hijo]    │                                  │  │
│  │                     │                                  │  │
│  └─────────────────────┴──────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ GALERÍA                                                 │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │ │
│  │ │ [IMG]│ │ [IMG]│ │ [IMG]│ │ [IMG]│ │[+IMG]│          │ │
│  │ │ 2020 │ │ 2019 │ │ 2018 │ │ 2017 │ │Agreg│          │ │
│  │ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [Editar Perfil] [Compartir] [Descargar Info]                │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Árbol: [Mi familia ▼] [Cambiar]                              │
└────────────────────────────────────────────────────────────────┘
```

---

## WIREFRAME 5: MOBILE VIEW (375px - iPhone SE)

```
┌─────────────────────────────────────────┐
│ Árbol Gen Pro      [Sync] [👤] [🌙]     │  HEADER (Compact)
├─────────────────────────────────────────┤
│ [🏠 Inicio]  [🌳 Árbol]  [👤 Perfil]   │  TAB NAV (Vertical icons)
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │    🌳 BIENVENIDO                  │ │  EMPTY STATE
│  │                                   │ │  (Responsive)
│  │  Preserva tu historia familiar    │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ → Crear primer árbol        │ │ │
│  │  └─────────────────────────────┘ │ │
│  │                                   │ │
│  │  ┌─────────────────────────────┐ │ │
│  │  │ Ver guía                    │ │ │
│  │  └─────────────────────────────┘ │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Árbol: Mi familia ▼               │ │  SELECTOR
│  │ [Cambiar]                         │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘

AJUSTES MOBILE:
- Header: Logo + Sync + Menu (hamburger en <640px)
- TabNav: Solo texto, sin icons
- Cards: Full-width con margen
- Botones: 44px altura mínima
- Tipografía: Escalada con clamp()
- Scroll: Solo vertical, NUNCA horizontal
```

---

## WIREFRAME 6: WIZARD MODAL (Create Tree - 3 Steps)

```
MODAL STEP 1: "Nombre del Árbol"
┌────────────────────────────────────────┐
│ Crear tu primer árbol familiar          │  MODAL HEADER
│ Paso 1 de 3                             │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ ┌─ ● ─ ● ─ ● ┐  Progress        │ │  STEP INDICATOR
│  │ └─────────────┘  1 de 3          │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ¿Cómo se llama tu árbol familiar?    │  PROMPT
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ [Mi familia               ] [×]  │ │  INPUT FIELD
│  └──────────────────────────────────┘ │
│                                        │
│  Ejemplos: "Familia García",           │  HELPER TEXT
│            "Árbol de los López",       │
│            "Generación Aguirre"        │
│                                        │
│  ┌────────────┐  ┌────────────────┐  │
│  │  Cancelar  │  │   Siguiente →  │  │  FOOTER
│  └────────────┘  └────────────────┘  │
│                                        │
└────────────────────────────────────────┘

MODAL STEP 2: "Tus Datos"
┌────────────────────────────────────────┐
│ Crear tu primer árbol familiar          │
│ Paso 2 de 3                             │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐ │
│  │ ┌─ ✓ ─ ● ─ ● ┐  Progress        │ │
│  │ └─────────────┘  2 de 3          │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Perfil central del árbol              │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Nombre                           │ │
│  │ [Eduardo              ] [×]      │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Apellido                         │ │
│  │ [Pérez                ] [×]      │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Estado de vida                   │ │
│  │ [Vivo/a ▼]                       │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌────────────┐  ┌────────────────┐  │
│  │  ← Atrás   │  │   Siguiente →  │  │
│  └────────────┘  └────────────────┘  │
│                                        │
└────────────────────────────────────────┘

MODAL STEP 3: "Confirmar"
┌────────────────────────────────────────┐
│ Crear tu primer árbol familiar          │
│ Paso 3 de 3                             │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐ │
│  │ ┌─ ✓ ─ ✓ ─ ● ┐  Progress        │ │
│  │ └─────────────┘  3 de 3          │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ✓ ¡Casi listo!                       │
│                                        │
│  Árbol:    "Mi familia"                │
│  Centro:   Eduardo Pérez               │
│  Estado:   Vivo/a                      │
│                                        │
│  Podrás agregar más familiares         │
│  después de crear el árbol.            │
│                                        │
│  ┌────────────┐  ┌────────────────┐  │
│  │  ← Atrás   │  │  Crear → [●]   │  │  Loading state
│  └────────────┘  └────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

---

## COMPARATIVA ANTES/DESPUÉS

### ANTES (Actual)
```
┌─ 🟠 NARANJA + 🔵 AZUL ────────────────┐
│ Árbol Gen Pro | Instalar | Auth      │
├─ Mixed Navigation ────────────────────┤
│ [🏠] [🌳] [👤] | Selector | [Crear] │
├─────────────────────────────────────────┤
│                                         │
│  Home (vacío, sin contexto)             │
│  ↓ text-sm (14px - ilegible)            │
│                                         │
└─────────────────────────────────────────┘

Problemas visuales:
❌ 8 colores simultáneamente
❌ Texto pequeño
❌ Sin jerarquía clara
❌ Saturado, caótico
```

### DESPUÉS (Propuesto)
```
┌─ 🌲 VERDE + 💛 DORADO ─────────────────┐
│ Árbol Gen Pro          [Sync] [👤] [🌙]│
├─ Clean TabNav ─────────────────────────┤
│ [🏠 Inicio] [🌳 Mi Árbol] [👤 Perfil] │
├─────────────────────────────────────────┤
│                                         │
│  ┌─ EMPTY STATE ───────────────────┐  │
│  │ 🌳 Bienvenido                   │  │
│  │ Tu espacio familiar              │  │
│  │ [→ Crear primer árbol]          │  │
│  └─────────────────────────────────┘  │
│                                         │
│  text-base (16px - legible)             │
│  Alto contraste, accesible              │
│                                         │
└─────────────────────────────────────────┘

Mejoras visuales:
✅ 3 colores primarios
✅ Tipografía clara y legible
✅ Jerarquía visual obvia
✅ Limpio, profesional, moderno
✅ WCAG AA compliant
```

---

## COLOR PALETTE (Implementación CSS)

```css
/* PRIMARIOS */
.bg-primary { background-color: #2D5A3D; }
.text-primary { color: #2D5A3D; }
.border-primary { border-color: #2D5A3D; }

/* ACCENT */
.bg-accent { background-color: #D4A574; }
.text-accent { color: #D4A574; }
.hover\:text-accent:hover { color: #D4A574; }

/* NEUTRAL */
.bg-neutral-50 { background-color: #FAFAF8; }
.bg-neutral-100 { background-color: #F5F5F2; }
.text-neutral-900 { color: #1A1A1A; }

/* BUTTONS */
.btn-primary {
  background: #2D5A3D;
  color: white;
  border-radius: 6px;
}

.btn-primary:hover {
  background: #1F3D2A;
}

.btn-primary:focus-visible {
  outline: 2px solid #2D5A3D;
  outline-offset: 2px;
}
```

---

## TIPOGRAFÍA EN USO

```css
/* H1 — Hero Title */
font-family: 'Lora', serif;
font-size: clamp(1.75rem, 5vw, 2.5rem);
font-weight: 700;
line-height: 1.2;

/* Cuerpo — Body Text */
font-family: 'Inter', sans-serif;
font-size: 1rem;        /* 16px - MÍNIMO WCAG */
line-height: 1.6;

/* Labels — Input Labels */
font-size: 0.875rem;    /* 14px */
font-weight: 600;
```

---

*Wireframes y Mockups — FASE 1 Auditoría*  
*Listo para diseño detallado en FASE 2*
