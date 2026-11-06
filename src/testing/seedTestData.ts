/**
 * Test Data Seeding
 * Generate sample genealogical data for testing React Flow tree visualization
 */

import { uuidv7 } from '../core/db';
import type { Tree, Person, Relationship, PartialDate } from '../core/db';

export interface TestDataSet {
  tree: Tree;
  persons: Person[];
  relationships: Relationship[];
}

/**
 * Create a sample family tree for testing
 * 3 generations: grandparents → parents → children
 */
export function createSampleFamilyTree(): TestDataSet {
  const treeId = uuidv7();
  const ownerId = 'test-user-local';

  // Create tree
  const tree: Tree = {
    id: treeId,
    name: 'Árbol de Prueba',
    description: 'Árbol genealógico de prueba para validar React Flow',
    ownerId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverVersion: 0,
    localRevision: 1,
    syncStatus: 'synced',
    deletedAt: null,
  };

  // Grandparents Generation
  const abuelo1: Person = {
    id: uuidv7(),
    treeId,
    firstName: 'José',
    lastName: 'García',
    sex: 'male',
    birthDate: { year: 1940, month: 3, day: 15 } as PartialDate,
    deathDate: { year: 2010, month: 8, day: 20 } as PartialDate,
    lifeStatus: 'deceased',
    birthplace: { name: 'Madrid, España', city: 'Madrid', country: 'ES' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverVersion: 0,
    localRevision: 1,
    syncStatus: 'synced',
    deletedAt: null,
  };

  const abuela1: Person = {
    id: uuidv7(),
    treeId,
    firstName: 'María',
    lastName: 'Rodríguez',
    sex: 'female',
    birthDate: { year: 1945, month: 6, day: 10 } as PartialDate,
    deathDate: { year: 2015, month: 11, day: 5 } as PartialDate,
    lifeStatus: 'deceased',
    birthplace: { name: 'Barcelona, España', city: 'Barcelona', country: 'ES' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverVersion: 0,
    localRevision: 1,
    syncStatus: 'synced',
    deletedAt: null,
  };

  const abuelo2: Person = {
    id: uuidv7(),
    treeId,
    firstName: 'Juan',
    lastName: 'López',
    sex: 'male',
    birthDate: { year: 1942, month: 1, day: 20 } as PartialDate,
    deathDate: { year: 2012, month: 4, day: 15 } as PartialDate,
    lifeStatus: 'deceased',
    birthplace: { name: 'Valencia, España', city: 'Valencia', country: 'ES' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverVersion: 0,
    localRevision: 1,
    syncStatus: 'synced',
    deletedAt: null,
  };

  const abuela2: Person = {
    id: uuidv7(),
    treeId,
    firstName: 'Carmen',
    lastName: 'Martínez',
    sex: 'female',
    birthDate: { year: 1948, month: 9, day: 8 } as PartialDate,
    lifeStatus: 'alive',
    birthplace: { name: 'Sevilla, España', city: 'Sevilla', country: 'ES' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverVersion: 0,
    localRevision: 1,
    syncStatus: 'synced',
    deletedAt: null,
  };

  // Parents Generation
  const padre: Person = {
    id: uuidv7(),
    treeId,
    firstName: 'Carlos',
    lastName: 'García López',
    sex: 'male',
    birthDate: { year: 1970, month: 5, day: 12 } as PartialDate,
    lifeStatus: 'alive',
    birthplace: { name: 'Madrid, España', city: 'Madrid', country: 'ES' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverVersion: 0,
    localRevision: 1,
    syncStatus: 'synced',
    deletedAt: null,
  };

  const madre: Person = {
    id: uuidv7(),
    treeId,
    firstName: 'Elena',
    lastName: 'López Martínez',
    sex: 'female',
    birthDate: { year: 1972, month: 11, day: 25 } as PartialDate,
    lifeStatus: 'alive',
    birthplace: { name: 'Barcelona, España', city: 'Barcelona', country: 'ES' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverVersion: 0,
    localRevision: 1,
    syncStatus: 'synced',
    deletedAt: null,
  };

  // Children Generation (current user as center)
  const yo: Person = {
    id: uuidv7(),
    treeId,
    firstName: 'Alfonso',
    lastName: 'García López',
    sex: 'male',
    birthDate: { year: 1995, month: 2, day: 14 } as PartialDate,
    lifeStatus: 'alive',
    birthplace: { name: 'Madrid, España', city: 'Madrid', country: 'ES' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverVersion: 0,
    localRevision: 1,
    syncStatus: 'synced',
    deletedAt: null,
  };

  const hermana: Person = {
    id: uuidv7(),
    treeId,
    firstName: 'Lucía',
    lastName: 'García López',
    sex: 'female',
    birthDate: { year: 1998, month: 7, day: 30 } as PartialDate,
    lifeStatus: 'alive',
    birthplace: { name: 'Madrid, España', city: 'Madrid', country: 'ES' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverVersion: 0,
    localRevision: 1,
    syncStatus: 'synced',
    deletedAt: null,
  };

  const hermano: Person = {
    id: uuidv7(),
    treeId,
    firstName: 'Roberto',
    lastName: 'García López',
    sex: 'male',
    birthDate: { year: 2000, month: 4, day: 22 } as PartialDate,
    lifeStatus: 'alive',
    birthplace: { name: 'Barcelona, España', city: 'Barcelona', country: 'ES' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    serverVersion: 0,
    localRevision: 1,
    syncStatus: 'synced',
    deletedAt: null,
  };

  // Relationships
  const relationships: Relationship[] = [
    // Abuelos García
    {
      id: uuidv7(),
      treeId,
      person1Id: abuelo1.id,
      person2Id: abuela1.id,
      type: 'spouse',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'synced',
      deletedAt: null,
    },

    // Abuelos López
    {
      id: uuidv7(),
      treeId,
      person1Id: abuelo2.id,
      person2Id: abuela2.id,
      type: 'spouse',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'synced',
      deletedAt: null,
    },

    // Padre → Abuelos García (child relationship)
    {
      id: uuidv7(),
      treeId,
      person1Id: abuelo1.id,
      person2Id: padre.id,
      type: 'child',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'synced',
      deletedAt: null,
    },

    // Madre → Abuelos López
    {
      id: uuidv7(),
      treeId,
      person1Id: abuelo2.id,
      person2Id: madre.id,
      type: 'child',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'synced',
      deletedAt: null,
    },

    // Padre - Madre (spouse)
    {
      id: uuidv7(),
      treeId,
      person1Id: padre.id,
      person2Id: madre.id,
      type: 'spouse',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'synced',
      deletedAt: null,
    },

    // Yo (Alfonso) - child of padre/madre
    {
      id: uuidv7(),
      treeId,
      person1Id: padre.id,
      person2Id: yo.id,
      type: 'child',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'synced',
      deletedAt: null,
    },

    // Hermana (Lucía) - child of padre/madre
    {
      id: uuidv7(),
      treeId,
      person1Id: padre.id,
      person2Id: hermana.id,
      type: 'child',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'synced',
      deletedAt: null,
    },

    // Hermano (Roberto) - child of padre/madre
    {
      id: uuidv7(),
      treeId,
      person1Id: madre.id,
      person2Id: hermano.id,
      type: 'child',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'synced',
      deletedAt: null,
    },

    // Yo y Hermana - siblings
    {
      id: uuidv7(),
      treeId,
      person1Id: yo.id,
      person2Id: hermana.id,
      type: 'sibling',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'synced',
      deletedAt: null,
    },

    // Yo y Hermano - siblings
    {
      id: uuidv7(),
      treeId,
      person1Id: yo.id,
      person2Id: hermano.id,
      type: 'sibling',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'synced',
      deletedAt: null,
    },

    // Hermana y Hermano - siblings
    {
      id: uuidv7(),
      treeId,
      person1Id: hermana.id,
      person2Id: hermano.id,
      type: 'sibling',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'synced',
      deletedAt: null,
    },
  ];

  return {
    tree,
    persons: [abuelo1, abuela1, abuelo2, abuela2, padre, madre, yo, hermana, hermano],
    relationships,
  };
}
