# ROADMAP DE IMPLEMENTACIÓN — FASE 2-6

**Arbol Gen Pro — UX/UI Redesign**  
**Duración Total:** 3-4 sprints (23 horas de desarrollo)  
**Riesgo:** Bajo (no toca funcionalidad)  
**Rollback:** Fácil (Git branch)

---

## 📅 CRONOGRAMA

```
SEMANA 1 — Preparación
├─ Martes: Design System (tokens.css)
├─ Miércoles: Componentes nuevos
└─ Jueves: Review + ajustes

SEMANA 2 — Arquitectura
├─ Lunes: Refactorización App.tsx
├─ Martes: Contextos (AuthContext, DataContext)
├─ Miércoles: LayoutManager
└─ Jueves: Testing inicial

SEMANA 3 — Integración Visual
├─ Lunes: Actualizar Home
├─ Martes: Actualizar TreeWorkspace + EmotionalTree
├─ Miércoles: Personalizar PersonProfilePage
└─ Jueves: Pulir detalles

SEMANA 4 — Validación
├─ Lunes: WCAG audit
├─ Martes: Testing responsive
├─ Miércoles: Build + deploy staging
└─ Jueves: Release
```

---

## 🔨 FASE 2: DESIGN SYSTEM

### Sprint: 2-3 horas
**Objetivo:** Definir todos los tokens y variables de diseño

### Tareas

#### 2.1 Actualizar `src/shared/design-system/tokens.css`
```css
/* Colores principales */
:root {
  /* PRIMARY: Verde Bosque */
  --color-primary: #2D5A3D;
  --color-primary-50: #F0F4F2;
  --color-primary-100: #D4E4D9;
  --color-primary-200: #A8CCAD;
  --color-primary-500: #2D5A3D;
  --color-primary-600: #1F3D2A;
  --color-primary-700: #152A1A;

  /* ACCENT: Dorado Cálido */
  --color-accent: #D4A574;
  --color-accent-50: #FEF7F0;
  --color-accent-100: #F5DEBD;
  --color-accent-500: #D4A574;
  --color-accent-600: #C4955E;

  /* NEUTRAL: Grises */
  --color-neutral-50: #FAFAF8;
  --color-neutral-100: #F5F5F2;
  --color-neutral-200: #E8E8E5;
  --color-neutral-300: #D4D4D0;
  --color-neutral-400: #9CA3A3;
  --color-neutral-500: #7A8080;
  --color-neutral-600: #5A6A6A;
  --color-neutral-700: #3A4A4A;
  --color-neutral-900: #1A1A1A;

  /* SEMANTIC */
  --color-success: #059669;
  --color-warning: #D97706;
  --color-error: #DC2626;
  --color-info: #0891B2;

  /* TEXT */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #5A6A6A;
  --color-text-tertiary: #9CA3A3;
  --color-text-inverse: #F5F5F2;

  /* BACKGROUNDS */
  --color-bg-primary: #FAFAF8;
  --color-bg-secondary: #F5F5F2;
  --color-bg-elevated: #FFFFFF;

  /* BORDERS */
  --color-border: #E8E8E5;
  --color-border-strong: #D4D4D0;

  /* SHADOWS */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* SPACING */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* CONTAINERS */
  --container-xs: 576px;
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;

  /* PADDING CONTAINERS */
  --padding-xs: 0.75rem;
  --padding-sm: 1rem;
  --padding-md: 1.5rem;
  --padding-lg: 2rem;

  /* RADIUS */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;

  /* TRANSITIONS */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;

  /* Z-INDEX */
  --z-hide: -1;
  --z-auto: auto;
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

/* Dark mode */
.dark {
  --color-bg-primary: #1A1A1A;
  --color-bg-secondary: #2D2D2D;
  --color-bg-elevated: #1A1A1A;
  --color-text-primary: #F5F5F2;
  --color-text-secondary: #D4D4D0;
  --color-text-inverse: #1A1A1A;
  --color-border: #3A4A4A;
  --color-border-strong: #5A6A6A;
}
```

