import React from "react";
import type { Person } from '../../../core/db/schema';
import { Card } from '../../../shared/components/ui/Card';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { Button } from '../../../shared/components/ui/Button';

export interface PersonHeaderProps {
  person: Person;
  photoUrl?: string;
  onEdit: () => void;
  onAddPhoto: () => void;
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
  const place = p.birthplace || p.deathPlace;
  if (!place?.name) return '—';
  const parts = [place.city, place.region, place.country].filter(Boolean);
  return parts.length ? parts.join(', ') : place.name;
}

export const PersonHeader = React.forwardRef<
  HTMLDivElement,
  PersonHeaderProps
>(
  ({ person, photoUrl, onEdit, onAddPhoto, className = '' }, ref) => {
    const deceased = person.lifeStatus === 'deceased';
    const lifeText = formatLifeDates(person);
    const place = getPlace(person);

    return (
      <Card
        ref={ref}
        elevated
        radius="xl"
        className={`
          bg-surface-elevated border border-parchment shadow-xl
          overflow-hidden relative ${className}
        `.trim()}
      >
        {/* Foto principal a ancho completo */}
        <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden bg-parchment">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${person.firstName} ${person.lastName ?? ''}`}
              className="w-full h-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-sepia/30">
              🖼️
            </div>
          )}
          {deceased && (
            <span className="absolute top-4 right-4 bg-wood text-surface text-xs font-bold px-2 py-1 rounded-full shadow-md uppercase tracking-widest">
              ✝
            </span>
          )}
        </div>

        {/* Contenido del header */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-8">
            {/* Avatar + nombre */}
            <div className="flex-shrink-0 sm:flex-shrink-0">
              <Avatar
                src={photoUrl}
                name={`${person.firstName} ${person.lastName ?? ''}`}
                size="lg"
                deceased={deceased}
                className="ring-4 ring-surface ring-offset-2 ring-offset-parchment shadow-lg"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-ink font-serif-titles mb-1 leading-tight">
                {person.firstName} {person.lastName ?? ''}
              </h1>

              <p className="text-xl text-wood font-serif-content mb-1">
                {lifeText}
              </p>

              {place && place !== '—' && (
                <p className="flex items-center gap-2 text-sm sm:text-base text-forest">
                  <span>📍</span>
                  <span>{place}</span>
                </p>
              )}
            </div>

            {/* Acciones */}
            <div className="flex gap-2 sm:gap-3 self-start sm:self-center">
              <Button size="sm" variant="ghost" onClick={onAddPhoto}>
                📷 Foto
              </Button>
              <Button size="sm" onClick={onEdit}>
                Editar
              </Button>
            </div>
          </div>

          {/* Biografía corta si existe */}
          {person.biography && (
            <div className="mt-6 sm:mt-8 pt-6 border-t border-border">
              <p className="text-base text-ink font-serif-content leading-relaxed italic">
                "{person.biography}"
              </p>
            </div>
          )}
        </div>
      </Card>
    );
  },
);

PersonHeader.displayName = 'PersonHeader';