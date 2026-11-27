import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Sidebar } from '../shared/components/ui/SidebarV2';

afterEach(cleanup);

describe('Sidebar mobile navigation', () => {
  it('opens the menu and closes it after navigation', async () => {
    const onClick = vi.fn();
    const { container } = render(<Sidebar items={[{ id: 'tree', label: 'Árbol', onClick }]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.getByRole('button', { name: 'Cerrar menú' }).getAttribute('aria-expanded')).toBe('true');
    const menu = container.querySelector('#mobile-sidebar');
    if (!(menu instanceof HTMLElement)) throw new Error('Mobile menu did not open');
    fireEvent.click(within(menu).getByRole('button', { name: 'Árbol' }));

    expect(onClick).toHaveBeenCalledOnce();
    // The sidebar should close after navigation click
    await waitFor(() => expect(container.querySelector('#mobile-sidebar')).toBeNull());
    expect(screen.getByRole('button', { name: 'Abrir menú' }).getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the menu when the overlay is clicked', async () => {
    const { container } = render(<Sidebar items={[]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú lateral' }));
    await waitFor(() => expect(container.querySelector('#mobile-sidebar')).toBeNull());
  });
});