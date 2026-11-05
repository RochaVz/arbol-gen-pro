/*
 * Tree Designs — Plantillas visuales para el árbol genealógico.
 * Cada diseño define un modo de layout y un preview interactivo.
 * El usuario puede cambiar de diseño en cualquier momento; la UI
 * re-renderiza el árbol con la nueva disposición sin perder datos.
 *
 * Estética: coherente con la paleta vibrante (tangerine/cerulean) y la tipografía
 * (Inter títulos, Lora contenido, Playfair Display headers).
 */

export type DesignMode =
  | 'classic'      // Árbol clásico: abuelos arriba, padres centro, hijos abajo
  | 'horizontal'   // Árbol horizontal: antepasados izquierda, descendientes derecha
  | 'vertical'     // Árbol vertical: organización arriba hacia abajo
  | 'circular'     // Árbol circular: distribución radial, usuario en centro
  | 'artistic'     // Árbol artístico: ramas naturales, fotos integradas
  | 'minimalist'   // Árbol minimalista: tarjetas limpias, líneas discretas
  | 'chronological'; // Árbol cronológico: por generaciones y fechas

export interface TreeDesign {
  id: DesignMode;
  name: string;
  description: string;
  // Componente opcional que renderiza un preview reducido (usado en la galería)
  preview?: React.ReactNode;
  // Modo de layout que consumirá treeLayout.ts
  mode: DesignMode;
}

/*
 * Las 7 plantillas disponibles. El orden no implica jerarquía: todas son
 * alternativas equivalentes; la elección es del usuario.
 */
export const TREE_DESIGNS: TreeDesign[] = [
  {
    id: 'classic',
    name: 'Árbol Clásico',
    description:
      'Abuelos en la parte superior, padres en el centro, hijos en la parte inferior. Generaciones claramente diferenciadas.',
    preview: null, // se proveerá un componente pequeño abajo
    mode: 'classic',
  },
  {
    id: 'horizontal',
    name: 'Árbol Horizontal',
    description:
      'Antepasados a la izquierda, descendientes a la derecha. Ideal para familias extensas con muchas ramas laterales.',
    preview: null,
    mode: 'horizontal',
  },
  {
    id: 'vertical',
    name: 'Árbol Vertical',
    description:
      'Organización de arriba hacia abajo. Fácil de comprender para usuarios nuevos; el flujo es natural (generación por generación).',
    preview: null,
    mode: 'vertical',
  },
  {
    id: 'circular',
    name: 'Árbol Circular',
    description:
      'Distribución radial de generaciones. Usuario o persona principal en el centro, con ramas que se extienden outward en círculo.',
    preview: null,
    mode: 'circular',
  },
  {
    id: 'artistic',
    name: 'Árbol Artístico',
    description:
      'Diseño visual inspirado en las ramas de un árbol natural. Fotografías integradas en las ramas, líneas orgánicas y curvas suaves. Estética cálida y orgánica.',
    preview: null,
    mode: 'artistic',
  },
  {
    id: 'minimalist',
    name: 'Árbol Minimalista',
    description:
      'Diseño limpio. Tarjetas sencillas, líneas discretas, sin ornamento visual. Foco en la información y nada más.',
    preview: null,
    mode: 'minimalist',
  },
  {
    id: 'chronological',
    name: 'Árbol Cronológico',
    description:
      'Organización por generaciones y fechas. Permite visualizar la línea de vida de cada persona junto con sus parientes. Cada nodo muestra nacimiento/fallecimiento al costado.',
    preview: null,
    mode: 'chronological',
  },
];

/*
 * Mapea cada modo a un nombre amigable en español que aparecerá en la galería.
 * Usamos lenguaje cotidiano, sin tecnicismo, para el usuario de 30-80 años.
 */
export const DESIGN_NAMES: Record<DesignMode, string> = {
  classic: 'Árbol Clásico',
  horizontal: 'Árbol Horizontal',
  vertical: 'Árbol Vertical',
  circular: 'Árbol Circular',
  artistic: 'Árbol Artístico',
  minimalist: 'Árbol Minimalista',
  chronological: 'Árbol Cronológico',
};

/*
 * Icono pequeño que representa cada diseño en la galería (usamos fuentes simples
 * para evitar dependencias de imágenes adicionales).
 */
export const DESIGN_ICONS: Record<DesignMode, string> = {
  classic: '🌳',
  horizontal: '↔️',
  vertical: '↕️',
  circular: '🔄',
  artistic: '🎨',
  minimalist: '✨',
  chronological: '📅',
};