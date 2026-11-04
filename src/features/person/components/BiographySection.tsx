import React from "react";
import type { Person } from '../../../core/db/schema';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

export interface BiographySectionProps {
  person: Person;
  onEdit: () => void;
  className?: string;
}

export const BiographySection = React.forwardRef<
  HTMLDivElement,
  BiographySectionProps
>(
  ({ person, onEdit, className = '' }, ref) => {
    if (!person.biography && !person.notes) {
      return null;
    }

    return (
      <Card
        ref={ref}
        radius="lg"
        className={`
          bg-surface border border-border shadow-sm
          ${className}
        `.trim()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg font-semibold text-ink font-serif-titles">
              Biografía
            </h3>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Editar
            </Button>
          </div>

          <div className="space-y-4">
            {person.biography && (
              <div className="text-base text-ink font-serif-content leading-relaxed">
                {person.biography.split('\n').map((para, i) => (
                  <p key={i} className="mb-4 last:mb-0">
                    {para}
                  </p>
                ))}
              </div>
            )}
            {person.notes && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-wood uppercase tracking-wider font-medium mb-2">
                  Notas personales
                </p>
                <p className="text-sm text-ink font-serif-content leading-relaxed italic">
                  {person.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  },
);

BiographySection.displayName = 'BiographySection';