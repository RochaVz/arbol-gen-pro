import React from 'react';

export interface TabNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

export interface TabNavProps {
  tabs: TabNavItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  ariaLabel?: string;
}

export const TabNav: React.FC<TabNavProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  ariaLabel = 'Tab navigation',
}) => (
  <nav
    className={`flex border-b border-neutral-200 overflow-x-auto ${className}`}
    aria-label={ariaLabel}
    role="tablist"
  >
    {tabs.map((tab) => (
      <button
        key={tab.id}
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls={`panel-${tab.id}`}
        onClick={() => onChange(tab.id)}
        className={`
          flex items-center gap-2 px-6 py-4 text-base font-medium whitespace-nowrap
          border-b-2 transition-colors
          ${
            activeTab === tab.id
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }
        `}
      >
        {tab.icon && <span className="text-lg">{tab.icon}</span>}
        {tab.label}
        {tab.badge !== undefined && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white bg-primary-600 rounded-full">
            {tab.badge}
          </span>
        )}
      </button>
    ))}
  </nav>
);

export default TabNav;
