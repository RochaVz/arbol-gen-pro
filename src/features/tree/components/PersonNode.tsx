import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Person } from '../../../core/db/schema';

export interface PersonNodeProps {
  person: Person;
  photoUrl?: string;
  isCenter?: boolean;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onDrag?: (id: string, x: number, y: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  gender?: 'male' | 'female' | 'other';
  relationshipStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'adopted';
}

const SIZE_MAP: Record<string, { w: number; h: number; avatar: number; padding: number }> = {
  sm: { w: 200, h: 120, avatar: 56, padding: 12 },
  md: { w: 240, h: 140, avatar: 72, padding: 16 },
  lg: { w: 280, h: 160, avatar: 88, padding: 20 },
};

const GENDER_COLORS: Record<string, string> = {
  male: 'var(--color-gender-male)',
  female: 'var(--color-gender-female)',
  other: 'var(--color-gender-other)',
};

const STATUS_COLORS: Record<string, string> = {
  single: 'var(--color-border)',
  married: 'var(--color-marriage)',
  divorced: 'var(--color-divorce)',
  widowed: 'var(--color-warning)',
  adopted: 'var(--color-adoption)',
};

export const PersonNode = React.forwardRef<HTMLDivElement, PersonNodeProps>(
  ({ person, photoUrl, isCenter = false, isSelected = false, onSelect, onDrag, size = 'md', className = '', style, gender = 'other', relationshipStatus = 'single' }, ref) => {
    const cfg = SIZE_MAP[size];
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

    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const dragRef = useRef<HTMLDivElement>(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

    const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('button')) return;
      if ((e.target as HTMLElement).closest('input, select, textarea')) return;
      setIsDragging(true);
      const rect = dragRef.current?.getBoundingClientRect();
      if (rect) {
        setDragPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
      e.preventDefault();
    }, []);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
      if (!isDragging) return;
      const rect = dragRef.current?.getBoundingClientRect();
      if (rect) {
        const newX = e.clientX - dragPosition.x;
        const newY = e.clientY - dragPosition.y;
        onDrag?.(person.id, newX, newY);
      }
    }, [isDragging, dragPosition, person.id, onDrag]);

    const onMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    const onDoubleClick = useCallback(() => {
      onSelect(person.id);
    }, [person.id, onSelect]);

    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          opacity: isDragging ? 0.7 : 1,
          scale: isDragging ? 0.95 : 1,
          boxShadow: isDragging
            ? 'var(--shadow-xl)'
            : isSelected
            ? 'var(--shadow-lg)'
            : isHovered
            ? 'var(--shadow-md)'
            : 'var(--shadow-sm)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'absolute',
          left: style?.left ?? 0,
          top: style?.top ?? 0,
          width: cfg.w,
          ...style,
        }}
        className={
          `
          relative flex flex-col items-center
          w-[${cfg.w}px]
          p-[${cfg.padding}px]
          bg-surface border border-border rounded-[var(--radius-lg)]
          cursor-grab active:cursor-grabbing
          ${isCenter ? 'border-2 border-primary shadow-lg ring-2 ring-primary/20' : 'border border-border'}
          ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}
          ${deceased ? 'opacity-60 grayscale-25' : ''}
          ${className}
          `
        }
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={onDoubleClick}
        role="button"
        tabIndex={0}
        aria-label={`Perfil de ${name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(person.id);
          }
        }}
      >
        <div className="flex items-center gap-1 mb-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: GENDER_COLORS[gender] }}
            aria-label={gender === 'male' ? 'Hombre' : gender === 'female' ? 'Mujer' : 'Otro'}
          />
          {relationshipStatus !== 'single' && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium border border-current"
              style={{
                borderColor: STATUS_COLORS[relationshipStatus],
                color: STATUS_COLORS[relationshipStatus],
              }}
            >
              {relationshipStatus === 'married' ? 'Casado/a' : relationshipStatus === 'divorced' ? 'Divorciado/a' : relationshipStatus === 'widowed' ? 'Viudo/a' : 'Adoptado/a'}
            </span>
          )}
          {isCenter && (
            <span className="ml-auto px-2 py-0.5 rounded bg-primary text-[10px] font-bold text-surface uppercase tracking-wider">
              Tú
            </span>
          )}
        </div>

        <div className="relative mb-2">
          <div
            className="relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-border"
            style={{
              width: cfg.avatar,
              height: cfg.avatar,
              backgroundColor: deceased ? 'var(--color-border)' : 'var(--color-surface-hover)',
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface/50 text-text-muted">
                <span className="text-[20px]">👤</span>
              </div>
            )}
            {deceased && (
              <span className="absolute -right-1 -bottom-1 w-4 h-4 bg-surface border border-white rounded-full flex items-center justify-center text-[10px] font-bold">
                ✝
              </span>
            )}
          </div>
        </div>

        <h3
          className="text-sm font-semibold text-text font-sans leading-tight text-center truncate"
          title={name}
        >
          {name}
        </h3>

        <p className="text-[11px] text-text-secondary font-medium text-center leading-tight">
          {lifeText}
        </p>

        <AnimatePresence>
          {isHovered && !isDragging && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex gap-1 mt-1"
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSelect(person.id); }}
                className="w-6 h-6 rounded-md bg-surface border border-border flex items-center justify-center text-[10px] hover:bg-primary/10 hover:text-primary transition-all"
                title="Ver perfil"
              >
                👁️
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); }}
                className="w-6 h-6 rounded-md bg-surface border border-border flex items-center justify-center text-[10px] hover:bg-warning/10 hover:text-warning transition-all"
                title="Editar"
              >
                ✏️
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

PersonNode.displayName = 'PersonNode';