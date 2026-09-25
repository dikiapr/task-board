import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AssigneeField from '../../../components/modal/AssigneeField';

describe('AssigneeField', () => {
  it('shows "Unassigned" without assignees', () => {
    render(<AssigneeField value={[]} onToggle={vi.fn()} />);
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('shows avatars of the selected assignees', () => {
    render(<AssigneeField value={['m1']} onToggle={vi.fn()} />);
    expect(screen.queryByText('Unassigned')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Andi Pratama')).toBeInTheDocument();
  });

  it('marks selected members in the popover and calls onToggle', async () => {
    const onToggle = vi.fn();
    render(<AssigneeField value={['m1']} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add or remove assignees' }));

    expect(await screen.findByRole('checkbox', { name: /Andi Pratama/ })).toHaveAttribute('aria-checked', 'true');
    const budi = screen.getByRole('checkbox', { name: /Budi Santoso/ });
    expect(budi).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(budi);
    expect(onToggle).toHaveBeenCalledWith('m2');
  });
});
