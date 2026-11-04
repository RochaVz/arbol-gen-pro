import React from "react";
import { Button } from './Button';
import type { HTMLAttributes } from 'react';

/**
 * Modal — Modal accesible con backdrop, cierre por Escape y clic fuera.
 * Superficie elevada blanca, estilo biblioteca histórica.
 */
export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  closeLabel?: string;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, closeLabel = 'Cerrar', className = '', children, ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[1000] bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={onClickOutside}
        >
          <span className="sr-only">{closeLabel}</span>

          {/* Panel del modal */}
          <div
            ref={ref}
            className={`
              bg-surface-elevated border border-border rounded-xl shadow-xl
              max-w-lg w-full max-h-[90vh] flex flex-col
              animate-in fade-in zoom-in duration-200
              ${className}
            `.trim()}
            style={{ overflow: 'auto', overscrollBehavior: 'contain' }}
            {...props}
          >
            {title && (
              <div className="p-6 sm:p-8 border-b border-border">
                <h3 className="text-xl font-semibold text-ink font-serif-titles">
                  {title}
                </h3>
              </div>
            )}
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[60vh]">
              {children}
            </div>
            <div className="p-4 sm:p-6 border-t border-border bg-surface/50">
              <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
                {closeLabel}
              </Button>
            </div>
          </div>
        </div>
      </>
    );

    function onClickOutside(e: React.MouseEvent) {
      if (e.target === e.currentTarget) onClose();
    }
  },
);

Modal.displayName = 'Modal';