import React from "react";
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Timeline } from '../../../shared/components/ui/Timeline';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  year?: number;
  date?: string;
  type?: 'event' | 'memory' | 'document';
  image?: string;
}

export interface TimelineSectionProps {
  events: TimelineEvent[];
  onAddEvent: () => void;
  className?: string;
}

export const TimelineSection = React.forwardRef<
  HTMLDivElement,
  TimelineSectionProps
>(
  ({ events, onAddEvent, className = '' }, ref) => {
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-ink font-serif-titles">
              Línea de tiempo
            </h3>
            <Button size="sm" variant="ghost" onClick={onAddEvent}>
              Agregar evento
            </Button>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-3 block">📅</span>
              <p className="text-wood text-sm font-serif-content">
                No hay eventos registrados aún. Agrega fechas importantes de la
                vida de esta persona.
              </p>
            </div>
          ) : (
            <Timeline items={events} />
          )}
        </div>
      </Card>
    );
  },
);

TimelineSection.displayName = 'TimelineSection';