import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, Header, PageContainer } from './ui';
import type { SidebarItem } from './ui/SidebarV2';
import { SidebarProvider, useSidebarState } from './ui/SidebarContext';
import { Home, Users, TreePine, ImageIcon, Settings, LogOut, Sun, Moon, HelpCircle } from 'lucide-react';

interface PremiumLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
  userEmail?: string | null;
}

export const PremiumLayout: React.FC<PremiumLayoutProps> = (props) => (
  <SidebarProvider>
    <PremiumLayoutInner {...props} />
  </SidebarProvider>
);

const PremiumLayoutInner: React.FC<PremiumLayoutProps> = ({ children, onLogout, userEmail }) => {
  const { collapsed } = useSidebarState();
  const location = useLocation();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('color-mode');
    return stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('color-mode', next ? 'dark' : 'light');
  };

  const currentPath = location.pathname;

  const sidebarItems: SidebarItem[] = [
    { id: '/', label: 'Inicio', icon: <Home className="w-5 h-5" />, active: currentPath === '/', onClick: () => navigate('/') },
    { id: '/tree', label: 'Árbol Genealógico', icon: <TreePine className="w-5 h-5" />, active: currentPath === '/tree', onClick: () => navigate('/tree') },
    { id: '/family', label: 'Mi Familia', icon: <Users className="w-5 h-5" />, active: currentPath === '/family', onClick: () => navigate('/family') },
    { id: '/photos', label: 'Fotografías', icon: <ImageIcon className="w-5 h-5" />, active: currentPath === '/photos', onClick: () => navigate('/photos') },
    { id: '/settings', label: 'Configuración', icon: <Settings className="w-5 h-5" />, active: currentPath === '/settings', onClick: () => navigate('/settings') },
    { id: '/help', label: 'Ayuda', icon: <HelpCircle className="w-5 h-5" />, active: currentPath === '/help', onClick: () => navigate('/help') },
  ];

  const pageTitle: Record<string, string> = {
    '/': 'Panel de Control',
    '/tree': 'Árbol Genealógico',
    '/family': 'Mi Familia',
    '/photos': 'Fotografías',
    '/settings': 'Configuración',
    '/help': 'Ayuda',
  };

  const title = currentPath.startsWith('/person')
    ? 'Perfil de Familiar'
    : (pageTitle[currentPath] ?? 'Árbol Gen Pro');

  const footerContent = (
    <div className="space-y-2">
      {userEmail && (
        <div className="px-2 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
          <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 truncate">{userEmail}</p>
        </div>
      )}
      <button
        onClick={toggleDark}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
      >
        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
      </button>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Cerrar sesión</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Sidebar
        items={sidebarItems}
        footer={footerContent}
        logo={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Árbol Gen Pro</h1>
              <p className="text-xs text-neutral-500">Genealogía Familiar</p>
            </div>
          </div>
        }
      />

      <div
        className="min-w-0 hidden lg:block transition-all duration-200 ease-in-out"
        style={{ marginLeft: collapsed ? '64px' : '256px' }}
      >
        <Header title={title} />
        <main
          key={currentPath}
          className="transition-opacity duration-200"
          style={{ opacity: 0 }}
        >
          <PageContainer>{children}</PageContainer>
        </main>
      </div>

      {/* Mobile content (no sidebar offset) */}
      <div className="lg:hidden">
        <Header title={title} />
        <main
          key={currentPath + '-mobile'}
          className="transition-opacity duration-200"
          style={{ opacity: 0 }}
        >
          <PageContainer>{children}</PageContainer>
        </main>
      </div>
    </div>
  );
};

PremiumLayout.displayName = 'PremiumLayout';