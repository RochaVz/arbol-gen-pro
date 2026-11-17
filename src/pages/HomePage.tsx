import { useNavigate } from 'react-router-dom';
import { PremiumHome } from '../shared/components/PremiumHome';
import { useAppStore } from '../store';
import { treeRepository, personRepository, uuidv7 } from '../core/db';
import { useToast } from '../shared/hooks/useToast';

export function HomePage() {
  const navigate = useNavigate();
  const { persons, events, photos, activeTreeId, load } = useAppStore();
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
      await load();
      navigate('/tree');
      addToast('Árbol creado. Comienza a agregar familiares.', 'success');
    } catch (e) {
      addToast(`Error: ${e}`, 'error');
    }
  };

  return (
    <PremiumHome
      onAddFamily={() => navigate('/tree')}
      onViewTree={() => navigate('/tree')}
      onCreateTree={handleCreateTree}
      stats={{
        totalFamilyMembers: personsInTree.length,
        generations: Math.max(1, Math.ceil(personsInTree.length / 3)),
        photos: photos.filter((ph) => !ph.deletedAt).length,
        events: events.filter((e) => !e.deletedAt && (!activeTreeId || e.treeId === activeTreeId)).length,
      }}
    />
  );
}
