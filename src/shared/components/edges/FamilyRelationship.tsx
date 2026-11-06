import React from 'react';
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  type EdgeProps,
} from 'reactflow';
import { cn } from '../../utils/cn';

interface FamilyEdgeData {
  relationType:
    | 'parent'
    | 'child'
    | 'spouse'
    | 'sibling'
    | 'other';
}

export const FamilyRelationship: React.FC<EdgeProps<FamilyEdgeData>> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20,
  });

  // Determine edge color and style based on relationship type
  const getEdgeStyle = (type?: string) => {
    switch (type) {
      case 'parent':
      case 'child':
        return {
          stroke: '#3b82f6', // Blue for parent-child
          strokeWidth: 2.5,
        };
      case 'spouse':
        return {
          stroke: '#ec4899', // Pink for spouse
          strokeWidth: 2.5,
          strokeDasharray: '5,5',
        };
      case 'sibling':
        return {
          stroke: '#10b981', // Green for sibling
          strokeWidth: 2,
        };
      default:
        return {
          stroke: '#94a3b8', // Gray for other
          strokeWidth: 1.5,
        };
    }
  };

  const edgeStyle = {
    ...getEdgeStyle(data?.relationType),
    ...style,
  };

  // Label for relationship
  const getRelationshipLabel = (type?: string) => {
    switch (type) {
      case 'parent':
        return 'Padre/Madre';
      case 'child':
        return 'Hijo/a';
      case 'spouse':
        return 'Cónyuge';
      case 'sibling':
        return 'Hermano/a';
      default:
        return 'Familiar';
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} style={edgeStyle} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 11,
            fontWeight: 600,
            pointerEvents: 'all',
          }}
          className={cn(
            'bg-white px-2 py-1 rounded-md shadow-sm border transition-all',
            selected
              ? 'border-primary-500 shadow-md text-primary-600'
              : 'border-slate-200 text-slate-600'
          )}
        >
          {getRelationshipLabel(data?.relationType)}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
