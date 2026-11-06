import React, { useState, useCallback, useRef } from "react";
import type { Person } from '../../../core/db/schema';
import { Avatar } from '../../../shared/components/ui/Avatar';

export interface TreeNodeProps {
  person: Person;
  photoUrl?: string;
  isCenter?: boolean;
  onSelect: (id: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP: Record<string, { w: string; h: string; avatar: 'sm' | 'md' | 'lg'; padding: string }> = {
  sm: { w: 'w-24 h-32', h: 'h-32', avatar: 'sm', padding: 'p-2' },
  md: { w: 'w-32 h-40', h: 'h-40', avatar: 'md', padding: 'p-3' },
  lg: { w: 'w-40 h-48', h: 'h-48', avatar: 'lg', padding: 'p-4' },
};

export const TreeNode = React.forwardRef<HTMLDivElement, TreeNodeProps>(
  ({ person, photoUrl, isCenter = false, onSelect, size = 'md', className = '', style }, ref) => {
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
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const dragRef = useRef<HTMLDivElement>(null);

    const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLButtonElement).tagName === 'BUTTON') return;
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - (dragRef.current?.getBoundingClientRect().left || 0),
        y: e.clientY - (dragRef.current?.getBoundingClientRect().top || 0),
      });
      e.preventDefault();
    }, []);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
      if (!isDragging) return;
      setDragOffset({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }, [isDragging, dragOffset]);

    const onMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    return (
      <div
        ref={ref}
        style={style}
        className={
          `
          relative flex flex-col items-center
          ${cfg.w} ${cfg.padding}
          bg-surface border rounded-xl shadow-md
          transition-all duration-300
          cursor-grab
          ${isCenter ? 'border-2 border-accent shadow-lg scale-105' : 'border border-border'}
          ${deceased ? 'border-border/50' : ''}
          ${className}
          
          `
        }
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(person.id);
          }
        }}
      >
        {/* Avatar */}
        <div className="relative mb-2 sm:mb-3">
          <Avatar
            src={photoUrl}
            name={name}
            size={cfg.avatar}
            deceased={deceased}
            className="shadow-md"
          />
        </div>

        {/* Nombre */}
        <h4
          className={`text-sm sm:text-base font-semibold text-ink font-serif-titles leading-tight text-center ${isCenter ? 'text-ink' : 'text-wood'}`}
        >
          {name}
        </h4>

        {/* Años de vida */}
        <p className="text-xs text-xs sm:text-sm text-forest text-center leading-tight">
          {lifeText}
        </p>

        {/* Marca de centro */}
        {isCenter && (
          <span className="absolute -top-2 -right-2 bg-accent text-surface text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md uppercase tracking-widest">
            Tú
          </span>
        )}
      </div>
    );
  }
);

TreeNode.displayName = 'TreeNode';