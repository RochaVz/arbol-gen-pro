import { useNavigate } from 'react-router-dom';
import { PremiumHome } from '../shared/components/PremiumHome';
import { useAppStore } from '../store';
import { treeRepository, personRepository, uuidv7 } from '../core/db';
import { useToast } from '../shared/hooks/useToast';

export function HomePage() {
  const navigate = useNavigate();
  const { trees, persons, events, photos, activeTreeId, load, setActiveTreeId } = useAppStore();
  const { addToast } = useToast();

  const personsInTree = activeTreeId
    ? persons.filter((p) => p.treeId === activeTreeId && !p.deletedAt)
    : [];

  const handleCreateTree = async (treeName: string, myName: string, myLastName: string) => {
    try {
      const t = await treeRepository.create({
        id: uuidv7(), name: treeName, ownerId: 'local-user',
      } as any);
      await personRepository.create({
        id: uuidv7(), treeId: t.entity.id,
        firstName: myName, lastName: myLastName || undefined, lifeStatus: 'alive',
      } as any);
      setActiveTreeId(t.entity.id);
      await load();
      navigate('/tree');
      addToast('Árbol creado. Comienza a agregar familiares.', 'success');
    } catch (e) {
      addToast(`Error: ${e}`, 'error');
    }
  };

  const handleSelectTree = (treeId: string) => {
    setActiveTreeId(treeId);
  };

  const handleOpenTree = (treeId: string) => {
    setActiveTreeId(treeId);
    navigate('/tree');
  };

  const treeSummaries = trees
    .filter((tree) => !tree.deletedAt)
    .map((tree) => ({
      id: tree.id,
      name: tree.name,
      description: tree.description,
      isActive: tree.id === activeTreeId,
      memberCount: persons.filter((person) =>
        person.treeId === tree.id && !person.deletedAt
      ).length,
    }));

  const generations = new Set(
    personsInTree
      .map((person) => person.generation)
      .filter((generation): generation is number => typeof generation === 'number')
  ).size;

  return (
    <PremiumHome
      onAddFamily={() => navigate('/tree')}
      onViewTree={() => navigate('/tree')}
      onCreateTree={handleCreateTree}
      onSelectTree={handleSelectTree}
      onOpenTree={handleOpenTree}
      onOpenPhotos={() => navigate('/photos')}
      onOpenEvents={() => navigate('/family')}
      trees={treeSummaries}
      stats={{
        totalFamilyMembers: personsInTree.length,
        generations: generations || (personsInTree.length > 0 ? 1 : 0),
        photos: photos.filter((ph) => !ph.deletedAt && (!activeTreeId || personsInTree.some((person) => person.id === ph.personId))).length,
        events: events.filter((e) => !e.deletedAt && (!activeTreeId || e.treeId === activeTreeId)).length,
      }}
    />
  );
}
