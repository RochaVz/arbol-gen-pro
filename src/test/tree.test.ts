import { describe, it, expect } from 'vitest';
import { computeLayout, parentsOf, childrenOf, spousesOf } from '../features/tree/utils/treeLayout';
import type { Relationship } from '../core/db/schema';

function rel(partial: Partial<Relationship>): Relationship {
  return {
    id: partial.id ?? 'r1',
    treeId: 't1',
    type: partial.type ?? 'parent',
    personId: partial.personId,
    relativeId: partial.relativeId,
    person1Id: partial.person1Id,
    person2Id: partial.person2Id,
    createdAt: 0, updatedAt: 0, serverVersion: 0, localRevision: 1, syncStatus: 'pending', deletedAt: null,
    ...partial,
  } as Relationship;
}

describe('tree layout (RF-04)', () => {
  it('relaciones parent/child se detectan', () => {
    const rels = [
      rel({ id: 'a', type: 'parent', person1Id: 'p1', person2Id: 'p2' }), // p1 parent of p2
    ];
    expect(parentsOf('p2', rels)).toContain('p1');
    expect(childrenOf('p1', rels)).toContain('p2');
  });

  it('spouses se detectan', () => {
    const rels = [rel({ id: 's', type: 'spouse', person1Id: 'a', person2Id: 'b' })];
    expect(spousesOf('a', rels)).toContain('b');
    expect(spousesOf('b', rels)).toContain('a');
  });

  it('computeLayout posiciona centro y descendientes', () => {
    const rels = [
      rel({ id: 'r1', type: 'parent', person1Id: 'root', person2Id: 'child1' }),
      rel({ id: 'r2', type: 'parent', person1Id: 'root', person2Id: 'child2' }),
    ];
    const res = computeLayout('root', 3, 'descendants', rels);
    expect(res.pos.has('root')).toBe(true);
    expect(res.pos.has('child1')).toBe(true);
    expect(res.pos.has('child2')).toBe(true);
    // children below root
    expect(res.pos.get('child1')!.y).toBeGreaterThan(res.pos.get('root')!.y);
  });

  it('modo branch incluye ancestros y descendientes', () => {
    const rels = [
      rel({ id: 'r1', type: 'parent', person1Id: 'parent', person2Id: 'root' }),
      rel({ id: 'r2', type: 'parent', person1Id: 'root', person2Id: 'child' }),
    ];
    const res = computeLayout('root', 3, 'branch', rels);
    expect(res.pos.has('parent')).toBe(true);
    expect(res.pos.has('child')).toBe(true);
    expect(res.pos.get('parent')!.y).toBeLessThan(res.pos.get('root')!.y);
    expect(res.pos.get('child')!.y).toBeGreaterThan(res.pos.get('root')!.y);
  });

  it('profundidad se limita a 10', () => {
    const res = computeLayout('x', 99, 'descendants', []);
    expect(res.pos.has('x')).toBe(true);
  });
});
