import { describe, it, expect } from 'vitest';
import { hasCycle, wouldCreateCycle } from '../shared/utils/graph';
import { comparePartialDates, isValidPartialDate, partialDateToNumber } from '../shared/utils/date';
import { validatePerson, validateRelationship, validateTree } from '../shared/utils/validation';
import { searchPersons } from '../shared/utils/search';

describe('graph cycles (RF-03.6)', () => {
  it('detects cycle', () => {
    const edges = [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'a' }];
    expect(hasCycle(edges)).toBe(true);
  });
  it('no cycle', () => {
    const edges = [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }];
    expect(hasCycle(edges)).toBe(false);
  });
  it('wouldCreateCycle', () => {
    const edges = [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }];
    expect(wouldCreateCycle(edges, 'c', 'a')).toBe(true);
    expect(wouldCreateCycle(edges, 'c', 'd')).toBe(false);
  });
});

describe('PartialDate', () => {
  it('compare', () => {
    expect(comparePartialDates({ year: 1900 }, { year: 1900, month: 1 })).toBe(-1);
    expect(comparePartialDates({ year: 1900, month: 2 }, { year: 1900, month: 1 })).toBe(1);
    expect(comparePartialDates({ year: 1900 }, { year: 1900 })).toBe(0);
  });
  it('valid', () => {
    expect(isValidPartialDate({ year: 1900, month: 13 })).toBe(false);
    expect(isValidPartialDate({ year: 1900, month: 12, day: 31 })).toBe(true);
  });
  it('number', () => {
    expect(partialDateToNumber({ year: 1900, month: 1, day: 2 })).toBe(19000102);
  });
});

describe('validation', () => {
  it('person requires firstName', () => {
    expect(validatePerson({ treeId: 't' } as any).ok).toBe(false);
    expect(validatePerson({ treeId: 't', firstName: 'Ana' } as any).ok).toBe(true);
  });
  it('tree requires name', () => {
    expect(validateTree({ ownerId: 'u' } as any).ok).toBe(false);
    expect(validateTree({ name: 'T', ownerId: 'u' } as any).ok).toBe(true);
  });
  it('relationship self not allowed', () => {
    const r = { treeId: 't', person1Id: 'a', person2Id: 'a', type: 'parent' } as any;
    expect(validateRelationship(r).ok).toBe(false);
  });
  it('relationship cycle', () => {
    const r = { treeId: 't', person1Id: 'c', person2Id: 'a', type: 'parent' } as any;
    const edges = [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }];
    expect(validateRelationship(r, edges).ok).toBe(false);
  });
});

describe('search', () => {
  it('filters by name and status', () => {
    const persons = [
      { id: '1', firstName: 'Ana', lastName: 'Lopez', lifeStatus: 'alive', treeId: 't', createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as any,
      { id: '2', firstName: 'Luis', lastName: 'Paz', lifeStatus: 'deceased', treeId: 't', createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null } as any,
    ];
    const res = searchPersons(persons, { query: 'ana' });
    expect(res.length).toBe(1);
    const res2 = searchPersons(persons, { lifeStatus: 'deceased' });
    expect(res2.length).toBe(1);
  });
});