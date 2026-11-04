import React from "react";
import type { HTMLAttributes } from 'react';

/**
 * Card — Tarjeta base con superficie papel/pergamino y borde suave.
 * Usada como contenedor principal en toda la app.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  elevated?: boolean;
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ padded = true, elevated = false, radius = 'md', className = '', children, ...props }, ref) => {
    const radii: Record<string, string> = {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    };

    return (
      <div
        ref={ref}
        className={`
          bg-surface border border-border ${radii[radius]}
          ${elevated ? 'shadow-lg' : 'shadow-md'}
          transition-shadow duration-300
          ${padded ? 'p-4 sm:p-6' : ''}
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';