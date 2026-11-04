import React from "react";
import type { ButtonHTMLAttributes } from 'react';

/***
 * Button — Botón con variantes vibrantes y vintage-moderna.
 * Colores: acento dorado/naranja sobre papel/incienso.
 * Accesible por defecto (focus-visible, tamaño mínimo 44px).
 ***/
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'vibrant';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const variants: Record<string, string> = {
      primary:
        'bg-accent text-surface-elevated hover:bg-wood border-transparent active:scale-95',
      secondary:
        'bg-surface-elevated text-ink border border-accent hover:bg-accent hover:text-surface-elevated active:scale-95',
      ghost:
        'bg-transparent text-accent hover:bg-accent/10 border-transparent active:scale-95',
      danger:
        'bg-wood text-surface-elevated hover:bg-accent border-transparent active:scale-95',
      vibrant: 'btn-vibrant',
    };

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-5 py-2 text-base min-h-[44px]',
      lg: 'px-6 py-2.5 text-lg min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`.trim()}
        style={{
          width: fullWidth ? '100%' : 'auto',
        }}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-1.5">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {children}
          </span>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';