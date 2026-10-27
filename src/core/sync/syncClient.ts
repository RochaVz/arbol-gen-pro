// Cliente HTTP del protocolo /sync (Fase 6).
// Una operación por petición. Clasifica la respuesta del servidor en un
// resultado tipado que el SyncEngine traduce a estado local.

import { getAccessToken } from '../supabase/client';
import type { SyncOperation } from '../db/schema';

export type SyncSendResult =
  | { kind: 'applied'; serverVersion: number }
  | { kind: 'alreadyProcessed'; serverVersion: number | null }
  | { kind: 'conflict'; serverVersion: number | null; conflictKind?: string; server?: unknown }
  | { kind: 'failed'; errorCode: string; detail?: string; retryable: boolean }
  | { kind: 'noSession' }
  | { kind: 'network'; message: string };

const FUNCTION_URL = (): string | null => {
  const base = import.meta.env.VITE_SUPABASE_URL;
  return base ? `${base.replace(/\/$/, '')}/functions/v1/sync` : null;
};

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

export async function sendOperation(op: SyncOperation): Promise<SyncSendResult> {
  const url = FUNCTION_URL();
  if (!url) return { kind: 'failed', errorCode: 'not_configured', retryable: false };

  const token = await getAccessToken();
  if (!token) return { kind: 'noSession' };

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: anonKey ?? '',
        'Idempotency-Key': op.operationId,
      },
      body: JSON.stringify({
        operationId: op.operationId,
        entityType: op.entityType,
        entityId: op.entityId,
        operationType: op.operationType,
        baseServerVersion: op.baseServerVersion,
        payload: op.payload,
      }),
    });
  } catch (e) {
    return { kind: 'network', message: String((e as Error)?.message ?? e) };
  }

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (res.ok) {
    const status = body?.status;
    const sv = typeof body?.serverVersion === 'number' ? body.serverVersion : null;
    if (status === 'applied') return { kind: 'applied', serverVersion: sv ?? 1 };
    if (status === 'alreadyProcessed') return { kind: 'alreadyProcessed', serverVersion: sv };
    if (status === 'conflict') {
      return { kind: 'conflict', serverVersion: sv, conflictKind: body?.conflictKind, server: body?.server };
    }
    return { kind: 'failed', errorCode: body?.errorCode ?? 'unknown', detail: body?.detail, retryable: false };
  }

  // Non-2xx
  if (res.status === 409) {
    const sv = typeof body?.serverVersion === 'number' ? body.serverVersion : null;
    return { kind: 'conflict', serverVersion: sv, conflictKind: body?.conflictKind, server: body?.server };
  }

  const retryable = isRetryableStatus(res.status);
  return {
    kind: 'failed',
    errorCode: body?.errorCode ?? `http_${res.status}`,
    detail: body?.detail,
    retryable,
  };
}
