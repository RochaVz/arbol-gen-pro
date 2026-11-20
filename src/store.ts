import { create } from 'zustand';
import type { Person, Relationship, Event, Tree, Photo } from './core/db';
import { HistoryService } from './features/family-tree/services/historyService';
import {
  personRepository,
  relationshipRepository,
  eventRepository,
  treeRepository,
  photoRepository,
} from './core/db';
import { getPhotoBlobs } from './features/photo/services/photoStorage';
import { db } from './core/db';

interface AppState {
  cleanAll: () => void;
  trees: Tree[];
  persons: Person[];
  relationships: Relationship[];
  events: Event[];
  photos: Photo[];
  personPhotoUrls: Record<string, string>;
  activeTreeId: string;
  loading: boolean;
  error: string | null;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => import('./features/family-tree/services/historyService').Operation | null;
  redo: () => import('./features/family-tree/services/historyService').Operation | null;
  setActiveTreeId: (id: string) => void;
  load: () => Promise<void>;
}

const historyService = new HistoryService();

export const useAppStore = create<AppState>((set, get) => ({
  trees: [],
  persons: [],
  relationships: [],
  events: [],
  photos: [],
  personPhotoUrls: {},
  activeTreeId: '',
  loading: false,
  error: null,
  canUndo: historyService.canUndo(),
  canRedo: historyService.canRedo(),
  undo: () => {
    const op = historyService.undo();
    set({ canUndo: historyService.canUndo(), canRedo: historyService.canRedo() });
    return op;
  },
  redo: () => {
    const op = historyService.redo();
    set({ canUndo: historyService.canUndo(), canRedo: historyService.canRedo() });
    return op;
  },
  addParent: async (op: { personId: string; fatherId?: string; motherId?: string; fatherName: string; motherName: string; personName: string; personLastName?: string }) => {
    set({ loading: true, error: null });
    try {
      historyService.recordOperation({
        type: 'ADD_PARENT',
        timestamp: Date.now(),
        params: op,
      });
      set({ canUndo: historyService.canUndo(), canRedo: historyService.canRedo() });
      await personRepository.create({
        id: op.personId,
        treeId: get().activeTreeId || '',
        firstName: op.personName,
        lastName: op.personLastName || '',
        generation: 1,
        syncStatus: 'synced',
        // @ts-ignore - relaxing type requirements for family operations
        ...op,
      } as any);
      if (op.fatherId) {
        await relationshipRepository.create({
          id: `${op.personId}-father`,
          treeId: get().activeTreeId || '',
          person1Id: op.fatherId,
          person2Id: op.personId,
          type: 'parent',
          syncStatus: 'synced',
          // @ts-ignore
          ...op,
        } as any);
      }
      if (op.motherId) {
        await relationshipRepository.create({
          id: `${op.personId}-mother`,
          treeId: get().activeTreeId || '',
          person1Id: op.motherId,
          person2Id: op.personId,
          type: 'parent',
          syncStatus: 'synced',
          // @ts-ignore
          ...op,
        } as any);
      }
      console.log('Add parent operation completed:', op);
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },
  addChild: async (op: { parentId: string; childId?: string; childName: string; childLastName?: string; childSex?: string }) => {
    set({ loading: true, error: null });
    try {
      historyService.recordOperation({
        type: 'ADD_CHILD',
        timestamp: Date.now(),
        params: op,
      });
      set({ canUndo: historyService.canUndo(), canRedo: historyService.canRedo() });
      await personRepository.create({
        id: op.childId || `child-${Date.now()}`,
        treeId: get().activeTreeId || '',
        firstName: op.childName,
        lastName: op.childLastName || '',
        generation: get().persons.length + 1,
        sex: op.childSex,
        syncStatus: 'synced',
        // @ts-ignore
        ...op,
      } as any);
      console.log('Add child operation completed:', op);
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },
  setActiveTreeId: (id: string) => set({ activeTreeId: id }),

  cleanAll: async () => {
    await db.transaction('rw', [db.trees, db.persons, db.relationships, db.events, db.photos, db.photoBlobs, db.syncOperations], async () => {
      await Promise.all([
        db.trees.clear(),
        db.persons.clear(),
        db.relationships.clear(),
        db.events.clear(),
        db.photos.clear(),
        db.photoBlobs.clear(),
        db.syncOperations.clear(),
      ]);
    });
    set({ trees: [], persons: [], relationships: [], events: [], photos: [], personPhotoUrls: {}, activeTreeId: '', loading: false, error: null, canUndo: false, canRedo: false });
  },

  load: async () => {
    set({ loading: true, error: null });
    try {
      const trees = await treeRepository.list();
      const persons = await personRepository.list();
      const relationships = await relationshipRepository.list();
      const events = await eventRepository.list();
      const photos = await photoRepository.list();

      const activeTreeId = get().activeTreeId || trees[0]?.id || '';

      // Revoke old URLs
      Object.values(get().personPhotoUrls).forEach((u) => {
        try { URL.revokeObjectURL(u); } catch {}
      });

      // Build photo URL map
      const personPhotoUrls: Record<string, string> = {};
      await Promise.all(
        persons.map(async (p: Person) => {
          const photo = photos
            .filter((ph: Photo) => ph.personId === p.id && !ph.deletedAt)
            .sort((a: Photo, b: Photo) => b.createdAt - a.createdAt)[0];
          if (!photo) return;
          try {
            const blobs = await getPhotoBlobs(photo.id);
            const thumb = blobs.find((b: { kind: string }) => b.kind === 'thumbnail') ?? blobs[0];
            if (thumb?.blob) personPhotoUrls[p.id] = URL.createObjectURL(thumb.blob);
          } catch {}
        })
      );

      set({ trees, persons, relationships, events, photos, personPhotoUrls, activeTreeId, loading: false, canUndo: historyService.canUndo(), canRedo: historyService.canRedo() });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
}));