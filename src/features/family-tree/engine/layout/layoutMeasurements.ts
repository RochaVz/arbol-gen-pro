export interface NodeMeasurements {
  width: number;
  height: number;
  totalWidth: number;
  totalHeight: number;
}

export function getNodeMeasurements(domNode: Element): NodeMeasurements {
  const rect = domNode.getBoundingClientRect();
  const style = window.getComputedStyle(domNode);

  const paddingLeft = parseFloat(style.paddingLeft) || 0;
  const paddingRight = parseFloat(style.paddingRight) || 0;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const paddingBottom = parseFloat(style.paddingBottom) || 0;

  const width = rect.width + paddingLeft + paddingRight;
  const height = rect.height + paddingTop + paddingBottom;

  return {
    width,
    height,
    totalWidth: width,
    totalHeight: height,
  };
}

export class LayoutEngine {
  calculateLayout(
    persons: any[],
    relationships: any[],
    options: {
      type: 'vertical' | 'horizontal' | 'radial';
      hGap?: number;
      vGap?: number;
      nodeWidth?: number;
      nodeHeight?: number;
    }
  ): { positions: Map<string, { x: number; y: number }>; measurements: NodeMeasurements } {
    const measurements: NodeMeasurements = {
      width: options.nodeWidth || 190,
      height: options.nodeHeight || 150,
      totalWidth: options.nodeWidth || 190,
      totalHeight: options.nodeHeight || 150,
    };

    const positions = new Map<string, { x: number; y: number }>();

    if (options.type === 'vertical') {
      let currentY = 0;

      const hasParentRelation = new Set<string>();
      for (const r of relationships) {
        if (r.type?.includes('parent')) {
          hasParentRelation.add(r.person2Id);
        }
      }

      const roots = persons.filter(p => !hasParentRelation.has(p.id));

      for (const root of roots) {
        positions.set(root.id, { x: options.nodeWidth! / 2, y: currentY });
        currentY += options.vGap ?? 180;
      }

      for (const parentId of positions.keys()) {
        const childrenOfParent = relationships
          .filter(r => r.personId === parentId || r.person1Id === parentId || r.person2Id === parentId)
          .filter(r => r.type?.includes('parent'));

        let childY = (positions.get(parentId)?.y ?? 0) + (options.vGap ?? 180);

        for (const childRel of childrenOfParent) {
          const childId = childRel.personId === parentId ? childRel.relativeId : childRel.personId;
          if (!positions.has(childId)) {
            positions.set(childId, { x: options.nodeWidth! / 2, y: childY });
            childY += options.vGap ?? 180;
          }
        }
      }
    }

    return { positions, measurements };
  }
}