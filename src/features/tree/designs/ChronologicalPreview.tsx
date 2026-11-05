/*
 * ChronologicalPreview — Vista previa reducida del Árbol Cronológico.
 * Generaciones organizadas por fechas con indicadores de nacimiento/fallecimiento.
 */
export const ChronologicalPreview: React.FC = () => {
  return (
    <div className="p-3 bg-surface border border-border rounded-lg text-center">
      <div className="text-2xl mb-2">📅</div>
      <h4 className="text-sm font-medium text-ink mb-1">Cronológico</h4>
      <p className="text-xs text-wood mb-2">Generaciones + fechas</p>
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded bg-parchment border border-border text-center align-middle font-serif-titles">
          <div className="text-xs">1920</div>
          <span className="text-[8px]">👤</span>
        </div>
        <div className="w-8 h-8 rounded bg-parchment border border-border text-center align-middle font-serif-titles">
          <div className="text-xs">1950</div>
          <span className="text-[8px]">👵</span>
        </div>
        <div className="w-8 h-8 rounded bg-parchment border border-border text-center align-middle font-serif-titles">
          <div className="text-xs">1980</div>
          <span className="text-[8px]">👶</span>
        </div>
      </div>
    </div>
  );
};