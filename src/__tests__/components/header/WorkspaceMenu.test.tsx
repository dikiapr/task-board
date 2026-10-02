import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import WorkspaceMenu from '../../../components/header/WorkspaceMenu';

describe('WorkspaceMenu', () => {
  it('shows the board name', () => {
    render(<WorkspaceMenu onReset={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Adhivasindo' })).toBeInTheDocument();
  });

  it('"Reset to sample data" calls onReset', async () => {
    const onReset = vi.fn();
    render(<WorkspaceMenu onReset={onReset} />);
    await userEvent.click(screen.getByRole('button', { name: 'Adhivasindo' }));
    await userEvent.click(await screen.findByText('Reset to sample data'));
    expect(onReset).toHaveBeenCalled();
  });
});
