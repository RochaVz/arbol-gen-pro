// @ts-nocheck
// Deno Edge Function - tipado gestionado por Deno, no por el tsconfig del frontend.
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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ status: 'failed', errorCode: 'method_not_allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ status: 'failed', errorCode: 'missing_token' }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return json({ status: 'failed', errorCode: 'session_expired' }, 401);
  }
  const userId = userData.user.id;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ status: 'failed', errorCode: 'invalid_json' }, 400);
  }

  const operationId = body.operationId;
  const entityType = body.entityType;
  const entityId = body.entityId;
  const operationType = body.operationType;
  const baseServerVersion = Number(body.baseServerVersion ?? 0);
  const payload = body.payload ?? null;

  if (!operationId || !entityType || !entityId || !operationType) {
    return json({ operationId, status: 'failed', errorCode: 'invalid_payload' }, 400);
  }
  if (!TABLE[entityType]) {
    return json({ operationId, status: 'failed', errorCode: 'unknown_entity_type' }, 400);
  }
  const table = TABLE[entityType];
  // Idempotencia
  const { data: existingOp } = await admin
    .from('processed_operations')
    .select('result_status, result_server_version')
    .eq('operation_id', operationId)
    .maybeSingle();
  if (existingOp) {
    return json({
      operationId,
      status: 'alreadyProcessed',
      serverVersion: existingOp.result_server_version,
    }, 200);
  }

  // Derivar treeId
  let treeId: string | null = null;
  if (entityType === 'tree') {
    treeId = entityId;
  } else if (operationType === 'create') {
    treeId = payload?.treeId ?? null;
  } else {
    const { data: row } = await admin.from(table).select('tree_id').eq('id', entityId).maybeSingle();
    treeId = row?.tree_id ?? null;
  }

  if (!(entityType === 'tree' && operationType === 'create')) {
    if (!treeId) {
      return json({ operationId, status: 'failed', errorCode: 'missing_tree' }, 400);
    }
    const { data: mem } = await admin
      .from('tree_memberships')
      .select('role')
      .eq('tree_id', treeId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();
    const role = mem?.role;
    if (!role || !['owner', 'admin', 'editor'].includes(role)) {
      return json({ operationId, status: 'failed', errorCode: 'forbidden' }, 403);
    }
  }

  const now = Date.now();

  const { data: current } = await admin.from(table).select('*').eq('id', entityId).maybeSingle();

  if (operationType !== 'create') {
    if (!current) {
      await admin.from('processed_operations').insert({
        operation_id: operationId,
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        operation_type: operationType,
        result_status: 'conflict',
        result_server_version: null,
        processed_at: now,
      });
      return json({ operationId, status: 'conflict', conflictKind: 'deleted_remotely' }, 409);
    }
    if (current.deleted_at !== null && operationType !== 'delete') {
      await admin.from('processed_operations').insert({
        operation_id: operationId,
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        operation_type: operationType,
        result_status: 'conflict',
        result_server_version: current.server_version,
        processed_at: now,
      });
      return json({
        operationId,
        status: 'conflict',
        serverVersion: current.server_version,
        conflictKind: 'deleted_remotely',
        server: current,
      }, 409);
    }
    if (baseServerVersion < current.server_version) {
      await admin.from('processed_operations').insert({
        operation_id: operationId,
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        operation_type: operationType,
        result_status: 'conflict',
        result_server_version: current.server_version,
        processed_at: now,
      });
      return json({
        operationId,
        status: 'conflict',
        serverVersion: current.server_version,
        conflictKind: 'version',
        server: current,
      }, 409);
    }
    if (baseServerVersion > current.server_version) {
      return json({ operationId, status: 'conflict', conflictKind: 'client_stale' }, 409);
    }
  } else {
    if (current && current.deleted_at === null) {
      return json({ operationId, status: 'conflict', conflictKind: 'version', serverVersion: current.server_version }, 409);
    }
  }

  try {
    let newServerVersion = 1;
    if (operationType !== 'create' && current) {
      newServerVersion = (current.server_version ?? 0) + 1;
    }

    if (operationType === 'create') {
      const row: any = { id: entityId, server_version: newServerVersion, deleted_at: null, created_at: now, updated_at: now, ...stripMeta(payload) };
      if (entityType === 'tree') {
        row.owner_id = userId;
        row.name = payload?.name ?? 'Sin nombre';
      }
      const { error } = await admin.from(table).insert(row);
      if (error) throw error;
      if (entityType === 'tree') {
        await admin.from('tree_memberships').insert({
          tree_id: entityId,
          user_id: userId,
          role: 'owner',
          joined_at: now,
          created_at: now,
          updated_at: now,
          server_version: 1,
          deleted_at: null,
        });
      }
    } else if (operationType === 'update') {
      const { error } = await admin.from(table).update({
        ...stripMeta(payload),
        server_version: newServerVersion,
        updated_at: now,
        deleted_at: null,
      }).eq('id', entityId);
      if (error) throw error;
    } else if (operationType === 'delete') {
      const { error } = await admin.from(table).update({
        deleted_at: now,
        server_version: newServerVersion,
        updated_at: now,
      }).eq('id', entityId);
      if (error) throw error;
    }

    await admin.from('processed_operations').insert({
      operation_id: operationId,
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      operation_type: operationType,
      result_status: 'applied',
      result_server_version: newServerVersion,
      processed_at: now,
    });

    return json({ operationId, status: 'applied', serverVersion: newServerVersion }, 200);
  } catch (e) {
    return json({ operationId, status: 'failed', errorCode: 'server_error', detail: String(e?.message ?? e) }, 500);
  }
});

function stripMeta(p: any): any {
  if (!p || typeof p !== 'object') return {};
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, serverVersion: _serverVersion, localRevision: _localRevision, syncStatus: _syncStatus, deletedAt: _deletedAt, ...rest } = p;
  const out: any = {};
  for (const [k, v] of Object.entries(rest)) {
    const snake = k.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
    out[snake] = v;
  }
  return out;
}

