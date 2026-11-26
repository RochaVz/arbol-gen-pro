import create from 'zustand';

/** Store for managing UI state.
 *  State: dark mode, selected tree, toasts, loading states.
 *  Pure UI state - no business logic.
 */
interface UiStore {
  /** Modo oscuro */
  darkMode: boolean;
  /** Árbol activo seleccionado */
  activeTreeId: string | null;
  /** Notificaciones/toasts */
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info'; duration?: number }>;
  /** Indicador de carga global */
  isLoading: boolean;
  /** Establecer modo oscuro */
  setDarkMode: (dark: boolean) => void;
  /** Establecer árbol activo */
  setActiveTreeId: (id: string | null) => void;
  /** Agregar un toast/notificación */
  addToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
  /** Remover un toast por ID */
  removeToast: (id: string) => void;
  /** Establecer estado de carga global */
  setIsLoading: (loading: boolean) => void;
  /** Limpiar todos los toasts */
  clearToasts: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  darkMode: false,
  activeTreeId: null,
  toasts: [],
  isLoading: false,
  setDarkMode: (dark: boolean) => set({ darkMode: dark }),
  setActiveTreeId: (id: string | null) => set({ activeTreeId: id }),
  addToast: (message, type, duration) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now().toString(), message, type, duration }],
    })),
  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  clearToasts: () => set({ toasts: [] }),
}));