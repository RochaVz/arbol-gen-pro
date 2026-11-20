import React from 'react';

export interface AppearanceControlsProps {
  showPhotos: boolean;
  showDates: boolean;
  showRelationships: boolean;
  showLabels: boolean;
  showGrid: boolean;
  showConnections: boolean;
  onShowPhotosChange: (value: boolean) => void;
  onShowDatesChange: (value: boolean) => void;
  onShowRelationshipsChange: (value: boolean) => void;
  onShowLabelsChange: (value: boolean) => void;
  onShowGridChange: (value: boolean) => void;
  onShowConnectionsChange: (value: boolean) => void;
}

export const AppearanceControls: React.FC<AppearanceControlsProps> = ({
  showPhotos,
  showDates,
  showRelationships,
  showLabels,
  showGrid,
  showConnections,
  onShowPhotosChange,
  onShowDatesChange,
  onShowRelationshipsChange,
  onShowLabelsChange,
  onShowGridChange,
  onShowConnectionsChange,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        👁️ Mostrar elementos
      </h3>
      <div className="space-y-2">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">📸 Fotografías</span>
          <input
            type="checkbox"
            checked={showPhotos}
            onChange={(e) => onShowPhotosChange(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">📅 Fechas</span>
          <input
            type="checkbox"
            checked={showDates}
            onChange={(e) => onShowDatesChange(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">🔗 Relaciones</span>
          <input
            type="checkbox"
            checked={showRelationships}
            onChange={(e) => onShowRelationshipsChange(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">🏷️ Etiquetas</span>
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => onShowLabelsChange(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">📐 Cuadrícula de fondo</span>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => onShowGridChange(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">🔗 Conexiones</span>
          <input
            type="checkbox"
            checked={showConnections}
            onChange={(e) => onShowConnectionsChange(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>
    </div>
  );
};