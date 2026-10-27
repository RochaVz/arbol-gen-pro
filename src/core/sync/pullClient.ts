// Cliente de sincronización descendente (Fase 8).
// Llama a la Edge Function `pull`, aplica los cambios remotos a Dexie
// y avanza el cursor local.

import { db } from '../db';
import type { EntityType } from '../db/schema';
import { getAccessToken } from '../supabase/client';

const TABLE_MAP: Record<EntityType, any> = {
  tree: db.trees,
  person: db.persons,
  relationship: db.relationships,
  event: db.events,
  photo: db.photos,
  treeMembership: db.treeMemberships,
  treeInvitation: db.treeInvitations,
};

const CURSOR_KEY = 'arbol-gen-pro-pull-cursor';

export function getPullCursor(): number {
  const v = localStorage.getItem(CURSOR_KEY);
  return v ? Number(v) : 0;
}

export function setPullCursor(c: number): void {
  localStorage.setItem(CURSOR_KEY, String(c));
}

function snakeToCamelKey(k: string): string {
  return k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function rowToEntity(row: any): any {
  const out: any = {};
  for (const [k, v] of Object.entries(row)) {
    out[snakeToCamelKey(k)] = v;
  }
  if (out.deletedAt === undefined && row.deleted_at !== undefined) out.deletedAt = row.deleted_at;
  out.syncStatus = 'synced';
  return out;
}

export interface PullResult {
  ok: boolean;
  applied: number;
  cursor: number;
  message?: string;
}

export async function pullChanges(treeId?: string): Promise<PullResult> {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return { ok: false, applied: 0, cursor: getPullCursor(), message: 'Supabase no configurado' };

  const token = await getAccessToken();
  if (!token) return { ok: false, applied: 0, cursor: getPullCursor(), message: 'Sin sesion' };

  const url = `${base.replace(/\/$/, '')}/functions/v1/pull`;
  const since = getPullCursor();

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
      },
      body: JSON.stringify({ since, treeId: treeId ?? null, limit: 200 }),
    });
  } catch (e) {
    return { ok: false, applied: 0, cursor: since, message: String((e as Error)?.message ?? e) };
  }

  if (!res.ok) {
    return { ok: false, applied: 0, cursor: since, message: `HTTP ${res.status}` };
  }

  const data = await res.json();
  const entities = data.entities ?? {};
  const cursor = typeof data.cursor === 'number' ? data.cursor : since;

  let applied = 0;
  for (const [et, rows] of Object.entries(entities)) {
    const table = TABLE_MAP[et as EntityType];
    if (!table) continue;
    for (const row of rows as any[]) {
      const entity = rowToEntity(row);
      // No sobrescribir cambios locales pendientes.
      const pending = await db.syncOutbox
        .where('[entityType+entityId]').equals([et, entity.id]).toArray();
      const hasPending = pending.some((p) => p.status === 'pending' || p.status === 'in_flight' || p.status === 'blocked');
      if (hasPending) continue;
      await table.put(entity);
      applied += 1;
    }
  }

  if (cursor > since) setPullCursor(cursor);
  return { ok: true, applied, cursor };
}
