import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PremiumHome } from '../shared/components/PremiumHome';

afterEach(cleanup);

describe('PremiumHome trees', () => {
  it('lists existing trees and allows opening or activating each one', () => {
    const onOpenTree = vi.fn();
    const onSelectTree = vi.fn();

    render(
      <PremiumHome
        onOpenTree={onOpenTree}
        onSelectTree={onSelectTree}
        stats={{ totalFamilyMembers: 3, generations: 2, photos: 1, events: 1 }}
        trees={[
          { id: 'active', name: 'Familia Rodríguez', memberCount: 3, isActive: true },
          { id: 'other', name: 'Familia Materna', memberCount: 1, isActive: false },
        ]}
      />
    );

    expect(screen.getAllByText('Familia Rodríguez').length).toBeGreaterThan(0);
    expect(screen.getByText('Familia Materna')).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: 'Abrir árbol' })[1]);
    expect(onOpenTree).toHaveBeenCalledWith('other');

    fireEvent.click(screen.getByRole('button', { name: 'Activar' }));
    expect(onSelectTree).toHaveBeenCalledWith('other');
  });
});
