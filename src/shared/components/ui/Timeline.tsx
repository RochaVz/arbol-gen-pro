import React from "react";
import type { HTMLAttributes } from 'react';

export interface TimelineItem {
  id: string;
  date?: string; // texto legible, ej. "15 marzo 1945"
  year?: number;
  title: string;
  description?: string;
  image?: string;
  type?: 'event' | 'memory' | 'document';
}

export interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  items: TimelineItem[];
  reversed?: boolean;
}

export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ items, reversed = false, className = '', children, ...props }, ref) => {
    const sorted = [...items].sort((a, b) => {
      const ay = a.year ?? 0;
      const by = b.year ?? 0;
      return reversed ? by - ay : ay - by;
    });

    return (
      <div
        ref={ref}
        className={`relative w-full pl-6 sm:pl-8 ${className}`}
        {...props}
      >
        {/* Línea vertical central */}
        <span className="absolute left-2 top-0 bottom-0 w-[2px] bg-border" />

        {sorted.map((item) => (
          <div
            key={item.id}
            className="relative mb-10 last:mb-0"
          >
            {/* Punto / marcador */}
            <span
              className="absolute left-[-6px] top-[6px] w-4 h-4 rounded-full bg-accent border-2 border-surface shadow-sm"
            />

            {/* Fecha / año */}
            {item.year || item.date && (
              <span className="absolute left-[-6px] -top-6 transform -translate-x-1/2 text-[10px] font-medium text-wood uppercase tracking-wider whitespace-nowrap">
                {item.year ?? item.date}
              </span>
            )}

            {/* Contenido */}
            <div className="ml-4 sm:ml-6">
              {item.image && (
                <div className="mb-3">
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-32 object-cover rounded-lg shadow-md"
                    loading="lazy"
                  />
                </div>
              )}
              <h4 className="text-lg font-semibold text-ink font-serif-titles mb-1">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-wood font-serif-content leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}

        {children}
      </div>
    );
  },
);

Timeline.displayName = 'Timeline';