import React from "react";
import type { Person } from '../../core/db/schema';

/**
 * PersonCard — Tarjeta premium de persona.
 * Estética: álbum familiar antiguo. Fotografía principal, nombre, años de vida,
 * ubicación, biografía corta y relaciones importantes.
 * Estados: sin foto / foto cargada / fallecido / vivo.
 */
export interface PersonCardProps {
  person: Person;
  photoUrl?: string;
  onSelect?: (id: string) => void;
  compact?: boolean;
  showRelationships?: boolean;
  deceasedMark?: boolean;
  className?: string;
}

function formatLifeDates(p: Person): string {
  const birth = p.birthDate?.year ? String(p.birthDate.year) : '—';
  const death = p.deathDate?.year ? String(p.deathDate.year) : '—';
  if (p.lifeStatus === 'deceased' && p.deathDate?.year) {
    return `${birth} – ${death}`;
  }
  if (p.lifeStatus === 'alive') {
    return `${birth} – presente`;
  }
  return `${birth} – ?`;
}

function getPlace(p: Person): string {
  const place = p.birthplace?.name || p.deathPlace?.name;
  if (!place) return '—';
  const parts = [place].filter(Boolean);
  return parts.length ? parts.join(', ') : place;
}

export const PersonCard = React.forwardRef<
  HTMLDivElement,
  PersonCardProps
>(
  (
    {
      person,
      photoUrl,
      onSelect,
      compact = false,
      showRelationships = true,
      deceasedMark = true,
      className = '',
    },
    ref,
  ) => {
    const deceased = person.lifeStatus === 'deceased';
    const lifeText = formatLifeDates(person);
    const place = getPlace(person);

    return (
      <div
        ref={ref}
        className={`
          bg-surface border border-border rounded-xl shadow-md
          p-4 sm:p-6 transition-all duration-300
          hover:shadow-lg hover:-translate-y-1 cursor-pointer
          ${compact ? 'p-3 sm:p-4' : ''}
          ${className}
        `.trim()}
        style={{
          borderColor: deceased
            ? 'var(--color-life-deceased)'
            : 'var(--color-border)',
        }}
        onClick={() => onSelect?.(person.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(person.id);
          }
        }}
      >
        {/* Cabecera con foto y estado de vida */}
        <div className="relative mb-3 sm:mb-4 min-h-[140px] sm:min-h-[180px]">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${person.firstName} ${person.lastName ?? ''}`}
              className="w-full h-full object-cover rounded-lg shadow-md"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div
              className="w-full h-full bg-parchment rounded-lg flex items-center justify-center shadow-inner"
              style={{ color: 'var(--color-sepia)' }}
            >
              <span className="text-3xl sm:text-4xl">📷</span>
            </div>
          )}
          {deceased && deceasedMark && (
            <span className="absolute -right-2 -bottom-2 bg-wood text-surface text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-widest">
              ✝
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 sm:gap-2">
          {/* Nombre */}
          <h3 className={`text-lg sm:text-xl font-semibold text-ink font-serif-titles leading-tight ${compact ? 'text-base sm:text-lg' : ''}`}>
            {person.firstName} {person.lastName ?? ''}
          </h3>

          {/* Años de vida */}
          <p className={`text-sm sm:text-base text-wood font-serif-content ${compact ? 'text-sm' : 'text-base'}`}>
            {lifeText}
          </p>

          {/* Ubicación */}
          {place && place !== '—' && (
            <p className="flex items-center gap-1.5 text-xs sm:text-sm text-forest">
              <span className="text-xs">📍</span>
              <span>{place}</span>
            </p>
          )}

          {/* Biografía corta */}
          {person.biography && !compact && (
            <p className="mt-2 text-sm sm:text-base text-ink font-serif-content line-clamp-2 leading-relaxed">
              {person.biography}
            </p>
          )}

          {/* Relaciones importantes */}
          {showRelationships && !compact && false && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-wood uppercase tracking-wider mb-2">
                Conexiones familiares
              </p>
              <div className="flex flex-wrap gap-2">
                {[].map((rel: any) => (
                  <span key={rel.id} className="px-2 py-1 text-[10px] bg-paper border border-parchment rounded-full text-wood font-medium">
                    {rel.type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

PersonCard.displayName = 'PersonCard';