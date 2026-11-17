import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Button, Modal } from '../shared/components/ui';
import { useToast } from '../shared/hooks/useToast';
import { Settings, Moon, Sun, Download, Share2, LogOut } from 'lucide-react';

export function SettingsPage() {
  const navigate = useNavigate();
  const { trees, activeTreeId, setActiveTreeId } = useAppStore();
  const { addToast } = useToast();

  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('color-mode');
    return stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [appVersion] = useState('1.0.0');

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('color-mode', next ? 'dark' : 'light');
    addToast(next ? 'Modo oscuro activado' : 'Modo claro activado', 'success');
  };

  const handleExportData = () => {
    // Export functionality
    const data = {
      trees,
      exportDate: new Date().toISOString(),
      appVersion,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arbol-gen-pro-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Datos exportados correctamente', 'success');
  };

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      addToast('Sesión cerrada', 'success');
      navigate('/');
    } catch (e) {
      addToast(`Error: ${e}`, 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Configuración
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Personaliza tu experiencia en Árbol Gen Pro
        </p>
      </div>

      {/* Appearance Section */}
      <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Apariencia</h2>
          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              ) : (
                <Sun className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              )}
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Modo oscuro</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {darkMode ? 'Activado' : 'Desactivado'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                darkMode ? 'bg-green-600' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-7' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Active Tree Selection */}
      {trees.length > 1 && (
        <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Árbol Genealógico Activo</h2>
            <div className="space-y-2">
              {trees.map((tree) => (
                <div
                  key={tree.id}
                  onClick={() => setActiveTreeId(tree.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    activeTreeId === tree.id
                      ? 'border-green-600 bg-green-50 dark:bg-green-900 dark:border-green-500'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-green-300 dark:hover:border-green-700'
                  }`}
                >
                  <p className="font-medium text-neutral-900 dark:text-white">{tree.name}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {activeTreeId === tree.id && '✓ Activo'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Data Management Section */}
      <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Gestión de Datos</h2>

        <div className="space-y-3">
          {/* Export */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Exportar datos</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Descargar tu árbol genealógico como JSON
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setExportModalOpen(true)}
              size="sm"
            >
              Exportar
            </Button>
          </div>

          {/* Share */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Compartir árbol</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Crear un enlace de lectura para compartir
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              disabled
              size="sm"
            >
              Próximamente
            </Button>
          </div>
        </div>
      </section>

      {/* Account Section */}
      <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Cuenta</h2>

        <div className="space-y-3">
          {/* Logout */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Cerrar sesión</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Salir de tu cuenta
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={handleLogout}
              size="sm"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Acerca de</h2>
        <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex justify-between">
            <span>Versión</span>
            <span className="font-medium">{appVersion}</span>
          </div>
          <div className="flex justify-between">
            <span>Almacenamiento Local</span>
            <span className="font-medium">IndexedDB + LocalStorage</span>
          </div>
          <div className="flex justify-between">
            <span>Plataforma</span>
            <span className="font-medium">Web App (PWA)</span>
          </div>
        </div>
      </section>

      {/* Export Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Exportar Datos"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Se descargarán todos tus árboles genealógicos como un archivo JSON.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setExportModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                handleExportData();
                setExportModalOpen(false);
              }}
              className="flex-1"
            >
              Descargar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
