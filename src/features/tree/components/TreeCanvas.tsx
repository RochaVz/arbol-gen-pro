import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { Person } from '../../../core/db/schema';
import type { Relationship } from '../../../core/db/schema';

export interface TreeCanvasProps {
  persons: Person[];
  relationships: Relationship[];
  centerId: string | null;
  onSelectPerson: (id: string) => void;
  onAddPerson?: (kind: 'father' | 'mother' | 'spouse' | 'child', parentId?: string) => void;
  onEditPerson?: (id: string) => void;
  onDragNode?: (id: string, x: number, y: number) => void;
  nodePositions?: Record<string, { x: number; y: number }>;
  onSavePositions?: (positions: Record<string, { x: number; y: number }>) => void;
  className?: string;
}

interface CanvasState {
  scale: number;
  offsetX: number;
  offsetY: number;
  isPanning: boolean;
  panStart: { x: number; y: number } | null;
}

export const TreeCanvas = React.forwardRef<HTMLDivElement, TreeCanvasProps>(
  ({ persons, relationships, centerId, onSelectPerson, onAddPerson, onEditPerson, onDragNode, nodePositions = {}, onSavePositions, className = '' }, ref) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState<CanvasState>({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      isPanning: false,
      panStart: null,
    });
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);
    const positionsRef = useRef<Record<string, { x: number; y: number }>>(nodePositions);

    useEffect(() => {
      positionsRef.current = nodePositions;
    }, [nodePositions]);

    useEffect(() => {
      if (onSavePositions) {
        const timer = setTimeout(() => onSavePositions(positionsRef.current), 500);
        return () => clearTimeout(timer);
      }
    }, [onSavePositions]);

    const transform = `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`;

    const handleWheel = useCallback((e: React.WheelEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = -e.deltaY;
      const zoomSpeed = 0.001;
      const newScale = Math.min(Math.max(0.3, state.scale + delta * zoomSpeed), 2);
      const scaleChange = newScale - state.scale;
      const newOffsetX = state.offsetX - mouseX * scaleChange + mouseX * scaleChange * (state.scale / newScale);
      const newOffsetY = state.offsetY - mouseY * scaleChange + mouseY * scaleChange * (state.scale / newScale);
      setState(prev => ({
        ...prev,
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      }));
    }, [state.scale, state.offsetX, state.offsetY]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest('[draggable="true"]')) return;
      setState(prev => ({
        ...prev,
        isPanning: true,
        panStart: { x: e.clientX - prev.offsetX, y: e.clientY - prev.offsetY },
      }));
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (!state.isPanning || !state.panStart) return;
      setState(prev => ({
        ...prev,
        offsetX: e.clientX - prev.panStart.x,
        offsetY: e.clientY - prev.panStart.y,
      }));
    }, [state.isPanning, state.panStart, state.offsetX, state.offsetY]);

    const handleMouseUp = useCallback(() => {
      setState(prev => ({
        ...prev,
        isPanning: false,
        panStart: null,
      }));
    }, []);

    const handleContextMenu = useCallback((e: React.MouseEvent, id: string) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, id });
    }, []);

    const closeContextMenu = useCallback(() => {
      setContextMenu(null);
    }, []);

    useEffect(() => {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('click', closeContextMenu);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('click', closeContextMenu);
      };
    }, [handleMouseMove, handleMouseUp, closeContextMenu]);

    const handleDragNode = useCallback((id: string, x: number, y: number) => {
      positionsRef.current[id] = { x, y };
      onDragNode?.(id, x, y);
    }, [onDragNode]);

    const byId = new Map(persons.map(p => [p.id, p]));

    return (
      <div
        ref={ref}
        className={`relative w-full h-full bg-background overflow-hidden ${className}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        style={{ touchAction: 'none' }}
      >
        <motion.div
          ref={contentRef}
          style={{
            transform,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
          className="relative w-full h-full"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(var(--color-border) 1px, transparent 1px),
                linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              opacity: state.scale > 0.7 ? 0.5 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />

          {positionsRef.current[centerId] && persons.map((person) => {
            const pos = positionsRef.current[person.id];
            if (!pos) return null;
            const isCenter = person.id === centerId;

            return (
              <PersonNodeCanvas
                key={person.id}
                person={person}
                photoUrl={undefined}
                x={pos.x}
                y={pos.y}
                isCenter={isCenter}
                isSelected={selectedNode === person.id}
                onSelect={onSelectPerson}
                onDrag={handleDragNode}
                onContextMenu={(e) => handleContextMenu(e, person.id)}
                onEdit={onEditPerson}
              />
            );
          })}
        </motion.div>

        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
          <button
            onClick={() => setState(prev => ({ ...prev, scale: Math.min(2, prev.scale + 0.1) }))}
            className="w-8 h-8 bg-surface border border-border rounded-lg flex items-center justify-center text-text shadow-md hover:bg-surface-hover transition-colors"
            title="Acercar"
          >
            +
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, scale: Math.max(0.3, prev.scale - 0.1) }))}
            className="w-8 h-8 bg-surface border border-border rounded-lg flex items-center justify-center text-text shadow-md hover:bg-surface-hover transition-colors"
            title="Alejar"
          >
            −
          </button>
          <button
            onClick={() => setState({ scale: 1, offsetX: 0, offsetY: 0, isPanning: false, panStart: null })}
            className="w-8 h-8 bg-surface border border-border rounded-lg flex items-center justify-center text-text shadow-md hover:bg-surface-hover transition-colors"
            title="Restablecer vista"
          >
            ↻
          </button>
        </div>

        {contextMenu && (
          <div
            className="fixed z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <ContextMenuPerson
              id={contextMenu.id}
              person={byId.get(contextMenu.id) ?? undefined}
              onSelect={onSelectPerson}
              onAddPerson={onAddPerson}
              onEdit={onEditPerson}
              onClose={closeContextMenu}
            />
          </div>
        )}
      </div>
    );
  },
);

TreeCanvas.displayName = 'TreeCanvas';

interface PersonNodeCanvasProps {
  person: Person;
  photoUrl?: string;
  x: number;
  y: number;
  isCenter: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onEdit?: (id: string) => void;
}

const PersonNodeCanvas = React.forwardRef<HTMLDivElement, PersonNodeCanvasProps>(
  ({ person, photoUrl, x, y, isCenter, isSelected, onSelect, onDrag, onContextMenu, onEdit }, ref) => {
    const deceased = person.lifeStatus === 'deceased';
    const name = `${person.firstName} ${person.lastName ?? ''}`;
    const birth = person.birthDate?.year ? String(person.birthDate.year) : '—';
    const death = person.deathDate?.year ? String(person.deathDate.year) : '—';
    const lifeText =
      deceased && person.deathDate?.year
        ? `${birth} – ${death}`
        : person.lifeStatus === 'alive'
        ? `${birth} – presente`
        : `${birth} – ?`;

    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          scale: isSelected ? 1.05 : 1,
          boxShadow: isSelected
            ? 'var(--shadow-xl)'
            : isCenter
            ? 'var(--shadow-lg)'
            : 'var(--shadow-md)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 240,
        }}
        className="
          relative flex flex-col items-center p-4
          bg-surface border border-border rounded-2xl
          cursor-grab active:cursor-grabbing
          transition-all duration-300
          shadow-md
        "
        onContextMenu={(e) => onContextMenu(e, person.id)}
        onDoubleClick={() => onSelect(person.id)}
        onClick={() => onSelect(person.id)}
        role="button"
        tabIndex={0}
        aria-label={`Perfil de ${name}`}
      >
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
            {isCenter && (
              <span className="ml-auto px-2 py-0.5 rounded bg-primary text-[10px] font-bold text-white uppercase tracking-wider">
                Tú
              </span>
            )}
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(person.id); }}
              className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center text-[10px] hover:bg-surface-hover transition-colors"
              title="Editar"
            >
              ✏️
            </button>
          )}
        </div>

        <div className="relative mb-2">
          <div className="relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-border"
            style={{
              width: 72,
              height: 72,
              backgroundColor: deceased ? 'var(--color-border)' : 'var(--color-surface-hover)',
            }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface/30 text-text-muted">
                <span className="text-[24px]">👤</span>
              </div>
            )}
            {deceased && (
              <span className="absolute -right-1 -bottom-1 w-5 h-5 bg-surface border border-white rounded-full flex items-center justify-center text-[11px] font-bold">
                ✝
              </span>
            )}
          </div>
        </div>

        <h3 className="text-sm font-semibold text-text font-sans leading-tight text-center truncate" title={name}>
          {name}
        </h3>
        <p className="text-[11px] text-text-secondary font-medium text-center leading-tight">
          {lifeText}
        </p>
      </motion.div>
    );
  },
);

PersonNodeCanvas.displayName = 'PersonNodeCanvas';

interface ContextMenuPersonProps {
  id: string;
  person?: Person;
  onSelect: (id: string) => void;
  onAddPerson?: (kind: 'father' | 'mother' | 'spouse' | 'child', parentId?: string) => void;
  onEdit?: (id: string) => void;
  onClose: () => void;
}

const ContextMenuPerson = React.forwardRef<HTMLDivElement, ContextMenuPersonProps>(
  ({ id, person, onSelect, onAddPerson, onEdit, onClose }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="z-50 w-56 bg-surface border border-border rounded-xl shadow-xl overflow-hidden"
        ref={ref}
      >
        <div className="p-2">
          {person && (
            <button
              type="button"
              onClick={() => { onSelect(id); onClose(); }}
              className="w-full px-3 py-2 text-sm text-left text-text hover:bg-surface-hover transition-colors"
            >
              Ver perfil
            </button>
          )}
          <button
            type="button"
            onClick={() => { onEdit?.(id); onClose(); }}
            className="w-full px-3 py-2 text-sm text-left text-text hover:bg-surface-hover transition-colors"
          >
            Editar
          </button>
          <div className="border-t border-border/50 my-1" />
          <button
            type="button"
            onClick={() => { onAddPerson?.('father', id); onClose(); }}
            className="w-full px-3 py-2 text-sm text-left text-text hover:bg-surface-hover transition-colors"
          >
            Agregar padre
          </button>
          <button
            type="button"
            onClick={() => { onAddPerson?.('mother', id); onClose(); }}
            className="w-full px-3 py-2 text-sm text-left text-text hover:bg-surface-hover transition-colors"
          >
            Agregar madre
          </button>
          <button
            type="button"
            onClick={() => { onAddPerson?.('spouse', id); onClose(); }}
            className="w-full px-3 py-2 text-sm text-left text-text hover:bg-surface-hover transition-colors"
          >
            Agregar cónyuge
          </button>
          <button
            type="button"
            onClick={() => { onAddPerson?.('child', id); onClose(); }}
            className="w-full px-3 py-2 text-sm text-left text-text hover:bg-surface-hover transition-colors"
          >
            Agregar hijo/a
          </button>
        </div>
      </motion.div>
    );
  },
);

ContextMenuPerson.displayName = 'ContextMenuPerson';