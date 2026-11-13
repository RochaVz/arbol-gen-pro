import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlowProvider,
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Person, Relationship } from '../../core/db';
import { FamilyNode } from './nodes/FamilyNode';
import { FamilyRelationship } from './edges/FamilyRelationship';
import { cn } from '../utils/cn';
import { computeLayout } from '../../features/tree/utils/treeLayout';
import { ErrorBoundary } from './ErrorBoundary';

interface ReactFlowTreeProps {
  persons: Person[];
  relationships: Relationship[];
  photos?: Record<string, string>;
  treeCenterId?: string;
  onNodeClick?: (personId: string) => void;
  className?: string;
}

interface FamilyNodeData {
  label: string;
  person: Person;
  photoUrl?: string;
  isAlive: boolean;
  isTreeCenter: boolean;
}

const EMPTY_PHOTOS: Record<string, string> = {};

/**
 * Validates that tree data has the minimum required structure.
 * @param persons - Array of persons in the tree
 * @param relationships - Array of relationships in the tree
 * @returns true if data is valid for rendering, false otherwise
 */
function isValidTreeData(
  persons: any,
  relationships: any
): boolean {
  // Check if arrays exist and are not empty
  if (!Array.isArray(persons) || !Array.isArray(relationships)) {
    return false;
  }

  // Check if persons array has at least one person with a valid ID
  if (persons.length === 0) {
    return false;
  }

  // Validate that at least one person has an ID
  if (persons.every((p: any) => !p?.id)) {
    return false;
  }

  return true;
}

/**
 * Logs detailed error information for debugging.
 * @param context - Where the error occurred
 * @param error - The error object
 * @param data - Additional context data
 */
function logTreeError(context: string, error: any, data?: Record<string, any>) {
  console.error(`[ReactFlowTree] Error in ${context}:`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    ...data,
  });
}

export const ReactFlowTree: React.FC<ReactFlowTreeProps> = (props) => (
  <ErrorBoundary>
    <ReactFlowProvider>
      <ReactFlowTreeContent {...props} />
    </ReactFlowProvider>
  </ErrorBoundary>
);

