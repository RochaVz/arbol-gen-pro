/**
 * UUID v7 generator (RFC 9562).
 * No dependency on crypto.randomUUID (which is v4).
 */
function getRandomBytes(length: number): Uint8Array {
  if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
    throw new Error('secure_random_unavailable');
  }
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function uuidv7(): string {
  const now = Date.now();
  const bytes = getRandomBytes(16);

  // 48-bit timestamp in ms (bytes 0-5)
  bytes[0] = (now / 0x10000000000) & 0xff;
  bytes[1] = (now / 0x100000000) & 0xff;
  bytes[2] = (now / 0x1000000) & 0xff;
  bytes[3] = (now / 0x10000) & 0xff;
  bytes[4] = (now / 0x100) & 0xff;
  bytes[5] = now & 0xff;

  // version 7 (bits 12-15 of byte 6)
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // variant 10 (bits 6-7 of byte 8)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function isUuidv7(value: unknown): value is string {
  return typeof value === 'string' && UUID_V7_PATTERN.test(value);
}

export function assertUuid(value: unknown, field = 'id'): asserts value is string {
  if (!isUuid(value)) throw new Error(`invalid_uuid:${field}`);
}

export function assertUuidArray(values: unknown, field = 'ids'): asserts values is string[] {
  if (!Array.isArray(values) || values.some((value) => !isUuid(value))) {
    throw new Error(`invalid_uuid:${field}`);
  }
}

export const generateUUIDv7 = uuidv7;
export const generateOperationId = uuidv7;
export const uuidV7 = uuidv7;
export const uuid_v7 = uuidv7;
export const generateUuidV7 = uuidv7;

export default uuidv7;