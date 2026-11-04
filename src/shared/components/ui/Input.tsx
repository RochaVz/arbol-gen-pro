import React from "react";
import type { InputHTMLAttributes } from 'react';

/**
 * Input — Campo de formulario con estilo papel/pergamino.
 * Tamaño mínimo 44px para accesibilidad (adultos mayores).
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, size = 'md', className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2 text-base min-h-[44px]',
      lg: 'px-5 py-2.5 text-lg min-h-[52px]',
    };

    const hasError = Boolean(error);

    return (
      <div className="w-full" style={{ width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-wood mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full bg-surface border rounded-lg
            text-ink placeholder:text-wood/60
            ${hasError ? 'border-accent/50 focus:ring-accent' : 'border-border focus:border-accent focus:ring-2 focus:ring-accent/20'}
            transition-all duration-200
            ${sizes[size]} ${className}
          `.trim()}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-accent font-medium">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-1 text-xs text-forest">{helper}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';