import React from 'react';
import { motion } from 'framer-motion';
import { Sidebar, Header, PageContainer } from './ui';
import type { SidebarItem } from './ui/SidebarV2';
import {
  Home,
  Users,
  TreePine,
  ImageIcon,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';

interface PremiumLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumb?: Array<{ label: string; onClick?: () => void }>;
  headerActions?: React.ReactNode;
  onNavigate?: (view: string) => void;
  currentView?: string;
  onLogout?: () => void;
  userEmail?: string | null;
}

export const PremiumLayout: React.FC<PremiumLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumb,
  headerActions,
  onNavigate,
  currentView = 'home',
  onLogout,
  userEmail,
}) => {
  const sidebarItems: SidebarItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: <Home className="w-5 h-5" />,
      active: currentView === 'home',
      onClick: () => onNavigate?.('home'),
    },
    {
      id: 'family',
      label: 'Mi Familia',
      icon: <Users className="w-5 h-5" />,
      active: currentView === 'family',
      onClick: () => onNavigate?.('family'),
    },
    {
      id: 'tree',
      label: 'Árbol Genealógico',
      icon: <TreePine className="w-5 h-5" />,
      active: currentView === 'tree',
      onClick: () => onNavigate?.('tree'),
    },
    {
      id: 'photos',
      label: 'Fotografías',
      icon: <ImageIcon className="w-5 h-5" />,
      active: currentView === 'photos',
      onClick: () => onNavigate?.('photos'),
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <Settings className="w-5 h-5" />,
      active: currentView === 'settings',
      onClick: () => onNavigate?.('settings'),
    },
    {
      id: 'help',
      label: 'Ayuda',
      icon: <HelpCircle className="w-5 h-5" />,
      active: currentView === 'help',
      onClick: () => onNavigate?.('help'),
    },
  ];

  const footerContent = (
    <div className="space-y-2">
      {userEmail && (
        <div className="px-2 py-2 rounded-lg bg-slate-50">
          <p className="text-xs font-medium text-slate-600 truncate">{userEmail}</p>
        </div>
      )}
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
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        footer={footerContent}
        logo={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-sm font-bold text-slate-900">Árbol Gen Pro</h1>
              <p className="text-xs text-slate-500">Genealogía Premium</p>
            </div>
          </div>
        }
        className="ml-0"
        onItemClick={(itemId: string) => {
          if (itemId !== 'settings' && itemId !== 'help') {
            onNavigate?.(itemId);
          }
        }}
      />

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <Header
          title={title}
          subtitle={subtitle}
          breadcrumb={breadcrumb}
          actions={headerActions}
        />

        {/* Page content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-[calc(100vh-200px)]"
        >
          <PageContainer>{children}</PageContainer>
        </motion.main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-8 mt-16">
          <PageContainer className="!py-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Árbol Gen Pro</h3>
                <p className="text-sm text-slate-600">
                  La plataforma genealógica más moderna y profesional.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Producto</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><a href="#" className="hover:text-primary-600 transition-colors">Características</a></li>
                  <li><a href="#" className="hover:text-primary-600 transition-colors">Precios</a></li>
                  <li><a href="#" className="hover:text-primary-600 transition-colors">Documentación</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Empresa</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><a href="#" className="hover:text-primary-600 transition-colors">Sobre nosotros</a></li>
                  <li><a href="#" className="hover:text-primary-600 transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-primary-600 transition-colors">Contacto</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><a href="#" className="hover:text-primary-600 transition-colors">Privacidad</a></li>
                  <li><a href="#" className="hover:text-primary-600 transition-colors">Términos</a></li>
                  <li><a href="#" className="hover:text-primary-600 transition-colors">Cookies</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-8 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                © 2024 Árbol Gen Pro. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-slate-600 hover:text-primary-600 transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-slate-600 hover:text-primary-600 transition-colors">
                  GitHub
                </a>
                <a href="#" className="text-slate-600 hover:text-primary-600 transition-colors">
                  LinkedIn
                </a>
              </div>
            </div>
          </PageContainer>
        </footer>
      </div>
    </div>
  );
};

PremiumLayout.displayName = 'PremiumLayout';
