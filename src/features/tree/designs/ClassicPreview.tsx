/*
 * ClassicPreview — Vista previa reducida del Árbol Clásico.
 * Muestra 3 generaciones (2 abuelos, 2 padres, 2 hijos) en disposición clásica.
 */
export const ClassicPreview: React.FC = () => {
  return (
    <div className="p-3 bg-surface border border-border rounded-lg text-center">
      <div className="text-2xl mb-2">🌳</div>
      <h4 className="text-sm font-medium text-ink mb-1">Clásico</h4>
      <p className="text-xs text-wood mb-2">Abuelos ↑ Padres ↓ Hijos</p>
      <div className="flex justify-center gap-2">
        <div className="w-8 h-8 rounded bg-parchment border border-border text-center align-middle font-serif-titles">👵</div>
        <div className="w-8 h-8 rounded bg-parchment border border-border text-center align-middle font-serif-titles">👴</div>
        <div className="w-8 h-8 rounded bg-parchment border border-border text-center align-middle font-serif-titles">👶</div>
      </div>
    </div>
  );
};