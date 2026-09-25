import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { KanbanCard, LabelPill, ProgressBar, SortableKanbanCard } from '../../../components/card/KanbanCard';
import { makeTask } from '../../fixtures';

describe('LabelPill', () => {
  it('applies the label class', () => {
    render(<LabelPill label="Bug" />);
    expect(screen.getByText('Bug')).toHaveClass('k-label', 'k-label--bug');
  });
});

describe('ProgressBar', () => {
  it('computes the percentage from done/total', () => {
    render(<ProgressBar done={1} total={3} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '33');
    expect(bar).not.toHaveClass('k-progress--complete');
  });

  it('is 0 when total is 0', () => {
    render(<ProgressBar done={0} total={0} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('gets the complete class when everything is done', () => {
    render(<ProgressBar done={2} total={2} />);
    expect(screen.getByRole('progressbar')).toHaveClass('k-progress--complete');
  });
});

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

describe('SortableKanbanCard', () => {
  const renderSortable = (onOpen = vi.fn()) => {
    const task = makeTask({ title: 'Design' });
    render(
      <DndContext sensors={[]}>
        <SortableContext items={[task.id]}>
          <SortableKanbanCard task={task} onOpen={onOpen} />
        </SortableContext>
      </DndContext>,
    );
    return { task, onOpen, card: screen.getByLabelText('Task: Design') };
  };

  it('opens the task on click', async () => {
    const { task, onOpen, card } = renderSortable();
    await userEvent.click(card);
    expect(onOpen).toHaveBeenCalledWith(task);
  });

  it('opens the task on Enter', () => {
    const { task, onOpen, card } = renderSortable();
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onOpen).toHaveBeenCalledWith(task);
  });
});
