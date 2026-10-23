import type { Person } from '../../core/db/schema';

export interface PersonSearchCriteria {
  query?: string;
  firstName?: string;
  lastName?: string;
  sex?: Person['sex'];
  lifeStatus?: Person['lifeStatus'];
  generation?: number;
  birthYearFrom?: number;
  birthYearTo?: number;
  hasPhoto?: boolean;
  placeText?: string;
}

export function matchesPerson(person: Person, criteria: PersonSearchCriteria): boolean {
  if (criteria.firstName && !(person.firstName ?? '').toLowerCase().includes(criteria.firstName.toLowerCase())) return false;
  if (criteria.lastName && !(person.lastName ?? '').toLowerCase().includes(criteria.lastName.toLowerCase())) return false;
  if (criteria.sex && person.sex !== criteria.sex) return false;
  if (criteria.lifeStatus && person.lifeStatus !== criteria.lifeStatus) return false;
  if (criteria.generation !== undefined && person.generation !== criteria.generation) return false;

  const q = criteria.query?.toLowerCase().trim();
  if (q) {
    const haystack = [
      person.firstName, person.lastName, person.biography, person.notes,
      person.birthplace?.name, person.deathPlace?.name
    ].filter(Boolean).join(' ').toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  if (criteria.birthYearFrom !== undefined) {
    const y = person.birthDate?.year ?? 0;
    if (y < criteria.birthYearFrom) return false;
  }
  if (criteria.birthYearTo !== undefined) {
    const y = person.birthDate?.year ?? 0;
    if (y > criteria.birthYearTo) return false;
  }

  if (criteria.placeText) {
    const p = criteria.placeText.toLowerCase();
    const places = [person.birthplace?.name, person.deathPlace?.name].filter(Boolean).join(' ').toLowerCase();
    if (!places.includes(p)) return false;
  }

  return true;
}

export function searchPersons(persons: Person[], criteria: PersonSearchCriteria): Person[] {
  return persons.filter((p) => matchesPerson(p, criteria));
}