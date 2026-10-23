import { describe, it, expect } from 'vitest';
import { uuidv7 } from '../shared/utils/uuid';

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
});