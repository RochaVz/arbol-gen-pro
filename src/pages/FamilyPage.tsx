import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Input, Button } from '../shared/components/ui';
import { EmptyState } from '../shared/components/EmptyState';
import { Search, Plus, Users } from 'lucide-react';
import { isStitchConfigured } from '../services/stitch';

export function FamilyPage() {
  const navigate = useNavigate();
  const { persons, relationships, activeTreeId, personPhotoUrls } = useAppStore();
  const [search, setSearch] = useState('');
  const [lifeStatusFilter, setLifeStatusFilter] = useState<'all' | 'alive' | 'deceased'>('all');
  const [generationFilter, setGenerationFilter] = useState<'all' | number>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  // Get persons in active tree
  const personsInTree = useMemo(
    () => activeTreeId
      ? persons.filter((p) => p.treeId === activeTreeId && !p.deletedAt)
      : persons.filter((p) => !p.deletedAt),
    [persons, activeTreeId]
  );

  // Calculate generations
  const calculateGenerations = (): Record<string, number> => {
    const gen: Record<string, number> = {};
    const visited = new Set<string>();

    // Find root person (no parents)
    const rootPersons = personsInTree.filter((p) => {
      const hasParents = relationships.some(
        (r) => r.person2Id === p.id && r.type === 'parent'
      );
      return !hasParents;
    });

    // BFS to calculate generations
    const queue: [string, number][] = rootPersons.map((p) => [p.id, 0]);

    while (queue.length > 0) {
      const [personId, level] = queue.shift()!;
      if (visited.has(personId)) continue;
      visited.add(personId);
      gen[personId] = level;

      // Add children
      relationships
        .filter((r) => r.person1Id === personId && r.type === 'parent')
        .forEach((r) => {
          if (r.person2Id && !visited.has(r.person2Id)) {
            queue.push([r.person2Id, level + 1]);
          }
        });
    }

    return gen;
  };

  const generations = useMemo(() => calculateGenerations(), [personsInTree, relationships]);

  // Filter persons
  const filteredPersons = useMemo(() => {
    return personsInTree.filter((p) => {
      const matchesSearch = !search || [p.firstName, p.lastName].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = lifeStatusFilter === 'all' || p.lifeStatus === lifeStatusFilter;
      const matchesGen = generationFilter === 'all' || generations[p.id] === generationFilter;
      return matchesSearch && matchesStatus && matchesGen;
    });
  }, [personsInTree, search, lifeStatusFilter, generationFilter, generations]);

  const uniqueGenerations = useMemo(
    () => Array.from(new Set(Object.values(generations))).sort((a, b) => a - b),
    [generations]
  );

  const getPhotoUrl = (personId: string) => {
    return personPhotoUrls[personId]?.[0];
  };

  if (personsInTree.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-16 h-16" />}
        title="Mi Familia está vacía"
        description="Comienza creando un árbol genealógico y agregando miembros de tu familia."
        action={<Button variant="primary" onClick={() => navigate('/')}>Crear Árbol</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Mi Familia</h1>
          <p className="text-neutral-600 dark:text-neutral-400">{personsInTree.length} miembros registrados</p>
          {isStitchConfigured() && (
            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm mt-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  IA activa
                </span>
              </div>
            </div>
          )}
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => navigate('/tree')}
        >
          Agregar Familiar
        </Button>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Buscar familia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Life Status Filter */}
          <select
            value={lifeStatusFilter}
            onChange={(e) => setLifeStatusFilter(e.target.value as 'all' | 'alive' | 'deceased')}
            className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-medium"
          >
            <option value="all">Todos</option>
            <option value="alive">Vivos</option>
            <option value="deceased">Fallecidos</option>
          </select>

          {/* Generation Filter */}
          <select
            value={generationFilter}
            onChange={(e) => setGenerationFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-medium"
          >
            <option value="all">Todas las generaciones</option>
            {uniqueGenerations.map((gen) => (
              <option key={gen} value={gen}>
                Generación {gen + 1}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-green-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-green-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              Lista
            </button>
          </div>
        </div>

        {filteredPersons.length === 0 && personsInTree.length > 0 && (
          <div className="text-center py-8">
            <p className="text-neutral-500 dark:text-neutral-400">
              No se encontraron miembros que coincidan con los filtros
            </p>
          </div>
        )}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && filteredPersons.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPersons.map((person) => {
            const photoUrl = getPhotoUrl(person.id);
            const gen = generations[person.id] ?? 0;

            return (
              <div
                key={person.id}
                onClick={() => navigate(`/person/${person.id}`)}
                className="group bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Photo */}
                <div className="aspect-square bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 flex items-center justify-center overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} alt={`${person.firstName} ${person.lastName}`} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-12 h-12 text-green-300 dark:text-green-700" />
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {person.firstName} {person.lastName || ''}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Generación {gen + 1}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        person.lifeStatus === 'alive'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {person.lifeStatus === 'alive' ? 'Vivo' : 'Fallecido'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredPersons.length > 0 && (
        <div className="space-y-2">
          {filteredPersons.map((person) => {
            const photoUrl = getPhotoUrl(person.id);
            const gen = generations[person.id] ?? 0;

            return (
              <div
                key={person.id}
                onClick={() => navigate(`/person/${person.id}`)}
                className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} alt={`${person.firstName} ${person.lastName}`} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-green-300 dark:text-green-700" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {person.firstName} {person.lastName || ''}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Gen {gen + 1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        person.lifeStatus === 'alive'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {person.lifeStatus === 'alive' ? 'Vivo' : 'Fallecido'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
