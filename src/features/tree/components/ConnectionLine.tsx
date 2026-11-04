import React from "react";
/**
 * ConnectionLine — Línea de conexión suave entre nodos del árbol.
 * Usa SVG con curva bézier para evitar diagramas técnicos rígidos.
 */
export interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'parent-child' | 'spouse' | 'descendant';
  color?: string;
  className?: string;
}

export const ConnectionLine = React.forwardRef<SVGSVGElement, ConnectionLineProps>(
  ({ x1, y1, x2, y2, type = 'parent-child', color, className = '' }, ref) => {
    // Curva suave para conexiones padre-hijo
    const cx1 = (x1 + x2) / 2;
    const cy1 = y1;
    const cx2 = (x1 + x2) / 2;
    const cy2 = y2;

    // Línea horizontal para cónyuges
    const isSpouse = type === 'spouse';

    const strokeColor = color || 'var(--color-sepia)';
    const strokeWidth = type === 'spouse' ? 2 : 2.5;
    const opacity = type === 'spouse' ? 0.6 : 0.7;

    return (
      <svg
        ref={ref}
        className={`absolute top-0 left-0 w-full h-full pointer-events-none ${className}`}
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} />
          </marker>
        </defs>

        {isSpouse ? (
          // Línea horizontal suave entre cónyuges
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeOpacity={opacity}
            strokeDasharray="4 4"
            className="transition-opacity duration-300"
          />
        ) : (
          // Curva bézier suave para conexiones generacionales
          <path
            d={`M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeOpacity={opacity}
            className="transition-opacity duration-300"
          />
        )}
      </svg>
    );
  },
);

ConnectionLine.displayName = 'ConnectionLine';