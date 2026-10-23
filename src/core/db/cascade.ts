import { db } from './database';
import { calculateBaseServerVersion } from './operations';
import { uuidv7 } from '../../shared/utils/uuid';

export async function desvincularPerson(personId: string): Promise<void> {
  await db.transaction('rw', db.persons, db.relationships, db.events, db.photos, db.syncOutbox, async () => {
    // Relationships
    const rels = await db.relationships.toArray();
    for (const r of rels) {
      let changed = false;
      const next: any = { ...r };
      if (next.personId === personId) { next.personId = null; changed = true; }
      if (next.relativeId === personId) { next.relativeId = null; changed = true; }
      if (next.person1Id === personId) { next.person1Id = null; changed = true; }
      if (next.person2Id === personId) { next.person2Id = null; changed = true; }
      if (changed) {
        await db.relationships.put(next as any);
        await db.syncOutbox.add({
          operationId: uuidv7(),
          entityType: 'relationship',
          entityId: r.id,
          operationType: 'update',
          baseServerVersion: calculateBaseServerVersion('update', r),
          payload: next,
          createdAt: Date.now(),
          status: 'pending',
          retryCount: 0,
          lastError: null,
          dependsOn: []
        });
      }
    }

    // Events
    const events = await db.events.toArray();
    for (const e of events) {
      if (e.personId === personId) {
        const next = { ...e, personId: null };
        await db.events.put(next as any);
        await db.syncOutbox.add({
          operationId: uuidv7(),
          entityType: 'event',
          entityId: e.id,
          operationType: 'update',
          baseServerVersion: calculateBaseServerVersion('update', e),
          payload: next,
          createdAt: Date.now(),
          status: 'pending',
          retryCount: 0,
          lastError: null,
          dependsOn: []
        });
      }
      if (Array.isArray(e.personIds) && e.personIds.includes(personId)) {
        const next = { ...e, personIds: e.personIds.filter((x) => x !== personId) };
        await db.events.put(next as any);
      }
    }

    // Photos
    const photos = await db.photos.toArray();
    for (const ph of photos) {
      if (ph.personId === personId) {
        const next = { ...ph, personId: null };
        await db.photos.put(next as any);
        await db.syncOutbox.add({
          operationId: uuidv7(),
          entityType: 'photo',
          entityId: ph.id,
          operationType: 'update',
          baseServerVersion: calculateBaseServerVersion('update', ph),
          payload: next,
          createdAt: Date.now(),
          status: 'pending',
          retryCount: 0,
          lastError: null,
          dependsOn: []
        });
      }
    }
  });
}

