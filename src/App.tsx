import { useEffect, useState, lazy, Suspense, useMemo } from 'react';
import { partialDateToString } from './shared/utils/date';
import {
  personRepository,
  relationshipRepository,
  eventRepository,
  treeRepository,
  photoRepository,
  uuidv7,
} from './core/db';
import type { Person, Event, Tree, Photo } from './core/db';
import { useSyncStatus } from './shared/hooks/useSyncStatus';
import { supabase } from './core/supabase';
import { getPhotoBlobs } from './features/photo/services/photoStorage';
import { startRealtimeSync, stopRealtimeSync } from './core/sync/realtime';
import { createSampleFamilyTree } from './testing/seedTestData';
import { parentsOf, childrenOf, spousesOf } from './features/tree/utils/treeLayout';

import { PremiumLayout } from './shared/components/PremiumLayout';
const ReactFlowTree = lazy(() => import('./shared/components/ReactFlowTree').then(m => ({ default: m.ReactFlowTree })));
const PersonProfilePage = lazy(() => import('./features/person/PersonProfilePage').then(m => ({ default: m.PersonProfilePage })));
const PremiumHome = lazy(() => import('./shared/components/PremiumHome').then(m => ({ default: m.PremiumHome })));
import { ButtonV2 as Button, InputV2 as Input, Toast } from './shared/components/ui';
import { Modal } from './shared/components/ui/Modal';
import { Plus, Mail, Lock } from 'lucide-react';

type View = 'home' | 'tree' | 'person' | 'family' | 'photos' | 'settings' | 'help';
type ColorMode = 'light' | 'dark';

