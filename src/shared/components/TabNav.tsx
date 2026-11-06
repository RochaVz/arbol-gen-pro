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
    className={`flex border-b border-neutral-200 overflow-x-auto bg-white ${className}`}
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
          flex items-center gap-2.5 px-6 py-4 text-base font-semibold whitespace-nowrap
          border-b-[3px] transition-all duration-200
          ${
            activeTab === tab.id
              ? 'border-primary-600 text-primary-700 bg-primary-50'
              : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }
        `}
      >
        {tab.icon && <span className="text-xl">{tab.icon}</span>}
        {tab.label}
        {tab.badge !== undefined && (
          <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold leading-none text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-md">
            {tab.badge}
          </span>
        )}
      </button>
    ))}
  </nav>
);

export default TabNav;
