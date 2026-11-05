import React from "react";

export interface ModernConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'parent-child' | 'spouse' | 'descendant';
  color?: string;
  className?: string;
  animated?: boolean;
}

export const ModernConnectionLine = React.forwardRef<SVGSVGElement, ModernConnectionLineProps>(
  ({ x1, y1, x2, y2, type = 'parent-child', color, className = '', animated = false }, ref) => {
    const isSpouse = type === 'spouse';
    
    const strokeColor = color || 'var(--color-border)';
    const strokeWidth = isSpouse ? 2 : 2.5;
    const strokeDasharray = isSpouse ? '4,4' : 'none';
    const opacity = isSpouse ? 0.6 : 0.7;

    // Para cónyuges: línea horizontal recta
    if (isSpouse) {
      return (
        <svg
          ref={ref}
          className={`absolute top-0 left-0 w-full h-full pointer-events-none ${className}`}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeOpacity={opacity}
            strokeDasharray={strokeDasharray}
            className="transition-opacity duration-300"
          />
        </svg>
      );
    }

    // Para padre-hijo: curva bézier suave
    const cx = (x1 + x2) / 2;
    const cy1 = y1;
    const cy2 = y2;
    const curveDepth = Math.abs(y2 - y1) * 0.3;

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
        
        {/* Línea vertical desde nodo padre hacia abajo */}
        <line
          x1={x1}
          y1={y1}
          x2={x1}
          y2={y1 + curveDepth}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity}
          className="transition-opacity duration-300"
        />
        
        {/* Línea horizontal conectando padres */}
        <line
          x1={x1}
          y1={y1 + curveDepth}
          x2={x2}
          y2={y1 + curveDepth}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity}
          className="transition-opacity duration-300"
        />
        
        {/* Línea vertical hacia nodo hijo */}
        <line
          x1={x2}
          y1={y1 + curveDepth}
          x2={x2}
          y2={y2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity}
          markerEnd="url(#arrowhead)"
          className="transition-opacity duration-300"
        />
      </svg>
    );
  },
);

ModernConnectionLine.displayName = 'ModernConnectionLine';