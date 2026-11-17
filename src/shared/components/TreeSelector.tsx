import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TreePine } from 'lucide-react';
import type { Tree } from '../../core/db/schema';

interface TreeSelectorProps {
  trees: Tree[];
  activeTreeId: string | null;
  onSelectTree: (treeId: string) => void;
  className?: string;
}

export const TreeSelector: React.FC<TreeSelectorProps> = ({
  trees,
  activeTreeId,
  onSelectTree,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeTree = trees.find((t) => t.id === activeTreeId);

  if (trees.length <= 1) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm font-medium text-neutral-900 dark:text-white"
        whileTap={{ scale: 0.98 }}
      >
        <TreePine className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="max-w-[150px] truncate">{activeTree?.name || 'Sin árbol'}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 overflow-hidden"
            >
              <div className="py-1">
                {trees.map((tree) => (
                  <motion.button
                    key={tree.id}
                    onClick={() => {
                      onSelectTree(tree.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                      activeTreeId === tree.id
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200'
                        : 'text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0">
                      {activeTreeId === tree.id && (
                        <motion.div
                          layoutId="active-tree"
                          className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{tree.name}</p>
                      {tree.description && (
                        <p className="text-xs opacity-75 truncate">{tree.description}</p>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
