import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { Person } from '../core/db';
import { ReactFlowTree } from '../shared/components/ReactFlowTree';

const hookFailure = vi.hoisted(() => ({ enabled: false }));

vi.mock('reactflow', async (importOriginal) => {
  const actual = await importOriginal<typeof import('reactflow')>();
  return {
    ...actual,
    useReactFlow: (...args: Parameters<typeof actual.useReactFlow>) => {
      if (hookFailure.enabled) throw new Error('test hook failure');
      return actual.useReactFlow(...args);
    },
  };
});

const person: Person = {
  id: 'person-1',
  treeId: 'tree-1',
  firstName: 'Ana',
  lifeStatus: 'alive',
  createdAt: 0,
  updatedAt: 0,
  serverVersion: 0,
  localRevision: 0,
  syncStatus: 'synced',
  deletedAt: null,
};

afterEach(() => {
  cleanup();
  hookFailure.enabled = false;
  vi.restoreAllMocks();
});

describe('ReactFlowTree', () => {
  it('renders without an external provider and handles data changes', () => {
    const { container, rerender } = render(
      <ReactFlowTree persons={[]} relationships={[]} />
    );
    expect(screen.getByText('No hay datos para mostrar')).toBeTruthy();

    rerender(<ReactFlowTree persons={[person]} relationships={[]} />);
    expect(container.querySelector('.react-flow')).toBeTruthy();
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.queryByText('Error al cargar el árbol')).toBeNull();

    rerender(<ReactFlowTree persons={[]} relationships={[]} />);
    expect(screen.getByText('No hay datos para mostrar')).toBeTruthy();
  });

  it('catches errors from hooks inside the tree', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    hookFailure.enabled = true;
    render(<ReactFlowTree persons={[person]} relationships={[]} />);
    expect(screen.getByRole('alert').textContent).toContain('Error al cargar el árbol');
    expect(log).toHaveBeenCalled();
  });
});
