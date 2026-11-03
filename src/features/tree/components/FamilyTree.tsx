import { useMemo, useState, useEffect } from 'react';
import type { Person, Relationship } from '../../../core/db/schema';
import { computeLayout, parentsOf, spousesOf, NODE_W, NODE_H } from '../utils/treeLayout';

export interface FamilyTreeProps {
  persons: Person[];
  relationships: Relationship[];
  centerId: string | null;
  depth?: number;
  mode?: 'ancestors' | 'descendants' | 'branch';
  onSelectPerson?: (id: string) => void;
  photoUrls?: Record<string, string>;
  onAddChild?: (id: string) => void;
  onAddSpouse?: (id: string) => void;
  onAddFather?: (id: string) => void;
  onAddMother?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function fullName(p: Person | undefined): string {
  if (!p) return '?';
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ').trim();
  return name || '(sin nombre)';
}

function ageText(p: Person | undefined): string {
  if (!p?.birthDate?.year) return '';
  const birth = p.birthDate.year;
  if (p.lifeStatus === 'deceased' && p.deathDate?.year) {
    return `${p.deathDate.year - birth} años`;
  }
  if (p.lifeStatus === 'alive') {
    return `${new Date().getFullYear() - birth} años`;
  }
  return '';
}

export default function FamilyTree({ persons, relationships, centerId, depth = 3, mode = 'branch', onSelectPerson, photoUrls, onAddChild, onAddSpouse, onAddFather, onAddMother, onEdit, onDelete }: FamilyTreeProps) {
  const [menu, setMenu] = useState<{ x: number; y: number; id: string } | null>(null);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null); };
    window.addEventListener('click', close);
    window.addEventListener('contextmenu', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('contextmenu', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);
  const byId = useMemo(() => {
    const m = new Map<string, Person>();
    for (const p of persons) m.set(p.id, p);
    return m;
  }, [persons]);

  const layout = useMemo(() => {
    if (!centerId) return null;
    return computeLayout(centerId, depth, mode, relationships);
  }, [centerId, depth, mode, relationships]);

  if (!centerId) {
    return <div style={{ padding: 16, color: '#6b7280' }}>Selecciona una persona para visualizar el árbol.</div>;
  }
  if (!layout) return null;

  const { pos, width, height, minX, minY } = layout;

  const edges: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];

  // Lineas de matrimonio: horizontal entre los dos conyugues
  const seenSpouse = new Set<string>();
  for (const id of pos.keys()) {
    for (const sid of spousesOf(id, relationships)) {
      if (!pos.has(sid)) continue;
      const key = [id, sid].sort().join('-');
      if (seenSpouse.has(key)) continue;
      seenSpouse.add(key);
      const a = pos.get(id)!;
      const b = pos.get(sid)!;
      const y = Math.min(a.y, b.y);
      edges.push({ x1: Math.min(a.x, b.x) + NODE_W / 2, y1: y, x2: Math.max(a.x, b.x) - NODE_W / 2, y2: y, key: `s-${key}` });
    }
  }

  // Conectores tradicionales: linea vertical desde el centro del matrimonio hacia los hijos
  const families = new Map<string, { parents: string[]; children: string[] }>();
  for (const childId of pos.keys()) {
    const pars = parentsOf(childId, relationships).filter((p) => pos.has(p));
    if (pars.length === 0) continue;
    const key = [...pars].sort().join('|');
    if (!families.has(key)) families.set(key, { parents: pars, children: [] });
    families.get(key)!.children.push(childId);
  }
  for (const [key, fam] of families) {
    const parentXs = fam.parents.map((id) => pos.get(id)!.x);
    const parentYs = fam.parents.map((id) => pos.get(id)!.y);
    const parentMidX = parentXs.reduce((a, b) => a + b, 0) / parentXs.length;
    const parentBottomY = parentYs.reduce((a, b) => a + b, 0) / parentYs.length + NODE_H / 2;
    const childXs = fam.children.map((id) => pos.get(id)!.x);
    const childTopY = Math.min(...fam.children.map((id) => pos.get(id)!.y)) - NODE_H / 2;
    const busY = parentBottomY + (childTopY - parentBottomY) / 2;
    // tronco
    edges.push({ x1: parentMidX, y1: parentBottomY, x2: parentMidX, y2: busY, key: `trunk-${key}` });
    // barra horizontal
    const minCx = Math.min(...childXs);
    const maxCx = Math.max(...childXs);
    edges.push({ x1: minCx, y1: busY, x2: maxCx, y2: busY, key: `bus-${key}` });
    // bajadas a cada hijo
    for (const cid of fam.children) {
      const cx = pos.get(cid)!.x;
      edges.push({ x1: cx, y1: busY, x2: cx, y2: childTopY, key: `drop-${key}-${cid}` });
    }
  }

  return (
    <>
      <div style={{ position: 'relative', width, height, margin: '0 auto', background: '#FDF6E3', borderRadius: 16, overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '2px solid #D4A373' }}>
      <svg width={width} height={height} viewBox={`${minX} ${minY} ${width} ${height}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {edges.map((e) => (
          <line key={e.key} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#8B4513" strokeWidth={2.5} strokeLinecap="round" />
        ))}
      </svg>
      {Array.from(pos.entries()).map(([id, pt]) => {
        const p = byId.get(id);
        const isCenter = id === centerId;
        const url = photoUrls?.[id];
        const sub = p?.birthDate?.year ? `n. ${p.birthDate.year}${ageText(p) ? ` (${ageText(p)})` : ''}` : (p?.lifeStatus === 'deceased' ? 'fallecido' : '');
        return (
          <div
            key={id}
            onClick={() => onSelectPerson?.(id)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenu({ x: e.clientX, y: e.clientY, id });
            }}
            style={{
              position: 'absolute',
              left: pt.x - minX - NODE_W / 2,
              top: pt.y - minY - NODE_H / 2,
              width: NODE_W,
              minHeight: NODE_H,
              background: isCenter ? '#FFF3B0' : '#FFFFFF',
              border: isCenter ? '3px solid #E8872E' : '2px solid #D4A373',
              borderRadius: 14,
              padding: 10,
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              textAlign: 'center',
              boxSizing: 'border-box',
              fontFamily: 'Georgia, serif',
            }}
          >
            <button
              type='button'
              onClick={(e) => { e.stopPropagation(); const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); setMenu({ x: rect.left, y: rect.bottom + 4, id }); }}
              style={{ position: 'absolute', top: 6, right: 6, padding: '4px 8px', minHeight: 26, fontSize: 12, borderRadius: 8, background: '#E8872E', color: 'white', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', fontWeight: 600 }}
              aria-label='Opciones'
            >⋯</button>
            {url ? (
              <img src={url} alt={fullName(p)} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #FFF', boxShadow: '0 3px 8px rgba(0,0,0,0.2)', background: '#F4E1D2' }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F4E1D2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#8B4513' }}>👤</div>
            )}
            <div style={{ fontWeight: 700, fontSize: 15, color: '#5C3A21', lineHeight: 1.2, marginTop: 2 }}>{fullName(p)}</div>
            {sub && <div style={{ fontSize: 11, color: '#8B4513', fontStyle: 'italic' }}>{sub}</div>}
            {p?.occupation && <div style={{ fontSize: 11, color: '#5C3A21', fontWeight: 600 }}>{p.occupation}</div>}
            {p?.characteristics && <div style={{ fontSize: 10, color: '#8B4513', fontStyle: 'italic', maxWidth: 180 }}>"{p.characteristics}"</div>}
            {p?.lifeStatus === 'deceased' && <div style={{ fontSize: 11, color: '#8B4513' }}>✝</div>}
          </div>
        );
      })}
      </div>


      {menu && (
        <div style={{ position: 'fixed', left: menu.x, top: menu.y, background: '#FFFDF5', border: '2px solid #D4A373', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 1000, minWidth: 200, padding: 8 }} onClick={(e) => e.stopPropagation()}>
          {[
            { label: 'Centrar aquí', action: () => onSelectPerson?.(menu.id) },
            { label: 'Agregar hijo/a', action: () => onAddChild?.(menu.id) },
            { label: 'Agregar pareja', action: () => onAddSpouse?.(menu.id) },
            { label: 'Agregar padre', action: () => onAddFather?.(menu.id) },
            { label: 'Agregar madre', action: () => onAddMother?.(menu.id) },
            { label: 'Editar', action: () => onEdit?.(menu.id) },
            { label: 'Eliminar', action: () => onDelete?.(menu.id) },
          ].map((opt) => (
            <button
              key={opt.label}
              type='button'
              onClick={() => { opt.action(); setMenu(null); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'white', color: '#5C3A21', border: '1px solid #D4A373', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