export default function App() {
  const sync = useSyncStatus();
  const [view, setView] = useState<View>('home');
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = uuidv7();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize dark mode
  useEffect(() => {
    const storedMode = localStorage.getItem('color-mode') as ColorMode | null;
    const systemMatch = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const initialMode = storedMode ?? systemMatch;
    if (initialMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // State management
  const [trees, setTrees] = useState<Tree[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [treeId, setTreeId] = useState('');
  const [treeCenterOverride, setTreeCenterOverride] = useState<string>('');
  const [personPhotoUrls, setPersonPhotoUrls] = useState<Record<string, string>>({});

  // Auth state
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Create tree wizard
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardTreeName, setWizardTreeName] = useState('Mi familia');
  const [wizardMyName, setWizardMyName] = useState('');
  const [wizardLastName, setWizardLastName] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Setup install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      // Install prompt available but not used in new UI
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Setup realtime sync
  useEffect(() => {
    startRealtimeSync();
    return () => stopRealtimeSync();
  }, []);

  // Setup auth listener
  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSessionEmail(data.session?.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (mounted) setSessionEmail(s?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(personPhotoUrls).forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const load = async () => {
    try {
      const t = await treeRepository.list();
      setTrees(t);
      if (!treeId && t.length) setTreeId(t[0].id);

      const personsList = await personRepository.list();
      setPersons(personsList);
      setRelationships(await relationshipRepository.list());
      setEvents(await eventRepository.list());

      const photoList = await photoRepository.list();
      setPhotos(photoList);

      // Clean old URLs
      Object.values(personPhotoUrls).forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });

      // Load photo URLs
      const urls: Record<string, string> = {};
      await Promise.all(
        personsList.map(async (p) => {
          const photo = photoList.find((ph) => ph.personId === p.id && !ph.deletedAt);
          if (!photo) return;
          try {
            const blobs = await getPhotoBlobs(photo.id);
            const thumb = blobs.find((b) => b.kind === 'thumbnail') ?? blobs[0];
            if (thumb?.blob) urls[p.id] = URL.createObjectURL(thumb.blob);
          } catch {}
        })
      );
      setPersonPhotoUrls(urls);

      await sync.refresh();
    } catch (error) {
      addToast(`Error al cargar datos: ${error}`, 'error');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // Derived tree center
  const treeCenterId = useMemo(() => {
    if (!treeId) return '';
    const list = persons.filter((p: any) => p.treeId === treeId && !p.deletedAt);
    if (list.length === 0) return '';
    if (treeCenterOverride && list.some((p: any) => p.id === treeCenterOverride)) return treeCenterOverride;
    return list[0].id;
  }, [treeId, persons, treeCenterOverride]);

  // Filter data by tree
  const inTree = (arr: { treeId?: string }[]) =>
    treeId ? arr.filter((x) => x.treeId === treeId) : arr;

  const personsT = inTree(persons) as Person[];
  const relationshipsT = inTree(relationships) as any[];
  const eventsT = inTree(events) as Event[];

  // Auth handlers
  const handleSignIn = async () => {
    if (!supabase) return;
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) {
        addToast(error.message, 'error');
      } else {
        addToast('Sesión iniciada', 'success');
        setAuthModalOpen(false);
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (error) {
      addToast(`Error: ${error}`, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!supabase) return;
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        addToast(error.message, 'error');
      } else {
        addToast('Cuenta creada. Revisa tu correo.', 'success');
        setAuthModalOpen(false);
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (error) {
      addToast(`Error: ${error}`, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      addToast('Sesión cerrada', 'success');
    } catch (error) {
      addToast(`Error: ${error}`, 'error');
    }
  };

  // Create tree
  const handleCreateTree = async () => {
    if (!wizardTreeName.trim()) {
      addToast('Pon un nombre al árbol', 'error');
      return;
    }
    if (!wizardMyName.trim()) {
      addToast('Pon tu nombre', 'error');
      return;
    }

    try {
      const t = await treeRepository.create({
        id: uuidv7(),
        name: wizardTreeName.trim(),
        ownerId: 'local-user',
      } as any);

      const me = await personRepository.create({
        id: uuidv7(),
        treeId: t.entity.id,
        firstName: wizardMyName.trim(),
        lastName: wizardLastName.trim() || undefined,
        lifeStatus: 'alive',
      } as any);

      setTreeId(t.entity.id);
      setTreeCenterOverride(me.entity.id);
      setWizardOpen(false);
      setView('tree');
      addToast('Árbol creado. Comienza a agregar familiares.', 'success');
      await load();
    } catch (error) {
      addToast(`Error: ${error}`, 'error');
    }
  };

  // Load sample test data (dev only)
  const handleLoadTestData = async () => {
    try {
      const { tree, persons, relationships } = createSampleFamilyTree();
      
      await treeRepository.create(tree as any);
      await Promise.all(persons.map(p => personRepository.create(p as any)));
      await Promise.all(relationships.map(r => relationshipRepository.create(r as any)));
      
      setTreeId(tree.id);
      setTreeCenterOverride(persons[0].id);
      setView('tree');
      addToast(`Datos de prueba cargados: ${persons.length} personas, ${relationships.length} relaciones`, 'success');
      await load();
    } catch (error) {
      addToast(`Error al cargar datos de prueba: ${error}`, 'error');
    }
  };

  // Render content based on view
  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <PremiumHome
            onAddFamily={() => setWizardOpen(true)}
            onViewTree={() => setView('tree')}
            onLoadTestData={handleLoadTestData}
            stats={{
              totalFamilyMembers: personsT.length,
              generations: Math.max(1, Math.ceil(personsT.length / 3)),
              photos: photos.length,
              events: eventsT.length,
            }}
          />
        );
      case 'tree':
        return trees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-6">No tienes árboles creados aún.</p>
            <Button onClick={() => setWizardOpen(true)} variant="primary">
              <Plus className="w-5 h-5" /> Crear primer árbol
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Tu Árbol Genealógico</h2>
              <p className="text-slate-600">Visualización interactiva de tu árbol genealógico con {personsT.length} miembros</p>
            </div>
            <ReactFlowTree
              persons={personsT}
              relationships={relationshipsT}
              photos={personPhotoUrls}
              treeCenterId={treeCenterId}
              onNodeClick={(personId) => {
                setSelectedPersonId(personId);
                setView('person');
              }}
            />
          </div>
        );
      case 'person': {
        const person = persons.find((p) => p.id === selectedPersonId);
        if (!person) return null;
        const rels = relationships.filter((r) => !r.deletedAt);
        const parentIds = parentsOf(person.id, rels);
        const childIds = childrenOf(person.id, rels);
        const partnerIds = spousesOf(person.id, rels);
        const parents = persons.filter((p) => parentIds.includes(p.id));
        const children = persons.filter((p) => childIds.includes(p.id));
        const partners = persons.filter((p) => partnerIds.includes(p.id));
        const personEvents = eventsT.filter((e: any) => e.personId === person.id || (Array.isArray(e.personIds) && e.personIds.includes(person.id)));
        const personPhotos = photos.filter((ph: any) => ph.personId === person.id && !ph.deletedAt);
        return (
          <PersonProfilePage
            personId={person.id}
            photoUrl={personPhotoUrls[person.id]}
            firstName={person.firstName}
            lastName={person.lastName}
            birthDate={person.birthDate ? partialDateToString(person.birthDate as any) : undefined}
            deathDate={person.deathDate ? partialDateToString(person.deathDate as any) : undefined}
            lifeStatus={person.lifeStatus === 'deceased' ? 'deceased' : 'living'}
            parents={parents}
            children={children}
            partners={partners}
            events={personEvents}
            gallery={personPhotos.map((ph: any) => ({ url: personPhotoUrls[ph.personId] }))}
            documents={[]}
            onSelectPerson={(id) => {
              setSelectedPersonId(id);
              setView('person');
            }}
            onBack={() => {
              setSelectedPersonId(null);
              setView('tree');
            }}
            onEdit={() => {}}
            onAddPhoto={() => {}}
            onAddParent={() => {}}
            onAddChild={() => {}}
            onAddPartner={() => {}}
            onAddEvent={() => {}}
            onAddDocument={() => {}}
          />
        );
      }
      case 'family':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Mi Familia</h2>
            <p className="text-slate-600">Lista de miembros del árbol actual</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personsT.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPersonId(p.id);
                    setView('person');
                  }}
                  className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {personPhotoUrls[p.id] ? (
                      <img src={personPhotoUrls[p.id]} alt={p.firstName} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        {p.firstName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{p.firstName} {p.lastName}</p>
                      <p className="text-sm text-slate-500">{p.lifeStatus === 'deceased' ? 'Fallecido' : 'Vivo'}</p>
                    </div>
                  </div>
                </div>
              ))}
              {personsT.length === 0 && <p className="text-slate-500">Sin miembros. Crea un árbol o carga datos de prueba.</p>}
            </div>
          </div>
        );
      case 'photos':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Fotografías</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(personPhotoUrls).map(([pid, url]) => (
                <div key={pid} className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={url} alt="foto" className="w-full h-full object-cover" />
                </div>
              ))}
              {Object.keys(personPhotoUrls).length === 0 && <p className="text-slate-500">Sin fotos.</p>}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Configuración</h2>
            <p className="text-slate-600">Próximamente: opciones de cuenta, sincronización y preferencias.</p>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Ayuda</h2>
            <p className="text-slate-600">Próximamente: preguntas frecuentes y guías de uso.</p>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-slate-600">Sección en desarrollo</p>
          </div>
        );
    }
  };

  return (
    <PremiumLayout
      title={
        view === 'home'
          ? 'Panel de Control'
          : view === 'tree'
            ? 'Árbol Genealógico'
            : 'Perfil de Familiar'
      }
      subtitle={
        view === 'home'
          ? 'Bienvenido a tu árbol genealógico'
          : 'Explora tu historia familiar'
      }
      currentView={view}
      onNavigate={(newView) => setView(newView as View)}
      userEmail={sessionEmail}
      onLogout={handleSignOut}
      headerActions={
        <div className="flex items-center gap-3">
          {!sessionEmail && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAuthModalOpen(true)}
            >
              <Mail className="w-4 h-4" /> Ingresar
            </Button>
          )}
          {view === 'home' && trees.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setWizardOpen(true)}
            >
              <Plus className="w-4 h-4" /> Nuevo Árbol
            </Button>
          )}
        </div>
      }
    >
       <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando...</div>}>
      {renderContent()}
       </Suspense>

      {/* Auth Modal */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Ingresar"
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
          />
          <Input
            label="Contraseña"
            type="password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
          />
          <div className="flex gap-2">
            <Button
              fullWidth
              variant="primary"
              onClick={handleSignIn}
              isLoading={authLoading}
            >
              Ingresar
            </Button>
            <Button
              fullWidth
              variant="secondary"
              onClick={handleSignUp}
              isLoading={authLoading}
            >
              Registrarse
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Tree Wizard */}
      <Modal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title="Crear un nuevo árbol genealógico"
      >
        <div className="space-y-4">
          <Input
            label="Nombre del árbol"
            value={wizardTreeName}
            onChange={(e) => setWizardTreeName(e.target.value)}
          />
          <Input
            label="Tu nombre"
            value={wizardMyName}
            onChange={(e) => setWizardMyName(e.target.value)}
          />
          <Input
            label="Tu apellido (opcional)"
            value={wizardLastName}
            onChange={(e) => setWizardLastName(e.target.value)}
          />
          <Button
            fullWidth
            variant="primary"
            onClick={handleCreateTree}
          >
            Crear Árbol
          </Button>
        </div>
      </Modal>

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-in fade-in slide-in-from-bottom-20 duration-300"
          >
            <Toast
              variant={toast.type}
              onClose={() => removeToast(toast.id)}
            >
              {toast.message}
            </Toast>
          </div>
        ))}
      </div>
    </PremiumLayout>
  );
}
