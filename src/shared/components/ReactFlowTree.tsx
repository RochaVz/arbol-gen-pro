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
  const nodeTypes = useMemo(() => ({ familyNode: FamilyNode }), []);
  const edgeTypes = useMemo(() => ({ familyEdge: FamilyRelationship }), []);

  // Generate nodes from persons
  const initialNodes: Node<FamilyNodeData>[] = useMemo(() => {
    const centerId =
      treeCenterId && persons.some((p) => p.id === treeCenterId)
        ? treeCenterId
        : persons[0]?.id;
    let posMap: Map<string, { x: number; y: number }> | null = null;
    if (centerId && relationships.length > 0) {
      try {
        const res = computeLayout(centerId, 3, 'branch', relationships);
        posMap = res.pos;
      } catch {
        posMap = null;
      }
    }

    return persons.map((person, index) => {
      const isTreeCenter = person.id === treeCenterId;
      const isAlive = person.lifeStatus !== 'deceased';
      const pt = posMap?.get(person.id);
      const position = pt
        ? { x: pt.x - 95, y: pt.y - 75 }
        : { x: (index % 5) * 280, y: Math.floor(index / 5) * 350 };

      return {
        id: person.id,
        data: {
          label: `${person.firstName} ${person.lastName || ''}`.trim(),
          person,
          photoUrl: photos[person.id],
          isAlive,
          isTreeCenter,
        },
        position,
        type: 'familyNode',
        draggable: true,
      };
    });
  }, [persons, treeCenterId, photos, relationships]);

  // Generate edges from relationships
  const initialEdges: Edge[] = useMemo(
    () =>
      relationships.map((rel, index) => ({
        id: `edge-${rel.id || index}`,
        source: rel.person1Id || '',
        target: rel.person2Id || '',
        type: 'familyEdge',
        data: {
          relationType: rel.type,
        },
        animated: false,
      })).filter(edge => edge.source && edge.target),
    [relationships]
  );

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
