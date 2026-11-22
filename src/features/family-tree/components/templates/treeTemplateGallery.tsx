import React from 'react';

export type TreeStyle = {
  id: string;
  name: string;
  description: string;
  icon: string;
  colorPrimary: string;
  colorSecondary: string;
  cardShape: 'round' | 'square';
  spacing: 'compact' | 'normal' | 'wide';
  orientation: 'vertical' | 'horizontal' | 'radial';
};

export const treeStyles: TreeStyle[] = [
  {
    id: 'classic',
    name: 'Clásico',
    description: 'Estilo tradicional familiar con nodos redondeados y conexiones suaves',
    icon: '👴',
    colorPrimary: '#2563EB',
    colorSecondary: '#DBEAFE',
    cardShape: 'round',
    spacing: 'normal',
    orientation: 'vertical',
  },
  {
    id: 'horizontal',
    name: 'Horizontal',
    description: 'Diseño extendido horizontal para navegar entre generaciones',
    icon: '🌐',
    colorPrimary: '#059669',
    colorSecondary: '#F0FDFA',
    cardShape: 'square',
    spacing: 'wide',
    orientation: 'horizontal',
  },
  {
    id: 'vertical',
    name: 'Vertical',
    description: 'Distribución vertical centrada con jerarquía clara',
    icon: '📐',
    colorPrimary: '#DC2626',
    colorSecondary: '#FEE2E2',
    cardShape: 'round',
    spacing: 'normal',
    orientation: 'vertical',
  },
  {
    id: 'circular',
    name: 'Circular',
    description: 'Organización en espiral circular con nodos distribuidos armoniosamente',
    icon: '🔄',
    colorPrimary: '#7C3AED',
    colorSecondary: '#EDE9FE',
    cardShape: 'round',
    spacing: 'normal',
    orientation: 'radial',
  },
  {
    id: 'artistic',
    name: 'Artístico',
    description: 'Tarjetas flexibles con líneas curvadas y colores vibrantes',
    icon: '🎨',
    colorPrimary: '#F59E0B',
    colorSecondary: '#FEF3C7',
    cardShape: 'round',
    spacing: 'compact',
    orientation: 'radial',
  },
  {
    id: 'minimalist',
    name: 'Minimalista',
    description: 'Líneas limpias y tarjetas simples con información esencial',
    icon: '✨',
    colorPrimary: '#1D4ED8',
    colorSecondary: '#EFF6FF',
    cardShape: 'square',
    spacing: 'wide',
    orientation: 'vertical',
  },
  {
    id: 'chronological',
    name: 'Cronológico',
    description: 'Organización por fechas de nacimiento y defunción',
    icon: '📅',
    colorPrimary: '#BE185D',
    colorSecondary: '#FAE8FF',
    cardShape: 'round',
    spacing: 'normal',
    orientation: 'vertical',
  },
  {
    id: 'personalized',
    name: 'Personalizado',
    description: 'Diseño líquido con tamaños y colores flexibles',
    icon: '🎨',
    colorPrimary: '#0D9488',
    colorSecondary: '#DCFCE7',
    cardShape: 'round',
    spacing: 'normal',
    orientation: 'radial',
  },
];

interface StyleGalleryItemProps {
  isSelected: boolean;
  onClick: () => void;
  isLoading: boolean;
  isHover: boolean;
  id?: string;
  name?: string;
  description?: string;
  icon?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  cardShape?: 'round' | 'square';
  spacing?: 'compact' | 'normal' | 'wide';
  orientation?: 'vertical' | 'horizontal' | 'radial';
}

/** StyleGalleryItem - Tarjeta individual de estilo con estados interactivos */
const StyleGalleryItem: React.FC<StyleGalleryItemProps> = ({
  isSelected,
  onClick,
  isLoading,
  isHover,
  name,
  icon,
  description,
  colorPrimary
}) => {
  const classes = 'flex flex-col items-center gap-2 cursor-pointer select-none transition-all duration-200 ' +
    (isLoading && 'pointer-events-none opacity-50') + ' ' +
    (!isLoading && isHover && 'hover:shadow-lg hover:translate-y-1') + ' ' +
    (isSelected && 'ring-2 ring-offset-2 ring-blue-500 shadow-xl') + ' ' +
    'rounded-xl';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
      role="menuitemradio"
      aria-checked={isSelected}
      aria-label={isSelected ? `Estilo ${name} seleccionado` : `Seleccionar estilo ${name}`}
      tabIndex={isSelected || !isLoading ? 0 : -1}
      className={classes}
    >
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{description}</div>
      <div
        className="mt-2 h-2 rounded-full w-4/5"
        style={{ backgroundColor: colorPrimary, opacity: isSelected ? 1 : 0.3 }}
      />
    </button>
  );
};

/** TreeTemplateGalleryProps - Props for the style gallery component */
interface TreeTemplateGalleryProps {
  currentStyle: string;
  onStyleSelect: (styleId: string) => void;
  isTransitioning?: boolean;
}

/** TreeTemplateGallery - Galería completa de estilos con transiciones suaves */
export const TreeTemplateGallery: React.FC<TreeTemplateGalleryProps> = ({
  currentStyle,
  onStyleSelect,
  isTransitioning = false,
}) => {
  const [isHover, setIsHover] = React.useState(false);

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        🌳 Galería de Estilos
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Elige un estilo para ver cómo se verá tu árbol
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {treeStyles.map((style) => (
          <StyleGalleryItem
            key={style.id}
            {...style}
            isSelected={currentStyle === style.id}
            isLoading={isTransitioning}
            onClick={() => onStyleSelect(style.id)}
            isHover={isHover}
          />
        ))}
      </div>
    </div>
  );
};