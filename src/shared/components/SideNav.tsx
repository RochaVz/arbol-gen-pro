import React from 'react';

export interface SideNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  badge?: number;
}

export interface SideNavProps {
  items: SideNavItem[];
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  title?: string;
}

export const SideNav: React.FC<SideNavProps> = ({
  items,
  isOpen = true,
  onClose,
  className = '',
  title,
}) => (
  <div
    className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-neutral-50 border-r border-neutral-200 shadow-lg
      transform transition-transform duration-300 lg:relative lg:transform-none
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      ${className}
    `}
    role="navigation"
    aria-label={title}
  >
    <div className="flex flex-col h-full">
      {title && (
        <div className="px-6 py-4 border-b border-neutral-200">
          <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              item.onClick?.();
              onClose?.();
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
              transition-colors mb-2
              ${
                item.isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }
            `}
            aria-current={item.isActive ? 'page' : undefined}
          >
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <span className="flex-1 font-medium">{item.label}</span>
            {item.badge !== undefined && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-primary-700 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  </div>
);

export default SideNav;
