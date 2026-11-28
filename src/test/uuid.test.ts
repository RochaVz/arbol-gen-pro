import { describe, it, expect } from 'vitest';
import { assertUuid, isUuid, isUuidv7, uuidv7 } from '../shared/utils/uuid';

describe('UUID v7', () => {
  it('genera formato canónico', () => {
    const id = uuidv7();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('version 7 y variant 10', () => {
    const id = uuidv7();
    const parts = id.split('-');
    expect(parts[2][0]).toBe('7');
    expect(['8', '9', 'a', 'b']).toContain(parts[3][0]);
  });

  it('unicidad', () => {
    const set = new Set(Array.from({ length: 1000 }, () => uuidv7()));
    expect(set.size).toBe(1000);
  });

  it('distingue UUID válidos y UUID v7', () => {
    const id = uuidv7();
    expect(isUuid(id)).toBe(true);
    expect(isUuidv7(id)).toBe(true);
    expect(isUuid('8b2e5bd6-ffbd-4d7a-a0cc-3bf3a3be44a5')).toBe(true);
    expect(isUuidv7('8b2e5bd6-ffbd-4d7a-a0cc-3bf3a3be44a5')).toBe(false);
  });

  it('rechaza identificadores temporales o compuestos', () => {
    for (const id of ['p1', 'local-user', 'child-123', 'tree-person']) {
      expect(isUuid(id)).toBe(false);
      expect(() => assertUuid(id)).toThrow('invalid_uuid:id');
    }
  });
});