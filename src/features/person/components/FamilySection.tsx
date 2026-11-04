import React from "react";
import type { Person } from '../../../core/db/schema';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

export interface FamilySectionProps {
  sectionTitle: string;
  icon: string;
  people: Person[];
  onSelectPerson: (id: string) => void;
  onAdd: () => void;
  emptyMessage: string;
  showAddButton?: boolean;
  className?: string;
}

export const FamilySection = React.forwardRef<
  HTMLDivElement,
  FamilySectionProps
>(
  ({
    sectionTitle,
    icon,
    people,
    onSelectPerson,
    onAdd,
    emptyMessage,
    showAddButton = true,
    className = '',
  }, ref) => {
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
            <div className="flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <h3 className="text-lg font-semibold text-ink font-serif-titles">
                {sectionTitle}
              </h3>
            </div>
            {showAddButton && (
              <Button size="sm" variant="ghost" onClick={onAdd}>
                Agregar
              </Button>
            )}
          </div>

          {people.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-2 block">{icon}</span>
              <p className="text-wood text-sm font-serif-content">
                {emptyMessage}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="group cursor-pointer"
                  onClick={() => onSelectPerson(person.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="w-20 h-20 mx-auto mb-3 bg-parchment border border-border rounded-xl flex items-center justify-center text-sepia shadow-sm group-hover:shadow-md transition-shadow">
                    {person.lifeStatus === 'deceased' ? '✝' : '👤'}
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-ink font-serif-titles text-center leading-tight">
                    {person.firstName} {person.lastName ?? ''}
                  </h4>
                  <p className="text-xs text-forest text-center mt-1">
                    {person.lifeStatus === 'deceased' ? 'Fallecido' : 'Vivo'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  },
);

FamilySection.displayName = 'FamilySection';