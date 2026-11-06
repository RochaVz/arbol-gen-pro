import React from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, width = '100%', height = '20px', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-slate-200 rounded-lg animate-pulse',
          className
        )}
        style={{ width, height }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-4 p-6">
    <Skeleton width="100%" height="24px" />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} width="100%" height="16px" />
    ))}
  </div>
);

SkeletonCard.displayName = 'SkeletonCard';

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
  title?: string;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant = 'info',
      onClose,
      title,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      success: 'bg-green-50 border-green-200 text-green-900',
      error: 'bg-red-50 border-red-200 text-red-900',
      info: 'bg-blue-50 border-blue-200 text-blue-900',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border p-4 shadow-md',
          variants[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            {title && <h4 className="font-semibold">{title}</h4>}
            {children}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 text-current opacity-50 hover:opacity-75 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Toast.displayName = 'Toast';
