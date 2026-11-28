import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../core/db';
import { uuidv7 } from '../shared/utils/uuid';

const mocks = vi.hoisted(() => ({
  sendOperation: vi.fn(),
  pullChanges: vi.fn(),
  getAccessToken: vi.fn(),
}));

vi.mock('../core/sync/syncClient', () => ({ sendOperation: mocks.sendOperation }));
vi.mock('../core/sync/pullClient', () => ({ pullChanges: mocks.pullChanges }));
vi.mock('../core/supabase/client', () => ({
  getAccessToken: mocks.getAccessToken,
  supabase: null,
}));

import { SyncEngine } from '../core/sync/syncEngine';

async function clearSyncData(): Promise<void> {
  await db.transaction('rw', [db.persons, db.syncOutbox, db.conflictSnapshots, db.changeLog], async () => {
    await db.persons.clear();
    await db.syncOutbox.clear();
    await db.conflictSnapshots.clear();
    await db.changeLog.clear();
  });
}

describe('sync engine hardening', () => {
  beforeEach(async () => {
    await clearSyncData();
    mocks.sendOperation.mockReset();
    mocks.pullChanges.mockReset();
    mocks.getAccessToken.mockReset();
    mocks.getAccessToken.mockResolvedValue('token');
    mocks.pullChanges.mockResolvedValue({ ok: true, applied: 0, cursor: 0 });
  });

  it('aplica backoff exponencial después de un fallo transitorio', async () => {
    const personId = uuidv7();
    const operationId = uuidv7();
    const person = {
      id: personId,
      treeId: uuidv7(),
      firstName: 'Ana',
      lifeStatus: 'alive' as const,
      createdAt: 1,
      updatedAt: 1,
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'pending' as const,
      deletedAt: null,
    };
    await db.persons.add(person);
    await db.syncOutbox.add({
      operationId,
      entityType: 'person',
      entityId: personId,
      operationType: 'create',
      baseServerVersion: 0,
      payload: person,
      createdAt: Date.now(),
      status: 'pending',
      retryCount: 0,
      lastError: null,
      dependsOn: [],
    });
    mocks.sendOperation.mockResolvedValue({
      kind: 'failed',
      errorCode: 'temporarily_unavailable',
      retryable: true,
    });

    await new SyncEngine().syncNow();

    const retry = await db.syncOutbox.get(operationId);
    expect(retry?.status).toBe('pending');
    expect(retry?.retryCount).toBe(1);
    expect(retry?.nextRetryAt).toBeGreaterThan(Date.now());

    await new SyncEngine().syncNow();
    expect(mocks.sendOperation).toHaveBeenCalledTimes(1);
  });

  it('mantiene pendientes los cambios creados durante el ACK y actualiza su versión base', async () => {
    const personId = uuidv7();
    const treeId = uuidv7();
    const firstOperationId = uuidv7();
    const person = {
      id: personId,
      treeId,
      firstName: 'Ana',
      lifeStatus: 'alive' as const,
      createdAt: 1,
      updatedAt: 1,
      serverVersion: 0,
      localRevision: 1,
      syncStatus: 'pending' as const,
      deletedAt: null,
    };
    await db.persons.add(person);
    await db.syncOutbox.add({
      operationId: firstOperationId,
      entityType: 'person',
      entityId: personId,
      operationType: 'create',
      baseServerVersion: 0,
      payload: person,
      createdAt: Date.now(),
      status: 'pending',
      retryCount: 0,
      lastError: null,
      dependsOn: [],
    });

    const secondOperationId = uuidv7();
    mocks.sendOperation.mockImplementationOnce(async () => {
      const local = await db.persons.get(personId);
      const updated = { ...local!, firstName: 'Anita', localRevision: 2, syncStatus: 'pending' as const };
      await db.persons.put(updated);
      await db.syncOutbox.add({
        operationId: secondOperationId,
        entityType: 'person',
        entityId: personId,
        operationType: 'update',
        baseServerVersion: 0,
        payload: updated,
        createdAt: Date.now() + 1,
        status: 'pending',
        retryCount: 0,
        lastError: null,
        dependsOn: [],
      });
      return { kind: 'applied', serverVersion: 1 };
    });

    await new SyncEngine().syncNow();

    const row = await db.persons.get(personId);
    const original = await db.syncOutbox.get(firstOperationId);
    const newer = await db.syncOutbox.get(secondOperationId);
    expect(original?.status).toBe('confirmed');
    expect(newer?.status).toBe('pending');
    expect(newer?.baseServerVersion).toBe(1);
    expect(row?.syncStatus).toBe('pending');
    expect(row?.serverVersion).toBe(1);
    expect(row?.firstName).toBe('Anita');
  });

  it('no oculta un fallo de pull aunque no haya operaciones locales', async () => {
    mocks.pullChanges.mockResolvedValue({
      ok: false,
      applied: 0,
      cursor: 4,
      message: 'HTTP 503',
    });

    const result = await new SyncEngine().syncNow();

    expect(result.ok).toBe(false);
    expect(result.status).toBe('error');
    expect(result.message).toContain('HTTP 503');
  });
});
