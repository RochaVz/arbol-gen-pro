import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { PersonProfileContainer } from '../features/person/PersonProfileContainer';

export function PersonPage() {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const { persons, relationships, events, photos, load } = useAppStore();

  if (!personId) {
    navigate('/tree');
    return null;
  }

  return (
    <PersonProfileContainer
      key={personId}
      personId={personId}
      persons={persons}
      relationships={relationships}
      events={events}
      photos={photos}
      onSelectPerson={(id) => navigate(`/person/${id}`)}
      onBack={() => navigate('/tree')}
      onRefresh={load}
    />
  );
}
