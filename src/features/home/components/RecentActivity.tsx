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
    const getActionIcon = (action: string) => {
      switch (action) {
        case 'añadió foto':
          return '📸';
        case 'agregó':
          return '➕';
        case 'actualizó':
          return '✏️';
        case 'conectó':
          return '🔗';
        default:
          return '📝';
      }
    };

    return (
      <div ref={ref} className={className}>
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📖</span>
              <p className="text-neutral-600 text-base">
                Aún no hay actividad. ¡Comienza a documentar tu historia familiar!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-4 p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-200"
                >
                  <div className="text-2xl flex-shrink-0">
                    {getActionIcon(item.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-neutral-900">
                      <span className="font-bold text-primary-600">{item.personName}</span>
                      {' '}{item.action}
                      {item.target && (
                        <>
                          {' '}<span className="font-semibold text-neutral-900">{item.target}</span>
                        </>
                      )}
                    </p>
                    <p className="text-sm text-neutral-600 mt-1">{item.when}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {onViewAll && items.length > 0 && (
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <Button variant="secondary" fullWidth onClick={onViewAll}>
              Ver toda la actividad
            </Button>
          </div>
        )}
      </div>
    );
  },
);

RecentActivity.displayName = 'RecentActivity';