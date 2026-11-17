import React, { useState } from 'react';
import { Search, Filter, Plus, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import type { Person } from '../../core/db';
import { AddFamilyMemberModal } from './AddFamilyMemberModal';

interface TreeToolbarProps {
  persons: Person[];
  onSearchChange?: (term: string) => void;
  onGenerationFilter?: (generation: number | null) => void;
  onAddFamily?: () => void;
  onLayoutToggle?: (layout: 'horizontal' | 'vertical') => void;
  currentLayout?: 'horizontal' | 'vertical';
  className?: string;
}

export const TreeToolbar: React.FC<TreeToolbarProps> = ({
  persons,
  onSearchChange,
  onGenerationFilter,
  onAddFamily,
  onLayoutToggle,
  currentLayout = 'horizontal',
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Calculate generations from persons (simple approach)
  const generations = Array.from(
    new Set(persons.map((p) => p.generation ?? 0))
  ).sort((a, b) => a - b);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    onSearchChange?.(term);
  };

  const handleGenerationChange = (gen: number | null) => {
    setSelectedGeneration(gen);
    onGenerationFilter?.(gen);
  };

  const handleLayoutToggle = () => {
    const newLayout = currentLayout === 'horizontal' ? 'vertical' : 'horizontal';
    onLayoutToggle?.(newLayout);
  };

  const handleAddFamily = (person: Person) => {
    // Person selected from modal
    console.log('Selected person to link:', person);
    setShowAddModal(false);
    // Parent component can handle the actual linking
    onAddFamily?.();
  };

  return (
    <>
      <div
        className={cn(
          'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm',
          className
        )}
      >
        <div className="px-4 py-3 flex flex-col gap-3">
          {/* Main toolbar row */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar persona en el árbol..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700',
                  'bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
                  'placeholder-slate-500 dark:placeholder-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'transition-colors'
                )}
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {/* Filter button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                  showFilters
                    ? 'bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Filtros</span>
              </button>

              {/* Layout toggle */}
              <button
                onClick={handleLayoutToggle}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                  'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
                title={`Cambiar a layout ${currentLayout === 'horizontal' ? 'vertical' : 'horizontal'}`}
              >
                <Layout className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  {currentLayout === 'horizontal' ? '⟷' : '⟶'}
                </span>
              </button>

              {/* Add family button */}
              <button
                onClick={() => setShowAddModal(true)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors',
                  'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600',
                  'text-white shadow-sm hover:shadow-md'
                )}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Agregar</span>
              </button>
            </div>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex flex-wrap gap-2">
                    {/* All generations button */}
                    <button
                      onClick={() => handleGenerationChange(null)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                        selectedGeneration === null
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      )}
                    >
                      Todas las generaciones
                    </button>

                    {/* Generation filters */}
                    {generations.length > 0 && (
                      <div className="flex gap-2">
                        {generations.map((gen) => (
                          <button
                            key={gen}
                            onClick={() => handleGenerationChange(gen)}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                              selectedGeneration === gen
                                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            )}
                          >
                            Gen {gen}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Family Modal */}
      <AddFamilyMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelect={handleAddFamily}
        persons={persons}
        relationshipType="parent"
      />
    </>
  );
};
