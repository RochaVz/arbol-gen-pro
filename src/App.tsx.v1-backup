import { useEffect, useState } from 'react';
import {
  personRepository,
  relationshipRepository,
  eventRepository,
  treeRepository,
  photoRepository,
  uuidv7,
} from './core/db';
import type { Person, Relationship, Event, Tree, SyncOperation, Photo } from './core/db';
import { useSyncStatus } from './shared/hooks/useSyncStatus';
import { supabase } from './core/supabase';
import { getPhotoBlobs } from './features/photo/services/photoStorage';
import { startRealtimeSync, stopRealtimeSync } from './core/sync/realtime';
import { Button } from './shared/components/ui/Button';
import { Modal } from './shared/components/ui/Modal';
import { TreeWorkspace } from './features/tree/TreeWorkspace';
import { Home } from './features/home/Home';
import { EmotionalTree } from './features/tree/components/EmotionalTree';
import { PersonProfilePage } from './features/person/PersonProfilePage';

// FASE 4: Componentes nuevos del Design System - Integración progresiva
import { Toast, TabNav, EmptyState } from './shared/components';
import type { ToastProps } from './shared/components';

type View = 'home' | 'tree' | 'person';
type ColorMode = 'light' | 'dark';

export default function App() {
  const sync = useSyncStatus();
  const [view, setView] = useState<View>('home');
  const [colorMode, setColorMode] = useState<ColorMode>('light');

  // FASE 4: Toast notifications state
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = uuidv7();
    setToasts((prev) => [...prev, { id, message, type, onDismiss: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize from localStorage or system preference
  useEffect(() => {
    const storedMode = localStorage.getItem('color-mode') as ColorMode | null;
    const systemMatch = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const initialMode = storedMode ?? systemMatch;
    setColorMode(initialMode);
    if (initialMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    localStorage.setItem('color-mode', newMode);
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  const [trees, setTrees] = useState<Tree[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [rels, setRels] = useState<Relationship[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  // conflicts state removed (unused in this UI pass)
  const [treeId, setTreeId] = useState('');
  const [treeCenterId, setTreeCenterId] = useState<string>('');
  const [treeDepth] = useState(3);
  const [personPhotoUrls, setPersonPhotoUrls] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [conflictOps, setConflictOps] = useState<SyncOperation[] | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardTreeName, setWizardTreeName] = useState('Mi familia');
  const [wizardMyName, setWizardMyName] = useState('');
  const [wizardLastName, setWizardLastName] = useState('');
  const [quickAdd, setQuickAdd] = useState<{ personId: string; kind: 'father' | 'mother' | 'spouse' | 'child' } | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickLast, setQuickLast] = useState('');
  const [quickLife, setQuickLife] = useState<'alive' | 'deceased' | 'unknown'>('alive');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMsg, setAuthMsg] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const installApp = async () => {
    if (!installPrompt) return;
    try { await installPrompt.prompt(); setInstallPrompt(null); } catch {}
  };
  useEffect(() => { startRealtimeSync(); return () => stopRealtimeSync(); }, []);
  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => { if (mounted) setSessionEmail(data.session?.user?.email ?? null); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSessionEmail(s?.user?.email ?? null); });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);
  const doSignIn = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    setAuthMsg(error ? error.message : 'Sesión iniciada');
  };
  const doSignUp = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { emailRedirectTo: `${window.location.origin}/` } });
    setAuthMsg(error ? error.message : 'Cuenta creada; revisa tu correo');
  };
  const doSignOut = async () => { if (!supabase) return; await supabase.auth.signOut(); setAuthMsg('Sesión cerrada'); };
  const load = async () => {
    const t = await treeRepository.list();
    setTrees(t);
    if (!treeId && t.length) setTreeId(t[0].id);
    const personsList = await personRepository.list();
    setPersons(personsList);
    setRels(await relationshipRepository.list());
    setEvents(await eventRepository.list());
    const photoList = await photoRepository.list();
    setPhotos(photoList);
    setPersonPhotoUrls((prev) => {
      Object.values(prev).forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
      return {};
    });
    const urls: Record<string, string> = {};
    await Promise.all(personsList.map(async (p) => {
      const photo = photoList.find((ph) => ph.personId === p.id && !ph.deletedAt);
      if (!photo) return;
      try {
        const blobs = await getPhotoBlobs(photo.id);
        const thumb = blobs.find((b) => b.kind === 'thumbnail') ?? blobs[0];
        if (thumb?.blob) urls[p.id] = URL.createObjectURL(thumb.blob);
      } catch {}
    }));
    setPersonPhotoUrls(urls);
    await sync.refresh();
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!treeId) { setTreeCenterId(''); return; }
    const list = persons.filter((p: any) => p.treeId === treeId && !p.deletedAt);
    if (list.length === 0) { setTreeCenterId(''); return; }
    if (!treeCenterId || !list.some((p: any) => p.id === treeCenterId)) setTreeCenterId(list[0].id);
  }, [treeId, persons, treeCenterId]);
  const inTree = (arr: { treeId?: string }[]) => treeId ? arr.filter((x) => x.treeId === treeId) : arr;
  const personsT = inTree(persons) as Person[];
  const relsT = inTree(rels) as Relationship[];
  const eventsT = inTree(events) as Event[];
  const startMyTree = async () => {
    if (!wizardTreeName.trim()) { setMsg('Pon un nombre al árbol'); return; }
    if (!wizardMyName.trim()) { setMsg('Pon tu nombre'); return; }
    try {
      const t = await treeRepository.create({ id: uuidv7(), name: wizardTreeName.trim(), ownerId: 'local-user' } as any);
      const me = await personRepository.create({ id: uuidv7(), treeId: t.entity.id, firstName: wizardMyName.trim(), lastName: wizardLastName.trim() || undefined, lifeStatus: 'alive' } as any);
      setTreeId(t.entity.id); setTreeCenterId(me.entity.id); setView('tree'); setWizardOpen(false);
      setMsg('Árbol creado. Ahora puedes agregar familiares.'); await load();
    } catch (e) { setMsg(String((e as Error)?.message ?? e)); }
  };
  const openQuickAdd = (personId: string, kind: 'father' | 'mother' | 'spouse' | 'child') => {
    setQuickAdd({ personId, kind }); setQuickName(''); setQuickLast(''); setQuickLife('alive');
  };
  const closeQuickAdd = () => setQuickAdd(null);
  const quickTitle = (kind: string) => {
    if (kind === 'father') return 'Agregar padre';
    if (kind === 'mother') return 'Agregar madre';
    if (kind === 'spouse') return 'Agregar pareja';
    return 'Agregar hijo/a';
  };
  const submitQuickAdd = async () => {
    if (!quickAdd) return;
    if (!treeId) { setMsg('Selecciona un árbol'); return; }
    if (!quickName.trim()) { setMsg('Nombre requerido'); return; }
    try {
      const sex = quickAdd.kind === 'father' ? 'male' : quickAdd.kind === 'mother' ? 'female' : undefined;
      const newPerson = await personRepository.create({
        id: uuidv7(), treeId, firstName: quickName.trim(),
        lastName: quickLast.trim() || undefined, lifeStatus: quickLife, sex,
      } as any);
      const edges = relsT.map((r) => ({ from: r.person1Id ?? r.personId ?? '', to: r.person2Id ?? r.relativeId ?? '' }));
      let type = 'otro'; let from = quickAdd.personId; let to = newPerson.entity.id;
      if (quickAdd.kind === 'father' || quickAdd.kind === 'mother') {
        type = quickAdd.kind === 'father' ? 'padre' : 'madre';
        from = newPerson.entity.id; to = quickAdd.personId;
      } else if (quickAdd.kind === 'child') {
        type = 'hijo'; from = quickAdd.personId; to = newPerson.entity.id;
      } else {
        type = 'pareja'; from = quickAdd.personId; to = newPerson.entity.id;
      }
      await relationshipRepository.create({ id: uuidv7(), treeId, type, person1Id: from, person2Id: to } as any, edges);
      setMsg('Familiar agregado'); setQuickAdd(null); await load();
    } catch (e) { setMsg(String((e as Error)?.message ?? e)); }
  };
  const syncNow = async () => {
    try {
      const r = await sync.syncNow();
      addToast(r.message, 'success');
      await load();
    } catch (e) {
      addToast(String((e as Error)?.message ?? e), 'error');
    }
  };
  // loadConflicts removed (unused in this UI pass)
  const recentActivity = personsT.slice(0, 5).map((p) => ({
    id: p.id, personName: p.firstName + ' ' + (p.lastName ?? ''),
    action: 'agregó' as const, target: 'nueva persona', when: 'hace poco',
  }));

  const memories = photos.slice(0, 6).map((ph) => ({
    id: ph.id, title: ph.description || 'Fotografía familiar', description: ph.description,
    photoUrl: ph.url, date: ph.capturedAt ? new Date(ph.capturedAt).toLocaleDateString('es-ES') : undefined,
    type: 'photo' as const,
  }));

  const selectedPerson = selectedPersonId ? persons.find((p) => p.id === selectedPersonId) : undefined;

  const personParents = selectedPerson ? persons.filter((p) => relsT.some((r) => {
    const from = r.person1Id ?? r.personId ?? '';
    const to = r.person2Id ?? r.relativeId ?? '';
    return (from === p.id && to === selectedPerson.id && (r.type?.toLowerCase().includes('padre') || r.type?.toLowerCase().includes('madre') || r.type?.toLowerCase().includes('parent'))) ||
      (from === selectedPerson.id && to === p.id && (r.type?.toLowerCase().includes('hijo') || r.type?.toLowerCase().includes('hija') || r.type?.toLowerCase().includes('child')));
  }) && p.id !== selectedPerson.id) : [];

  const personChildren = selectedPerson ? persons.filter((p) => relsT.some((r) => {
    const from = r.person1Id ?? r.personId ?? '';
    const to = r.person2Id ?? r.relativeId ?? '';
    return (from === selectedPerson.id && to === p.id && (r.type?.toLowerCase().includes('hijo') || r.type?.toLowerCase().includes('hija') || r.type?.toLowerCase().includes('child'))) ||
      (from === p.id && to === selectedPerson.id && (r.type?.toLowerCase().includes('padre') || r.type?.toLowerCase().includes('madre') || r.type?.toLowerCase().includes('parent')));
  }) && p.id !== selectedPerson.id) : [];

  const personPartners = selectedPerson ? persons.filter((p) => relsT.some((r) => {
    const from = r.person1Id ?? r.personId ?? '';
    const to = r.person2Id ?? r.relativeId ?? '';
    return (from === selectedPerson.id || to === selectedPerson.id) &&
      (from === p.id || to === p.id) &&
      (r.type?.toLowerCase().includes('pareja') || r.type?.toLowerCase().includes('esposo') || r.type?.toLowerCase().includes('esposa') || r.type?.toLowerCase().includes('spouse'));
  }) && p.id !== selectedPerson.id) : [];

  const personEvents = selectedPerson ? eventsT.filter((e) => e.personId === selectedPerson.id || e.personIds?.includes(selectedPerson.id)).map((e) => ({
    id: e.id, title: e.title || e.type || 'Evento', description: e.description,
    year: e.date?.year, date: e.date?.year ? String(e.date.year) : undefined,
    type: (e.type === 'birth' || e.type === 'death' ? 'event' : 'memory') as 'event' | 'memory' | 'document',
  })) : [];

  const personGallery = selectedPerson ? photos.filter((ph) => ph.personId === selectedPerson.id).map((ph) => ({
    id: ph.id, url: ph.url || '', title: ph.description,
    date: ph.capturedAt ? new Date(ph.capturedAt).toLocaleDateString('es-ES') : undefined,
    description: ph.description,
  })) : [];

  const personDocuments = selectedPerson ? photos.filter((ph) => ph.personId === selectedPerson.id && (ph.kind === 'original' || ph.kind === 'optimized')).map((ph) => ({
    id: ph.id, title: ph.description || 'Documento familiar', type: 'documento' as const,
    date: ph.capturedAt ? new Date(ph.capturedAt).toLocaleDateString('es-ES') : undefined,
    url: ph.url,
  })) : [];
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 text-neutral-900 overflow-x-hidden">
      <header className="sticky top-0 z-[100] bg-white shadow-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-700 font-serif-titles">🌳 Árbol Gen Pro</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {installPrompt && <Button size="sm" variant="ghost" onClick={installApp}>Instalar</Button>}
            {supabase && !sessionEmail && (
              <div className="flex items-center gap-2.5 p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                <input placeholder="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="px-3 py-2 text-base border border-neutral-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" style={{ width: 150 }} />
                <input type="password" placeholder="contraseña" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="px-3 py-2 text-base border border-neutral-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" style={{ width: 120 }} />
                <Button size="sm" onClick={doSignIn}>Entrar</Button>
                <Button size="sm" variant="secondary" onClick={doSignUp}>Registrarse</Button>
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleColorMode}
              className="flex items-center gap-2"
            >
              {colorMode === 'light' ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" />
                  <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" />
                  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
              {colorMode === 'light' ? '🌙' : '☀️'}
            </Button>
            {supabase && sessionEmail && <span className="text-sm font-semibold text-neutral-700">{sessionEmail}</span>}
            {supabase && sessionEmail && <Button size="sm" variant="secondary" onClick={doSignOut}>Salir</Button>}
            <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-2" style={{ background: sync.status === 'synced' ? 'var(--color-sync-synced)' : sync.status === 'pending' ? 'var(--color-sync-pending)' : sync.status === 'error' ? 'var(--color-sync-error)' : 'var(--color-sync-offline)' }}>
              {sync.status === 'synced' ? '✅ Sincronizado' : sync.status === 'pending' ? '⏳ Pendiente' : sync.status === 'syncing' ? '🔄 Sincronizando' : sync.status === 'conflict' ? '⚠️ Conflicto' : sync.status === 'error' ? '❌ Error' : '📴 Sin conexión'}
            </div>
            <Button size="sm" onClick={syncNow} disabled={sync.syncing}>Sincronizar</Button>
          </div>
        </div>
      </header>
      {/* FASE 4: TabNav horizontal navigation */}
      <nav className="bg-white border-b border-neutral-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <TabNav
            tabs={[
              { id: 'home', label: 'Inicio', icon: '🏠' },
              { id: 'tree', label: 'Árbol', icon: '🌳' },
              ...(selectedPersonId ? [{ id: 'person', label: 'Persona', icon: '👤' }] : []),
            ]}
            activeTab={view}
            onChange={(tabId) => setView(tabId as View)}
            className="flex-1 border-b-0"
          />
          {/* Right-side controls: Tree selector and actions */}
          <div className="flex items-center gap-3 ml-4">
            <select value={treeId} onChange={(e) => setTreeId(e.target.value)} className="px-4 py-2.5 text-sm font-medium border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm">
              <option value="">(seleccionar árbol)</option>
              {trees.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {trees.length === 0 && <Button size="sm" onClick={() => setWizardOpen(true)}>Crear árbol</Button>}
          </div>
        </div>
      </nav>
      {msg && (
        <div className="max-w-4xl mx-auto px-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-l-4 border-blue-500 rounded-lg p-4 flex items-center justify-between shadow-md">
            <span className="text-sm font-medium text-blue-900">{msg}</span>
            <Button size="sm" variant="ghost" onClick={() => setMsg(null)}>✕</Button>
          </div>
        </div>
      )}
      {authMsg && (
        <div className="max-w-4xl mx-auto px-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-l-4 border-orange-500 rounded-lg p-4 flex items-center justify-between shadow-md">
            <span className="text-sm font-medium text-orange-900">{authMsg}</span>
            <Button size="sm" variant="ghost" onClick={() => setAuthMsg(null)}>✕</Button>
          </div>
        </div>
      )}
      <main className="flex min-h-[calc(100vh-60px)]">
        {/* Navigation lateral - visible en desktop */}
          <nav className="w-16 sm:w-20 bg-surface/50 border-r border-border/20 flex flex-col items-center py-4 sm:py-6">
            <div className="flex-1 text-center">
              <h2 className="text-sm font-medium text-ink mb-4 font-serif-titles">
                Menú
              </h2>
            </div>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView('home')}
                className="flex items-center justify-center gap-2 rounded-lg hover:bg-surface/30 transition-colors"
                aria-label="Inicio"
              >
                🏠
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView('tree')}
                className="flex items-center justify-center gap-2 rounded-lg hover:bg-surface/30 transition-colors"
                aria-label="Árbol"
              >
                🌳
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView('person')}
                className="flex items-center justify-center gap-2 rounded-lg hover:bg-surface/30 transition-colors"
                aria-label="Perfil"
              >
                👤
              </Button>
            </div>
          </nav>

          {/* Contenido principal - vistas diferenciadas */}
        {view === 'home' && (
          <main className="flex-1 flex flex-col bg-gradient-to-br from-white via-neutral-50 to-white">
            {trees.length === 0 ? (
              <EmptyState
                icon="🌳"
                title="Comienza tu árbol genealógico"
                description="Crea tu primer árbol familiar y conecta con tu historia."
                action={
                  <Button onClick={() => setWizardOpen(true)} size="lg">
                    Crear árbol familiar
                  </Button>
                }
              />
            ) : (
              <Home
                treeName={trees.find((t) => t.id === treeId)?.name ?? 'Mi familia'}
                treeSubtitle="Tu historia familiar en un solo lugar"
                treePhotoUrl={undefined}
                familyMembers={personsT}
                recentActivity={recentActivity}
                memories={memories}
                onViewTree={() => setView('tree')}
                onAddMember={() => trees.length === 0 ? setWizardOpen(true) : (treeCenterId ? openQuickAdd(treeCenterId, 'child') : setWizardOpen(true))}
                onViewMemory={() => {}}
              />
            )}
          </main>
        )}
        {view === 'tree' && (
          <main className="flex-1 bg-gradient-to-br from-white via-neutral-50 to-white">
            <TreeWorkspace>
              <EmotionalTree
                persons={personsT}
                relationships={relsT}
                centerId={treeCenterId}
                depth={treeDepth}
                onSelectPerson={(id) => { setSelectedPersonId(id); setView('person'); }}
                photoUrls={personPhotoUrls}
                onAddParent={(id) => openQuickAdd(id, 'father')}
                onAddChild={(id) => openQuickAdd(id, 'child')}
                onAddPartner={(id) => openQuickAdd(id, 'spouse')}
              />
            </TreeWorkspace>
          </main>
        )}
        {view === 'person' && selectedPerson && (
          <main className="flex-1 bg-gradient-to-br from-white via-neutral-50 to-white">
            <PersonProfilePage
              personId={selectedPerson.id}
              photoUrl={personPhotoUrls[selectedPerson.id]}
              parents={personParents}
              children={personChildren}
              partners={personPartners}
              events={personEvents}
              gallery={personGallery}
              documents={personDocuments}
              onEdit={() => {}}
              onAddPhoto={() => {}}
              onAddParent={() => openQuickAdd(selectedPerson.id, 'father')}
              onAddChild={() => openQuickAdd(selectedPerson.id, 'child')}
              onAddPartner={() => openQuickAdd(selectedPerson.id, 'spouse')}
              onAddEvent={() => {}}
              onAddDocument={() => {}}
              onSelectPerson={(id) => { setSelectedPersonId(id); setView('person'); }}
              onBack={() => setView('tree')}
            />
          </main>
        )}
      </main>
      <Modal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} title="Crear tu árbol familiar">
        <div className="space-y-5">
          <p className="text-base text-neutral-700 font-serif-content leading-relaxed">Responde estas dos preguntas y listo.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Nombre del árbol</label>
              <input value={wizardTreeName} onChange={(e) => setWizardTreeName(e.target.value)} placeholder="Mi familia" className="w-full px-4 py-3 text-base border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Tu nombre</label>
              <input value={wizardMyName} onChange={(e) => setWizardMyName(e.target.value)} placeholder="Nombre" className="w-full px-4 py-3 text-base border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Tu apellido (opcional)</label>
              <input value={wizardLastName} onChange={(e) => setWizardLastName(e.target.value)} placeholder="Apellido" className="w-full px-4 py-3 text-base border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setWizardOpen(false)}>Cancelar</Button>
            <Button onClick={startMyTree}>Crear árbol</Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={!!quickAdd} onClose={closeQuickAdd} title={quickAdd ? quickTitle(quickAdd.kind) : ''}>
        <div className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Nombre</label>
              <input value={quickName} onChange={(e) => setQuickName(e.target.value)} placeholder="Nombre" className="w-full px-4 py-3 text-base border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Apellido (opcional)</label>
              <input value={quickLast} onChange={(e) => setQuickLast(e.target.value)} placeholder="Apellido" className="w-full px-4 py-3 text-base border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Estado</label>
              <select value={quickLife} onChange={(e) => setQuickLife(e.target.value as 'alive' | 'deceased' | 'unknown')} className="w-full px-4 py-3 text-base border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition">
              <option value="alive">Vivo</option>
              <option value="deceased">Fallecido</option>
              <option value="unknown">Desconocido</option>
            </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={closeQuickAdd}>Cancelar</Button>
            <Button onClick={submitQuickAdd}>Guardar</Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={!!conflictOps} onClose={() => setConflictOps(null)} title="Operaciones en conflicto">
        <pre className="text-xs text-neutral-900 bg-neutral-100 p-4 rounded-lg overflow-auto max-h-60 border border-neutral-200">
          {JSON.stringify(conflictOps, null, 2)}
        </pre>
      </Modal>
      {/* FASE 4: Toast notifications container */}
      <div className="fixed bottom-6 right-6 z-[1000] space-y-3 max-w-md">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
}