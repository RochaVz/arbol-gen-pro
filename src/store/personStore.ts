import create from 'zustand';

/** State interface for the person store. */
interface PersonStoreState {
  /** Personas del árbol activo */
  persons: PersonNode[];
  /** Relaciones familiares */
  relationships: Array<{ id: string; person1Id: PersonId; person2Id: PersonId; type: string; startDate?: number }>;
  /** Eventos de vida */
  events: Array<{ id: string; type: string; title?: string; date?: number; place?: string }>;
  /** Fotos del árbol activo */
  photos: Array<{ id: string; url: string; kind: 'original' | 'optimized' | 'thumbnail'; isPrimary: boolean }>;
  /** ID de la persona seleccionada */
  selectedPersonId: PersonId | null;
}

/** Actions interface for the person store. */
interface PersonStoreActions {
  /** Seleccionar una persona */
  setSelectedPerson: (id: PersonId | null) => void;
  /** Agregar una nueva persona */
  addPerson: (person: Omit<PersonNode, 'updatedAt'>) => void;
  /** Actualizar una persona */
  updatePerson: (id: PersonId, updates: Partial<PersonNode>) => void;
  /** Eliminar una persona */
  removePerson: (id: PersonId, deletedBy?: PersonId) => void;
  /** Agregar una relación */
  addRelationship: (rel: { id: string; person1Id: PersonId; person2Id: PersonId; type: string; startDate?: number }) => void;
  /** Agregar un evento */
  addEvent: (event: { id: string; type: string; title?: string; date?: number; place?: string }) => void;
  /** Agregar una foto */
  addPhoto: (photo: { id: string; url: string; kind: 'original' | 'optimized' | 'thumbnail'; isPrimary: boolean }) => void;
}

/** Complete PersonStore type combining state and actions. */
type PersonStore = PersonStoreState & PersonStoreActions;

/** Node interface for person data. */
interface PersonNode {
  id: PersonId;
  treeId: string;
  firstName: string;
  lastName?: string;
  sex?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: number; // PartialDate as timestamp
  deathDate?: number | null;
  birthplace?: string;
  deathplace?: string;
  biography?: string;
  notes?: string;
  deletedAt?: number | null;
  deletedBy?: PersonId | null;
}

/** Store for managing genealogy persons.
 *  State: persons, relationships, events, photos of the active tree.
 *  Pure local-first state - no sync logic.
 */
type PersonId = string;

export const usePersonStore = create<PersonStore>((set) => ({
  persons: [],
  relationships: [],
  events: [],
  photos: [],
  selectedPersonId: null,
  setSelectedPerson: (id: PersonId | null) => set({ selectedPersonId: id }),
  addPerson: (person) =>
    set((state) => ({
      persons: [...state.persons, { ...person, updatedAt: Date.now() }],
    })),
  updatePerson: (id, updates) =>
    set((state) => ({
      persons: state.persons.map((person) =>
        person.id === id ? { ...person, ...updates, updatedAt: Date.now() } : person
      ),
    })),
  removePerson: (id, deletedBy) =>
    set((state) => ({
      persons: state.persons.map((person) =>
        person.id === id
          ? { ...person, deletedAt: Date.now(), deletedBy: deletedBy ?? null, updatedAt: Date.now() }
          : person
      ),
    })),
  addRelationship: (rel) =>
    set((state) => ({
      relationships: [...state.relationships, rel],
    })),
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),
  addPhoto: (photo) =>
    set((state) => ({
      photos: [...state.photos, photo],
    })),
}));
