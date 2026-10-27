// @ts-nocheck
// @ts-nocheck
// Deno Edge Function - pull descendente (Fase 8).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const TABLE: Record<string, string> = {
  tree: 'trees',
  person: 'persons',
  relationship: 'relationships',
  event: 'events',
  photo: 'photos',
  treeMembership: 'tree_memberships',
  treeInvitation: 'tree_invitations',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// function snakeToCamel? no, server returns snake; client converts.

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ error: 'missing_token' }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) return json({ error: 'session_expired' }, 401);
  const userId = userData.user.id;

  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }

  const since = Number(body.since ?? 0);
  const requestedTreeId = body.treeId ?? null;
  const limit = Math.min(Number(body.limit ?? 200), 500);

  // Árboles accesibles por el usuario.
  const { data: mems } = await admin.from('tree_memberships').select('tree_id').eq('user_id', userId).is('deleted_at', null);
  const accessibleTrees = new Set((mems ?? []).map((m: any) => m.tree_id));
  // También los que posee.
  const { data: owned } = await admin.from('trees').select('id').eq('owner_id', userId).is('deleted_at', null);
  for (const t of owned ?? []) accessibleTrees.add(t.id);

  if (requestedTreeId && !accessibleTrees.has(requestedTreeId)) {
    return json({ error: 'forbidden' }, 403);
  }

  const treeFilter = requestedTreeId ? new Set([requestedTreeId]) : accessibleTrees;

  // Operaciones procesadas posteriores al cursor.
  const { data: ops } = await admin
    .from('processed_operations')
    .select('operation_id, entity_type, entity_id, operation_type, result_status, result_server_version, processed_at, user_id')
    .gt('processed_at', since)
    .order('processed_at', { ascending: true })
    .limit(limit);

  // Derivar treeId de cada op y filtrar por acceso.
  const treeIdCache = new Map<string, string | null>();
  async function deriveTreeId(entityType: string, entityId: string): Promise<string | null> {
    if (entityType === 'tree') return entityId;
    const key = `${entityType}:${entityId}`;
    if (treeIdCache.has(key)) return treeIdCache.get(key)!;
    const table = TABLE[entityType];
    if (!table) { treeIdCache.set(key, null); return null; }
    const { data: row } = await admin.from(table).select('tree_id').eq('id', entityId).maybeSingle();
    const tid = row?.tree_id ?? null;
    treeIdCache.set(key, tid);
    return tid;
  }

  const filteredOps: any[] = [];
  for (const op of ops ?? []) {
    const tid = await deriveTreeId(op.entity_type, op.entity_id);
    if (!tid || !treeFilter.has(tid)) continue;
    filteredOps.push(op);
  }

  // Recolectar entidades afectadas.
  const byEntity = new Map<string, Set<string>>();
  for (const op of filteredOps) {
    const key = op.entity_type;
    if (!byEntity.has(key)) byEntity.set(key, new Set());
    byEntity.get(key)!.add(op.entity_id);
  }

  const entities: Record<string, any[]> = {};
  for (const [et, ids] of byEntity.entries()) {
    const table = TABLE[et];
    if (!table) continue;
    const { data: rows } = await admin.from(table).select('*').in('id', Array.from(ids));
    entities[et] = rows ?? [];
  }

  const cursor = filteredOps.length ? filteredOps[filteredOps.length - 1].processed_at : since;

  return json({ operations: filteredOps, entities, cursor }, 200);
});
