/*
 * CircularPreview — Vista previa reducida del Árbol Circular.
 * Distribución radial con usuario/persona central y ramas que se extienden outward.
 */
export const CircularPreview: React.FC = () => {
  return (
    <div className="p-3 bg-surface border border-border rounded-lg text-center">
      <div className="text-2xl mb-2">🔄</div>
      <h4 className="text-sm font-medium text-ink mb-1">Circular</h4>
      <p className="text-xs text-wood mb-2">Radial: centro ↔ ramas</p>
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-parchment border border-border text-center align-middle font-serif-titles text-2xl">👤</div>
        <div className="w-6 h-6 rounded bg-parchment border border-border text-center align-middle">👵</div>
        <div className="w-6 h-6 rounded bg-parchment border border-border text-center align-middle">👴</div>
        <div className="w-6 h-6 rounded bg-parchment border border-border text-center align-middle">👶</div>
      </div>
    </div>
  );
};