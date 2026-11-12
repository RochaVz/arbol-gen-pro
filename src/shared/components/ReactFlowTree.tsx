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

export const ReactFlowTree: React.FC<ReactFlowTreeProps> = ({
  persons,
  relationships,
  photos = {},
  treeCenterId,
  onNodeClick,
  className,
}) => {
  // Safely generate nodes from persons with error handling
  const initialNodes: Node<FamilyNodeData>[] = useMemo(() => {
    // Handle empty persons array
    if (!persons || persons.length === 0) return [];

    // Safely determine center ID
    let centerId: string | undefined;
    try {
      centerId =
        treeCenterId && persons.some((p) => p?.id === treeCenterId)
          ? treeCenterId
          : persons[0]?.id;
    } catch {
      centerId = undefined;
    }

    // Safely compute layout
    let posMap: Map<string, { x: number; y: number }> | null = null;
    try {
      if (centerId && relationships?.length > 0) {
        const res = computeLayout(centerId, 3, 'branch', relationships);
        posMap = res.pos;
      }
    } catch {
      posMap = null;
    }

    // Safely map persons to nodes
    try {
      return persons.map((person, index) => {
        // Safely access person properties
        const personId = person?.id;
        if (!personId) return null;

        const isTreeCenter = person?.id === treeCenterId;
        const isAlive = person?.lifeStatus !== 'deceased';
        
        // Safely get position from posMap or use default
        const pt = posMap?.get(personId);
        const position = pt
          ? { x: pt.x - 95, y: pt.y - 75 }
          : { x: (index % 5) * 280, y: Math.floor(index / 5) * 350 };

        // Safely construct data object
        const label = `${person?.firstName || ''} ${person?.lastName || ''}`.trim();
        const photoUrl = photos[personId];

        return {
          id: personId,
          data: {
            label,
            person: person || { id: '', firstName: '', lastName: '', lifeStatus: 'alive', sex: 'unknown', birthDate: undefined, deathDate: undefined, birthplace: undefined },
            photoUrl,
            isAlive,
            isTreeCenter,
          },
          position,
          type: 'familyNode' as const,
          draggable: true,
        };
      }).filter(Boolean) as Node<FamilyNodeData>[];
    } catch {
      return [];
    }
  }, [persons, treeCenterId, photos, relationships]);

  // Safely generate edges from relationships with error handling
  const initialEdges: Edge[] = useMemo(() => {
    // Handle empty or undefined relationships
    if (!relationships || relationships.length === 0) return [];

    try {
      return relationships
        .map((rel, index) => {
          // Safely access relationship properties
          const source = rel?.person1Id || '';
          const target = rel?.person2Id || '';

          // Filter out edges with invalid source/target
          if (!source || !target) return null;

          return {
            id: `edge-${rel.id || index}`,
            source,
            target,
            type: 'familyEdge' as const,
            data: {
              relationType: rel?.type,
            },
            animated: false,
          };
        })
        .filter(Boolean) as Edge[];
    } catch {
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
      setTimeout(() => fitView({ padding: 0.2 }), 200);
    }
  }, [nodes.length, fitView]);

  return (
    <ReactFlowProvider>
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
        {/* Background */}
        <Background
          color="#cbd5e1"
          gap={16}
          size={1}
          style={{ backgroundColor: '#f8fafc' }}
        />

        {/* Controls */}
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

        {/* Mini Map */}
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
    </ReactFlowProvider>
  );
};

export default ReactFlowTree;
