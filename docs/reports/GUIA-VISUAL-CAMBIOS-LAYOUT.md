# 🎨 Guía Visual: Cambios de Layout y Diseño

## 1. Home Page - Transformación Completa

### Estructura Anterior
```
┌─────────────────────────────────────┐
│ Header                              │
│ "Tu historia familiar"              │
└─────────────────────────────────────┘

┌──────────────────┐
│  FeaturedTree    │  (pequeño)
│  (max-w-2xl)     │
└──────────────────┘

┌────────────┬────────────┐
│ Actividad  │  Familia   │  (compacto)
└────────────┴────────────┘

┌──────────────────┐
│  Recuerdos       │  (compacto)
└──────────────────┘

┌────┬────┬────┐
│ Btn│ Btn│ Btn│  (pequeños)
└────┴────┴────┘
```

### Nueva Estructura
```
┌───────────────────────────────────────────────────────────────┐
│                    HERO HEADER ELEVADO                         │
│                    🌳 Árbol Familiar                           │
│  Descripción clara y detallada con mejor tipografía          │
│  ┌──────────────────────┐  ┌──────────────────┐              │
│  │ 🌳 Ver árbol        │  │ ➕ Agregar       │              │
│  └──────────────────────┘  └──────────────────┘              │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│              FEATURED TREE - HERO IMAGE GRANDE                │
│  ════════════════════════════════════════════════════════════ │
│  [IMAGEN 320x320px]                                           │
│  [Avatares de miembros con tooltips]                          │
└───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┬──────────────────────────┐
│  ACTIVIDAD RECIENTE (2/3 ancho)    │  FAMILIA (1/3 ancho)    │
│  ╔═════════════════════════════════╗ │ ╔════════════════════╗ │
│  ║ 📰 Actividad reciente           ║ │ ║ 👥 Familia        ║ │
│  ║ ─────────────────────────────── ║ │ ║ 6 miembros        ║ │
│  ║ 📸 Juan agregó a María         ║ │ ║ ───────────────── ║ │
│  ║ hace 2 días                     ║ │ ║ [Avatar] Juan    ║ │
│  ║ ─────────────────────────────── ║ │ ║ [Avatar] María   ║ │
│  ║ ✏️  María actualizó su perfil   ║ │ ║ [Avatar] Carlos  ║ │
│  ║ hace 1 semana                   ║ │ ║ ...              ║ │
│  ╚═════════════════════════════════╝ │ ╚════════════════════╝ │
└─────────────────────────────────────┴──────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                  RECUERDOS DESTACADOS                          │
│  ┌──────────────┬──────────────┬──────────────┐               │
│  │ [IMG] 📸     │ [IMG] 📸     │ [IMG] 📸     │               │
│  │ Vacaciones   │ Cumpleaños   │ Navidad      │               │
│  │ 2023         │ 2023         │ 2023         │               │
│  └──────────────┴──────────────┴──────────────┘               │
└───────────────────────────────────────────────────────────────┘

┌─────────────┬─────────────┬──────────────┐
│ ➕ Agregar  │ 🌳 Árbol    │ 📸 Galería   │  (más grandes)
└─────────────┴─────────────┴──────────────┘
```

### Cambios Clave
- **Max-width**: 640px → 1280px
- **Padding**: 16px → 32px
- **Gaps**: 16px → 32px
- **Card elevation**: subtle → pronounced
- **Header**: inline → hero block
- **FeaturedTree**: 48px height → 320px height
- **Grid**: 2 cols → 2-3 adaptive cols

---

## 2. PersonProfilePage - De Mínimo a Profesional

### Antes
```
┌──────────────────────┐
│ Perfil de Persona    │
│ Person ID: xyz       │
└──────────────────────┘
```

