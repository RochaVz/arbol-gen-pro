import React from "react";
import type { Person } from '../../../core/db/schema';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Avatar } from '../../../shared/components/ui/Avatar';

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
      <Card
        ref={ref}
        elevated
        radius="lg"
        className={`
          bg-surface-elevated border border-parchment shadow-lg
          overflow-hidden ${className}
        `.trim()}
      >
        {/* Foto destacada del árbol / familia */}
        <div className="relative h-48 sm:h-64 overflow-hidden bg-parchment">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-sepia/40">
              🌳
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface/90 to-transparent p-6 sm:p-8">
            <div className="flex items-end justify-between w-full">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-ink font-serif-titles mb-1">
                  {title}
                </h2>
                <p className="text-sm sm:text-base text-wood font-serif-content">
                  {subtitle}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onViewTree}>
                  Ver árbol
                </Button>
                <Button size="sm" onClick={onAddMember}>
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Miembros destacados (avatares) */}
        <div className="p-6 sm:p-8">
          <p className="text-xs text-wood uppercase tracking-wider font-medium mb-4">
            Miembros de esta familia
          </p>
          <div className="flex flex-wrap gap-3 -mt-2">
            {members.slice(0, 6).map((member) => (
              <div key={member.id} className="relative group">
                <Avatar
                  src={undefined}
                  name={`${member.firstName} ${member.lastName ?? ''}`}
                  size="md"
                  deceased={member.lifeStatus === 'deceased'}
                  className="ring-2 ring-surface ring-offset-2 ring-offset-parchment shadow-md"
                />
                {member.lifeStatus === 'deceased' && (
                  <span className="absolute -right-1 -bottom-1 bg-wood text-surface text-[10px] font-bold rounded-full px-1">
                    ✝
                  </span>
                )}
              </div>
            ))}
            {members.length > 6 && (
              <div className="w-12 h-12 bg-parchment border border-border rounded-full flex items-center justify-center text-wood font-semibold text-sm">
                +{members.length - 6}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  },
);

FeaturedTree.displayName = 'FeaturedTree';