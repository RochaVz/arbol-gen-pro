import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 shadow-sm hover:shadow-md',
        accent:
          'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm hover:shadow-md',
        ghost: 'text-slate-700 hover:bg-slate-100 active:bg-slate-200',
        danger:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md',
      },
      size: {
sm: 'px-3 py-1.5 text-sm min-h-[44px] rounded-lg',
md: 'px-4 py-2 text-base min-h-[44px] rounded-lg',
        

        
        lg: 'px-6 py-3 text-lg h-12',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      loading: {
        true: 'opacity-75 cursor-wait',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false,
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      disabled,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          buttonVariants({
            variant,
            size,
            fullWidth,
            loading: isLoading,
          }),
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <svg
            className="w-4 h-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && icon && <span>{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
