import React from "react";
import type { Person } from '../../../core/db/schema';
import { Button } from '../../../shared/components/ui/Button';

export interface FeaturedTreeProps {
  title: string;
  subtitle: string;
  members: Person[];
  photoUrl?: string;
  onViewTree: () => void;
  onAddMember: () => void;
  className?: string;
}

export const FeaturedTree = React.forwardRef<
  HTMLDivElement,
  FeaturedTreeProps
>(
  ({ title, subtitle, members, photoUrl, onViewTree, onAddMember, className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden
          hover:shadow-2xl transition-all duration-300 ${className}
        `.trim()}
      >
        {/* Foto destacada del árbol / familia */}
        <div className="relative h-64 sm:h-80 overflow-hidden bg-gradient-to-br from-primary-100 to-primary-50">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl text-primary-300">
              🌳
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-titles mb-2">
              {title}
            </h2>
            <p className="text-base sm:text-lg text-neutral-100 font-serif-content mb-6">
              {subtitle}
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button variant="primary" size="md" onClick={onViewTree}>
                🌳 Explorar árbol
              </Button>
              <Button variant="secondary" size="md" onClick={onAddMember}>
                ➕ Agregar miembro
              </Button>
            </div>
          </div>
        </div>

        {/* Miembros destacados (avatares) */}
        <div className="p-8 border-t-2 border-neutral-200 bg-neutral-50">
          <p className="text-xs text-neutral-600 uppercase tracking-wider font-bold mb-6">
            👥 {members.length} Miembros de esta familia
          </p>
          <div className="flex flex-wrap gap-4">
            {members.slice(0, 8).map((member) => (
              <div key={member.id} className="relative group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-200 to-primary-100 border-3 border-white shadow-md hover:shadow-lg transition-all group-hover:scale-110 flex items-center justify-center font-bold text-2xl">
                  {member.firstName.charAt(0)}
                </div>
                {member.lifeStatus === 'deceased' && (
                  <span className="absolute -right-2 -bottom-2 bg-neutral-800 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                    ✝
                  </span>
                )}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {member.firstName} {member.lastName}
                </div>
              </div>
            ))}
            {members.length > 8 && (
              <div className="w-16 h-16 bg-white border-3 border-neutral-300 rounded-full flex items-center justify-center font-bold text-primary-600 text-lg shadow-md">
                +{members.length - 8}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

FeaturedTree.displayName = 'FeaturedTree';