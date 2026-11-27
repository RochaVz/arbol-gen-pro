import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui';
import { Plus, Users, Calendar, ImageIcon } from 'lucide-react';

interface WizardGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onTreeCreated: () => void;
}

export const WizardGuide: React.FC<WizardGuideProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      id: 1,
      title: 'Bienvenido a Arbol Gen Pro',
      description: 'Tu aplicación genealógica familiar para documentar tu historia y legado.',
      icon: <Plus className="w-8 h-8 text-primary-600" />,
    },
    {
      id: 2,
      title: 'Crea tu primer árbol',
      description: 'Haz clic en el botón de más para crear tu árbol familiar y agregar a ti mismo.',
      icon: <Plus className="w-8 h-8 text-primary-600" />,
    },
    {
      id: 3,
      title: 'Agrega familiares',
      description: 'Añade padres, hijos, cónyuges y otros familiares para construir tu árbol genealógico.',
      icon: <Users className="w-8 h-8 text-primary-600" />,
    },
    {
      id: 4,
      title: 'Explora estilos',
      description: 'Selecciona diferentes estilos visuales para ver cómo se ve tu árbol en varios diseños.',
      icon: <Calendar className="w-8 h-8 text-primary-600" />,
    },
    {
      id: 5,
      title: 'Personaliza tu vista',
      description: 'Muestra u oculta fotos, fechas, relaciones y cambia la disposición del árbol.',
      icon: <ImageIcon className="w-8 h-8 text-primary-600" />,
    },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <motion.div
        className="bg-white dark:bg-slate-900 rounded-lg p-8 max-w-md w-full mx-8 shadow-2xl"
        style={{ maxHeight: '90vh' }}
      >
        <motion.div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            🧭 Tutorial de Arbol Gen Pro
          </h3>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400">
            ✕
          </button>
        </motion.div>

        <motion.div className="space-y-6 flex-1">
          {steps.map((step) => (
            <motion.div key={step.id} className="p-6 rounded-lg border transition-all duration-300">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                {step.icon}
              </div>

              <h4 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                {step.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <Button variant="primary" size="lg" onClick={onClose}>
            Comenzar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