### Después
```
┌─────────────────────────────────────────────────────────────┐
│ ← Volver                              ✏️ Editar Perfil      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    HERO PROFILE SECTION                      │
│  ┌─────────────┐   ┌─────────────────────────────────────┐  │
│  │   [FOTO]    │   │ Juan Carlos González Pérez          │  │
│  │   140x140   │   │ 📅 Nacimiento: 15/03/1960           │  │
│  │   Rounded   │   │ ✝️  Fallecimiento: 22/11/2023        │  │
│  │ Border-4px  │   │                                     │  │
│  │ Shadow-xl   │   │ ┌──────────┐ ┌──────────┐          │  │
│  │ [📸 Foto]   │   │ │ 👨‍👩‍👧  │ │ 💑      │          │  │
│  │             │   │ │ Padres   │ │ Pareja   │          │  │
│  │             │   │ │ Agregar  │ │ Agregar  │          │  │
│  │             │   │ └──────────┘ └──────────┘          │  │
│  │             │   │ ┌──────────┐ ┌──────────┐          │  │
│  │             │   │ │ 👶      │ │ 📝      │          │  │
│  │             │   │ │ Hijos    │ │ Eventos  │          │  │
│  │             │   │ │ Agregar  │ │ Agregar  │          │  │
│  │             │   │ └──────────┘ └──────────┘          │  │
│  └─────────────┘   └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────┐
│       PADRES                 │         PAREJA               │
│ ╔════════════════════════════╗│╔════════════════════════════╗│
│ ║ [Avatar] Padre             ║║ [Avatar] Esposo            ║│
│ ║ [Avatar] Madre             ║║ m. 1985                    ║│
│ ╚════════════════════════════╝╚════════════════════════════╝│
└──────────────────────────────┴──────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────┐
│        HIJOS                 │        EVENTOS               │
│ ╔════════════════════════════╗│╔════════════════════════════╗│
│ ║ [Avatar] Hijo 1            ║║ 📅 Matrimonio: 1985        ║│
│ ║ [Avatar] Hija 2            ║║ 📅 Jubilación: 1998        ║│
│ ║ [Avatar] Hijo 3            ║║ 📅 Aniversario: 60 años    ║│
│ ╚════════════════════════════╝╚════════════════════════════╝│
└──────────────────────────────┴──────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────┐
│       GALERÍA                │      DOCUMENTOS              │
│ ┌────┬────┬────┐             │ ╔════════════════════════════╗│
│ │IMG │IMG │IMG │             │║ 📄 Acta de Matrimonio      ║│
│ │    │    │    │             │║ 📄 Certificado de Nac.     ║│
│ │    │    │    │             │║ 📄 Diploma                 ║│
│ └────┴────┴────┘             │╚════════════════════════════╝│
│ ┌────┬────┬────┐             │                              │
│ │IMG │IMG │IMG │             │                              │
│ └────┴────┴────┘             │                              │
└──────────────────────────────┴──────────────────────────────┘
```

### Cambios Clave
- De 200px ancho a full responsive
- Hero section con foto y datos (3 cols: 1 foto, 2 datos)
- Grid de 2-3 columnas para relaciones
- Secciones claramente separadas con bordes
- Mejor padding y spacing
- Buttons de acciones rápidas

---

## 3. Cards - Elevación Visual

### Antes
```
┌─────────────────────────┐
│ Contenido               │  shadow-md
│                         │  subtle border
└─────────────────────────┘
```

### Después
```
         ╱─────────────────────────────╲
        │ ╔═════════════════════════════╗ │
        │ ║ Contenido                   ║ │
        │ ║                             ║ │  shadow-lg
        │ ║                             ║ │  border-neutral-200
        │ ╚═════════════════════════════╝ │
        │                                │ → hover:
         ╲─────────────────────────────╱   shadow-xl +
                                          translate-y-1
```

### Specs
```
Base Shadow:    shadow-lg (0 10px 15px -3px)
Hover Shadow:   shadow-xl (0 20px 25px -5px)
Elevated:       shadow-2xl (0 25px 50px -12px)
Border:         1px solid border-neutral-200
Radius:         rounded-xl to rounded-2xl
Padding:        p-6 sm:p-8
Transition:     duration-300 ease-in-out
Transform:      hover:-translate-y-1 (elevación visual)
```

---

## 4. Spacing System

### Escala de Espaciado
```
┌────────┬──────────┬─────────────────────────────┐
│ Nombre │ Valor    │ Uso                         │
├────────┼──────────┼─────────────────────────────┤
│ space-1│  4px     │ Micro espacios              │
│ space-2│  8px     │ Espacios internos pequeños  │
│ space-3│ 12px     │ Espacios pequeños           │
│ space-4│ 16px     │ Gaps dentro de cards        │
│ space-6│ 24px     │ Padding dentro de sections  │
│ space-8│ 32px     │ GAPS ENTRE SECCIONES ⭐     │
│ space-10│40px     │ Grandes separaciones        │
│ space-12│48px     │ Header/footer separaciones  │
└────────┴──────────┴─────────────────────────────┘
```

### Aplicación
```
Home Page:
  Header padding:         py-8 sm:py-12
  Between sections:       space-y-10 (40px)
  Section gaps:           gap-8 (32px)
  Card padding:           p-6 sm:p-8
  Items inside card:      gap-4 (16px)

Cards:
  Outer padding:          p-6 sm:p-8
  Between items:          gap-4 (16px)
  Borders:                border-b border-neutral-200

Grid:
  Column gaps:            gap-8 (32px)
  Row gaps:               gap-8 (32px)
```

---

## 5. Color Hierarchy

### Before (Legacy)
```
Primary:   #variable-sepia
Secondary: #variable-wood
Accent:    #variable-forest
Surface:   #variable-surface
Border:    #variable-border
```

### After (New)
```
Text Primary:     neutral-900 (much darker, better contrast)
Text Secondary:   neutral-600 (readable secondary)
Text Tertiary:    neutral-500 (meta/small text)
Accent/CTA:       primary-600 (clear call to action)
Accent Light:     primary-100/50 (backgrounds)
Border:           neutral-200 (visible but subtle)
Background:       white (main cards)
Background Alt:   neutral-50/100 (sections)
Hover State:      neutral-100 (light feedback)
```

