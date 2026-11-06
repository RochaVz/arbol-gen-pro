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
          className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={onClickOutside}
        >
          <span className="sr-only">{closeLabel}</span>

          {/* Panel del modal */}
          <div
            ref={ref}
            className={`
              bg-white border border-neutral-200 rounded-2xl shadow-2xl
              max-w-lg w-full max-h-[90vh] flex flex-col
              animate-in fade-in zoom-in-95 duration-300 transform
              ${className}
            `.trim()}
            style={{ overflow: 'auto', overscrollBehavior: 'contain' }}
            {...props}
          >
            {title && (
              <div className="p-6 sm:p-8 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-transparent">
                <h3 className="text-2xl font-bold text-neutral-900 font-serif-titles">
                  {title}
                </h3>
              </div>
            )}
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[60vh] flex-1">
              {children}
            </div>
            <div className="p-4 sm:p-6 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose} size="md">
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