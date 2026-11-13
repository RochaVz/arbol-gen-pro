import { useEffect, useMemo, useRef, useState } from 'react';
import {
  db, eventRepository, personRepository, relationshipRepository, unconfirmedCreateOperations, uuidv7,
  type BaseEntity, type Event, type Person, type Photo, type Relationship,
} from '../../core/db';
import { getPhotoBlobs, savePhotoLocally } from '../photo/services/photoStorage';
import { childrenOf, parentsOf, spousesOf } from '../tree/utils/treeLayout';
import { partialDateToString } from '../../shared/utils/date';
import { ButtonV2 as Button, InputV2 as Input } from '../../shared/components/ui';
import { Modal } from '../../shared/components/ui/Modal';
import { PersonProfilePage } from './PersonProfilePage';

type Action = 'parent' | 'partner' | 'child' | 'event';
const actionTitles: Record<Action, string> = {
  parent: 'Agregar padre o madre',
  partner: 'Agregar pareja',
  child: 'Agregar hijo o hija',
  event: 'Agregar evento',
};

interface Props {
  personId: string;
  persons: Person[];
  relationships: Relationship[];
  events: Event[];
  photos: Photo[];
  onSelectPerson: (id: string) => void;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

function newEntity(): BaseEntity {
  const now = Date.now();
  return {
    id: uuidv7(), createdAt: now, updatedAt: now, serverVersion: 0,
    localRevision: 0, syncStatus: 'pending', deletedAt: null,
  };
}

export function PersonProfileContainer({
  personId, persons, relationships, events, photos, onSelectPerson, onBack, onRefresh,
}: Props) {
  const person = persons.find((p) => p.id === personId);
  const [action, setAction] = useState<Action | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [gallery, setGallery] = useState<Array<{ id: string; url: string }>>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const personPhotos = useMemo(
    () => photos.filter((photo) => photo.personId === personId && !photo.deletedAt)
      .sort((a, b) => b.createdAt - a.createdAt),
    [photos, personId]
  );

  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];
    async function loadPhotos() {
      try {
        const items: Array<{ id: string; url: string }> = [];
        for (const photo of personPhotos) {
          const blobs = await getPhotoBlobs(photo.id);
          if (cancelled) return;
          const blob = blobs.find((b) => b.kind === 'thumbnail') ?? blobs[0];
          const url = blob?.blob ? URL.createObjectURL(blob.blob) : photo.thumbnailUrl ?? photo.url;
          if (url) {
            if (blob?.blob) urls.push(url);
            items.push({ id: photo.id, url });
          }
        }
        if (!cancelled) setGallery(items);
      } catch (cause) {
        console.error('[PersonProfile] Error al cargar fotos', cause);
        if (!cancelled) setError('No se pudieron cargar las fotos.');
      }
    }
    void loadPhotos();
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [personPhotos]);

  const peopleByIds = (ids: string[]) =>
    ids.map((id) => persons.find((p) => p.id === id)).filter((p): p is Person => !!p);

  const openAction = (next: Action) => {
    setError('');
    setFirstName('');
    setLastName('');
    setEventTitle('');
    setEventDate('');
    setAction(next);
  };

  const saveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person || !action || busy) return;
    setError('');
    if (action === 'event' ? !eventTitle.trim() : !firstName.trim()) {
      setError(action === 'event' ? 'Escribe el título del evento.' : 'Escribe el nombre.');
      return;
    }
    setBusy(true);
    try {
      if (action === 'event') {
        const [year, month, day] = eventDate.split('-').map(Number);
        await db.transaction('rw', [db.events, db.syncOperations], async () => {
          const dependsOn = await unconfirmedCreateOperations([
            { entityType: 'tree', entityId: person.treeId },
            { entityType: 'person', entityId: person.id },
          ]);
          const saved = await eventRepository.create({
            ...newEntity(), treeId: person.treeId, personId: person.id,
            type: 'event', title: eventTitle.trim(),
            date: eventDate ? { year, month, day } : undefined,
          });
          await db.syncOperations.update(saved.operation.operationId, { dependsOn });
        });
      } else {
        const relative: Person = {
          ...newEntity(), treeId: person.treeId, firstName: firstName.trim(),
          lastName: lastName.trim() || undefined, lifeStatus: 'unknown',
        };
        const relationship: Relationship = {
          ...newEntity(), treeId: person.treeId,
          person1Id: action === 'parent' ? relative.id : person.id,
          person2Id: action === 'parent' ? person.id : relative.id,
          type: action === 'partner' ? 'spouse' : 'parent',
        };
        await db.transaction('rw', [db.persons, db.relationships, db.syncOperations], async () => {
          const treeDependencies = await unconfirmedCreateOperations([
            { entityType: 'tree', entityId: person.treeId },
          ]);
          const existingPersonDependencies = await unconfirmedCreateOperations([
            { entityType: 'person', entityId: person.id },
          ]);
          const savedPerson = await personRepository.create(relative);
          await db.syncOperations.update(savedPerson.operation.operationId, { dependsOn: treeDependencies });
          const savedRelationship = await relationshipRepository.create(relationship);
          await db.syncOperations.update(savedRelationship.operation.operationId, {
            dependsOn: [...treeDependencies, ...existingPersonDependencies, savedPerson.operation.operationId],
          });
        });
      }
      setAction(null);
      await onRefresh();
    } catch (cause) {
      console.error('[PersonProfile] Error al guardar', cause);
      setError('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const addPhoto = async (file?: File) => {
    if (!file || !person || busy) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen.');
      return;
    }
    setBusy(true);
    try {
      await savePhotoLocally({ file, treeId: person.treeId, personId: person.id });
      await onRefresh();
    } catch (cause) {
      console.error('[PersonProfile] Error al guardar foto', cause);
      setError('No se pudo guardar la foto. Comprueba el archivo y el espacio disponible.');
    } finally {
      setBusy(false);
    }
  };

  if (!person) {
    return <div role="alert">No se encontró la persona. <button onClick={onBack}>Volver al árbol</button></div>;
  }

  return (
    <>
      {error && !action && <p role="alert" className="text-red-700 p-4">{error}</p>}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        aria-label="Seleccionar foto"
        className="hidden"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          e.currentTarget.value = '';
          void addPhoto(file);
        }}
      />
      <PersonProfilePage
        personId={person.id}
        firstName={person.firstName}
        lastName={person.lastName}
        birthDate={partialDateToString(person.birthDate)}
        deathDate={partialDateToString(person.deathDate)}
        lifeStatus={person.lifeStatus === 'alive' ? 'living' : person.lifeStatus}
        photoUrl={gallery[0]?.url}
        gallery={gallery}
        parents={peopleByIds(parentsOf(person.id, relationships))}
        familyChildren={peopleByIds(childrenOf(person.id, relationships))}
        partners={peopleByIds(spousesOf(person.id, relationships))}
        events={events.filter((event) => event.personId === person.id || event.personIds?.includes(person.id))
          .map((event) => ({ id: event.id, title: event.title || event.type, date: partialDateToString(event.date) }))}
        onSelectPerson={onSelectPerson}
        onBack={onBack}
        onAddPhoto={() => { if (!busy) fileInput.current?.click(); }}
        onAddParent={() => openAction('parent')}
        onAddChild={() => openAction('child')}
        onAddPartner={() => openAction('partner')}
        onAddEvent={() => openAction('event')}
      />
      <Modal isOpen={action !== null} onClose={() => { if (!busy) setAction(null); }} title={action ? actionTitles[action] : ''}>
        <form onSubmit={(e) => void saveAction(e)} className="space-y-4">
          {action === 'event' ? (
            <>
              <Input id="event-title" label="Título del evento" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} required />
              <Input id="event-date" label="Fecha (opcional)" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </>
          ) : (
            <>
              <Input id="relative-first-name" label="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <Input id="relative-last-name" label="Apellido (opcional)" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </>
          )}
          {error && <p role="alert" className="text-red-700">{error}</p>}
          <Button type="submit" isLoading={busy} fullWidth>Guardar</Button>
        </form>
      </Modal>
    </>
  );
}
