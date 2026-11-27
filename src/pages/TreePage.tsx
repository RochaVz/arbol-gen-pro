import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ReactFlowTree } from '../shared/components/ReactFlowTree';
import { AppearanceControls } from '../features/family-tree/components/designer/appearanceControls';
import { TreeTemplateGallery, treeStyles } from '../features/family-tree/components/templates/treeTemplateGallery';
import { Button } from '../shared/components/ui';
import { useToast } from '../shared/hooks/useToast';
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
  const { addToast } = useToast();
  const { persons, relationships, personPhotoUrls, activeTreeId } = useAppStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedGeneration, setSelectedGeneration] = React.useState<number | null>(null);
  const [draftStyleId, setDraftStyleId] = React.useState('classic');
  const [appliedStyleId, setAppliedStyleId] = React.useState('classic');
  const [showPhotos, setShowPhotos] = React.useState(true);
  const [showDates, setShowDates] = React.useState(true);
  const [showRelationships, setShowRelationships] = React.useState(true);
  const [showLabels, setShowLabels] = React.useState(true);
  const [showGrid, setShowGrid] = React.useState(false);
  const [showConnections, setShowConnections] = React.useState(true);

  React.useEffect(() => {
    if (!activeTreeId) {
      setDraftStyleId('classic');
      setAppliedStyleId('classic');
      setShowPhotos(true);
      setShowDates(true);
      setShowRelationships(true);
      setShowLabels(true);
      setShowGrid(false);
      setShowConnections(true);
      return;
    }
    try {
      const saved = localStorage.getItem(`tree-style:${activeTreeId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.styleId === 'string') {
          setDraftStyleId(parsed.styleId);
          setAppliedStyleId(parsed.styleId);
        }
        setShowPhotos(parsed.showPhotos !== false);
        setShowDates(parsed.showDates !== false);
        setShowRelationships(parsed.showRelationships !== false);
        setShowLabels(parsed.showLabels !== false);
        setShowGrid(parsed.showGrid === true);
        setShowConnections(parsed.showConnections !== false);
      } else {
        setDraftStyleId('classic');
        setAppliedStyleId('classic');
        setShowPhotos(true);
        setShowDates(true);
        setShowRelationships(true);
        setShowLabels(true);
        setShowGrid(false);
        setShowConnections(true);
      }
    } catch (error) {
      console.error('[TreePage] No se pudo cargar el estilo guardado:', error);
    }
  }, [activeTreeId]);

  const appliedStyle = React.useMemo(
    () => treeStyles.find((style) => style.id === appliedStyleId) ?? treeStyles[0],
    [appliedStyleId]
  );
  const handleApplyStyle = () => {
    if (!activeTreeId) {
      addToast('Selecciona un árbol activo antes de aplicar el estilo.', 'error');
      return;
    }
    setAppliedStyleId(draftStyleId);
    localStorage.setItem(`tree-style:${activeTreeId}`, JSON.stringify({
      styleId: draftStyleId,
      showPhotos,
      showDates,
      showRelationships,
      showLabels,
      showGrid,
      showConnections,
    }));
    addToast('Estilo aplicado al árbol.', 'success');
  };

  const handleRestoreStyle = () => {
    setDraftStyleId('classic');
    setAppliedStyleId('classic');
    setShowPhotos(true);
    setShowDates(true);
    setShowRelationships(true);
    setShowLabels(true);
    setShowGrid(false);
    setShowConnections(true);
    if (activeTreeId) {
      localStorage.setItem(`tree-style:${activeTreeId}`, JSON.stringify({
        styleId: 'classic',
        showPhotos: true,
        showDates: true,
        showRelationships: true,
        showLabels: true,
        showGrid: false,
        showConnections: true,
      }));
    }
    addToast('Estilo restaurado.', 'success');
  };

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
      <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[520px] gap-0 bg-slate-100">
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
            showPhotos={showPhotos}
            showDates={showDates}
            showRelationships={showRelationships}
            showLabels={showLabels}
            showGrid={showGrid}
            showConnections={showConnections}
            onShowPhotosChange={setShowPhotos}
            onShowDatesChange={setShowDates}
            onShowRelationshipsChange={setShowRelationships}
            onShowLabelsChange={setShowLabels}
            onShowGridChange={setShowGrid}
            onShowConnectionsChange={setShowConnections}
          />
          <TreeTemplateGallery
            currentStyle={draftStyleId}
            onStyleSelect={setDraftStyleId}
          />
          <div className="ml-auto flex shrink-0 flex-col gap-2">
            <Button
              onClick={handleApplyStyle}
              variant="primary"
              disabled={!activeTreeId}
            >
              Aplicar estilo
            </Button>
            <Button onClick={handleRestoreStyle} variant="secondary">
              Restaurar
            </Button>
          </div>
        </div>
      </div>

      {/* Tree visualization - flexed to fill remaining space */}
      <div className="flex-1 min-h-[420px] overflow-hidden">
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
                  size="lg"
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
            layout={appliedStyle.orientation === 'radial' ? 'horizontal' : appliedStyle.orientation}
            visualStyle={appliedStyle}
            showPhotos={showPhotos}
            showDates={showDates}
            showLabels={showLabels}
            showRelationships={showRelationships}
            showGrid={showGrid}
            showConnections={showConnections}
            className="rounded-none"
          />
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
}