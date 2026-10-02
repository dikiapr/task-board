import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KanbanCard } from '../../../components/card/KanbanCard';
import { makeTask } from '../../fixtures';

describe('KanbanCard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 25));
  });

  afterEach(() => vi.useRealTimers());

  it('shows the title and label', () => {
    render(<KanbanCard task={makeTask({ title: 'Fix login', label: 'Bug' })} />);
    expect(screen.getByRole('heading', { name: 'Fix login' })).toBeInTheDocument();
    expect(screen.getByText('Bug')).toBeInTheDocument();
  });

  it('shows the priority only when set', () => {
    const { rerender } = render(<KanbanCard task={makeTask()} />);
    expect(screen.queryByLabelText(/priority/)).not.toBeInTheDocument();

    rerender(<KanbanCard task={makeTask({ priority: 'High' })} />);
    expect(screen.getByLabelText('High priority')).toBeInTheDocument();
  });

  it('marks a past due date as overdue', () => {
    const { container } = render(<KanbanCard task={makeTask({ dueDate: '2026-09-20' })} />);
    const due = container.querySelector('.k-due');
    expect(due).toHaveTextContent('20 Sep');
    expect(due).toHaveClass('k-due--overdue');
  });

  it('does not flag the due date for tasks in Done', () => {
    const { container } = render(<KanbanCard task={makeTask({ columnId: 'done', dueDate: '2026-09-20' })} />);
    expect(container.querySelector('.k-due')).toHaveClass('k-due--none');
  });

  it('shows checklist progress and attachment count', () => {
    render(
      <KanbanCard
        task={makeTask({
          subtasks: [
            { id: 's1', title: 'A', done: true },
            { id: 's2', title: 'B', done: false },
          ],
          attachments: [{ id: 'a1', name: 'spec.pdf', type: 'pdf' }],
        })}
      />,
    );
    expect(screen.getByTitle('Checklist')).toHaveTextContent('1/2');
    expect(screen.getByTitle('Attachments')).toHaveTextContent('1');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('hides checklist, attachments, and due date when empty', () => {
    const { container } = render(<KanbanCard task={makeTask()} />);
    expect(screen.queryByTitle('Checklist')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Attachments')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(container.querySelector('.k-due')).toBeNull();
  });

  it('shows the cover image and overlay class', () => {
    const { container } = render(<KanbanCard task={makeTask({ coverImage: '/covers/cover-1.jpg' })} isOverlay />);
    expect(container.querySelector('.k-card__cover')).toHaveAttribute('src', '/covers/cover-1.jpg');
    expect(container.querySelector('.k-card')).toHaveClass('k-card--overlay');
  });
});
