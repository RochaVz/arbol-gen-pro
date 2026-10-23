export type Edge = { from: string; to: string };

export function hasCycle(edges: Edge[]): boolean {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  for (const n of adj.keys()) color.set(n, WHITE);
  // ensure nodes with no outgoing also present
  for (const e of edges) {
    if (!color.has(e.to)) color.set(e.to, WHITE);
  }

  function dfs(u: string): boolean {
    color.set(u, GRAY);
    for (const v of adj.get(u) ?? []) {
      if (!color.has(v)) color.set(v, WHITE);
      if (color.get(v) === GRAY) return true;
      if (color.get(v) === WHITE && dfs(v)) return true;
    }
    color.set(u, BLACK);
    return false;
  }

  for (const n of color.keys()) {
    if (color.get(n) === WHITE && dfs(n)) return true;
  }
  return false;
}

export function wouldCreateCycle(edges: Edge[], from: string, to: string): boolean {
  return hasCycle([...edges, { from, to }]);
}

export function findCycle(edges: Edge[]): string[] | null {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }
  const path: string[] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(u: string): boolean {
    visited.add(u);
    recStack.add(u);
    path.push(u);
    for (const v of adj.get(u) ?? []) {
      if (!visited.has(v)) {
        if (dfs(v)) return true;
      } else if (recStack.has(v)) {
        path.push(v);
        return true;
      }
    }
    recStack.delete(u);
    path.pop();
    return false;
  }

  for (const n of adj.keys()) {
    if (!visited.has(n) && dfs(n)) return path;
  }
  return null;
}