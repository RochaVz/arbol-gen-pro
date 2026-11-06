import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => (
  <div
    className={`flex flex-col items-center justify-center min-h-[70vh] px-4 text-center ${className}`}
    role="status"
    aria-label={title}
  >
    <div className="max-w-md mx-auto">
      {icon && <div className="mb-6 text-7xl drop-shadow-lg">{icon}</div>}
      <h2 className="text-3xl font-bold text-neutral-900 mb-3 font-serif-titles">{title}</h2>
      {description && (
        <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  </div>
);

export default EmptyState;
