import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ReactFlowTree } from '../shared/components/ReactFlowTree';
import { TreeToolbar } from '../shared/components/TreeToolbar';
import { Button } from '../shared/components/ui';
import { Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { generateTree, analyzeTree, isStitchConfigured } from '../services/stitch';
import { useToast } from '../shared/hooks/useToast';

export function TreePage() {
  const navigate = useNavigate();
  const { persons, relationships, personPhotoUrls, activeTreeId } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [currentLayout, setCurrentLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  // @ts-ignore - used in async event handlers
  const [stitchStatus, setStitchStatus] = useState<'idle' | 'checking' | 'configured' | 'error'>('idle');
  // @ts-ignore - used in async event handlers
  // @ts-ignore - used in async event handlers
  const [stitchResult, setStitchResult] = useState<unknown>(null);
// @ts-ignore - used in async event handlers
  const { addToast, removeToast } = useToast();

  const personsInTree = useMemo(() => {
    let filtered = activeTreeId
      ? persons.filter((p) => p.treeId === activeTreeId && !p.deletedAt)
      : persons.filter((p) => !p.deletedAt);

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(term)
      );
    }

    // Apply generation filter
    if (selectedGeneration !== null) {
      filtered = filtered.filter((p) => p.generation === selectedGeneration);
    }

    return filtered;
  }, [persons, activeTreeId, searchTerm, selectedGeneration]);

  const relationshipsInTree = activeTreeId
    ? relationships.filter((r) => r.treeId === activeTreeId && !r.deletedAt)
    : relationships.filter((r) => !r.deletedAt);

  // Filter relationships to only include persons in current filtered tree
  const filteredRelationships = relationshipsInTree.filter(
    (r) =>
      personsInTree.some((p) => p.id === r.person1Id) &&
      personsInTree.some((p) => p.id === r.person2Id)
  );

  const treeCenterId = personsInTree[0]?.id;

  if (persons.filter((p) => !p.deletedAt).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">No tienes árboles creados aún.</p>
        <Button onClick={() => navigate('/')} variant="primary" icon={<Plus className="w-5 h-5" />}>
          Crear primer árbol
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Header with info */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Tu Árbol Genealógico</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          {personsInTree.length} de {persons.filter((p) => !p.deletedAt).length} miembros
          {selectedGeneration !== null && ` · Gen ${selectedGeneration}`}
        </p>
      </div>
      
      {/* Stitch status and actions */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm">
        <div className="flex items-center gap-2">
          {isStitchConfigured() && (
            <span className="text-green-600 dark:text-green-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              Stitch IA activo
            </span>
          )}
          {!isStitchConfigured() && (
            <span className="text-red-600 dark:text-red-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              Configurar API
            </span>
          )}
        </div>
        {isStitchConfigured() && (
          <div className="mt-1 flex gap-1">
            <button
              onClick={async () => {
                setStitchStatus('idle');
                setStitchStatus('checking');
                try {
                  const result = await generateTree({
                    type: 'family',
                    memberCount: personsInTree.length,
                    generations: Math.max(...personsInTree.map(p => p.generation || 0), 1)
                  });
                  setStitchResult(result);
                  addToast('Árbol generado con IA', 'success');
                } catch (err) {
                  console.error('Stitch error:', err);
                  addToast('Error al generar árbol', 'error');
                }
                setStitchStatus('configured');
              }}
              className="px-2 py-1 text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 rounded"
            >
              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              Generar
            </button>
            <button
              onClick={async () => {
                setStitchStatus('idle');
                setStitchStatus('checking');
                try {
                  const result = await analyzeTree({
                    type: 'family',
                    memberCount: personsInTree.length,
                    data: personsInTree.map(p => ({
                      id: p.id,
                      name: `${p.firstName} ${p.lastName}`,
                      generation: p.generation
                    }))
                  });
                  setStitchResult(result);
                  addToast('Análisis completado', 'success');
                } catch (err) {
                  console.error('Stitch error:', err);
                  addToast('Error en análisis', 'error');
                }
                setStitchStatus('configured');
              }}
              className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 rounded"
            >
              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              Analizar
            </button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <TreeToolbar
        persons={personsInTree}
        onSearchChange={setSearchTerm}
        onGenerationFilter={setSelectedGeneration}
        onAddFamily={() => navigate('/')}
        onLayoutToggle={setCurrentLayout}
        currentLayout={currentLayout}
      />

      {/* Tree visualization - flexed to fill remaining space */}
      <div className="flex-1 overflow-hidden">
        {personsInTree.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center">
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {searchTerm || selectedGeneration !== null
                  ? 'No hay miembros que coincidan con los filtros.'
                  : 'No hay árbol disponible'}
              </p>
              {(searchTerm || selectedGeneration !== null) && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedGeneration(null);
                  }}
                  variant="primary"
                  size="sm"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ReactFlowTree
            persons={personsInTree}
            relationships={filteredRelationships}
            photos={personPhotoUrls}
            treeCenterId={treeCenterId}
            onNodeClick={(personId) => navigate(`/person/${personId}`)}
            layout={currentLayout}
            className="rounded-none"
          />
        )}
      </div>
    </div>
  );
}
