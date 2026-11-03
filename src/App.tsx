import { useEffect, useState } from 'react';
import { personRepository, relationshipRepository, eventRepository, treeRepository, photoRepository, uuidv7 } from './core/db';
import type { Person, Relationship, Event, Tree, SyncOperation, Photo } from './core/db';
import { useSyncStatus } from './shared/hooks/useSyncStatus';
import { supabase } from './core/supabase';
import { savePhotoLocally, photoState, getPhotoBlobs } from './features/photo/services/photoStorage';
import { listConflicts, resolveConflictKeepLocal, resolveConflictKeepServer } from './core/sync';
import { startRealtimeSync, stopRealtimeSync } from './core/sync/realtime';


import { recordAudit, listAudit } from './core/audit/auditService';
import { exportToJson, exportToGedcom, downloadText } from './features/export/exportService';
import FamilyTree from './features/tree/components/FamilyTree';





type Tab = 'trees' | 'persons' | 'relationships' | 'events' | 'photos' | 'conflicts' | 'sync' | 'tree' | 'audit' | 'export';






const color: Record<string, string> = { synced: '#16a34a', pending: '#ca8a04', syncing: '#2563eb', conflict: '#dc2626', error: '#b91c1c', offline: '#6b7280' };

export default function App() {
  const sync = useSyncStatus();
  const [tab, setTab] = useState<Tab>('trees');
  const [trees, setTrees] = useState<Tree[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [rels, setRels] = useState<Relationship[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [treeId, setTreeId] = useState('');
  const [treeCenterId, setTreeCenterId] = useState<string>('');
  const [treeDepth] = useState(3);
  const [treeMode, setTreeMode] = useState<'ancestors' | 'descendants' | 'branch'>('branch');
  const [personPhotoUrls, setPersonPhotoUrls] = useState<Record<string, string>>({});



  const [msg, setMsg] = useState<string | null>(null);
  const [conflictOps, setConflictOps] = useState<SyncOperation[] | null>(null);
  const [auditEntries, setAuditEntries] = useState<any[]>([]);
  const [exportTreeId, setExportTreeId] = useState('');


  // Asistente para crear el arbol de forma sencilla
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardTreeName, setWizardTreeName] = useState('Mi familia');
  const [wizardMyName, setWizardMyName] = useState('');
  const [wizardLastName, setWizardLastName] = useState('');

  // Agregar familiares de forma guiada
  const [quickAdd, setQuickAdd] = useState<{ personId: string; kind: 'father' | 'mother' | 'spouse' | 'child' } | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickLast, setQuickLast] = useState('');
  const [quickLife, setQuickLife] = useState<'alive' | 'deceased' | 'unknown'>('alive');

  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      setInstallPrompt(null);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    startRealtimeSync();
    return () => stopRealtimeSync();
  }, []);

  const [sessionEmail, setSessionEmail] = useState<string | null>(null);


  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMsg, setAuthMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSessionEmail(data.session?.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSessionEmail(s?.user?.email ?? null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const doSignIn = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    setAuthMsg(error ? error.message : 'Sesion iniciada');
  };
  const doSignUp = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signUp({
     email: authEmail,
     password: authPassword,
     options: { emailRedirectTo: `${window.location.origin}/` },
   });

    setAuthMsg(error ? error.message : 'Cuenta creada; revisa tu correo');
  };
  const doSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthMsg('Sesion cerrada');
  };

  const [pName, setPName] = useState('');
  const [pLast, setPLast] = useState('');
  const [pLife, setPLife] = useState<'alive' | 'deceased' | 'unknown'>('alive');
  const [pBirthYear, setPBirthYear] = useState('');
  const [pOccupation, setPOccupation] = useState('');
  const [pCharacteristics, setPCharacteristics] = useState('');
  const [pPhotoFile, setPPhotoFile] = useState<File | null>(null);
  const [editPerson, setEditPerson] = useState<string | null>(null);
  const [relType, setRelType] = useState('parent');
  const [relFrom, setRelFrom] = useState('');
  const [relTo, setRelTo] = useState('');
  const [evType, setEvType] = useState('birth');
  const [evTitle, setEvTitle] = useState('');
  const [evPerson, setEvPerson] = useState('');
  const [evYear, setEvYear] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

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

    // Cargar miniaturas locales para mostrar fotos en el arbol
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []);

  useEffect(() => {
    if (!treeId) { setTreeCenterId(''); return; }
    const list = persons.filter((p: any) => p.treeId === treeId && !p.deletedAt);
    if (list.length === 0) { setTreeCenterId(''); return; }
    if (!treeCenterId || !list.some((p: any) => p.id === treeCenterId)) {
      setTreeCenterId(list[0].id);
    }
  }, [treeId, persons, treeCenterId]);

  const inTree = (arr: { treeId?: string }[]) => treeId ? arr.filter((x) => x.treeId === treeId) : arr;
  const personsT = inTree(persons) as Person[];
  const relsT = inTree(rels) as Relationship[];
  const eventsT = inTree(events) as Event[];

  const startMyTree = async () => {
    if (!wizardTreeName.trim()) { setMsg('Pon un nombre al arbol'); return; }
    if (!wizardMyName.trim()) { setMsg('Pon tu nombre'); return; }
    try {
      const t = await treeRepository.create({ id: uuidv7(), name: wizardTreeName.trim(), ownerId: 'local-user' } as any);
      const me = await personRepository.create({ id: uuidv7(), treeId: t.entity.id, firstName: wizardMyName.trim(), lastName: wizardLastName.trim() || undefined, lifeStatus: 'alive' } as any);
      setTreeId(t.entity.id);
      setTreeCenterId(me.entity.id);
      setTab('tree');
      setWizardOpen(false);
      setMsg('Arbol creado. Ahora puedes agregar familiares.');
      await load();
    } catch (e) {
      setMsg(String((e as Error)?.message ?? e));
    }
  };

  const openQuickAdd = (personId: string, kind: 'father' | 'mother' | 'spouse' | 'child') => {
    setQuickAdd({ personId, kind });
    setQuickName('');
    setQuickLast('');
    setQuickLife('alive');
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
    if (!treeId) { setMsg('Selecciona un arbol'); return; }
    if (!quickName.trim()) { setMsg('Nombre requerido'); return; }
    try {
      const sex = quickAdd.kind === 'father' ? 'male' : quickAdd.kind === 'mother' ? 'female' : undefined;
      const newPerson = await personRepository.create({
        id: uuidv7(),
        treeId,
        firstName: quickName.trim(),
        lastName: quickLast.trim() || undefined,
        lifeStatus: quickLife,
        sex,
      } as any);

      const edges = relsT.map((r) => ({ from: r.person1Id ?? r.personId ?? '', to: r.person2Id ?? r.relativeId ?? '' }));
      let type = 'otro';
      let from = quickAdd.personId;
      let to = newPerson.entity.id;
      if (quickAdd.kind === 'father' || quickAdd.kind === 'mother') {
        // el nuevo es padre/madre de la persona seleccionada
        type = quickAdd.kind === 'father' ? 'padre' : 'madre';
        from = newPerson.entity.id;
        to = quickAdd.personId;
      } else if (quickAdd.kind === 'child') {
        type = 'hijo';
        from = quickAdd.personId;
        to = newPerson.entity.id;
      } else {
        type = 'pareja';
        from = quickAdd.personId;
        to = newPerson.entity.id;
      }
      await relationshipRepository.create({ id: uuidv7(), treeId, type, person1Id: from, person2Id: to } as any, edges);

      setMsg('Familiar agregado');
      setQuickAdd(null);
      await load();
    } catch (e) {
      setMsg(String((e as Error)?.message ?? e));
    }
  };

  const savePerson = async () => {
    if (!treeId) { setMsg('Crea o selecciona un arbol'); return; }
    if (!pName.trim()) { setMsg('Nombre requerido'); return; }
    const birthDate = pBirthYear.trim() ? { year: Number(pBirthYear.trim()) } : undefined;
    if (editPerson) {
      await personRepository.update(editPerson, { firstName: pName.trim(), lastName: pLast.trim() || undefined, lifeStatus: pLife, birthDate, occupation: pOccupation.trim() || undefined, characteristics: pCharacteristics.trim() || undefined } as any);
      if (pPhotoFile) {
        try { await savePhotoLocally({ file: pPhotoFile, treeId, personId: editPerson }); } catch (e) { setMsg(String((e as Error)?.message ?? e)); }
      }
      setMsg('Persona actualizada');
    } else {
      const created = await personRepository.create({ id: uuidv7(), treeId, firstName: pName.trim(), lastName: pLast.trim() || undefined, lifeStatus: pLife, birthDate, occupation: pOccupation.trim() || undefined, characteristics: pCharacteristics.trim() || undefined } as any);
      if (pPhotoFile) {
        try { await savePhotoLocally({ file: pPhotoFile, treeId, personId: created.entity.id }); } catch (e) { setMsg(String((e as Error)?.message ?? e)); }
      }
      setMsg('Persona creada');
    }
    setEditPerson(null); setPName(''); setPLast(''); setPLife('alive'); setPBirthYear(''); setPOccupation(''); setPCharacteristics(''); setPPhotoFile(null); await load();
  };

  const delPerson = async (id: string) => { await personRepository.delete(id); setMsg('Persona eliminada'); await load(); };

  const removeDuplicates = async () => {
    const groups = new Map<string, Person[]>();
    for (const p of personsT) {
      const key = `${p.firstName} ${p.lastName ?? ''}`.trim().toLowerCase();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }
    const toDelete: Person[] = [];
    for (const g of groups.values()) {
      if (g.length > 1) toDelete.push(...g.slice(1));
    }
    if (toDelete.length === 0) { setMsg('No se encontraron duplicados'); return; }
    if (!window.confirm(`Se eliminarán ${toDelete.length} integrantes duplicados. ¿Continuar?`)) return;
    try {
      for (const p of toDelete) await personRepository.delete(p.id);
      setMsg(`${toDelete.length} duplicados eliminados`);
      await load();
    } catch (e) {
      setMsg(String((e as Error)?.message ?? e));
    }
  };

  const deleteTree = async (id: string) => {
    if (!window.confirm('¿Eliminar este árbol y todos sus integrantes?')) return;
    try {
      for (const p of persons.filter((x) => x.treeId === id)) await personRepository.delete(p.id);
      for (const r of rels.filter((x) => x.treeId === id)) await relationshipRepository.delete(r.id);
      for (const e of events.filter((x) => x.treeId === id)) await eventRepository.delete(e.id);
      for (const ph of photos.filter((x) => x.treeId === id)) await photoRepository.delete(ph.id);
      await treeRepository.delete(id);
      if (treeId === id) setTreeId('');
      setMsg('Árbol eliminado');
      await load();
    } catch (e) {
      setMsg(String((e as Error)?.message ?? e));
    }
  };

  const createRel = async () => {
    if (!treeId || !relFrom || !relTo) { setMsg('Datos incompletos'); return; }
    const edges = relsT.map((r) => ({ from: r.person1Id ?? r.personId ?? '', to: r.person2Id ?? r.relativeId ?? '' }));
    await relationshipRepository.create({ id: uuidv7(), treeId, type: relType, person1Id: relFrom, person2Id: relTo } as any, edges);
    setRelFrom(''); setRelTo(''); setMsg('Relacion creada'); await load();
  };

  const delRel = async (id: string) => { await relationshipRepository.delete(id); setMsg('Relacion eliminada'); await load(); };

  const createEvent = async () => {
    if (!treeId || !evType.trim()) { setMsg('Datos incompletos'); return; }
    const date = evYear.trim() ? { year: Number(evYear.trim()) } : undefined;
    await eventRepository.create({ id: uuidv7(), treeId, type: evType.trim(), title: evTitle.trim() || undefined, personId: evPerson || undefined, date } as any);
    setEvType('birth'); setEvTitle(''); setEvPerson(''); setEvYear(''); setMsg('Evento creado'); await load();
  };

  const delEvent = async (id: string) => { await eventRepository.delete(id); setMsg('Evento eliminado'); await load(); };
  const loadConflicts = async () => {
    setConflicts(await listConflicts());
  };

  useEffect(() => {
    if (tab === 'conflicts') void loadConflicts();
  }, [tab]);
  const createPhoto = async () => {
    if (!treeId) { setMsg('Crea o selecciona un arbol'); return; }
    if (!photoFile) { setMsg('Selecciona una imagen'); return; }
    try {
      await savePhotoLocally({ file: photoFile, treeId });
      setPhotoFile(null); setMsg('Foto guardada'); await load();
    } catch (e) {
      setMsg(String((e as Error)?.message ?? e));
    }
  };

  const syncNow = async () => { const r = await sync.syncNow(); setMsg(r.message); await load(); };
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 24, maxWidth: 1100, margin: '0 auto', background: 'linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)', minHeight: '100vh', borderRadius: 0 }}>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>Arbol Gen Pro</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {installPrompt && (
            <button type='button' onClick={installApp} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: 'white', cursor: 'pointer' }}>
              Instalar app
            </button>
          )}
          {supabase && !sessionEmail && (
            <>
              <input placeholder='email' value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={{ width: 160 }} />
              <input type='password' placeholder='password' value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ width: 120 }} />
              <button type='button' onClick={doSignIn}>Entrar</button>
              <button type='button' onClick={doSignUp}>Registrarse</button>
            </>
          )}
          {supabase && sessionEmail && (
            <>
              <span style={{ fontSize: 13, color: '#374151' }}>{sessionEmail}</span>
              <button type='button' onClick={doSignOut}>Salir</button>
            </>
          )}
          <span data-testid='sync-status' style={{ padding: '6px 12px', borderRadius: 999, color: 'white', background: color[sync.status] || '#6b7280', fontSize: 14, fontWeight: 600 }}>
            {sync.status === 'synced' ? '✅ Todo sincronizado' : sync.status === 'pending' ? '⏳ Pendiente' : sync.status === 'syncing' ? '🔄 Sincronizando' : sync.status === 'conflict' ? '⚠️ Conflicto' : sync.status === 'error' ? '❌ Error' : '📴 Sin conexión'}
          </span>
          <button type='button' onClick={syncNow} disabled={sync.syncing}>Sincronizar ahora</button>
        </div>
      </header>

      {msg && <div style={{ marginBottom: 12, padding: 8, background: '#f3f4f6', borderRadius: 6 }}>{msg} <button type='button' onClick={() => setMsg(null)}>x</button></div>}
      {authMsg && <div style={{ marginBottom: 12, padding: 8, background: '#eff6ff', borderRadius: 6 }}>{authMsg} <button type='button' onClick={() => setAuthMsg(null)}>x</button></div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button key='tree' type='button' onClick={() => setTab('tree')} style={{ padding: '12px 20px', borderRadius: 12, border: tab === 'tree' ? '2px solid #E8872E' : '1px solid #D4A373', background: tab === 'tree' ? '#FFF3B0' : '#FFFDF5', color: tab === 'tree' ? '#5C3A21' : '#8B4513', cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.08)', fontFamily: 'Georgia, serif' }}>
          🌲 Árbol
        </button>
        <button key='persons' type='button' onClick={() => setTab('persons')} style={{ padding: '12px 20px', borderRadius: 12, border: tab === 'persons' ? '2px solid #E8872E' : '1px solid #D4A373', background: tab === 'persons' ? '#FFF3B0' : '#FFFDF5', color: tab === 'persons' ? '#5C3A21' : '#8B4513', cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.08)', fontFamily: 'Georgia, serif' }}>
          👤 Personas
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8, fontWeight: 600, color: '#5C3A21', fontFamily: 'Georgia, serif' }}>Árbol activo:</label>
        <select value={treeId} onChange={(e) => setTreeId(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #D4A373', background: 'white', fontSize: 14, fontFamily: 'Georgia, serif' }}>
          <option value=''>(seleccionar árbol)</option>
          {trees.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {tab === 'trees' && (
        <section>
          <h2>Mis árboles</h2>
          {trees.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, background: '#FFFDF5', borderRadius: 16, border: '2px solid #D4A373', marginBottom: 20 }}>
              <p style={{ fontSize: 20, color: '#5C3A21', marginBottom: 16, fontFamily: 'Georgia, serif' }}>¡Bienvenido a tu árbol genealógico!</p>
              <p style={{ fontSize: 15, color: '#8B4513', marginBottom: 24 }}>Crear tu primer árbol es muy fácil. Solo necesitas un nombre y tu nombre.</p>
              <button type='button' onClick={() => setWizardOpen(true)} style={{ padding: '14px 28px', fontSize: 17, borderRadius: 12, background: '#E8872E', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'Georgia, serif', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                Crear mi árbol
              </button>
            </div>
          )}
          {trees.length > 0 && (
            <div>
              <p style={{ fontSize: 15, color: '#5C3A21', marginBottom: 12, fontFamily: 'Georgia, serif' }}>Tus árboles:</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {trees.map((t) => (
                  <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'white', borderRadius: 12, border: '1px solid #D4A373', marginBottom: 10, boxShadow: '0 3px 8px rgba(0,0,0,0.08)' }}>
                    <span style={{ fontSize: 24 }}>{t.syncStatus === 'synced' ? '✅' : t.syncStatus === 'pending' ? '⏳' : '⚠️'}</span>
                    <span style={{ fontSize: 17, fontWeight: 700, color: '#5C3A21', fontFamily: 'Georgia, serif', flex: 1 }}>{t.name}</span>
                    <button type='button' onClick={() => { setTreeId(t.id); setTab('tree'); }} style={{ padding: '10px 16px', borderRadius: 10, background: '#FFF3B0', color: '#5C3A21', border: '1px solid #D4A373', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                      Abrir árbol
                    </button>
                    <button type='button' onClick={() => deleteTree(t.id)} style={{ padding: '10px 16px', borderRadius: 10, background: '#F4E1D2', color: '#8B4513', border: '1px solid #D4A373', cursor: 'pointer', fontWeight: 700, fontSize: 14, marginLeft: 8 }}>
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {tab === 'persons' && (
        <section>
          <h2>Personas de la familia</h2>
          {!treeId && (
            <div style={{ textAlign: 'center', padding: 30, background: '#FFFDF5', borderRadius: 16, border: '2px solid #D4A373' }}>
              <p style={{ fontSize: 16, color: '#5C3A21', marginBottom: 16, fontFamily: 'Georgia, serif' }}>Primero selecciona un árbol.</p>
            </div>
          )}
          {treeId && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <input placeholder='Nombre' value={pName} onChange={(e) => setPName(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #D4A373', background: 'white', fontSize: 15, minWidth: 140 }} />
                <input placeholder='Apellido' value={pLast} onChange={(e) => setPLast(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #D4A373', background: 'white', fontSize: 15, minWidth: 140 }} />
                <input placeholder='Año nacimiento' value={pBirthYear} onChange={(e) => setPBirthYear(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #D4A373', background: 'white', fontSize: 15, width: 130 }} />
                <input placeholder='Ocupación' value={pOccupation} onChange={(e) => setPOccupation(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #D4A373', background: 'white', fontSize: 15, minWidth: 150 }} />
                <input placeholder='Características (ej. alegre)' value={pCharacteristics} onChange={(e) => setPCharacteristics(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #D4A373', background: 'white', fontSize: 15, minWidth: 180 }} />
                <select value={pLife} onChange={(e) => setPLife(e.target.value as 'alive' | 'deceased' | 'unknown')} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #D4A373', background: 'white', fontSize: 15 }}>
                  <option value='alive'>vivo</option>
                  <option value='deceased'>fallecido</option>
                  <option value='unknown'>desconocido</option>
                </select>
                <input type='file' accept='image/*' onChange={(e) => setPPhotoFile(e.target.files?.[0] ?? null)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #D4A373', background: 'white', fontSize: 14 }} />
                <button type='button' onClick={savePerson} style={{ padding: '10px 20px', borderRadius: 12, background: '#E8872E', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, fontFamily: 'Georgia, serif', boxShadow: '0 3px 8px rgba(0,0,0,0.15)' }}>
                  {editPerson ? 'Guardar cambios' : 'Crear persona'}
                </button>
                <button type='button' onClick={removeDuplicates} style={{ padding: '10px 20px', borderRadius: 12, background: '#F4E1D2', color: '#8B4513', border: '1px solid #D4A373', cursor: 'pointer', fontWeight: 700, fontSize: 14, marginLeft: 8 }}>
                  Eliminar duplicados
                </button>
                {editPerson && (
                  <button type='button' onClick={() => { setEditPerson(null); setPName(''); setPLast(''); setPLife('alive'); setPBirthYear(''); setPOccupation(''); setPCharacteristics(''); setPPhotoFile(null); }} style={{ padding: '10px 20px', borderRadius: 12, background: '#F4E1D2', color: '#8B4513', border: '1px solid #D4A373', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    Cancelar
                  </button>
                )}
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {personsT.map((p) => (
              <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, background: 'white', borderRadius: 12, border: '1px solid #D4A373', marginBottom: 10, boxShadow: '0 3px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F4E1D2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#8B4513', flexShrink: 0 }}>👤</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#5C3A21', fontFamily: 'Georgia, serif' }}>{p.firstName} {p.lastName ?? ''}</div>
                  <div style={{ fontSize: 13, color: '#8B4513', fontStyle: 'italic', marginTop: 2 }}>
                    {p.birthDate?.year ? `n. ${p.birthDate.year}` : ''}{p.deathDate?.year ? ` – ${p.deathDate.year}` : ''}
                    {p.occupation ? ` • ${p.occupation}` : ''}
                    {p.characteristics ? ` • "${p.characteristics}"` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: '#8B4513', marginTop: 4 }}>{p.lifeStatus === 'deceased' ? '✝ Fallecido' : p.lifeStatus === 'alive' ? '💚 Vivo' : '❓ Desconocido'}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button type='button' onClick={() => { setEditPerson(p.id); setPName(p.firstName); setPLast(p.lastName ?? ''); setPLife(p.lifeStatus); setPBirthYear(p.birthDate?.year ? String(p.birthDate.year) : ''); setPOccupation(p.occupation ?? ''); setPCharacteristics(p.characteristics ?? ''); }} style={{ padding: '6px 12px', borderRadius: 8, background: '#FFF3B0', color: '#5C3A21', border: '1px solid #D4A373', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Editar</button>
                  <button type='button' onClick={() => delPerson(p.id)} style={{ padding: '6px 12px', borderRadius: 8, background: '#F4E1D2', color: '#8B4513', border: '1px solid #D4A373', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Eliminar</button>
                  <button type='button' onClick={() => openQuickAdd(p.id, 'father')} style={{ padding: '6px 12px', borderRadius: 8, background: '#FFF3B0', color: '#5C3A21', border: '1px solid #D4A373', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>+ Padre</button>
                  <button type='button' onClick={() => openQuickAdd(p.id, 'mother')} style={{ padding: '6px 12px', borderRadius: 8, background: '#FFF3B0', color: '#5C3A21', border: '1px solid #D4A373', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>+ Madre</button>
                  <button type='button' onClick={() => openQuickAdd(p.id, 'spouse')} style={{ padding: '6px 12px', borderRadius: 8, background: '#FFF3B0', color: '#5C3A21', border: '1px solid #D4A373', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>+ Pareja</button>
                  <button type='button' onClick={() => openQuickAdd(p.id, 'child')} style={{ padding: '6px 12px', borderRadius: 8, background: '#FFF3B0', color: '#5C3A21', border: '1px solid #D4A373', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>+ Hijo/a</button>
                </div>
              </li>
            ))}
          </ul>
            </>
          )}
        </section>
      )}

      {tab === 'relationships' && (
        <section>
          <h2>Relaciones</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <select value={relType} onChange={(e) => setRelType(e.target.value)}>
              <option value='padre'>Padre de</option>
              <option value='madre'>Madre de</option>
              <option value='hijo'>Hijo de</option>
              <option value='hija'>Hija de</option>
              <option value='esposo'>Esposo de</option>
              <option value='esposa'>Esposa de</option>
              <option value='hermano'>Hermano de</option>
              <option value='hermana'>Hermana de</option>
              <option value='otro'>Otro</option>
            </select>
            <select value={relFrom} onChange={(e) => setRelFrom(e.target.value)}>
              <option value=''>de</option>
              {personsT.map((p) => <option key={p.id} value={p.id}>{p.firstName}</option>)}
            </select>
            <select value={relTo} onChange={(e) => setRelTo(e.target.value)}>
              <option value=''>a</option>
              {personsT.map((p) => <option key={p.id} value={p.id}>{p.firstName}</option>)}
            </select>
            <button type='button' onClick={createRel}>Crear</button>
          </div>
          <ul>
            {relsT.map((r) => (
              <li key={r.id} style={{ marginBottom: 4 }}>
                {r.type}: {r.person1Id ?? r.personId} -&gt; {r.person2Id ?? r.relativeId} <span style={{ fontSize: 12, color: '#6b7280' }}>{r.syncStatus}</span>
                <button type='button' style={{ marginLeft: 8 }} onClick={() => delRel(r.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'events' && (
        <section>
          <h2>Eventos</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <input placeholder='Tipo' value={evType} onChange={(e) => setEvType(e.target.value)} />
            <input placeholder='Titulo' value={evTitle} onChange={(e) => setEvTitle(e.target.value)} />
            <select value={evPerson} onChange={(e) => setEvPerson(e.target.value)}>
              <option value=''>(sin persona)</option>
              {personsT.map((p) => <option key={p.id} value={p.id}>{p.firstName}</option>)}
            </select>
            <input placeholder='Anio' value={evYear} onChange={(e) => setEvYear(e.target.value)} style={{ width: 80 }} />
            <button type='button' onClick={createEvent}>Crear</button>
          </div>
          <ul>
            {eventsT.map((e) => (
              <li key={e.id} style={{ marginBottom: 4 }}>
                {e.type} {e.title ? '- ' + e.title : ''} {e.date?.year ? '(' + e.date.year + ')' : ''} <span style={{ fontSize: 12, color: '#6b7280' }}>{e.syncStatus}</span>
                <button type='button' style={{ marginLeft: 8 }} onClick={() => delEvent(e.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'photos' && (
        <section>
          <h2>Fotos</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <input type='file' accept='image/*' onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
            <button type='button' onClick={createPhoto}>Guardar foto</button>
          </div>
          <ul>
            {photos.map((p) => (
              <li key={p.id} style={{ marginBottom: 4 }}>
                {p.id.slice(0, 8)} {p.width}x{p.height} <span style={{ fontSize: 12, color: '#6b7280' }}>{photoState(p)}</span> {p.r2Key ? '(subida)' : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'conflicts' && (
        <section>
          <h2>Conflictos</h2>
          {conflicts.length === 0 && <p>Sin conflictos.</p>}
          {conflicts.map((c) => (
            <div key={c.operation.operationId} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <p><strong>{c.entityType}</strong> {c.entityId}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <h4>Local</h4>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, background: '#f9fafb', padding: 8, borderRadius: 4 }}>{JSON.stringify(c.local, null, 2)}</pre>
                </div>
                <div>
                  <h4>Servidor</h4>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, background: '#f9fafb', padding: 8, borderRadius: 4 }}>{JSON.stringify(c.server, null, 2)}</pre>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type='button' onClick={async () => { await resolveConflictKeepLocal(c.operation.operationId); await loadConflicts(); setMsg('Resuelto: conservar local'); }}>Conservar local</button>
                <button type='button' onClick={async () => { await resolveConflictKeepServer(c.operation.operationId); await loadConflicts(); setMsg('Resuelto: conservar servidor'); }}>Conservar servidor</button>
              </div>
            </div>
          ))}
        </section>
      )}

{tab === 'tree' && (
        <section>
          <h2>🌲 Tu Árbol Genealógico</h2>
          <p style={{ fontSize: 13, color: '#8B4513', marginBottom: 12, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Haz clic en cualquier persona para centrar el árbol en ella. Usa el botón ⋯ en cada tarjeta para agregar familiares, editar o eliminar.</p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center', padding: 16, background: '#FFFDF5', borderRadius: 14, border: '2px solid #D4A373' }}>
            <label style={{ fontWeight: 700, color: '#5C3A21', fontFamily: 'Georgia, serif', fontSize: 14 }}>Persona central:</label>
            <select value={treeCenterId} onChange={(e) => setTreeCenterId(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #D4A373', background: 'white', fontSize: 14, fontFamily: 'Georgia, serif', minWidth: 180 }}>
              <option value=''>(seleccionar persona)</option>
              {personsT.map((p) => <option key={p.id} value={p.id}>{[p.firstName, p.lastName].filter(Boolean).join(' ')}</option>)}
            </select>
            <label style={{ fontWeight: 700, color: '#5C3A21', fontFamily: 'Georgia, serif', fontSize: 14, marginLeft: 10 }}>Ver:</label>
            <select value={treeMode} onChange={(e) => setTreeMode(e.target.value as any)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #D4A373', background: 'white', fontSize: 14, fontFamily: 'Georgia, serif' }}>
              <option value='branch'>Árbol completo</option>
              <option value='ancestors'>Solo antepasados</option>
              <option value='descendants'>Solo descendientes</option>
            </select>
          </div>
          <FamilyTree
            persons={personsT}
            relationships={relsT}
            centerId={treeCenterId || null}
            depth={treeDepth}
            mode={treeMode}
            photoUrls={personPhotoUrls}
            onSelectPerson={(id) => setTreeCenterId(id)}
            onAddChild={(id) => openQuickAdd(id, 'child')}
            onAddSpouse={(id) => openQuickAdd(id, 'spouse')}
            onAddFather={(id) => openQuickAdd(id, 'father')}
            onAddMother={(id) => openQuickAdd(id, 'mother')}
            onEdit={(id) => {
              const p = persons.find((x) => x.id === id);
              if (!p) return;
              setEditPerson(p.id);
              setPName(p.firstName);
              setPLast(p.lastName ?? '');
              setPLife(p.lifeStatus);
              setPBirthYear(p.birthDate?.year ? String(p.birthDate.year) : '');
              setPOccupation(p.occupation ?? '');
              setPCharacteristics(p.characteristics ?? '');
              setTab('persons');
              setMsg('Editando persona. Guarda los cambios abajo.');
            }}
            onDelete={async (id) => {
              if (!window.confirm('¿Eliminar esta persona?')) return;
              await delPerson(id);
            }}
          />
        </section>
      )}


{tab === 'sync' && (
        <section>
          <h2>Cola sync</h2>
          <p>Pendientes: {sync.counts.pending} En vuelo: {sync.counts.inFlight} Fallidas: {sync.counts.failed} Bloqueadas: {sync.counts.blocked} Total: {sync.counts.total}</p>
          <p>Red: {sync.online ? 'online' : 'offline'}</p>
          {sync.progress && (
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(sync.progress.done / Math.max(1, sync.progress.total)) * 100}%`, background: '#2563eb', transition: 'width 0.2s' }} />
              </div>
              <p style={{ fontSize: 12, color: '#6b7280' }}>{sync.progress.done}/{sync.progress.total}</p>
            </div>
          )}
        </section>
      )}

{tab === 'audit' && (
        <section>
          <h2>Auditoria (D6)</h2>
          <button type='button' onClick={async () => {
            const entries = await listAudit(treeId || undefined);
            setAuditEntries(entries);
          }}>Cargar</button>
          <ul style={{ marginTop: 8 }}>
            {(auditEntries ?? []).map((e) => (
              <li key={e.id} style={{ fontSize: 12, marginBottom: 4 }}>
                {new Date(e.createdAt).toLocaleString()} — {e.action} {e.entityType} {e.entityId?.slice(0, 8)} {e.treeId ? `(arbol ${e.treeId.slice(0, 8)})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'export' && (
        <section>
          <h2>Exportar arbol (D5)</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <select value={exportTreeId} onChange={(e) => setExportTreeId(e.target.value)}>
              <option value=''>(seleccionar arbol)</option>
              {trees.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button type='button' onClick={async () => {
              if (!exportTreeId) return;
              const bundle = {
                tree: trees.find((t) => t.id === exportTreeId)!,
                persons: persons.filter((p) => p.treeId === exportTreeId),
                relationships: rels.filter((r) => r.treeId === exportTreeId),
                events: events.filter((e) => e.treeId === exportTreeId),
                exportedAt: new Date().toISOString(),
              };
              downloadText(`${exportTreeId}.json`, exportToJson(bundle as any), 'application/json');
              await recordAudit({ treeId: exportTreeId, entityType: 'tree', entityId: exportTreeId, action: 'create', payload: { kind: 'export_json' } });
            }}>Exportar JSON</button>
            <button type='button' onClick={async () => {
              if (!exportTreeId) return;
              const bundle = {
                tree: trees.find((t) => t.id === exportTreeId)!,
                persons: persons.filter((p) => p.treeId === exportTreeId),
                relationships: rels.filter((r) => r.treeId === exportTreeId),
                events: events.filter((e) => e.treeId === exportTreeId),
                exportedAt: new Date().toISOString(),
              };
              downloadText(`${exportTreeId}.ged`, exportToGedcom(bundle as any), 'text/plain');
              await recordAudit({ treeId: exportTreeId, entityType: 'tree', entityId: exportTreeId, action: 'create', payload: { kind: 'export_gedcom' } });
            }}>Exportar GEDCOM</button>
          </div>
        </section>
      )}


        {wizardOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setWizardOpen(false)}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, maxWidth: 420, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3>Crear tu árbol</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Responde estas dos preguntas y listo.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label>Nombre del árbol</label>
              <input value={wizardTreeName} onChange={(e) => setWizardTreeName(e.target.value)} placeholder='Mi familia' />
              <label>Tu nombre</label>
              <input value={wizardMyName} onChange={(e) => setWizardMyName(e.target.value)} placeholder='Nombre' />
              <label>Tu apellido (opcional)</label>
              <input value={wizardLastName} onChange={(e) => setWizardLastName(e.target.value)} placeholder='Apellido' />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button type='button' onClick={() => setWizardOpen(false)}>Cancelar</button>
              <button type='button' onClick={startMyTree}>Crear árbol</button>
            </div>
          </div>
        </div>
      )}

      {quickAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeQuickAdd}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, maxWidth: 420, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3>{quickTitle(quickAdd.kind)}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label>Nombre</label>
              <input value={quickName} onChange={(e) => setQuickName(e.target.value)} placeholder='Nombre' />
              <label>Apellido (opcional)</label>
              <input value={quickLast} onChange={(e) => setQuickLast(e.target.value)} placeholder='Apellido' />
              <label>Estado</label>
              <select value={quickLife} onChange={(e) => setQuickLife(e.target.value as 'alive' | 'deceased' | 'unknown')}>
                <option value='alive'>vivo</option>
                <option value='deceased'>fallecido</option>
                <option value='unknown'>desconocido</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button type='button' onClick={closeQuickAdd}>Cancelar</button>
              <button type='button' onClick={submitQuickAdd}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {conflictOps && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setConflictOps(null)}>
          <div style={{ background: 'white', padding: 16, borderRadius: 8, maxWidth: 600, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3>Operaciones en conflicto</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(conflictOps, null, 2)}</pre>
            <button type='button' onClick={() => setConflictOps(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