const ReactFlowTreeContent: React.FC<ReactFlowTreeProps> = ({
  persons,
  relationships,
  photos = EMPTY_PHOTOS,
  treeCenterId,
  onNodeClick,
  className,
}) => {
  // Safely generate nodes from persons with error handling
  const initialNodes: Node<FamilyNodeData>[] = useMemo(() => {
    try {
      // Guard: Validate input arrays
      if (!isValidTreeData(persons, relationships)) {
        return [];
      }

      if (!Array.isArray(persons) || persons.length === 0) {
        return [];
      }

      if (!Array.isArray(relationships)) {
        logTreeError('initialNodes', 'relationships is not an array', {
          relationshipsType: typeof relationships,
        });
        return [];
      }

      // Safely determine center ID
      let centerId: string | undefined;
      try {
        centerId =
          treeCenterId && persons.some((p) => p?.id === treeCenterId)
            ? treeCenterId
            : persons[0]?.id;

        if (!centerId) {
          logTreeError('initialNodes', 'No valid center ID found');
          return [];
        }
      } catch (error) {
        logTreeError('initialNodes', error, { context: 'determining center ID' });
        centerId = undefined;
      }

      // Safely compute layout
      let posMap: Map<string, { x: number; y: number }> | null = null;
      try {
        if (centerId && relationships.length > 0) {
          const res = computeLayout(centerId, 3, 'branch', relationships);
          if (res?.pos && res.pos instanceof Map) {
            posMap = res.pos;
          }
        }
      } catch (error) {
        logTreeError('initialNodes', error, {
          context: 'computing layout',
          centerId,
          relationshipsCount: relationships.length,
        });
        posMap = null;
      }

      // Safely map persons to nodes
      const nodes = persons
        .map((person, index) => {
          try {
            // Validate person object
            if (!person || typeof person !== 'object') {
              return null;
            }

            const personId = person.id;
            if (!personId || typeof personId !== 'string') {
              return null;
            }

            const isTreeCenter = personId === treeCenterId;
            const isAlive = person.lifeStatus !== 'deceased';

            // Safely get position from posMap or use default fallback
            let position = { x: 0, y: 0 };
            try {
              const pt = posMap?.get(personId);
              if (pt && typeof pt.x === 'number' && typeof pt.y === 'number') {
                position = { x: pt.x - 95, y: pt.y - 75 };
              } else {
                // Fallback to grid layout
                position = {
                  x: (index % 5) * 280,
                  y: Math.floor(index / 5) * 350,
                };
              }
            } catch {
              // If position calculation fails, use grid layout
              position = {
                x: (index % 5) * 280,
                y: Math.floor(index / 5) * 350,
              };
            }

            // Safely construct data object
            const firstName = String(person.firstName || '').trim();
            const lastName = String(person.lastName || '').trim();
            const label = `${firstName} ${lastName}`.trim() || 'Sin nombre';
            const photoUrl = photos[personId] || undefined;

            return {
              id: personId,
              data: {
                label,
                person: person as Person,
                photoUrl,
                isAlive,
                isTreeCenter,
              },
              position,
              type: 'familyNode' as const,
              draggable: true,
            };
          } catch (error) {
            logTreeError('initialNodes', error, {
              context: 'mapping person to node',
              index,
              personId: person?.id,
            });
            return null;
          }
        })
        .filter(Boolean) as Node<FamilyNodeData>[];

      if (nodes.length === 0) {
        logTreeError('initialNodes', 'No valid nodes created from persons array', {
          personsCount: persons.length,
        });
      }

      return nodes;
    } catch (error) {
      logTreeError('initialNodes', error, {
        personsCount: persons?.length,
        relationshipsCount: relationships?.length,
      });
      return [];
    }
  }, [persons, treeCenterId, photos, relationships]);

  // Safely generate edges from relationships with error handling
  const initialEdges: Edge[] = useMemo(() => {
    try {
      // Validate input
      if (!Array.isArray(relationships) || relationships.length === 0) {
        return [];
      }

      const edges = relationships
        .map((rel, index) => {
          try {
            // Validate relationship object
            if (!rel || typeof rel !== 'object') {
              return null;
            }

            // Extract IDs with multiple fallback patterns
            // Support both (person1Id/person2Id) and (personId/relativeId)
            const source = rel.person1Id || rel.personId || '';
            const target = rel.person2Id || rel.relativeId || '';

            // Filter out edges with invalid source/target
            if (
              !source ||
              !target ||
              typeof source !== 'string' ||
              typeof target !== 'string'
            ) {
              return null;
            }

            // Don't create self-loops
            if (source === target) {
              return null;
            }

            const edgeId = rel.id ? String(rel.id) : `edge-${index}`;

            return {
              id: edgeId,
              source,
              target,
              type: 'familyEdge' as const,
              data: {
                relationType: rel.type || 'unknown',
              },
              animated: false,
            };
          } catch (error) {
            logTreeError('initialEdges', error, {
              context: 'mapping relationship to edge',
              index,
              relationId: rel?.id,
            });
            return null;
          }
        })
        .filter(Boolean) as Edge[];

      if (edges.length === 0 && relationships.length > 0) {
        logTreeError('initialEdges', 'No valid edges created from relationships array', {
          relationshipsCount: relationships.length,
        });
      }

      return edges;
    } catch (error) {
      logTreeError('initialEdges', error, {
        relationshipsCount: relationships?.length,
      });
      return [];
    }
  }, [relationships]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync when props change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const { fitView } = useReactFlow();

  const nodeTypes = useMemo(() => ({
    familyNode: FamilyNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    familyEdge: FamilyRelationship,
  }), []);

  const onNodeClickHandler = useCallback(
    (_event: React.MouseEvent, node: Node<FamilyNodeData>) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  // Auto-fit view when nodes change
  React.useEffect(() => {
    if (nodes.length > 0) {
      // Small delay to allow rendering
      const timeout = setTimeout(() => fitView({ padding: 0.2 }), 200);
      return () => clearTimeout(timeout);
    }
  }, [nodes.length, fitView]);

  // Render fallback UI if no valid data
  if (!isValidTreeData(persons, relationships)) {
    return (
      <div
        className={cn(
          'w-full h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center',
          className
        )}
      >
        <div className="text-center p-6 max-w-md">
          <div className="text-lg font-semibold text-slate-800 mb-2">
            No hay datos para mostrar
          </div>
          <p className="text-sm text-slate-600">
            No hay miembros de la familia o relaciones para visualizar el árbol genealógico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 shadow-sm overflow-hidden',
        className
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClickHandler}
        fitView
      >
        <Background
          color="#cbd5e1"
          gap={16}
          size={1}
          style={{ backgroundColor: '#f8fafc' }}
        />
        <Controls
          position="top-left"
          showZoom
          showFitView
          showInteractive
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        />
        <MiniMap
          position="bottom-right"
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
          maskColor="rgba(37, 99, 235, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};

export default ReactFlowTree;