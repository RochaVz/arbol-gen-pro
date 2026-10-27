import { useEffect, useState } from 'react';
import { db, personRepository, relationshipRepository, eventRepository, treeRepository, photoRepository, uuidv7 } from './core/db';
import type { Person, Relationship, Event, Tree, SyncOperation, Photo } from './core/db';
import { useSyncStatus } from './shared/hooks/useSyncStatus';
import { supabase } from './core/supabase';
import { savePhotoLocally, photoState } from './features/photo/services/photoStorage';
import { listConflicts, resolveConflictKeepLocal, resolveConflictKeepServer } from './core/sync';

type Tab = 'trees' | 'persons' | 'relationships' | 'events' | 'photos' | 'conflicts' | 'sync';

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
  const [msg, setMsg] = useState<string | null>(null);
  const [conflictOps, setConflictOps] = useState<SyncOperation[] | null>(null);
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
    const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
    setAuthMsg(error ? error.message : 'Cuenta creada; revisa tu correo');
  };
  const doSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthMsg('Sesion cerrada');
  };

  const [treeName, setTreeName] = useState('');
  const [pName, setPName] = useState('');
  const [pLast, setPLast] = useState('');
  const [pLife, setPLife] = useState<'alive' | 'deceased' | 'unknown'>('alive');
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
    setPersons(await personRepository.list());
    setRels(await relationshipRepository.list());
    setEvents(await eventRepository.list());
    setPhotos(await photoRepository.list());
    await sync.refresh();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []);

  const inTree = (arr: { treeId?: string }[]) => treeId ? arr.filter((x) => x.treeId === treeId) : arr;
  const personsT = inTree(persons) as Person[];
  const relsT = inTree(rels) as Relationship[];
  const eventsT = inTree(events) as Event[];

  const createTree = async () => {
    if (!treeName.trim()) { setMsg('Nombre requerido'); return; }
    await treeRepository.create({ id: uuidv7(), name: treeName.trim(), ownerId: 'local-user' } as any);
    setTreeName(''); setMsg('Arbol creado'); await load();
  };

  const savePerson = async () => {
    if (!treeId) { setMsg('Crea o selecciona un arbol'); return; }
    if (!pName.trim()) { setMsg('Nombre requerido'); return; }
    if (editPerson) {
      await personRepository.update(editPerson, { firstName: pName.trim(), lastName: pLast.trim() || undefined, lifeStatus: pLife } as any);
      setMsg('Persona actualizada');
    } else {
      await personRepository.create({ id: uuidv7(), treeId, firstName: pName.trim(), lastName: pLast.trim() || undefined, lifeStatus: pLife } as any);
      setMsg('Persona creada');
    }
    setEditPerson(null); setPName(''); setPLast(''); setPLife('alive'); await load();
  };

  const delPerson = async (id: string) => { await personRepository.delete(id); setMsg('Persona eliminada'); await load(); };

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

  const showConflicts = async (entityType: string, entityId: string) => {
    const ops = await db.syncOutbox.where('[entityType+entityId]').equals([entityType, entityId]).toArray();
    const blocked = ops.filter((o) => o.status === 'blocked' || o.status === 'failed');
    setConflictOps(blocked.length ? blocked : ops);
  };

  const syncNow = async () => { const r = await sync.syncNow(); setMsg(r.message); await load(); };
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16, maxWidth: 1100, margin: '0 auto' }}>
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
          <span data-testid='sync-status' style={{ padding: '4px 10px', borderRadius: 999, color: 'white', background: color[sync.status] || '#6b7280', fontSize: 14 }}>
            {sync.status}
          </span>
          <button type='button' onClick={syncNow} disabled={sync.syncing}>Sincronizar ahora</button>
        </div>
      </header>

      {msg && <div style={{ marginBottom: 12, padding: 8, background: '#f3f4f6', borderRadius: 6 }}>{msg} <button type='button' onClick={() => setMsg(null)}>x</button></div>}
      {authMsg && <div style={{ marginBottom: 12, padding: 8, background: '#eff6ff', borderRadius: 6 }}>{authMsg} <button type='button' onClick={() => setAuthMsg(null)}>x</button></div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['trees', 'persons', 'relationships', 'events', 'photos', 'conflicts', 'sync'] as Tab[]).map((t) => (
          <button key={t} type='button' onClick={() => setTab(t)} style={{ padding: '6px 12px', borderRadius: 6, border: tab === t ? '2px solid #2563eb' : '1px solid #d1d5db', background: tab === t ? '#eff6ff' : 'white', cursor: 'pointer' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Arbol activo:</label>
        <select value={treeId} onChange={(e) => setTreeId(e.target.value)}>
          <option value=''>(todos)</option>
          {trees.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {tab === 'trees' && (
        <section>
          <h2>Arboles</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input placeholder='Nombre' value={treeName} onChange={(e) => setTreeName(e.target.value)} />
            <button type='button' onClick={createTree}>Crear arbol</button>
          </div>
          <ul>{trees.map((t) => <li key={t.id}>{t.name} <span style={{ fontSize: 12, color: '#6b7280' }}>({t.syncStatus})</span></li>)}</ul>
        </section>
      )}

      {tab === 'persons' && (
        <section>
          <h2>Personas</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <input placeholder='Nombre' value={pName} onChange={(e) => setPName(e.target.value)} />
            <input placeholder='Apellido' value={pLast} onChange={(e) => setPLast(e.target.value)} />
            <select value={pLife} onChange={(e) => setPLife(e.target.value as 'alive' | 'deceased' | 'unknown')}>
              <option value='alive'>vivo</option>
              <option value='deceased'>fallecido</option>
              <option value='unknown'>desconocido</option>
            </select>
            <button type='button' onClick={savePerson}>{editPerson ? 'Actualizar' : 'Crear'}</button>
            {editPerson && <button type='button' onClick={() => { setEditPerson(null); setPName(''); setPLast(''); setPLife('alive'); }}>Cancelar</button>}
          </div>
          <ul>
            {personsT.map((p) => (
              <li key={p.id} style={{ marginBottom: 4 }}>
                {p.firstName} {p.lastName ?? ''} ({p.lifeStatus}) <span style={{ fontSize: 12, color: '#6b7280' }}>{p.syncStatus}</span>
                {p.syncStatus === 'conflict' && <button type='button' style={{ marginLeft: 8 }} onClick={() => showConflicts('person', p.id)}>Ver conflictos</button>}
                <button type='button' style={{ marginLeft: 8 }} onClick={() => { setEditPerson(p.id); setPName(p.firstName); setPLast(p.lastName ?? ''); setPLife(p.lifeStatus); }}>Editar</button>
                <button type='button' style={{ marginLeft: 8 }} onClick={() => delPerson(p.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'relationships' && (
        <section>
          <h2>Relaciones</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <select value={relType} onChange={(e) => setRelType(e.target.value)}>
              <option value='parent'>parent</option>
              <option value='child'>child</option>
              <option value='spouse'>spouse</option>
              <option value='sibling'>sibling</option>
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

