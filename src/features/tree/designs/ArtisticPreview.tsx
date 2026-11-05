/*
 * ArtisticPreview — Vista previa reducida del Árbol Artístico.
 * Rimas orgánicas, fotos integradas en las líneas del árbol, estética natural.
 */
export const ArtisticPreview: React.FC = () => {
  return (
    <div className="p-3 bg-surface border border-border rounded-lg text-center">
      <div className="text-2xl mb-2">🎨</div>
      <h4 className="text-sm font-medium text-ink mb-1">Artístico</h4>
      <p className="text-xs text-wood mb-2">Ramas orgánicas con fotos</p>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded bg-parchment border border-border relative">
          <div className="absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full bg-tangerine"></div>
          <span className="text-[10px] font-bold text-tangerine uppercase tracking-widest">T</span>
        </div>
        <div className="w-8 h-8 rounded bg-parchment border border-border text-center align-middle">👤</div>
        <div className="w-8 h-8 rounded bg-parchment border border-border text-center align-middle">👵</div>
      </div>
    </div>
  );
};