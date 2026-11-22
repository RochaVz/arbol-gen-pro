import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ReactFlowTree } from '../shared/components/ReactFlowTree';
import { AppearanceControls } from '../features/family-tree/components/designer/appearanceControls';
import { TreeTemplateGallery, treeStyles } from '../features/family-tree/components/templates/treeTemplateGallery';
import { Button } from '../shared/components/ui';
import { Plus } from 'lucide-react';
import * as React from 'react';

// Error Boundary component to catch and display errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    console.error('Error en TreePage:', error);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-center bg-red-100 dark:bg-red-900 text-red-800 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">⚠️ Error en la Galería</h3>
        <p className="mb-4">Ocurrió un error al renderizar el árbol genealógico.</p>
        <button onClick={() => window.location.reload()} className="btn-reload mt-4">
          Recargar Página
        </button>
      </div>;
    }
    return this.props.children;
  }
}

export function TreePage() {
  const navigate = useNavigate();
  const { persons, relationships, personPhotoUrls, activeTreeId } = useAppStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedGeneration, setSelectedGeneration] = React.useState<number | null>(null);
  const [styleId, setStyleId] = React.useState<string>('');

               // Transition state for style changes (prevents tree "disappearance")
               // $FlowFixMe
 // @ts-expect-error TS6133 - setIsTransitioning used in style transition handler
 const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Map style orientation to ReactFlow layout
  const layout = React.useMemo(() => {
    try {
      if (isTransitioning) return 'horizontal'; // Keep current layout during transition
                  if (!styleId) return 'horizontal';
      const style = treeStyles.find((s) => s.id === styleId);
      if (!style) {
        console.warn('[TreeStyle] Style not found, using default horizontal:', styleId);
        return 'horizontal';
      }
      return style?.orientation === 'radial' ? 'horizontal' : style?.orientation || 'horizontal';
    } catch (error) {
      console.error('[TreeStyle] Error calculating layout:', error);
      return 'horizontal';
    }
  }, [styleId, isTransitioning, treeStyles]); // Keep current layout during style transitions

  // Debug: log when styleId changes
  React.useEffect(() => {
    try {
      console.log('[TreePage] styleId changed:', styleId, 'layout:', layout);
    } catch (error) {
      console.error('[TreePage] Error en useEffect styleId:', error);
    }
  }, [styleId, layout]);

  const personsInTree = React.useMemo(() => {
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
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          No tienes árboles creados aún.
        </p>
        <Button onClick={() => navigate('/')} variant="primary" icon={<Plus className="w-5 h-5" />}>
          Crear primer árbol
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full gap-0 bg-slate-100">
      {/* Header with info */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Tu Árbol Genealógico
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          {personsInTree.length} de {persons.filter((p) => !p.deletedAt).length} miembros
          {selectedGeneration !== null && ` · Gen ${selectedGeneration}`}
        </p>
      </div>

      {/* Appearance and style selection */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm">
        <div className="flex items-center gap-2">
          <AppearanceControls
            showPhotos={true}
            showDates={true}
            showRelationships={true}
            showLabels={true}
            showGrid={false}
            showConnections={true}
            onShowPhotosChange={() => {}}
            onShowDatesChange={() => {}}
            onShowRelationshipsChange={() => {}}
            onShowLabelsChange={() => {}}
            onShowGridChange={() => {}}
            onShowConnectionsChange={() => {}}
          />
          {/* Style gallery - onStyleSelect handled via store update */}
          <TreeTemplateGallery
            currentStyle={styleId}
            onStyleSelect={() => setStyleId('classic')}
          />
        </div>
      </div>

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
            layout={layout}
            className="rounded-none"
          />
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
}