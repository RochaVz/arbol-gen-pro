import type { Relationship } from '../../../core/db/schema';


export const NODE_W = 120;
export const NODE_H = 56;
export const H_GAP = 28;
export const V_GAP = 110;

export type Pt = { x: number; y: number };
export type Layout = Map<string, Pt>;

export function parentsOf(personId: string, rels: Relationship[]): string[] {
  const out: string[] = [];
  for (const r of rels) {
    if (r.deletedAt) continue;
    const from = r.person1Id ?? r.personId;
    const to = r.person2Id ?? r.relativeId;
    if (!from || !to) continue;
    const t = String(r.type ?? '').toLowerCase();
    if (t.includes('parent') || t.includes('father') || t.includes('mother')) {
      if (to === personId) out.push(from);
    } else if (t.includes('child') || t.includes('son') || t.includes('daughter')) {
      if (from === personId) out.push(to);
    }
  }
  return Array.from(new Set(out));
}

export function childrenOf(personId: string, rels: Relationship[]): string[] {
  const out: string[] = [];
  for (const r of rels) {
    if (r.deletedAt) continue;
    const from = r.person1Id ?? r.personId;
    const to = r.person2Id ?? r.relativeId;
    if (!from || !to) continue;
    const t = String(r.type ?? '').toLowerCase();
    if (t.includes('parent') || t.includes('father') || t.includes('mother')) {
      if (from === personId) out.push(to);
    } else if (t.includes('child') || t.includes('son') || t.includes('daughter')) {
      if (to === personId) out.push(from);
    }
  }
  return Array.from(new Set(out));
}

export function spousesOf(personId: string, rels: Relationship[]): string[] {
  const out: string[] = [];
  for (const r of rels) {
    if (r.deletedAt) continue;
    const from = r.person1Id ?? r.personId;
    const to = r.person2Id ?? r.relativeId;
    if (!from || !to) continue;
    const t = String(r.type ?? '').toLowerCase();
    if (t.includes('spouse') || t.includes('partner') || t.includes('marriage') || t.includes('husband') || t.includes('wife') || t.includes('union')) {
      if (from === personId) out.push(to);
      if (to === personId) out.push(from);
    }
  }
  return Array.from(new Set(out));
}

export type Mode = 'ancestors' | 'descendants' | 'branch';

export function layoutDescendants(rootId: string, depth: number, rels: Relationship[], pos: Layout, startX = 0, y = 0): number {
  const kids = depth > 0 ? childrenOf(rootId, rels) : [];
  if (kids.length === 0) {
    const cx = startX + NODE_W / 2;
    pos.set(rootId, { x: cx, y: y + NODE_H / 2 });
    return NODE_W;
  }
  let x = startX;
  for (const c of kids) {
    const w = layoutDescendants(c, depth - 1, rels, pos, x, y + V_GAP);
    x += w + H_GAP;
  }
  const totalW = x - startX - H_GAP;
  const rootCx = startX + totalW / 2;
  pos.set(rootId, { x: rootCx, y: y + NODE_H / 2 });
  return Math.max(totalW, NODE_W);
}

export function layoutAncestors(rootId: string, depth: number, rels: Relationship[], pos: Layout, startX = 0, y = 0): number {
  const pars = depth > 0 ? parentsOf(rootId, rels) : [];
  if (pars.length === 0) {
    const cx = startX + NODE_W / 2;
    if (!pos.has(rootId)) pos.set(rootId, { x: cx, y: y - NODE_H / 2 });
    return NODE_W;
  }
  let x = startX;
  for (const p of pars) {
    const w = layoutAncestors(p, depth - 1, rels, pos, x, y - V_GAP);
    x += w + H_GAP;
  }
  const totalW = x - startX - H_GAP;
  const rootCx = startX + totalW / 2;
  if (!pos.has(rootId)) pos.set(rootId, { x: rootCx, y: y - NODE_H / 2 });
  return Math.max(totalW, NODE_W);
}

export interface LayoutResult {
  pos: Layout;
  width: number;
  height: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function computeLayout(centerId: string, depth: number, mode: Mode, rels: Relationship[]): LayoutResult {
  const pos: Layout = new Map();
  const d = Math.max(1, Math.min(10, depth));

  if (mode === 'descendants') {
    layoutDescendants(centerId, d, rels, pos, 0, 0);
  } else if (mode === 'ancestors') {
    layoutAncestors(centerId, d, rels, pos, 0, 0);
  } else {
    layoutDescendants(centerId, d, rels, pos, 0, 0);
    const centerX = pos.get(centerId)!.x;
    const ancPos: Layout = new Map();
    const ancW = layoutAncestors(centerId, d, rels, ancPos, 0, 0);
    const ancRootCx = ancPos.get(centerId)!.x;
    const shift = centerX - ancRootCx;
    for (const [id, pt] of ancPos) {
      if (id === centerId) continue;
      pos.set(id, { x: pt.x + shift, y: pt.y });
    }
    const sps = spousesOf(centerId, rels);
    let sx = centerX + NODE_W + H_GAP;
    for (const s of sps) {
      if (pos.has(s)) continue;
      pos.set(s, { x: sx + NODE_W / 2, y: pos.get(centerId)!.y });
      sx += NODE_W + H_GAP;
    }
    void ancW;
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const pt of pos.values()) {
    minX = Math.min(minX, pt.x - NODE_W / 2);
    minY = Math.min(minY, pt.y - NODE_H / 2);
    maxX = Math.max(maxX, pt.x + NODE_W / 2);
    maxY = Math.max(maxY, pt.y + NODE_H / 2);
  }
  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = NODE_W; maxY = NODE_H; }
  const pad = 40;
  return {
    pos,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
    minX: minX - pad,
    minY: minY - pad,
    maxX: maxX + pad,
    maxY: maxY + pad,
  };
}
