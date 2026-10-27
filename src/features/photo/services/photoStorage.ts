export { MAX_PHOTO_SIZE_BYTES } from './photoCompression';
import { db, photoRepository } from '../../../core/db';
import type { Photo, PhotoBlob } from '../../../core/db/schema';
import { uuidv7 } from '../../../shared/utils/uuid';
import { getAccessToken } from '../../../core/supabase';
import { compressPhoto, MAX_PHOTO_SIZE_BYTES } from './photoCompression';
import type { PhotoVersions } from './photoCompression';

export const PHOTO_SIGNED_URL_TTL_MS = 15 * 60 * 1000;

export interface SavePhotoParams {
  file: File | Blob;
  treeId: string;
  personId?: string;
  eventId?: string;
  description?: string;
}

export interface SavePhotoResult {
  photo: Photo;
  blobs: PhotoBlob[];
  operation: any;
  versions: PhotoVersions;
}

export async function savePhotoLocally(params: SavePhotoParams): Promise<SavePhotoResult> {
  const { file, treeId } = params;
  if (!file) throw new Error('missing_file');
  if (file.size > MAX_PHOTO_SIZE_BYTES) throw new Error('file_too_large');
  if (!treeId) throw new Error('missing_tree');

  const versions = await compressPhoto(file);

  const storageOk = await ensureStorageAvailable(file.size * 3 + 1024);
  if (!storageOk) throw new Error('insufficient_storage');

  const id = uuidv7();
  const photo: Photo = {
    id,
    treeId,
    personId: params.personId,
    eventId: params.eventId,
    description: params.description,
    mimeType: versions.mimeType,
    sizeBytes: versions.sizeBytes,
    size: versions.sizeBytes,
    width: versions.width,
    height: versions.height,
    kind: 'original',
    r2Key: undefined,
    uploadedAt: undefined,
    syncStatus: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverVersion: 0,
    localRevision: 0,
    deletedAt: null,
  } as Photo;

  const { entity, operation } = await photoRepository.create(photo);

  const now = Date.now();
  const blobs: PhotoBlob[] = [
    { id: uuidv7(), photoId: id, kind: 'original', blob: versions.original, size: versions.original.size, createdAt: now, updatedAt: now, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as PhotoBlob,
    { id: uuidv7(), photoId: id, kind: 'optimized', blob: versions.optimized, size: versions.optimized.size, createdAt: now, updatedAt: now, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as PhotoBlob,
    { id: uuidv7(), photoId: id, kind: 'thumbnail', blob: versions.thumbnail, size: versions.thumbnail.size, createdAt: now, updatedAt: now, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as PhotoBlob,
  ];

  await db.transaction('rw', db.photoBlobs, async () => {
    await db.photoBlobs.bulkPut(blobs);
  });

  return { photo: entity, blobs, operation, versions };
}

export async function getPhotoBlobs(photoId: string): Promise<PhotoBlob[]> {
  return db.photoBlobs.where('photoId').equals(photoId).toArray();
}

export function isPhotoUploaded(photo: Photo | null | undefined): boolean {
  return !!photo?.r2Key && !!photo?.uploadedAt;
}

export function isPhotoRegistered(photo: Photo | null | undefined): boolean {
  return !!photo && photo.syncStatus === 'synced' && !!photo.r2Key;
}

export function photoState(photo: Photo | null | undefined): 'saved' | 'uploaded' | 'registered' {
  if (isPhotoRegistered(photo)) return 'registered';
  if (isPhotoUploaded(photo)) return 'uploaded';
  return 'saved';
}

export async function uploadPhoto(photoId: string): Promise<{ ok: boolean; r2Key?: string; reason?: string }> {
  const photo = await photoRepository.getById(photoId);
  if (!photo) return { ok: false, reason: 'not_found' };

  const blobs = await getPhotoBlobs(photoId);
  const original = blobs.find((b) => b.kind === 'original');
  if (!original?.blob) return { ok: false, reason: 'missing_blob' };

  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return { ok: false, reason: 'not_configured' };

  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'no_session' };

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

  let res: Response;
  try {
    res = await fetch(`${base.replace(/\/$/, '')}/functions/v1/photo-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: anonKey,
      },
      body: JSON.stringify({
        photoId,
        contentType: photo.mimeType ?? 'application/octet-stream',
        size: photo.sizeBytes ?? photo.size,
      }),
    });
  } catch (e) {
    return { ok: false, reason: `network:${String((e as Error)?.message ?? e)}` };
  }

  if (!res.ok) return { ok: false, reason: `http_${res.status}` };

  let body: any = null;
  try { body = await res.json(); } catch { body = null; }
  const uploadUrl = body?.uploadUrl ?? body?.upload_url;
  const r2Key = body?.r2Key ?? body?.r2_key;
  if (!uploadUrl || !r2Key) return { ok: false, reason: 'invalid_upload_response' };

  let put: Response;
  try {
    put = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': photo.mimeType ?? 'application/octet-stream' },
      body: original.blob,
    });
  } catch (e) {
    return { ok: false, reason: `upload_network:${String((e as Error)?.message ?? e)}` };
  }
  if (!put.ok) return { ok: false, reason: `upload_${put.status}` };

  await photoRepository.update(photoId, { r2Key, uploadedAt: Date.now() } as any);
  return { ok: true, r2Key };
}

export async function getSignedPhotoUrl(r2Key: string): Promise<{ url: string; expiresAt: number } | null> {
  if (!r2Key) return null;
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return null;
  const token = await getAccessToken();
  if (!token) return null;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/functions/v1/photo-signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: anonKey,
      },
      body: JSON.stringify({ r2Key, ttl: PHOTO_SIGNED_URL_TTL_MS }),
    });
    if (!res.ok) return null;
    const body = await res.json();
    const url = body?.url ?? body?.signedUrl;
    const expiresAt = typeof body?.expiresAt === 'number' ? body.expiresAt : Date.now() + PHOTO_SIGNED_URL_TTL_MS;
    if (!url) return null;
    return { url, expiresAt };
  } catch {
    return null;
  }
}

export async function cleanupLocalBinaries(photoId: string): Promise<{ ok: boolean; reason?: string }> {
  const photo = await photoRepository.getById(photoId);
  if (!photo) return { ok: false, reason: 'not_found' };
  if (!isPhotoRegistered(photo)) {
    return { ok: false, reason: 'not_registered' };
  }
  await db.photoBlobs.where('photoId').equals(photoId).delete();
  return { ok: true };
}

export async function ensureStorageAvailable(requiredBytes: number): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.estimate === 'function') {
      const est = await navigator.storage.estimate();
      const available = (est.quota ?? 0) - (est.usage ?? 0);
      return available >= requiredBytes;
    }
  } catch {
    // ignore
  }
  return true;
}

export const savePhoto = savePhotoLocally;
export const addPhoto = savePhotoLocally;
export const uploadPhotoToR2 = uploadPhoto;
export const getSignedUrl = getSignedPhotoUrl;
export const signedUrl = getSignedPhotoUrl;
export const removeLocalBinaries = cleanupLocalBinaries;
export const deleteLocalBinariesIfRegistered = cleanupLocalBinaries;

export default {
  savePhotoLocally,
  savePhoto,
  addPhoto,
  getPhotoBlobs,
  isPhotoUploaded,
  isPhotoRegistered,
  photoState,
  uploadPhoto,
  uploadPhotoToR2,
  getSignedPhotoUrl,
  getSignedUrl,
  signedUrl,
  cleanupLocalBinaries,
  removeLocalBinaries,
  deleteLocalBinariesIfRegistered,
  ensureStorageAvailable,
  MAX_PHOTO_SIZE_BYTES: MAX_PHOTO_SIZE_BYTES,
  PHOTO_SIGNED_URL_TTL_MS,
};

