import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './core/supabase';
import { useAppStore } from './store';
import { useToastStore } from './shared/hooks/useToast';
import { PremiumLayout } from './shared/components/PremiumLayout';
import { Toast } from './shared/components/ui';
import { HomePage } from './pages/HomePage';
import { TreePage } from './pages/TreePage';
import { PersonPage } from './pages/PersonPage';
import { FamilyPage } from './pages/FamilyPage';
import { PhotosPage } from './pages/PhotosPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';

function AppShell() {
  const load = useAppStore((s) => s.load);
  const { toasts, removeToast } = useToastStore();
  const { addToast } = useToastStore();
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  // Dark mode init
  useEffect(() => {
    const stored = localStorage.getItem('color-mode');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if ((stored ?? system) === 'dark') document.documentElement.classList.add('dark');
  }, []);

  // Auth listener
  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSessionEmail(data.session?.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (mounted) setSessionEmail(s?.user?.email ?? null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  // Load data
  useEffect(() => { void load(); }, [load]);

  const handleSignOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      addToast('Sesión cerrada', 'success');
    } catch (e) {
      addToast(`Error: ${e}`, 'error');
    }
  };

  return (
    <PremiumLayout userEmail={sessionEmail} onLogout={handleSignOut}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tree" element={<TreePage />} />
        <Route path="/person/:personId" element={<PersonPage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/photos" element={<PhotosPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div key={toast.id} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Toast variant={toast.type} onClose={() => removeToast(toast.id)}>
              {toast.message}
            </Toast>
          </div>
        ))}
      </div>
    </PremiumLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