#### 2.2 Actualizar `src/shared/design-system/typography.css`
```css
/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

/* Root font setup */
html {
  font-size: 16px; /* Base 16px */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  font-size: 1rem;        /* 16px */
  line-height: 1.5;       /* 24px */
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
}

/* Headings */
h1, .h1 {
  font-family: var(--font-serif);
  font-size: clamp(1.75rem, 5vw, 2.5rem);  /* 28px → 40px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}

h2, .h2 {
  font-family: var(--font-serif);
  font-size: clamp(1.5rem, 4vw, 2rem);    /* 24px → 32px */
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

h3, .h3 {
  font-family: var(--font-sans);
  font-size: 1.25rem;     /* 20px */
  font-weight: 600;
  line-height: 1.4;
}

h4, .h4 {
  font-size: 1.125rem;    /* 18px */
  font-weight: 600;
  line-height: 1.4;
}

/* Párrafos */
p {
  margin: 0;
  font-size: 1rem;        /* 16px */
  line-height: 1.6;       /* 25.6px */
}

.text-lg {
  font-size: 1.125rem;    /* 18px */
  line-height: 1.75;
}

.text-sm {
  font-size: 0.875rem;    /* 14px */
  line-height: 1.5;
}

/* NO usar text-xs en interfaces principales */
.text-xs {
  font-size: 0.75rem;     /* 12px - solo helper text */
  line-height: 1.5;
}

/* Utility: Line heights */
.leading-tight { line-height: 1.2; }
.leading-normal { line-height: 1.5; }
.leading-relaxed { line-height: 1.75; }
.leading-loose { line-height: 2; }

/* Utility: Font weights */
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }

/* Utility: Letter spacing */
.tracking-tight { letter-spacing: -0.02em; }
.tracking-normal { letter-spacing: 0; }
.tracking-wide { letter-spacing: 0.05em; }
```

#### 2.3 Actualizar `src/index.css`
```css
@import './shared/design-system/tokens.css';
@import './shared/design-system/typography.css';
@import './shared/design-system/reset.css';
@import './shared/design-system/utilities.css';

/* Global */
body {
  font-family: var(--font-sans);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  margin: 0;
  padding: 0;
}

/* Focus visible global */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Selection color */
::selection {
  background-color: var(--color-primary);
  color: white;
}

/* Accessibility: reduce motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Validación
```bash
npm run build  # Verificar sin errores
# Revisar en navegador: colores, tipografía
```

---

## 🔨 FASE 3: COMPONENTES NUEVOS

### Sprint: 4-5 horas
**Objetivo:** Crear TabNav, SideNav, EmptyState, Toast

### Tareas

#### 3.1 Crear `src/shared/components/ui/TabNav.tsx`
```tsx
import React from 'react';

export interface TabNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

