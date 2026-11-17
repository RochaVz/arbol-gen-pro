import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ReactFlowTree } from '../shared/components/ReactFlowTree';
import { Button } from '../shared/components/ui';
import { Plus } from 'lucide-react';

export function TreePage() {
  const navigate = useNavigate();
  const { persons, relationships, personPhotoUrls, activeTreeId } = useAppStore();

  const personsInTree = activeTreeId
    ? persons.filter((p) => p.treeId === activeTreeId && !p.deletedAt)
    : persons.filter((p) => !p.deletedAt);

  const relationshipsInTree = activeTreeId
    ? relationships.filter((r) => r.treeId === activeTreeId && !r.deletedAt)
    : relationships.filter((r) => !r.deletedAt);

  const treeCenterId = personsInTree[0]?.id;

  if (personsInTree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <p className="text-neutral-600 text-lg">No tienes árboles creados aún.</p>
        <Button onClick={() => navigate('/')} variant="primary" icon={<Plus className="w-5 h-5" />}>
          Crear primer árbol
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Tu Árbol Genealógico</h2>
        <p className="text-neutral-600">
          Visualización interactiva · {personsInTree.length} miembros
        </p>
      </div>
      <ReactFlowTree
        persons={personsInTree}
        relationships={relationshipsInTree}
        photos={personPhotoUrls}
        treeCenterId={treeCenterId}
        onNodeClick={(personId) => navigate(`/person/${personId}`)}
      />
    </div>
  );
}
