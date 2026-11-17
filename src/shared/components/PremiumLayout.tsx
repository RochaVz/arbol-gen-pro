import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar, Header, PageContainer } from './ui';
import type { SidebarItem } from './ui/SidebarV2';
import { SidebarProvider, useSidebarState } from './ui/SidebarContext';
import { Home, Users, TreePine, ImageIcon, Settings, LogOut, Sun, Moon, Mail, Lock, Plus, HelpCircle } from 'lucide-react';
import { Button, Input, Modal } from './ui';
import { TreeSelector } from './TreeSelector';
import { supabase } from '../../core/supabase';
import { treeRepository, personRepository, uuidv7 } from '../../core/db';
import { useToast } from '../hooks/useToast';
import { useAppStore } from '../../store';

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
  const { addToast } = useToast();
  const { trees, load, activeTreeId, setActiveTreeId } = useAppStore();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [wizardTreeName, setWizardTreeName] = useState('Mi familia');
  const [wizardMyName, setWizardMyName] = useState('');
  const [wizardLastName, setWizardLastName] = useState('');
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
    { id: '/tree', label: 'Árbol Genealógico', icon: <TreePine className="w-5 h-5" />, active: currentPath === '/tree' || currentPath.startsWith('/person'), onClick: () => navigate('/tree') },
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

  const handleSignIn = async () => {
    if (!supabase) return;
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) { addToast(error.message, 'error'); }
      else { addToast('Sesión iniciada', 'success'); setAuthModalOpen(false); setAuthEmail(''); setAuthPassword(''); }
    } catch (e) { addToast(`Error: ${e}`, 'error'); }
    finally { setAuthLoading(false); }
  };

  const handleSignUp = async () => {
    if (!supabase) return;
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: authEmail, password: authPassword,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) { addToast(error.message, 'error'); }
      else { addToast('Cuenta creada. Revisa tu correo.', 'success'); setAuthModalOpen(false); setAuthEmail(''); setAuthPassword(''); }
    } catch (e) { addToast(`Error: ${e}`, 'error'); }
    finally { setAuthLoading(false); }
  };

  const handleCreateTree = async () => {
    if (!wizardTreeName.trim() || !wizardMyName.trim()) {
      addToast('Completa nombre del árbol y tu nombre', 'error');
      return;
    }
    try {
      const t = await treeRepository.create({ id: uuidv7(), name: wizardTreeName.trim(), ownerId: 'local-user' } as any);
      await personRepository.create({ id: uuidv7(), treeId: t.entity.id, firstName: wizardMyName.trim(), lastName: wizardLastName.trim() || undefined, lifeStatus: 'alive' } as any);
      setWizardOpen(false);
      await load();
      navigate('/tree');
      addToast('Árbol creado. Comienza a agregar familiares.', 'success');
    } catch (e) { addToast(`Error: ${e}`, 'error'); }
  };

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

  const headerActions = (
    <div className="flex items-center gap-3">
      {trees.length > 1 && (
        <TreeSelector
          trees={trees}
          activeTreeId={activeTreeId}
          onSelectTree={(id) => { setActiveTreeId(id); load(); }}
        />
      )}
      {!userEmail && (
        <Button variant="secondary" size="sm" onClick={() => setAuthModalOpen(true)} icon={<Mail className="w-4 h-4" />}>
          Ingresar
        </Button>
      )}
      {trees.length === 0 ? (
        <Button variant="primary" size="sm" onClick={() => setWizardOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Nuevo Árbol
        </Button>
      ) : currentPath === '/' && (
        <Button variant="primary" size="sm" onClick={() => setWizardOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Nuevo Árbol
        </Button>
      )}
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

      <motion.div
        animate={{ marginLeft: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="min-w-0 hidden lg:block"
      >
        <Header title={title} actions={headerActions} />

        <motion.main
          key={currentPath}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <PageContainer>{children}</PageContainer>
        </motion.main>
      </motion.div>

      {/* Mobile content (no sidebar offset) */}
      <div className="lg:hidden">
        <Header title={title} actions={headerActions} />
        <motion.main
          key={currentPath + '-mobile'}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <PageContainer>{children}</PageContainer>
        </motion.main>
      </div>

      {/* Auth Modal */}
      <Modal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} title="Ingresar">
        <div className="space-y-4">
          <Input label="Email" type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} />
          <Input label="Contraseña" type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} />
          <div className="flex gap-2">
            <Button fullWidth variant="primary" onClick={handleSignIn} isLoading={authLoading}>Ingresar</Button>
            <Button fullWidth variant="secondary" onClick={handleSignUp} isLoading={authLoading}>Registrarse</Button>
          </div>
        </div>
      </Modal>

      {/* Create Tree Wizard */}
      <Modal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} title="Crear árbol genealógico">
        <div className="space-y-4">
          <Input label="Nombre del árbol" value={wizardTreeName} onChange={(e) => setWizardTreeName(e.target.value)} />
          <Input label="Tu nombre" value={wizardMyName} onChange={(e) => setWizardMyName(e.target.value)} />
          <Input label="Tu apellido (opcional)" value={wizardLastName} onChange={(e) => setWizardLastName(e.target.value)} />
          <Button fullWidth variant="primary" onClick={handleCreateTree}>Crear Árbol</Button>
        </div>
      </Modal>
    </div>
  );
};

PremiumLayout.displayName = 'PremiumLayout';
