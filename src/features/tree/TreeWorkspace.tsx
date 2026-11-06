import React from 'react';

/**
 * TreeWorkspace — Contenedor dedicado y aislado para la vista del árbol genealógico.
 * 
 * Características:
 * - width: 100% (nunca limitado por max-width)
 * - min-height: calc(100vh - header) 
 * - overflow: auto (scroll independiente)
 * - background independiente (gris superficie/ink)
 * - separación visual del resto de la app mediante padding y sombra
 * - z-index controlado para evitar superposiciones
 */
export const TreeWorkspace = React.forwardRef<HTMLDivElement, {
  className?: string;
  style?: React.CSSProperties;
}>(({ className = 'tree-workspace', style, children }, ref) => {
  return (
    <div
      ref={ref}
      className={`
        w-full
        min-h-screen
        overflow-x-hidden
        overflow-y-auto
        bg-surface/50
        border-t border-border/20
        backdrop-blur-sm
        ${className}
      `.trim()}
      style={style}
    >
      {children}
    </div>
  );
});

TreeWorkspace.displayName = 'TreeWorkspace';