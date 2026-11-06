import React from 'react';

export interface AppLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  header,
  sidebar,
  children,
  footer,
  className = '',
}) => (
  <div className={`flex h-screen flex-col bg-neutral-50 ${className}`}>
    {/* Header */}
    {header && (
      <header className="flex-none border-b border-neutral-200 bg-white shadow-sm">
        {header}
      </header>
    )}

    {/* Main content with sidebar */}
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      {sidebar && <aside className="flex-none">{sidebar}</aside>}

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>

    {/* Footer */}
    {footer && (
      <footer className="flex-none border-t border-neutral-200 bg-white">
        {footer}
      </footer>
    )}
  </div>
);

export default AppLayout;
