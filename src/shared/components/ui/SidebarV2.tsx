import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { useSidebarState } from './SidebarContext';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  badge?: string;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onItemClick?: (itemId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, logo, footer, className, onItemClick }) => {
  const { collapsed, setCollapsed } = useSidebarState();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const handleItemClick = (item: SidebarItem) => {
    onItemClick?.(item.id);
    item.onClick?.();
    setMobileOpen(false);
  };

  const NavItem = ({ item }: { item: SidebarItem }) => (
    <div className="relative group">
      <motion.button
        onClick={() => handleItemClick(item)}
        className={cn(
          'w-full flex items-center rounded-lg text-sm font-medium transition-colors duration-150',
          collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
          item.active
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
        )}
        whileTap={{ scale: 0.97 }}
      >
        {item.icon && (
          <span className={cn('flex-shrink-0', item.active ? 'text-primary-600 dark:text-primary-400' : '')}>
            {item.icon}
          </span>
        )}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 text-left truncate overflow-hidden whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {!collapsed && item.badge && (
          <span className="ml-auto inline-block bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
            {item.badge}
          </span>
        )}
      </motion.button>

      {/* Tooltip en modo colapsado */}
      {collapsed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          {item.label}
          {item.badge && <span className="ml-1 text-primary-300">({item.badge})</span>}
        </div>
      )}
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo + collapse toggle */}
      <div className={cn(
        'flex items-center border-b border-neutral-200 dark:border-neutral-700',
        collapsed ? 'justify-center px-2 py-4' : 'justify-between px-4 py-4'
      )}>
        <AnimatePresence initial={false}>
          {!collapsed && logo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-w-0"
            >
              {logo}
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* Nav items */}
      <nav className={cn('flex-1 overflow-y-auto py-3 space-y-0.5', collapsed ? 'px-2' : 'px-3')}>
        {items.map((item) => <NavItem key={item.id} item={item} />)}
      </nav>

      {/* Footer */}
      {footer && (
        <div className={cn('border-t border-neutral-200 dark:border-neutral-700 py-3', collapsed ? 'px-2' : 'px-3')}>
          <AnimatePresence initial={false}>
            {collapsed ? (
              // En modo colapsado solo mostrar iconos del footer si los hay
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {footer}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 shadow-sm z-40 overflow-hidden',
          className
        )}
      >
        {sidebarContent}
      </motion.div>

      {/* Mobile toggle button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
          className="p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm hover:bg-neutral-50 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              id="mobile-sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-neutral-900 shadow-xl z-40"
            >
              {sidebarContent}
            </motion.div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              aria-label="Cerrar menú lateral"
              className="lg:hidden fixed inset-0 bg-black/40 z-30"
              onClick={() => setMobileOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

Sidebar.displayName = 'Sidebar';
