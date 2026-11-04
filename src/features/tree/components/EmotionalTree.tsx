import React from "react";
import type { Person } from '../../../core/db/schema';
import type { Relationship } from '../../../core/db/schema';
import { TreeNode } from './TreeNode';
import { ConnectionLine } from './ConnectionLine';
import { computeLayout, NODE_W, NODE_H, spousesOf, parentsOf } from '../utils/treeLayout';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

export interface EmotionalTreeProps {
  persons: Person[];
  relationships: Relationship[];
  centerId: string | null;
  depth?: number;
  onSelectPerson: (id: string) => void;
  photoUrls?: Record<string, string>;
  onAddParent?: (id: string) => void;
  onAddChild?: (id: string) => void;
  onAddPartner?: (id: string) => void;
  className?: string;
}

export const EmotionalTree = React.forwardRef<
  HTMLDivElement,
  EmotionalTreeProps
>(
  ({
    persons,
    relationships,
    centerId,
    depth = 3,
    onSelectPerson,
    photoUrls = {},
    onAddParent,
    onAddChild,
    onAddPartner,
    className = '',
  }, ref) => {
    const byId = new Map(persons.map((p) => [p.id, p]));

    if (!centerId) {
      return (
        <Card radius="lg" className={`
          bg-surface border border-border shadow-sm text-center py-12
          ${className}
        `.trim()}>
          <div className="text-4xl mb-3">🌳</div>
          <h3 className="text-lg font-semibold text-ink font-serif-titles mb-2">
            Selecciona una persona para ver su árbol
          </h3>
          <p className="text-wood text-sm font-serif-content">
            Toca a cualquier familiar para explorar sus conexiones.
          </p>
        </Card>
      );
    }

    const layout = computeLayout(centerId, depth, 'branch', relationships);
    const { pos, width, height } = layout;

    return (
      <div
        ref={ref}
        className={`
          w-full h-full relative bg-surface/30 rounded-xl border border-border/50
          overflow-auto touch-none
          ${className}
        `.trim()}
        style={{ minHeight: '600px' }}
      >
        {/* Capa de conexiones (SVG detrás de los nodos) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {renderSpouseLines()}
          {renderFamilyLines()}
        </svg>

        {/* Nodos (personas) */}
        <div
          className="relative w-full h-full"
          style={{
            width,
            height,
            transformOrigin: 'top left',
          }}
        >
          {Array.from(pos.entries()).map(([id, pt]) => {
            const person = byId.get(id);
            if (!person) return null;
            const isCenter = id === centerId;

            return (
              <TreeNode
                key={id}
                person={person}
                photoUrl={photoUrls[id]}
                isCenter={isCenter}
                onSelect={onSelectPerson}
                size={isCenter ? 'lg' : 'md'}
                style={{
                  position: 'absolute',
                  left: pt.x - NODE_W / 2,
                  top: pt.y - NODE_H / 2,
                }}
              />
            );
          })}
        </div>

        {/* Acciones rápidas (solo móvil visible, fijo abajo) */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 sm:hidden">
          {onAddParent && (
            <Button size="sm" variant="ghost" onClick={() => onAddParent!(centerId!)}>
              Padre/Madre
            </Button>
          )}
          {onAddPartner && (
            <Button size="sm" variant="ghost" onClick={() => onAddPartner!(centerId!)}>
              Pareja
            </Button>
          )}
          {onAddChild && (
            <Button size="sm" onClick={() => onAddChild!(centerId!)}>Hijo/a</Button>
          )}
        </div>
      </div>
    );

    function renderSpouseLines() {
      const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
      const seen = new Set<string>();
      for (const id of pos.keys()) {
        for (const sid of spousesOf(id, relationships)) {
          if (!pos.has(sid)) continue;
          const key = [id, sid].sort().join('-');
          if (seen.has(key)) continue;
          seen.add(key);
          const a = pos.get(id)!;
          const b = pos.get(sid)!;
          edges.push({
            x1: Math.min(a.x, b.x) + NODE_W / 2,
            y1: Math.min(a.y, b.y),
            x2: Math.max(a.x, b.x) - NODE_W / 2,
            y2: Math.min(a.y, b.y),
          });
        }
      }
      return edges.map((e, i) => (
        <ConnectionLine
          key={`spouse-${i}`}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          type="spouse"
        />
      ));
    }

    function renderFamilyLines() {
      const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
      for (const id of pos.keys()) {
        const parentIds = parentsOf(id, relationships);
        for (const pid of parentIds) {
          if (!pos.has(pid)) continue;
          const a = pos.get(id)!;
          const b = pos.get(pid)!;
          edges.push({
            x1: a.x,
            y1: a.y - NODE_H / 2 - 4,
            x2: b.x,
            y2: b.y + NODE_H / 2 + 4,
          });
        }
      }
      return edges.map((e, i) => (
        <ConnectionLine
          key={`family-${i}`}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          type="parent-child"
        />
      ));
    }
  },
);

EmotionalTree.displayName = 'EmotionalTree';