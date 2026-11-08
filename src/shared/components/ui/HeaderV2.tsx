import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: Array<{ label: string; onClick?: () => void }>;
}

export const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, title, subtitle, actions, breadcrumb, children, ...props }, _ref) => {
    const [darkMode, setDarkMode] = useState(() => {
      const stored = localStorage.getItem('dark-mode');
      if (stored) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    useEffect(() => {
      document.documentElement.classList.toggle('dark', darkMode);
      localStorage.setItem('dark-mode', darkMode.toString());
    }, [darkMode, setDarkMode]);

    return (
      <header
        className={cn(
          'sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm',
          darkMode ? 'bg-neutral-900/80' : 'bg-white/80',
          className
        )}
        {...props}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb */}
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-2 mb-4 text-sm">
              {breadcrumb.map((item, index) => (
                <React.Fragment key={index}>
                  <button
                    onClick={item.onClick}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {item.label}
                  </button>
                  {index < breadcrumb.length - 1 && (
                    <span className="text-slate-400">/</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Main header content */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {title && (
                <motion.h1
                  className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {title}
                </motion.h1>
              )}
              {subtitle && (
                <motion.p
                  className="mt-1 text-slate-600 text-sm sm:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>

            {/* Actions */}
            {actions && (
              <motion.div
                className="flex items-center gap-2 flex-shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {actions}
              </motion.div>
            )}
          </div>

          {children}
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, padded = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'w-full max-w-7xl mx-auto',
        padded && 'px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

PageContainer.displayName = 'PageContainer';
