import create from 'zustand';

/** Store for managing genealogy trees.
 *  State: active tree, list of trees, selected tree operations.
 *  No sync logic - pure local-first state.
 */
type TreeId = string;

interface TreeNode {
  id: TreeId;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
  deletedBy?: TreeId | null;
}

interface TreeStore {
  /** Identificador del árbol actualmente activo */
  activeTreeId: TreeId | null;
  /** Lista de todos los árboles disponibles */
  trees: TreeNode[];
  /** Cargar un árbol por su ID */
  setActiveTreeId: (id: TreeId | null) => void;
  /** Agregar un nuevo árbol */
  addTree: (tree: Omit<TreeNode, 'updatedAt'>) => void;
  /** Actualizar un árbol existente */
  updateTree: (id: TreeId, updates: Partial<TreeNode>) => void;
  /** Eliminar un árbol */
  removeTree: (id: TreeId, deletedBy?: TreeId) => void;
}

export const useTreeStore = create<TreeStore>((set) => ({
  activeTreeId: null,
  trees: [],
  setActiveTreeId: (id: TreeId | null) => set({ activeTreeId: id }),
  addTree: (tree) =>
    set((state) => ({
      trees: [...state.trees, { ...tree, updatedAt: Date.now() }],
    })),
  updateTree: (id, updates) =>
    set((state) => ({
      trees: state.trees.map((tree) =>
        tree.id === id ? { ...tree, ...updates, updatedAt: Date.now() } : tree
      ),
    })),
  removeTree: (id, deletedBy) =>
    set((state) => ({
      trees: state.trees.map((tree) =>
        tree.id === id
          ? { ...tree, deletedAt: Date.now(), deletedBy: deletedBy ?? null, updatedAt: Date.now() }
          : tree
      ),
      activeTreeId: state.activeTreeId === id ? null : state.activeTreeId,
    })),
}));