import { Button } from '../../../shared/components/ui/Button';
import React from "react";
/**
 * RecentActivity — Actividad reciente del árbol familiar.
 * Estilo libro de recuerdos, no panel de administración.
 */
export interface ActivityItem {
  id: string;
  personName: string;
  action: 'agregó' | 'actualizó' | 'añadió foto' | 'conectó';
  target?: string;
  when: string; // texto legible, ej. "hace 2 días"
  photoUrl?: string;
}

export interface RecentActivityProps {
  items: ActivityItem[];
  onViewAll?: () => void;
  className?: string;
}

export const RecentActivity = React.forwardRef<
  HTMLDivElement,
  RecentActivityProps
>(
  ({ items, onViewAll, className = '' }, ref) => {
    return (
      <div ref={ref} className={className}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-ink font-serif-titles">
            Actividad reciente
          </h3>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              Ver toda la historia
            </Button>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-2 block">📖</span>
              <p className="text-wood text-sm font-serif-content">
                Aún no hay recuerdos registrados. Comienza agregando a tu familia.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 flex-shrink-0 bg-parchment border border-border rounded-lg flex items-center justify-center text-sepia">
                  {item.action === 'añadió foto' ? '📸' : '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-ink font-serif-content leading-tight">
                    <span className="font-semibold text-wood">{item.personName}</span>{' '}
                    {item.action}
                    {item.target ? ` <span className="font-medium text-ink">${item.target}</span>` : ''}
                  </p>
                  <p className="text-xs text-forest mt-0.5">{item.when}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  },
);

RecentActivity.displayName = 'RecentActivity';