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
    className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    role="status"
    aria-label={title}
  >
    {icon && <div className="mb-4 text-5xl text-neutral-300">{icon}</div>}
    <h2 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h2>
    {description && <p className="text-neutral-600 mb-6 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
