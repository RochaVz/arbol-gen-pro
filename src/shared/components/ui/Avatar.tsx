import React from "react";
import type { HTMLAttributes } from 'react';

/**
 * Avatar — Avatar de persona con soporte para foto, iniciales o estado sin foto.
 * Diseño tipo álbum familiar antiguo (borde pergamino, sombra suave).
 */
export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  deceased?: boolean;
  borderColor?: string;
}

const SIZE_MAP: Record<string, { w: string; h: string; text: string; border: string }> = {
  sm: { w: 'w-12', h: 'h-12', text: 'text-xs', border: 'border-2' },
  md: { w: 'w-20', h: 'h-20', text: 'text-sm', border: 'border-3' },
  lg: { w: 'w-32', h: 'h-32', text: 'text-base', border: 'border-4' },
  xl: { w: 'w-40', h: 'h-40', text: 'text-xl', border: 'border-4' },
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = 'md', deceased = false, borderColor, className = '', ...props }, ref) => {
    const sizeCfg = SIZE_MAP[size];
    const initials = name
      ? name
          .split(' ')
          .map((n) => n[0])
          .filter(Boolean)
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : '?';

    const border = borderColor || (deceased ? 'border-life-deceased' : 'border-sepia');

    return (
      <div
        ref={ref}
        className={`
          relative inline-flex items-center justify-center
          ${sizeCfg.w} ${sizeCfg.h} ${sizeCfg.border}
          bg-paper border-parchment rounded-full overflow-hidden shadow-md
          ${className}
        `.trim()}
        style={{
          borderColor: deceased
            ? 'var(--color-life-deceased)'
            : borderColor
            ? borderColor
            : 'var(--color-sepia)',
        }}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Foto de perfil'}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--color-parchment)',
              color: 'var(--color-wood)',
            }}
          >
            <span className={`${sizeCfg.text} font-semibold`}>{initials}</span>
          </div>
        )}
        {deceased && (
          <span className="absolute -right-1 -bottom-1 bg-surface border border-surface text-ink text-[10px] font-bold rounded-full px-1">
            ✝
          </span>
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';