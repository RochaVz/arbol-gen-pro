import { useMemo } from 'react';
import type { Person, Relationship } from '../../../core/db/schema';
import { computeLayout, parentsOf, spousesOf, NODE_W, NODE_H } from '../utils/treeLayout';

export interface FamilyTreeProps {
  persons: Person[];
  relationships: Relationship[];
  centerId: string | null;
  depth?: number;
  mode?: 'ancestors' | 'descendants' | 'branch';
  onSelectPerson?: (id: string) => void;
}

function label(p: Person | undefined): string {
  if (!p) return '?';
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ').trim();
  return name || '(sin nombre)';
}

function sublabel(p: Person | undefined): string {
  if (!p) return '';
  const y = p.birthDate?.year;
  const d = p.deathDate?.year;
  if (y && d) return `${y}–${d}`;
  if (y) return `n. ${y}`;
  return p.lifeStatus === 'deceased' ? 'fallecido' : '';
}

export default function FamilyTree({ persons, relationships, centerId, depth = 3, mode = 'branch', onSelectPerson }: FamilyTreeProps) {
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
  for (const [id, pt] of pos) {
    for (const pid of parentsOf(id, relationships)) {
      const p = pos.get(pid);
      if (!p) continue;
      edges.push({ x1: pt.x, y1: pt.y - NODE_H / 2, x2: p.x, y2: p.y + NODE_H / 2, key: `p-${pid}-${id}` });
    }
  }
  const seenSpouse = new Set<string>();
  for (const id of pos.keys()) {
    for (const sid of spousesOf(id, relationships)) {
      if (!pos.has(sid)) continue;
      const key = [id, sid].sort().join('-');
      if (seenSpouse.has(key)) continue;
      seenSpouse.add(key);
      const a = pos.get(id)!;
      const b = pos.get(sid)!;
      edges.push({ x1: a.x + NODE_W / 2, y1: a.y, x2: b.x - NODE_W / 2, y2: b.y, key: `s-${key}` });
    }
  }

  return (
    <div style={{ overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
      <svg width={width} height={height} viewBox={`${minX} ${minY} ${width} ${height}`} style={{ display: 'block' }}>
        {edges.map((e) => (
          <line key={e.key} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#9ca3af" strokeWidth={1.5} />
        ))}
        {Array.from(pos.entries()).map(([id, pt]) => {
          const p = byId.get(id);
          const isCenter = id === centerId;
          return (
            <g key={id} transform={`translate(${pt.x - NODE_W / 2}, ${pt.y - NODE_H / 2})`} style={{ cursor: 'pointer' }} onClick={() => onSelectPerson?.(id)}>
              <rect width={NODE_W} height={NODE_H} rx={8} ry={8} fill={isCenter ? '#dbeafe' : '#ffffff'} stroke={isCenter ? '#2563eb' : '#d1d5db'} strokeWidth={isCenter ? 2 : 1} />
              <text x={NODE_W / 2} y={18} textAnchor="middle" fontSize={12} fontWeight={600} fill="#111827">{label(p)}</text>
              <text x={NODE_W / 2} y={34} textAnchor="middle" fontSize={10} fill="#6b7280">{sublabel(p)}</text>
              {p?.lifeStatus === 'deceased' && (
                <text x={NODE_W / 2} y={48} textAnchor="middle" fontSize={9} fill="#9ca3af">†</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
