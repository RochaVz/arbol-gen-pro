import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { EmptyState } from '../shared/components/EmptyState';
import { Image, Download } from 'lucide-react';
import { Button } from '../shared/components/ui';

interface PhotoWithPerson {
  photoId: string;
  url: string;
  personId: string;
  personName: string;
  uploadedAt?: string;
}

export function PhotosPage() {
  const navigate = useNavigate();
  const { photos, persons, activeTreeId, personPhotoUrls } = useAppStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | string>('all');

  // Get all photos in active tree
  const photosInTree = useMemo(() => {
    const result: PhotoWithPerson[] = [];
    const personsInTree = activeTreeId
      ? persons.filter((p) => p.treeId === activeTreeId && !p.deletedAt)
      : persons.filter((p) => !p.deletedAt);

    personsInTree.forEach((person) => {
      const personPhotos = personPhotoUrls[person.id];
      if (Array.isArray(personPhotos)) {
        personPhotos.forEach((url: string, idx: number) => {
          result.push({
            photoId: `${person.id}-${idx}`,
            url,
            personId: person.id,
            personName: `${person.firstName} ${person.lastName || ''}`,
          });
        });
      }
    });

    return result;
  }, [photos, persons, activeTreeId, personPhotoUrls]);

  // Get unique persons with photos
  const personsWithPhotos = useMemo(
    () => Array.from(new Set(photosInTree.map((p) => p.personId)))
      .map((id) => ({
        id,
        name: photosInTree.find((p) => p.personId === id)?.personName || 'Unknown',
      })),
    [photosInTree]
  );

  // Filter photos
  const filteredPhotos = useMemo(
    () => selectedFilter === 'all'
      ? photosInTree
      : photosInTree.filter((p) => p.personId === selectedFilter),
    [photosInTree, selectedFilter]
  );

  if (photosInTree.length === 0) {
    return (
      <EmptyState
        icon={<Image className="w-16 h-16" />}
        title="No hay fotografías"
        description="Agrega fotos a los miembros de tu familia en sus perfiles para verlas aquí."
        action={<Button variant="primary" onClick={() => navigate('/family')}>Ir a Miembros</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Fotografías</h1>
        <p className="text-neutral-600 dark:text-neutral-400">{filteredPhotos.length} fotos</p>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFilter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Todas ({photosInTree.length})
          </button>
          {personsWithPhotos.map((person) => {
            const count = photosInTree.filter((p) => p.personId === person.id).length;
            return (
              <button
                key={person.id}
                onClick={() => setSelectedFilter(person.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === person.id
                    ? 'bg-green-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {person.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Masonry Grid */}
      {filteredPhotos.length > 0 && (
        <div
          className="grid gap-4 auto-rows-max"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          }}
        >
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.photoId}
              className="group relative bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden aspect-square hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/person/${photo.personId}`)}
              role="button"
              tabIndex={0}
            >
              {/* Image */}
              <img
                src={photo.url}
                alt={photo.personName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-colors flex items-end">
                <div className="w-full p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">{photo.personName}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Download logic would go here
                    const link = document.createElement('a');
                    link.href = photo.url;
                    link.download = `${photo.personName}-${idx}.jpg`;
                    link.click();
                  }}
                  className="p-2 bg-white rounded-lg text-neutral-900 hover:bg-neutral-100 shadow-lg transition-colors"
                  title="Descargar"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredPhotos.length === 0 && selectedFilter !== 'all' && (
        <div className="text-center py-12">
          <p className="text-neutral-500 dark:text-neutral-400">
            Este miembro no tiene fotografías
          </p>
          <Button
            variant="secondary"
            onClick={() => setSelectedFilter('all')}
            className="mt-4"
          >
            Ver todas las fotos
          </Button>
        </div>
      )}
    </div>
  );
}
