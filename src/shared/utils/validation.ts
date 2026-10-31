import type { Person, Relationship, Event, Tree, Place } from '../../core/db/schema';
import { isValidPartialDate } from './date';
import { ok, err, type Result } from '../types/common';

export function validatePerson(person: Partial<Person>): Result<Person> {
  const errors: string[] = [];
  if (!person.firstName || !person.firstName.trim()) errors.push('firstName is required');
  if (!person.treeId) errors.push('treeId is required');
  if (person.lifeStatus && !['alive', 'deceased', 'unknown'].includes(person.lifeStatus)) errors.push('invalid lifeStatus');
  if (person.birthDate && !isValidPartialDate(person.birthDate)) errors.push('invalid birthDate');
  if (person.deathDate && !isValidPartialDate(person.deathDate)) errors.push('invalid deathDate');
  if (person.birthDate && person.deathDate) {
    // death should not be before birth (year-level)
    if ((person.deathDate.year ?? 0) < (person.birthDate.year ?? 0)) errors.push('deathDate before birthDate');
  }
  if (errors.length) return err(errors.join('; '));
  return ok(person as Person);
}

export function validateRelationship(
  rel: Partial<Relationship>,
  existingEdges?: { from: string; to: string }[]
): Result<Relationship> {
  const errors: string[] = [];
  if (!rel.treeId) errors.push('treeId is required');
  const from = rel.person1Id ?? rel.personId;
  const to = rel.person2Id ?? rel.relativeId;
  if (!from || !to) errors.push('person ids are required');
  if (from && to && from === to) errors.push('self-relationship not allowed');
  if (rel.startDate && !isValidPartialDate(rel.startDate)) errors.push('invalid startDate');
  if (rel.endDate && !isValidPartialDate(rel.endDate)) errors.push('invalid endDate');
  if (rel.startDate && rel.endDate) {
    // compare by year
    if ((rel.endDate.year ?? 0) < (rel.startDate.year ?? 0)) errors.push('endDate before startDate');
  }
  // cycle check for parent/child relationships
  if (from && to && existingEdges) {
    const type = String(rel.type ?? '').toLowerCase();
    if (type.includes('parent') || type.includes('child') || type.includes('padre') || type.includes('madre') || type.includes('hijo') || type.includes('hija')) {

      const edges = existingEdges.map((e) => ({ from: e.from, to: e.to }));
      // parent: from is parent of to => edge to->from? We'll treat from->to generically
      if (wouldCreateCycleImport(edges, from, to)) {
        errors.push('relationship creates a cycle');
      }
    }
  }
  if (errors.length) return err(errors.join('; '));
  return ok(rel as Relationship);
}

// lazy import to avoid circular
function wouldCreateCycleImport(edges: { from: string; to: string }[], from: string, to: string): boolean {
  // inline cycle check
  const adj = new Map<string, string[]>();
  for (const e of [...edges, { from, to }]) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }
  const visited = new Set<string>();
  const rec = new Set<string>();
  function dfs(u: string): boolean {
    visited.add(u); rec.add(u);
    for (const v of adj.get(u) ?? []) {
      if (!visited.has(v)) { if (dfs(v)) return true; }
      else if (rec.has(v)) return true;
    }
    rec.delete(u);
    return false;
  }
  for (const n of adj.keys()) if (!visited.has(n) && dfs(n)) return true;
  return false;
}

export function validateEvent(event: Partial<Event>): Result<Event> {
  const errors: string[] = [];
  if (!event.treeId) errors.push('treeId is required');
  if (!event.type) errors.push('type is required');
  if (event.date && !isValidPartialDate(event.date)) errors.push('invalid date');
  if (errors.length) return err(errors.join('; '));
  return ok(event as Event);
}

export function validateTree(tree: Partial<Tree>): Result<Tree> {
  const errors: string[] = [];
  if (!tree.name || !tree.name.trim()) errors.push('name is required');
  if (!tree.ownerId) errors.push('ownerId is required');
  if (errors.length) return err(errors.join('; '));
  return ok(tree as Tree);
}

export function validatePlace(place: Partial<Place>): Result<Place> {
  const errors: string[] = [];
  if (!place.name || !place.name.trim()) errors.push('name is required');
  if (place.country && !/^[A-Z]{2}$/.test(place.country)) errors.push('invalid country code');
  if (errors.length) return err(errors.join('; '));
  return ok(place as Place);
}