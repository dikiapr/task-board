import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DetailTopbar from '../../../../components/task-detail/parts/DetailTopbar';

const renderTopbar = (isComplete = false) => {
  const handlers = { onToggleComplete: vi.fn(), onClose: vi.fn() };
  render(<DetailTopbar isComplete={isComplete} {...handlers} />);
  return handlers;
};

describe('DetailTopbar', () => {
  it('shows "Mark Complete" while the task is not done', () => {
    renderTopbar();
    const mark = screen.getByRole('button', { name: 'Mark Complete' });
    expect(mark).toHaveAttribute('aria-pressed', 'false');
    expect(mark).not.toHaveClass('is-complete');
  });

  it('shows "Completed" once the task is done', () => {
    renderTopbar(true);
    const mark = screen.getByRole('button', { name: 'Completed' });
    expect(mark).toHaveAttribute('aria-pressed', 'true');
    expect(mark).toHaveClass('is-complete');
  });

  it('calls onToggleComplete and onClose', async () => {
    const { onToggleComplete, onClose } = renderTopbar();
    await userEvent.click(screen.getByRole('button', { name: 'Mark Complete' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onToggleComplete).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
