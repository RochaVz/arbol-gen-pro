import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  db, eventRepository, personRepository, photoRepository, relationshipRepository, treeRepository,
  type Person, type Relationship, type Event, type Photo,
} from '../core/db';
import { PersonProfileContainer } from '../features/person/PersonProfileContainer';

vi.mock('browser-image-compression', () => ({ default: async (file: File) => file }));

const base = {
  createdAt: 1, updatedAt: 1, serverVersion: 0, localRevision: 0,
  syncStatus: 'pending' as const, deletedAt: null,
};
const person: Person = { ...base, id: 'p1', treeId: 't1', firstName: 'Ana', lifeStatus: 'alive' };

function Profile() {
  const [persons, setPersons] = useState<Person[]>([person]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const refresh = async () => {
    setPersons(await personRepository.list());
    setRelationships(await relationshipRepository.list());
    setEvents(await eventRepository.list());
    setPhotos(await photoRepository.list());
  };
  return <PersonProfileContainer personId="p1" persons={persons} relationships={relationships}
    events={events} photos={photos} onSelectPerson={() => {}} onBack={() => {}} onRefresh={refresh} />;
}

beforeEach(async () => {
  await db.transaction('rw', [db.trees, db.persons, db.relationships, db.events, db.photos, db.photoBlobs, db.syncOperations], async () => {
    await Promise.all([db.trees.clear(), db.persons.clear(), db.relationships.clear(), db.events.clear(),
      db.photos.clear(), db.photoBlobs.clear(), db.syncOperations.clear()]);
  });
  await treeRepository.create({ ...base, id: 't1', name: 'Familia', ownerId: 'owner' });
  await personRepository.create(person);
  vi.stubGlobal('URL', Object.assign(class extends URL {}, {
    createObjectURL: vi.fn(() => 'blob:test'),
    revokeObjectURL: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('person profile actions', () => {
  it.each([
    ['Agregar padres', 'parent', true],
    ['Agregar pareja', 'spouse', false],
    ['Agregar hijos', 'parent', false],
  ])('persists %s and its relationship', async (button, type, relativeIsSource) => {
    render(<Profile />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(button) }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Luis' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await screen.findByText('Luis');
    const relative = (await personRepository.list()).find((p) => p.firstName === 'Luis');
    expect(relative).toBeDefined();
    const [relationship] = await relationshipRepository.list();
    expect(relationship).toMatchObject({
      type, person1Id: relativeIsSource ? relative?.id : person.id,
      person2Id: relativeIsSource ? person.id : relative?.id,
    });
    const createdPerson = (await db.syncOperations.toArray()).find((op) =>
      op.entityType === 'person' && op.entityId === relative?.id);
    const createdRelationship = (await db.syncOperations.toArray()).find((op) =>
      op.entityType === 'relationship' && op.entityId === relationship.id);
    expect(createdRelationship?.dependsOn).toContain(createdPerson?.operationId);
  });

  it('rolls back the new person when the relationship cannot be saved', async () => {
    vi.spyOn(relationshipRepository, 'create').mockRejectedValue(new Error('save failed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Profile />);
    fireEvent.click(screen.getByRole('button', { name: /Agregar padres/ }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Luis' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect((await screen.findByRole('alert')).textContent).toContain('No se pudo guardar');
    expect(await personRepository.list()).toHaveLength(1);
  });

  it('persists an event and photo for the selected person', async () => {
    render(<Profile />);
    fireEvent.click(screen.getByRole('button', { name: /Agregar evento/ }));
    fireEvent.change(screen.getByLabelText('Título del evento'), { target: { value: 'Reunión' } });
    fireEvent.change(screen.getByLabelText('Fecha (opcional)'), { target: { value: '2026-03-15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await screen.findByText('Reunión');
    expect((await eventRepository.list())[0]).toMatchObject({
      personId: 'p1', title: 'Reunión', date: { year: 2026, month: 3, day: 15 },
    });

    fireEvent.change(screen.getByLabelText('Seleccionar foto'), {
      target: { files: [new File(['image'], 'photo.png', { type: 'image/png' })] },
    });
    await waitFor(() => expect(screen.getByAltText('Foto 1')).toBeTruthy());
    const [photo] = await photoRepository.list();
    expect(photo.personId).toBe('p1');
    expect(await db.photoBlobs.where('photoId').equals(photo.id).count()).toBe(3);
  });
});
