import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../core/db';
import { savePhotoLocally, getPhotoBlobs, photoState, cleanupLocalBinaries, ensureStorageAvailable } from '../features/photo/services/photoStorage';
import { compressPhoto, MAX_PHOTO_SIZE_BYTES } from '../features/photo/services/photoCompression';

vi.mock('browser-image-compression', () => ({
  default: async (file: any) => file,
}));

async function clearAll() {
  await db.transaction('rw', [db.trees, db.persons, db.photos, db.photoBlobs, db.syncOperations], async () => {
    await db.trees.clear();
    await db.persons.clear();
    await db.photos.clear();
    await db.photoBlobs.clear();
    await db.syncOperations.clear();
  });
}

describe('Fase 9 - fotografias', () => {
  beforeEach(async () => {
    if (!db.isOpen()) await db.open();
    await clearAll();
  });

  it('MAX_PHOTO_SIZE_BYTES definido', () => {
    expect(MAX_PHOTO_SIZE_BYTES).toBeGreaterThan(0);
  });

  it('compressPhoto devuelve 3 versiones', async () => {
    const file = new File([new Uint8Array(100)], 'a.jpg', { type: 'image/jpeg' });
    const v = await compressPhoto(file);
    expect(v.original).toBeDefined();
    expect(v.optimized).toBeDefined();
    expect(v.thumbnail).toBeDefined();
    expect(v.mimeType).toBe('image/jpeg');
  });

  it('compressPhoto rechaza archivos demasiado grandes', async () => {
    const big = new File([new Uint8Array(MAX_PHOTO_SIZE_BYTES + 1)], 'big.jpg', { type: 'image/jpeg' });
    await expect(compressPhoto(big)).rejects.toThrow('file_too_large');
  });

  it('savePhotoLocally guarda metadatos + 3 blobs y encola operacion', async () => {
    const treeId = 't1';
    await db.trees.add({ id: treeId, name: 'Arbol', ownerId: 'u', createdAt: Date.now(), updatedAt: Date.now(), serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as any);
    const file = new File([new Uint8Array(100)], 'a.jpg', { type: 'image/jpeg' });
    const res = await savePhotoLocally({ file, treeId, personId: 'p1' });
    expect(res.photo).toBeDefined();
    expect(res.blobs.length).toBe(3);
    const blobs = await getPhotoBlobs(res.photo.id);
    expect(blobs.length).toBe(3);
    const ops = await db.syncOperations.where('[entityType+entityId]').equals(['photo', res.photo.id]).toArray();
    expect(ops.length).toBe(1);
    expect(ops[0].operationType).toBe('create');
    expect(photoState(res.photo)).toBe('saved');
  });

  it('savePhotoLocally rechaza sin arbol', async () => {
    const file = new File([new Uint8Array(10)], 'a.jpg', { type: 'image/jpeg' });
    await expect(savePhotoLocally({ file, treeId: '' })).rejects.toThrow('missing_tree');
  });

  it('cleanupLocalBinaries no borra si no esta registrado', async () => {
    const treeId = 't2';
    await db.trees.add({ id: treeId, name: 'Arbol', ownerId: 'u', createdAt: Date.now(), updatedAt: Date.now(), serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as any);
    const file = new File([new Uint8Array(10)], 'a.jpg', { type: 'image/jpeg' });
    const res = await savePhotoLocally({ file, treeId });
    const r = await cleanupLocalBinaries(res.photo.id);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('not_registered');
    const blobs = await getPhotoBlobs(res.photo.id);
    expect(blobs.length).toBe(3);
  });

  it('ensureStorageAvailable devuelve boolean', async () => {
    const ok = await ensureStorageAvailable(1);
    expect(typeof ok).toBe('boolean');
  });
});
