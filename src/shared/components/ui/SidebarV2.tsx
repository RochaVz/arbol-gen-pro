import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Menu, X } from 'lucide-react';

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

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  logo,
  footer,
  className,
  onItemClick,
}) => {
  const [collapsed] = useState(false);  // For future responsive behavior
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleItemClick = (item: SidebarItem) => {
    onItemClick?.(item.id);
    item.onClick?.();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      {logo && (
        <div className="px-6 py-4 border-b border-slate-200">
          {logo}
        </div>
      )}

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200',
              item.active
                ? 'bg-primary-100 text-primary-600'
                : 'text-slate-700 hover:bg-slate-100'
            )}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
            {!collapsed && (
              <div className="flex-1 text-left">
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-2 inline-block bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="px-3 py-4 border-t border-slate-200">
          {footer}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 shadow-sm z-40',
          className
        )}
      >
        {sidebarContent}
      </motion.div>

      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <motion.div
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          className="lg:hidden fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-40 mt-16"
        >
          {sidebarContent}
        </motion.div>
      )}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 mt-16"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

Sidebar.displayName = 'Sidebar';
