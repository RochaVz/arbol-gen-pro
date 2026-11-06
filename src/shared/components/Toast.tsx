import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: (id: string) => void;
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-900 border-l-4 border-green-500 shadow-lg',
  error: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-900 border-l-4 border-red-500 shadow-lg',
  warning: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border-l-4 border-amber-500 shadow-lg',
  info: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-900 border-l-4 border-blue-500 shadow-lg',
};

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'info',
  duration = 4000,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      className={`
        px-5 py-4 rounded-xl border
        animate-fade-in transform transition-all duration-300
        ${typeStyles[type]}
      `}
    >
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold flex-shrink-0">{typeIcons[type]}</span>
        <p className="text-sm font-semibold flex-1">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            onDismiss(id);
          }}
          className="ml-2 text-lg leading-none opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
