import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import type { Person } from '../../core/db';
import { Button } from './ui';

interface AddFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (person: Person) => void;
  persons: Person[];
  relationshipType?: 'parent' | 'spouse' | 'child' | 'sibling';
}

export const AddFamilyMemberModal: React.FC<AddFamilyMemberModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  persons,
  relationshipType = 'parent',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const filteredPersons = useMemo(() => {
    if (!searchTerm.trim()) return persons;
    
    const term = searchTerm.toLowerCase();
    return persons.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(term)
    );
  }, [persons, searchTerm]);

  const handleSelect = (person: Person) => {
    setSelectedPersonId(person.id);
    onSelect?.(person);
    // Don't close immediately - let parent handle it
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedPersonId(null);
    onClose();
  };

  if (!isOpen) return null;

  const relationshipLabels = {
    parent: 'Agregar Padre/Madre',
    spouse: 'Agregar Pareja',
    child: 'Agregar Hijo/Hija',
    sibling: 'Agregar Hermano/Hermana',
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {relationshipLabels[relationshipType]}
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar persona..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className={cn(
                  'w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700',
                  'bg-white dark:bg-slate-900 text-slate-900 dark:text-white',
                  'placeholder-slate-500 dark:placeholder-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                )}
              />
            </div>

            {/* Person list */}
            <div className="space-y-2">
              {filteredPersons.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p className="text-sm">No se encontraron personas</p>
                </div>
              ) : (
                filteredPersons.map((person) => (
                  <motion.button
                    key={person.id}
                    whileHover={{ x: 4 }}
                    onClick={() => handleSelect(person)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg transition-colors',
                      'border border-transparent',
                      selectedPersonId === person.id
                        ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-700'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {person.firstName} {person.lastName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {person.lifeStatus === 'deceased' ? '✝ Fallecido' : '✓ Vivo'}
                        </div>
                      </div>
                      {selectedPersonId === person.id && (
                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex gap-2 justify-end bg-slate-50 dark:bg-slate-900">
            <Button
              onClick={handleClose}
              variant="secondary"
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (selectedPersonId) {
                  const selected = persons.find((p) => p.id === selectedPersonId);
                  if (selected) {
                    onSelect?.(selected);
                  }
                }
              }}
              variant="primary"
              size="sm"
              disabled={!selectedPersonId}
            >
              Seleccionar
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
