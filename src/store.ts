import { create } from 'zustand';
import type { Person, Relationship, Event, Tree, Photo } from './core/db';
import {
  personRepository,
  relationshipRepository,
  eventRepository,
  treeRepository,
  photoRepository,
} from './core/db';
import { getPhotoBlobs } from './features/photo/services/photoStorage';

interface AppState {
  trees: Tree[];
  persons: Person[];
  relationships: Relationship[];
  events: Event[];
  photos: Photo[];
  personPhotoUrls: Record<string, string>;
  activeTreeId: string;
  loading: boolean;
  error: string | null;

  setActiveTreeId: (id: string) => void;
  load: () => Promise<void>;
}

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

  setActiveTreeId: (id) => set({ activeTreeId: id }),

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

      set({ trees, persons, relationships, events, photos, personPhotoUrls, activeTreeId, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
}));
