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
      sm: 'rounded-lg',
      md: 'rounded-xl',
      lg: 'rounded-2xl',
      xl: 'rounded-3xl',
      full: 'rounded-full',
    };

    return (
      <div
        ref={ref}
        className={`
          bg-white border border-neutral-200
          ${radii[radius]}
          ${elevated ? 'shadow-xl' : 'shadow-lg'}
          hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1
          ${padded ? 'p-6 sm:p-8' : ''}
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