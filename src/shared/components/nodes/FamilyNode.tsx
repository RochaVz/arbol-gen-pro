import React from 'react';
import {
  Handle,
  Position,
  type NodeProps,
} from 'reactflow';
import { User, MapPin, Calendar } from 'lucide-react';
import type { Person } from '../../../core/db';
import { cn } from '../../utils/cn';
import { partialDateToString } from '../../utils/date';

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

  // Determine gender icon color (handle undefined sex)
  const genderColor = person?.sex === 'male' ? '#3b82f6' : '#ec4899';

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-lg border-2 p-3 w-64 cursor-pointer transition-all duration-200',
        selected ? 'border-primary-600 shadow-xl' : 'border-slate-200',
        isTreeCenter && 'ring-4 ring-accent-300 ring-offset-2',
        !isAlive && 'opacity-75'
      )}
    >
      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* Header with Gender Indicator */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {isTreeCenter && (
            <div className="inline-block bg-accent-100 text-accent-700 text-xs font-bold px-2 py-1 rounded-full mb-1">
              Centro del Árbol
            </div>
          )}
          <h3 className="font-bold text-sm text-slate-900 truncate">{label}</h3>
        </div>

        {/* Gender Indicator */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0 ml-2"
          style={{ backgroundColor: genderColor }}
          title={person?.sex === .male. ? 'Masculino' : 'Femenino'}
        />
      </div>

      {/* Photo */}
      {photoUrl ? (
        <div className="mb-3 overflow-hidden">
          <img
            src={photoUrl}
            alt={label}
            className="w-full h-40 object-cover rounded-lg"
          />
        </div>
      ) : (
        <div className="mb-3 w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
          <User className="w-12 h-12 text-slate-400" />
        </div>
      )}

      {/* Dates */}
      <div className="space-y-1 text-xs text-slate-600">
        {person.birthDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>
              Nac.:{' '}
              {partialDateToString(person.birthDate as any)}
            </span>
          </div>
        )}

        {person.deathDate && (
          <div className="flex items-center gap-1 text-red-600">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>
              Fall.:{' '}
              {partialDateToString(person.deathDate as any)}
            </span>
          </div>
        )}

        {person.birthplace && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{person.birthplace.name}</span>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <span
          className={cn(
            'inline-block text-xs font-semibold px-2 py-1 rounded-full',
            isAlive
              ? 'bg-green-100 text-green-700'
              : 'bg-slate-100 text-slate-700'
          )}
        >
          {isAlive ? 'Vivo' : 'Fallecido'}
        </span>
      </div>
    </div>
  );
};
