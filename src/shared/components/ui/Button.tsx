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
        'bg-gradient-to-b from-primary-600 via-primary-700 to-primary-800 text-white hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 border-0 active:scale-95 shadow-lg hover:shadow-xl focus-visible:ring-primary-500 transition-all',
      secondary:
        'bg-white text-primary-700 border-2 border-primary-300 hover:bg-primary-50 hover:border-primary-400 active:scale-95 shadow-md hover:shadow-lg focus-visible:ring-primary-500',
      ghost:
        'bg-transparent text-primary-700 hover:bg-primary-100 border-0 active:scale-95 transition-colors',
      danger:
        'bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-0 active:scale-95 shadow-lg hover:shadow-xl focus-visible:ring-red-500',
      vibrant: 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-white shadow-lg hover:shadow-2xl active:scale-95 hover:from-amber-500 hover:via-amber-600 hover:to-amber-700 focus-visible:ring-amber-500 font-bold',
    };

    const sizes: Record<string, string> = {
      sm: 'px-4 py-2.5 text-sm min-h-[40px] rounded-md font-medium',
      md: 'px-6 py-3 text-base min-h-[48px] rounded-lg font-semibold',
      lg: 'px-8 py-4 text-lg min-h-[56px] rounded-lg font-bold',
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2.5 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`.trim()}
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