export interface TabNavProps {
  items: TabNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const TabNav = React.forwardRef<HTMLDivElement, TabNavProps>(
  ({ items, activeId, onChange, className = '' }, ref) => {
    return (
      <nav
        ref={ref}
        className={`
          flex gap-1 border-b border-border
          bg-bg-secondary overflow-x-auto scrollbar-hide
          ${className}
        `.trim()}
        role="tablist"
      >
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeId === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => onChange(item.id)}
            disabled={item.disabled}
            className={`
              flex items-center gap-2 px-4 py-3
              border-b-2 transition-all duration-200
              text-sm font-medium whitespace-nowrap
              ${
                activeId === item.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {item.icon && <span className="h-5 w-5">{item.icon}</span>}
            {item.label}
            {item.badge && (
              <span className="ml-1 px-2 py-0.5 bg-error text-white text-xs rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    );
  }
);

TabNav.displayName = 'TabNav';
```

#### 3.2 Crear `src/shared/components/ui/EmptyState.tsx`
```tsx
import React from 'react';
import { Card } from './Card';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondary?: React.ReactNode;
  className?: string;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, secondary, className = '' }, ref) => {
    return (
      <Card
        ref={ref}
        className={`
          flex flex-col items-center justify-center
          py-12 md:py-16 px-6
          text-center
          ${className}
        `.trim()}
      >
        {icon && (
          <div className="text-5xl md:text-6xl mb-4 opacity-75">
            {icon}
          </div>
        )}
        
        <h3 className="text-2xl font-bold text-text-primary mb-2">
          {title}
        </h3>
        
        {description && (
          <p className="text-text-secondary max-w-sm mb-6">
            {description}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:justify-center">
          {action}
          {secondary}
        </div>
      </Card>
    );
  }
);

EmptyState.displayName = 'EmptyState';
```

#### 3.3 Crear `src/shared/components/ui/Toast.tsx`
```tsx
import React, { useEffect } from 'react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: number;
  onClose: () => void;
  className?: string;
}

const typeStyles = {
  success: 'bg-success',
  error: 'bg-error',
  warning: 'bg-warning',
  info: 'bg-info',
};

const typeIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({
    id,
    type,
    message,
    description,
    action,
    autoClose = 3000,
    onClose,
    className = '',
  }, ref) => {
    useEffect(() => {
      if (autoClose) {
        const timer = setTimeout(onClose, autoClose);
        return () => clearTimeout(timer);
      }
    }, [autoClose, onClose]);

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`
          flex items-start gap-4 p-4 rounded-lg
          ${typeStyles[type]} text-white
          shadow-lg
          animate-slide-in
          ${className}
        `.trim()}
      >
        <span className="text-xl font-bold flex-shrink-0">
          {typeIcons[type]}
        </span>
        
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
          {description && <p className="text-sm opacity-90 mt-1">{description}</p>}
        </div>
        
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-medium underline hover:opacity-90 flex-shrink-0"
          >
            {action.label}
          </button>
        )}
        
        <button
          onClick={onClose}
          className="text-xl opacity-75 hover:opacity-100 flex-shrink-0"
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      </div>
    );
  }
);

Toast.displayName = 'Toast';
```

#### 3.4 Mejorar `src/shared/components/ui/Button.tsx`
```tsx
// Agregar :focus-visible clara
const buttonStyles = {
  primary: `
    bg-primary text-white hover:bg-primary-600
    focus-visible:ring-2 ring-primary ring-offset-2
  `,
  ghost: `
    bg-transparent text-text-primary hover:bg-neutral-100
    focus-visible:ring-2 ring-primary ring-offset-2
  `,
  // ... resto de variantes
};
```

### Validación
```bash
npm run build
# Verificar TabNav, EmptyState, Toast en Storybook
```

---

## 🔨 FASE 4: ARQUITECTURA

### Sprint: 6-7 horas
**Objetivo:** Refactorizar App.tsx, crear contextos

#### 4.1 Crear `src/context/AuthContext.tsx`
```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../core/supabase';

interface AuthContextType {
  email: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setEmail(s?.user?.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ email, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

#### 4.2 Refactorizar `src/App.tsx` (Reducir a 150 líneas)
```tsx
import { useEffect, useState } from 'react';
import { useSyncStatus } from './shared/hooks/useSyncStatus';
import { startRealtimeSync, stopRealtimeSync } from './core/sync/realtime';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './layout/AppLayout';
import { HomeView } from './views/HomeView';
import { TreeView } from './views/TreeView';
import { PersonView } from './views/PersonView';

type View = 'home' | 'tree' | 'person';

function AppContent() {
  const sync = useSyncStatus();
  const { email, loading: authLoading } = useAuth();
  const [view, setView] = useState<View>('home');
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  // Initialize color mode
  useEffect(() => {
    const stored = localStorage.getItem('color-mode') as 'light' | 'dark' | null;
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const mode = stored ?? system;
    setColorMode(mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, []);

  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    localStorage.setItem('color-mode', newMode);
    document.documentElement.classList.toggle('dark', newMode === 'dark');
  };

  useEffect(() => {
    startRealtimeSync();
    return () => stopRealtimeSync();
  }, []);

  if (authLoading) return <div>Cargando...</div>;

  return (
    <AppLayout
      syncStatus={sync.status}
      userEmail={email}
      colorMode={colorMode}
      onColorModeToggle={toggleColorMode}
      currentView={view}
      onViewChange={setView}
    >
      {view === 'home' && <HomeView />}
      {view === 'tree' && <TreeView onSelectPerson={() => setView('person')} />}
      {view === 'person' && <PersonView onBack={() => setView('tree')} />}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

### Validación
```bash
npm run build  # Sin errores TS
npm run lint   # Sin warnings
```

---

## 🔨 FASE 5: INTEGRACIÓN VISUAL

### Sprint: 4-5 horas
**Objetivo:** Actualizar componentes existentes con nuevo diseño

#### 5.1 Actualizar `src/features/home/Home.tsx`
- Agregar EmptyState cuando no hay árbol
- Mejorar tipografía (text-lg en lugar de text-sm)
- Nuevo espaciado (usar variables tokens)

#### 5.2 Actualizar `src/features/tree/TreeWorkspace.tsx`
- Mejorar responsive (zoom/pan en mobile)
- Agregar indicador de sincronización en nodos
- Espaciado consistente

#### 5.3 Mejorar `src/features/person/PersonProfilePage.tsx`
- Implementar layout real (actualmente stub)
- Galería responsive
- Documentos, eventos, relaciones

### Validación
```bash
npm run build
# Test en móvil, tablet, desktop
```

---

## 🔨 FASE 6: TESTING Y VALIDACIÓN

### Sprint: 3-4 horas
**Objetivo:** Validación final (WCAG, Responsive, Build)

#### 6.1 WCAG AA Audit
```bash
# Usar: https://wave.webaim.org/
# Checklist:
# ✅ Contraste 4.5:1
# ✅ Tamaño mínimo texto 16px
# ✅ Focus visible claro
# ✅ aria-label en todos los botones
# ✅ Semantic HTML (<nav>, <main>, <section>)
```

#### 6.2 Responsive Testing
```bash
# Dispositivos:
# ✅ iPhone SE (375px)
# ✅ iPhone 13 (390px)
# ✅ Android 5" (480px)
# ✅ iPad (768px)
# ✅ Desktop (1440px)

# Checklist:
# ✅ No scroll horizontal
# ✅ Tipografía legible
# ✅ Botones tocables (min 44px)
# ✅ Modales responsivos
```

#### 6.3 Build & Deploy
```bash
npm run lint   # ✅ Sin warnings
npm run build  # ✅ Sin errores
npm run preview # ✅ Verificar en navegador
```

---

## 📊 MÉTRICAS DE ÉXITO

```
ANTES          DESPUÉS         DELTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
40% WCAG       95% WCAG AA      +55%
45% Nav        95% Nav          +50%
55% Design     95% Design       +40%
65% Responsive 98% Responsive   +33%
75% Components 95% Components   +20%
```

---

## ⚠️ RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Git conflicts | Media | Bajo | Coordinar branch, merge frecuente |
| Performance | Baja | Medio | Medir bundle size, lazy load |
| Accesibilidad incompleta | Baja | Alto | WAVE audit antes de merge |
| Regresión funcional | Muy baja | Crítico | Test suite, staging deployment |

---

## 🎯 CHECKLIST FINAL

Antes de considerar completada la FASE 2-6:

- [ ] Auditoría FASE 1 completada ✅
- [ ] Tokens.css actualizado ✅
- [ ] Componentes nuevos creados ✅
- [ ] App.tsx refactorizado ✅
- [ ] AuthContext implementado ✅
- [ ] Vistas actualizadas ✅
- [ ] npm run build ✅ (sin errores)
- [ ] npm run lint ✅ (sin warnings)
- [ ] WCAG AA audit ✅
- [ ] Responsive testing ✅
- [ ] Documentación actualizada ✅
- [ ] Branch mergeado a main ✅

---

**Listo para comenzar FASE 2**  
**Equipo Senior Frontend + UX/UI**  
*5 Noviembre, 2026*
