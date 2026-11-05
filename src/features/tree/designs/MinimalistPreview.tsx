/*
 * MinimalistPreview — Vista previa reducida del Árbol Minimalista.
 * Tarjetas simples, líneas discretas, sin ornamento visual.
 */
export const MinimalistPreview: React.FC = () => {
  return (
    <div className="p-3 bg-surface border border-border rounded-lg text-center">
      <div className="text-2xl mb-2">✨</div>
      <h4 className="text-sm font-medium text-ink mb-1">Minimalista</h4>
      <p className="text-xs text-wood mb-2">Tarjetas limpias, líneas discretas</p>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded bg-parchment border border-border text-center align-middle font-serif-titles">👤</div>
        <div className="w-8 h-8 rounded bg-parchment border border-border text-center align-middle font-serif-titles">👵</div>
      </div>
    </div>
  );
};