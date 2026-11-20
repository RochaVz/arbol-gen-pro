import React, { useState } from 'react';

export interface AppearanceControlsProps {
  styleId: string;
  onStyleChange: (styleId: string) => void;
}

export const TreeDesigner: React.FC<AppearanceControlsProps> = ({ styleId }) => {
  const [cardSize, setCardSize] = useState(190);
  const [cardShape, setCardShape] = useState<'round' | 'square'>('round');
  const [cardSpacing, setCardSpacing] = useState(40);
  const [verticalGap, setVerticalGap] = useState(180);
  const [colorPrimary, setColorPrimary] = useState('#2563EB');
  const [colorSecondary, setColorSecondary] = useState('#DBEAFE');
  const [showPhotos, setShowPhotos] = useState(true);

  const handleSaveStyle = () => {
    // Guardar estilo personalizado
    console.log('Guardando estilo:', {
      styleId,
      cardSize,
      cardShape,
      cardSpacing,
      verticalGap,
      colorPrimary,
      colorSecondary,
      showPhotos,
    });
  };

  const handleRestoreDefault = () => {
    setCardSize(190);
    setCardShape('round');
    setCardSpacing(40);
    setVerticalGap(180);
    setColorPrimary('#2563EB');
    setColorSecondary('#DBEAFE');
    setShowPhotos(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          🎨 Diseñador de Apariencia
        </h3>
        <button
          onClick={handleSaveStyle}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          💾 Guardar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tamaño de tarjetas
            </label>
            <input
              type="range"
              min="100"
              max="300"
              value={cardSize}
              onChange={(e) => setCardSize(parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{cardSize}px</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Forma de tarjetas
            </label>
            <select
              value={cardShape}
              onChange={(e) => setCardShape(e.target.value as 'round' | 'square')}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-1"
            >
              <option value="round">Redondeadas</option>
              <option value="square">Cuadradas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Separación horizontal
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={cardSpacing}
              onChange={(e) => setCardSpacing(parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{cardSpacing}px</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Separación vertical
            </label>
            <input
              type="range"
              min="100"
              max="300"
              value={verticalGap}
              onChange={(e) => setVerticalGap(parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{verticalGap}px</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Color primario
            </label>
            <input
              type="color"
              value={colorPrimary}
              onChange={(e) => setColorPrimary(e.target.value)}
              className="w-full h-10 rounded border border-gray-300 p-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Color secundario
            </label>
            <input
              type="color"
              value={colorSecondary}
              onChange={(e) => setColorSecondary(e.target.value)}
              className="w-full h-10 rounded border border-gray-300 p-1"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSaveStyle}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          💾 Guardar estilo
        </button>
        <button
          onClick={handleRestoreDefault}
          className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          🔄 Restaurar predeterminado
        </button>
      </div>
    </div>
  );
};