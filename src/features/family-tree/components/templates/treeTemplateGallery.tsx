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

interface TreeTemplateGalleryProps {
  currentStyle: string;
  onStyleSelect: (styleId: string) => void;
}

export const TreeTemplateGallery: React.FC<TreeTemplateGalleryProps> = ({
  currentStyle,
  onStyleSelect,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        🌳 Galería de Estilos
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Elige un estilo para ver cómo se verá tu árbol
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {treeStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleSelect(style.id)}
            className={`relative rounded-xl p-3 text-left transition-all duration-200 ${
              currentStyle === style.id
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="text-2xl mb-2">{style.icon}</div>
            <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
              {style.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {style.description}
            </div>
            <div
              className="mt-2 h-2 rounded-full"
              style={{
                backgroundColor: style.colorPrimary,
                opacity: currentStyle === style.id ? 1 : 0.3,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};