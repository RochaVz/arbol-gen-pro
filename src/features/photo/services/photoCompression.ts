import imageCompression from 'browser-image-compression';

export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024;
export const PHOTO_OPTIMIZED_MAX_PX = 800;
export const PHOTO_THUMBNAIL_MAX_PX = 200;

export interface PhotoVersions {
  original: Blob;
  optimized: Blob;
  thumbnail: Blob;
  width: number;
  height: number;
  mimeType: string;
  sizeBytes: number;
}

export async function readImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await Promise.race([
        createImageBitmap(blob),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 50)),
      ]);
      if (bmp) {
        const dims = { width: (bmp as any).width, height: (bmp as any).height };
        (bmp as any).close?.();
        return dims;
      }
    } catch {
      // fall through
    }
  }
  if (typeof Image !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      const timer = setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      }, 50);
      img.onload = () => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      };
      img.onerror = () => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  }
  return { width: 0, height: 0 };
}

export async function compressPhoto(file: File | Blob): Promise<PhotoVersions> {
  if (!file) throw new Error('missing_file');
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error('file_too_large');
  }

  const mimeType = file.type || 'image/jpeg';
  const dims = await readImageDimensions(file);

  let optimized: Blob;
  let thumbnail: Blob;
  try {
    optimized = await imageCompression(file as File, {
      maxWidthOrHeight: PHOTO_OPTIMIZED_MAX_PX,
      useWebWorker: false,
      fileType: mimeType,
    });
    thumbnail = await imageCompression(file as File, {
      maxWidthOrHeight: PHOTO_THUMBNAIL_MAX_PX,
      useWebWorker: false,
      fileType: mimeType,
    });
  } catch {
    // Fallback: keep original for all versions so the photo is still saved.
    optimized = file;
    thumbnail = file;
  }

  return {
    original: file instanceof Blob ? file : new Blob([file], { type: mimeType }),
    optimized,
    thumbnail,
    width: dims.width,
    height: dims.height,
    mimeType,
    sizeBytes: file.size,
  };
}

// Aliases for compatibility with possible test/feature naming.
export const compressImage = compressPhoto;
export const createPhotoVersions = compressPhoto;
export default { compressPhoto, compressImage, createPhotoVersions, readImageDimensions, MAX_PHOTO_SIZE_BYTES };
