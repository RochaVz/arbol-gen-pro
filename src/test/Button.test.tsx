import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Button } from '../shared/components/ui/ButtonV2';

afterEach(cleanup);

describe('ButtonV2', () => {
  it('renders its label and handles clicks', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Guardar</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disables interaction while loading', () => {
    const onClick = vi.fn();
    render(<Button isLoading onClick={onClick}>Guardar</Button>);

    const button = screen.getByRole('button', { name: 'Guardar' });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