### Visual Effect
```
OLD (Low contrast):         NEW (High contrast):
┌─────────────────────┐     ┌─────────────────────┐
│ ╭─────────────────╮ │     │ ╔═════════════════╗ │
│ │ Contenido sepia │ │     │ ║ Contenido claro ║ │
│ │ con fondo café  │ │     │ ║ sobre blanco    ║ │
│ ╰─────────────────╯ │     │ ╚═════════════════╝ │
│                     │     │                     │
└─────────────────────┘     └─────────────────────┘
Poca legibilidad            Excelente legibilidad
Apariencia "cálida"         Apariencia "profesional"
```

---

## 6. Typography Hierarchy

### Tamaños por Nivel
```
H1 (Hero):              text-4xl sm:text-5xl (36-48px)
                        font-bold, font-serif-titles

H2 (Section):           text-2xl (24px)
                        font-bold, font-serif-titles

H3 (Subsection):        text-xl (20px)
                        font-bold, font-serif-titles

P (Body):               text-base (16px)
                        font-serif-content

Small (Meta):           text-sm (14px)
                        text-neutral-600

Extra small (Micro):    text-xs (12px)
                        uppercase, tracking-wider
```

### Aplicación
```
┌─────────────────────────────────────────────┐
│ 🌳 Árbol Familiar                           │  H1
│ text-4xl, font-bold, mb-4                   │
│                                             │
│ Una descripción clara y legible que ayuda  │  P
│ al usuario entender el propósito de esta   │  text-base
│ sección de su árbol genealógico.           │
│                                             │
│ ┌──────────────────────────────────────┐  │
│ │ 📰 Actividad Reciente               │  │  H2
│ │ text-2xl, font-bold                 │  │  text-base, mb-6
│ │                                    │  │
│ │ 📸 Juan agregó a María            │  │
│ │ hace 2 días                        │  │  Body text
│ │ ─────────────────────────────────  │  │
│ │ ✏️  María actualizó su perfil      │  │
│ │ hace 1 semana                      │  │  Small meta
│ │                                    │  │
│ └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 7. Responsive Breakpoints

### Mobile (< 640px)
```
┌──────────────────────┐
│ Header               │  Hero en stack
├──────────────────────┤
│ FeaturedTree         │  Full width
│ (1 columna)          │  Adapts height
├──────────────────────┤
│ Actividad            │  1 columna
├──────────────────────┤
│ Familia              │  1 columna
├──────────────────────┤
│ Recuerdos            │  1 columna
├──────────────────────┤
│ Botones              │  1 columna, full-width
└──────────────────────┘

px: 4 (16px)
py: 8 (32px)
Text: base
Gaps: gap-4 (16px)
```

### Tablet (640-1024px)
```
┌──────────────────────────────────────┐
│ Header (px-6)                        │
├──────────────────────────────────────┤
│ FeaturedTree                         │  Full width
├──────┬──────┬──────┐
│ Act. │      │ Fam. │  2-3 columnas
├──────┴──────┴──────┤
│ Recuerdos          │  2 columnas
├────────┬───────────┤
│ Galería│Documentos │  2 columnas
├──────┬──────┬──────┤
│ Btn  │ Btn  │ Btn  │
└──────┴──────┴──────┘

px: 6 (24px)
py: 12 (48px)
Text: base
Gaps: gap-6 (24px)
```

### Desktop (> 1024px)
```
┌────────────────────────────────────────────────────────┐
│ Header (max-w-5xl centered)                            │
├────────────────────────────────────────────────────────┤
│ FeaturedTree (max-w-5xl)                               │
├──────────────────────────────┬───────────────────────┤
│ Actividad Reciente           │ Familia               │
│ (lg:col-span-2)              │ (lg:col-span-1)       │
├──────────────────────────────┴───────────────────────┤
│ Recuerdos (3 columnas)                                │
│ ┌──────────────┬──────────────┬──────────────┐       │
│ │              │              │              │       │
│ └──────────────┴──────────────┴──────────────┘       │
├──────────────┬──────────────┬──────────────┐       │
│ Galería      │              │ Documentos   │       │
└──────────────┴──────────────┴──────────────┘       │
└────────────────────────────────────────────────────────┘

px: 8 (32px)
py: 12 (48px)
max-w: 1280px
Text: lg
Gaps: gap-8 (32px)
```

---

## Conclusión

La transformación de layout no es solo visual, es una **arquitectura de información completamente rediseñada**:

✅ **Antes**: Layout compacto, contenedores pequeños, plano
✅ **Después**: Layout expansivo, contenedores grandes, profundidad visual

Este cambio hace que la app sea:
- 📱 Más fácil de usar
- 👁️ Más agradable a la vista
- 🎯 Más clara en estructura
- 👴 Más accesible para usuarios mayores

---

Generated: 2024 | Layout Reference Guide
