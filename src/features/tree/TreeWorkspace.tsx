import React from 'react';

/**
 * TreeWorkspace — Contenedor dedicado y aislado para la vista del árbol genealógico.
 * 
 * Características:
 * - width: 100% (nunca limitado por max-width)
 * - min-height: calc(100vh - header) 
 * - overflow: auto (scroll independiente)
 * - background gradiente profesional
 * - separación visual del resto de la app mediante padding y sombra
 * - z-index controlado para evitar superposiciones
 */
export const TreeWorkspace = React.forwardRef<HTMLDivElement, {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}>(({ className = 'tree-workspace', style, children }, ref) => {
  return (
    <div
      ref={ref}
      className={`
        w-full
        min-h-screen
        overflow-x-auto
        overflow-y-auto
        bg-gradient-to-br from-neutral-50 via-white to-neutral-100
        border-t-2 border-neutral-200
        ${className}
      `.trim()}
      style={style}
    >
      <div className="p-8">
        {children}
      </div>
    </div>
  );
});

TreeWorkspace.displayName = 'TreeWorkspace';