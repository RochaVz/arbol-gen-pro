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
import type { TreeStyle } from '../../features/family-tree/components/templates/treeTemplateGallery';

interface ReactFlowTreeProps {
  persons: Person[];
  relationships: Relationship[];
  photos?: Record<string, string>;
  treeCenterId?: string;
  onNodeClick?: (personId: string) => void;
  className?: string;
  onSearchTermChange?: (term: string) => void;
  layout?: 'horizontal' | 'vertical';
  visualStyle?: TreeStyle;
  showPhotos?: boolean;
  showDates?: boolean;
  showLabels?: boolean;
  showRelationships?: boolean;
  showGrid?: boolean;
  showConnections?: boolean;
}

interface FamilyNodeData {
  label: string;
  person: Person;
  photoUrl?: string;
  isAlive: boolean;
  isTreeCenter: boolean;
  generation?: number;
  showPhotos: boolean;
  showDates: boolean;
  showLabels: boolean;
  visualStyle?: TreeStyle;
}

const NODE_TYPES = {
  familyNode: FamilyNode,
};

const EDGE_TYPES = {
  familyEdge: FamilyRelationship,
};

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
  layout: _layout = 'horizontal',
  visualStyle,
  showPhotos = true,
  showDates = true,
  showLabels = true,
  showRelationships = true,
  showGrid = false,
  showConnections = true,
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
        if (centerId) {
          const res = computeLayout(centerId, 3, 'branch', relationships);
          if (res?.pos && res.pos instanceof Map) {
            posMap = res.pos;
            if (visualStyle?.orientation === 'horizontal') {
              const horizontal = new Map<string, { x: number; y: number }>();
              for (const [id, point] of posMap) {
                horizontal.set(id, { x: point.y, y: point.x });
              }
              posMap = horizontal;
            } else if (visualStyle?.orientation === 'radial') {
              const radial = new Map<string, { x: number; y: number }>();
              const ids = persons.map((person) => person.id);
              const centerIndex = ids.indexOf(centerId);
              if (centerIndex >= 0) radial.set(centerId, { x: 0, y: 0 });
              const others = ids.filter((id) => id !== centerId);
              const spacingScale = visualStyle.spacing === 'compact' ? 0.85 : visualStyle.spacing === 'wide' ? 1.25 : 1;
              others.forEach((id, index) => {
                const angle = (Math.PI * 2 * index) / Math.max(others.length, 1);
                const radius = 360 * spacingScale;
                radial.set(id, {
                  x: Math.cos(angle) * radius,
                  y: Math.sin(angle) * radius,
                });
              });
              posMap = radial;
            }

            if (visualStyle?.spacing && visualStyle.orientation !== 'radial') {
              const scale = visualStyle.spacing === 'compact' ? 0.85 : visualStyle.spacing === 'wide' ? 1.25 : 1;
              const scaled = new Map<string, { x: number; y: number }>();
              for (const [id, point] of posMap) {
                scaled.set(id, { x: point.x * scale, y: point.y * scale });
              }
              posMap = scaled;
            }
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

      if (!posMap) {
        posMap = new Map();
        persons.forEach((person, index) => {
          posMap?.set(person.id, {
            x: (index % 5) * 280 + 95,
            y: Math.floor(index / 5) * 350 + 75,
          });
        });
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
            const generation = person.generation ?? 0;

            return {
              id: personId,
              data: {
                label,
                person: person as Person,
                photoUrl,
                isAlive,
                isTreeCenter,
                generation,
                showPhotos,
                showDates,
                showLabels,
                visualStyle,
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
  }, [persons, treeCenterId, photos, relationships, visualStyle, showPhotos, showDates, showLabels]);

  // Safely generate edges from relationships with error handling
  const initialEdges: Edge[] = useMemo(() => {
    try {
      if (!showConnections) return [];
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
                showRelationships,
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
  }, [persons, relationships, showConnections, showRelationships]);

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
  }, [nodes, fitView]);

  // Render fallback UI if no valid data
  if (!isValidTreeData(persons, relationships)) {
    return (
      <div
        className={cn(
          'w-full h-full bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex items-center justify-center',
          className
        )}
      >
        <div className="text-center p-6 max-w-md">
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            No hay datos para mostrar
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No hay miembros de la familia o relaciones para visualizar el árbol genealógico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full h-full bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden',
        className
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onNodeClick={onNodeClickHandler}
        fitView
      >
        {showGrid && (
          <Background
            color="#cbd5e1"
            gap={16}
            size={1}
            style={{ backgroundColor: 'var(--bg-color)' }}
          />
        )}
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
        {/* Only show MiniMap on desktop (lg screens) */}
        <div className="hidden lg:block">
          <MiniMap
            position="bottom-right"
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
            maskColor="rgba(37, 99, 235, 0.1)"
          />
        </div>
      </ReactFlow>
    </div>
  );
};

export default ReactFlowTree;