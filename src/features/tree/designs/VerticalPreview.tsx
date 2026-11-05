/*
 * VerticalPreview — Vista previa reducida del Árbol Vertical.
 * Disposición arriba-abajo, fácil de comprender.
 */
export const VerticalPreview: React.FC = () => {
  return (
    <div className="p-3 bg-surface border border-border rounded-lg text-center">
      <div className="text-2xl mb-2">↕️</div>
      <h4 className="text-sm font-medium text-ink mb-1">Vertical</h4>
      <p className="text-xs text-wood mb-2">Arriba ↓ Abajo</p>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded bg-parchment border border-border text-center align-middle font-serif-titles">👵</div>
        <div className="w-8 h-8 rounded bg-parchment border border-border text-center align-middle font-serif-titles">👴</div>
        <div className="w-8 h-8 rounded bg-parchment border border-border text-center align-middle font-serif-titles">👶</div>
      </div>
    </div>
  );
};