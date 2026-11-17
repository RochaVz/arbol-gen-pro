import React from 'react';
import {
  Handle,
  Position,
  type NodeProps,
} from 'reactflow';
import { User } from 'lucide-react';
import type { Person } from '../../../core/db';
import { cn } from '../../utils/cn';

interface FamilyNodeData {
  label: string;
  person: Person;
  photoUrl?: string;
  isAlive: boolean;
  isTreeCenter: boolean;
}

export const FamilyNode: React.FC<NodeProps<FamilyNodeData>> = ({
  data,
  selected,
}) => {
  const { label, person, photoUrl, isAlive, isTreeCenter } = data;

  // Determine gender border color (subtle left border)
  const genderBorderColor = person?.sex === 'male' ? 'border-l-blue-500' : 'border-l-pink-500';

  // Format dates: show year only or compact date
  const birthYear = person.birthDate
    ? new Date(
        typeof person.birthDate === 'string'
          ? person.birthDate
          : (person.birthDate as any).year || 0,
        0,
        1
      ).getFullYear()
    : null;

  const deathYear = person.deathDate
    ? new Date(
        typeof person.deathDate === 'string'
          ? person.deathDate
          : (person.deathDate as any).year || 0,
        0,
        1
      ).getFullYear()
    : null;

  const dateRange = birthYear && deathYear ? `${birthYear}–${deathYear}` : birthYear ? `b. ${birthYear}` : '';

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-l-4 overflow-hidden',
        'w-56 cursor-pointer transition-all duration-200',
        selected ? 'border-primary-500 shadow-lg scale-105' : 'border-slate-200 dark:border-slate-700',
        genderBorderColor,
        isTreeCenter && 'ring-2 ring-accent-400 ring-offset-2 dark:ring-offset-slate-900',
        !isAlive && 'opacity-70 grayscale'
      )}
    >
      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* Avatar section */}
      <div className="relative">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={label}
            className="w-full h-24 object-cover"
          />
        ) : (
          <div className="w-full h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
            <User className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
        )}

        {/* Tree center badge - overlaid on image */}
        {isTreeCenter && (
          <div className="absolute top-1 right-1 bg-accent-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
            ★
          </div>
        )}

        {/* Status indicator - bottom right */}
        <div
          className={cn(
            'absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white shadow-sm',
            isAlive ? 'bg-green-500' : 'bg-slate-500'
          )}
        />
      </div>

      {/* Content section */}
      <div className="p-2.5">
        {/* Name - prominent */}
        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate leading-tight mb-1">
          {label}
        </h3>

        {/* Compact date range */}
        {dateRange && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2 truncate">
            {dateRange}
          </p>
        )}

        {/* Status badge */}
        <span
          className={cn(
            'inline-block text-xs font-semibold px-1.5 py-0.5 rounded',
            isAlive
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          )}
        >
          {isAlive ? 'Vivo' : 'Fallecido'}
        </span>
      </div>
    </div>
  );
};
