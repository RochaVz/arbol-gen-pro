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
// listConflicts removed (unused in this UI pass)
import { startRealtimeSync, stopRealtimeSync } from './core/sync/realtime';
// recordAudit removed (unused in this UI pass) (placeholder)
// exportToJson, exportToGedcom, downloadText removed (unused in this UI pass)
import { Button } from './shared/components/ui/Button';
import { Modal } from './shared/components/ui/Modal';
import { Home } from './features/home/Home';
import { EmotionalTree } from './features/tree/components/EmotionalTree';
import { PersonProfilePage } from './features/person/PersonProfilePage';

type View = 'home' | 'tree' | 'person';

type ColorMode = 'light' | 'dark';

export default function App() {
  const sync = useSyncStatus();
  const [view, setView] = useState<View>('home');
  const [colorMode, setColorMode] = useState<ColorMode>('light');

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
  const syncNow = async () => { const r = await sync.syncNow(); setMsg(r.message); await load(); };
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
    <div className="min-h-screen bg-paper text-ink overflow-x-hidden">
      <header className="sticky top-0 z-[100] bg-surface/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold text-ink font-serif-titles">Árbol Gen Pro</h1>
          <div className="flex items-center gap-2 flex-wrap">
            {installPrompt && <Button size="sm" variant="ghost" onClick={installApp}>Instalar</Button>}
            {supabase && !sessionEmail && (
              <div className="flex items-center gap-2">
                <input placeholder="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface" style={{ width: 140 }} />
                <input type="password" placeholder="contraseña" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface" style={{ width: 100 }} />
                <Button size="sm" onClick={doSignIn}>Entrar</Button>
                <Button size="sm" variant="ghost" onClick={doSignUp}>Registrarse</Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleColorMode}
              className="flex items-center gap-2 px-3 py-1 rounded border border-border text-sm font-medium"
            >
              {colorMode === 'light' ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a1 1 0 011 1v8a1 1 0 11-2 0V4a1 1 0 011-1zm0 5a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1zm0 5a1 1 0 011 1v8a1 1 0 11-2 0v-4a1 1 0 011-1z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.5 13.5l-2.519-1.978a.5.5 0 0 0-.638-.208L15.53 9H14.7l-.562 1.078a.5.5 0 0 0 .143.689l1.324 1.105a.5.5 0 0 0 .568 0l1.324-1.105.562 1.078a.5.5 0 0 0 .389-.143l2.519 1.978a.5.5 0 0 0 .208-.638zM12 2a1 1 0 011 1v12a1 1 0 01-2 0V3a1 1 0 011-1zm-9.415 4.415a.5.5 0 0 1 .52.032l-.837 1.983a.5.5 0 0 1-.151.305l-.328-.778a.5.5 0 1 1-.498-.317l-.837-1.983a.5.5 0 0 1 .305-.52l.778-.328a.5.5 0 1 1 .317.498l.328.778zM2 12a1 1 0 011 1h12a1 1 0 010 2h-1a1 1 0 01-1-1H3a1 1 0 01-1-1zm10.546-6.437a1.5 1.5 0 0 0-.184-.677l-.46 1.55a1.5 1.5 0 0 0 .505.277l1.078.46a1.5 1.5 0 0 0 .782 0l.46-1.55a1.5 1.5 0 0 0-.677-.185z" />
                </svg>
              )}
              Modo {colorMode === 'light' ? 'Oscuro' : 'Claro'}
            </Button>
            {supabase && sessionEmail && <span className="text-sm text-wood">{sessionEmail}</span>}
            {supabase && sessionEmail && <Button size="sm" variant="ghost" onClick={doSignOut}>Salir</Button>}
            <span className="px-3 py-1.5 rounded-full text-xs font-bold text-surface" style={{ background: sync.status === 'synced' ? 'var(--color-sync-synced)' : sync.status === 'pending' ? 'var(--color-sync-pending)' : sync.status === 'error' ? 'var(--color-sync-error)' : 'var(--color-sync-offline)' }}>
              {sync.status === 'synced' ? '✅ Sincronizado' : sync.status === 'pending' ? '⏳ Pendiente' : sync.status === 'syncing' ? '🔄 Sincronizando' : sync.status === 'conflict' ? '⚠️ Conflicto' : sync.status === 'error' ? '❌ Error' : '📴 Sin conexión'}
            </span>
            <Button size="sm" variant="ghost" onClick={syncNow} disabled={sync.syncing}>Sincronizar</Button>
          </div>
        </div>
      </header>
      <nav className="max-w-4xl mx-auto px-4 py-3 flex gap-2 flex-wrap">
        <Button size="sm" variant={view === 'home' ? 'primary' : 'ghost'} onClick={() => setView('home')}>🏠 Inicio</Button>
        <Button size="sm" variant={view === 'tree' ? 'primary' : 'ghost'} onClick={() => setView('tree')}>🌳 Árbol</Button>
        {selectedPersonId && <Button size="sm" variant={view === 'person' ? 'primary' : 'ghost'} onClick={() => setView('person')}>👤 Persona</Button>}
        <div className="flex-1" />
        <select value={treeId} onChange={(e) => setTreeId(e.target.value)} className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface text-ink">
          <option value="">(seleccionar árbol)</option>
          {trees.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {trees.length === 0 && <Button size="sm" onClick={() => setWizardOpen(true)}>Crear árbol</Button>}
      </nav>
      {msg && (
        <div className="max-w-4xl mx-auto px-4 mb-4">
          <div className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-ink">{msg}</span>
            <Button size="sm" variant="ghost" onClick={() => setMsg(null)}>✕</Button>
          </div>
        </div>
      )}
      {authMsg && (
        <div className="max-w-4xl mx-auto px-4 mb-4">
          <div className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-ink">{authMsg}</span>
            <Button size="sm" variant="ghost" onClick={() => setAuthMsg(null)}>✕</Button>
          </div>
        </div>
      )}
      <main className="max-w-4xl mx-auto px-4 pb-8">
        {view === 'home' && (
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
        {view === 'tree' && (
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
        )}
        {view === 'person' && selectedPerson && (
          <PersonProfilePage
            personId={selectedPerson?.id}
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
        )}
      </main>
      <Modal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} title="Crear tu árbol familiar">
        <div className="space-y-4">
          <p className="text-sm text-wood font-serif-content">Responde estas dos preguntas y listo.</p>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-wood">Nombre del árbol</label>
            <input value={wizardTreeName} onChange={(e) => setWizardTreeName(e.target.value)} placeholder="Mi familia" className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-ink" />
            <label className="block text-sm font-medium text-wood">Tu nombre</label>
            <input value={wizardMyName} onChange={(e) => setWizardMyName(e.target.value)} placeholder="Nombre" className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-ink" />
            <label className="block text-sm font-medium text-wood">Tu apellido (opcional)</label>
            <input value={wizardLastName} onChange={(e) => setWizardLastName(e.target.value)} placeholder="Apellido" className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-ink" />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="ghost" onClick={() => setWizardOpen(false)}>Cancelar</Button>
            <Button onClick={startMyTree}>Crear árbol</Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={!!quickAdd} onClose={closeQuickAdd} title={quickAdd ? quickTitle(quickAdd.kind) : ''}>
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-wood">Nombre</label>
            <input value={quickName} onChange={(e) => setQuickName(e.target.value)} placeholder="Nombre" className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-ink" />
            <label className="block text-sm font-medium text-wood">Apellido (opcional)</label>
            <input value={quickLast} onChange={(e) => setQuickLast(e.target.value)} placeholder="Apellido" className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-ink" />
            <label className="block text-sm font-medium text-wood">Estado</label>
            <select value={quickLife} onChange={(e) => setQuickLife(e.target.value as 'alive' | 'deceased' | 'unknown')} className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-ink">
              <option value="alive">Vivo</option>
              <option value="deceased">Fallecido</option>
              <option value="unknown">Desconocido</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="ghost" onClick={closeQuickAdd}>Cancelar</Button>
            <Button onClick={submitQuickAdd}>Guardar</Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={!!conflictOps} onClose={() => setConflictOps(null)} title="Operaciones en conflicto">
        <pre className="text-xs text-ink bg-paper p-3 rounded-lg overflow-auto max-h-60">
          {JSON.stringify(conflictOps, null, 2)}
        </pre>
      </Modal>
    </div>
  );
}
