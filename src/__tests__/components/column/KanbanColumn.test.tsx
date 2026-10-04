import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import type { Column, Task } from '../../../types/task';
import KanbanColumn from '../../../components/column/KanbanColumn';
import { useBoardStore } from '../../../store/useBoardStore';
import { makeTask, resetBoard } from '../../fixtures';

const todo = (): Column => useBoardStore.getState().columns.find((c) => c.id === 'todo')!;

const renderColumn = (props: { column?: Column; tasks?: Task[]; isFiltering?: boolean } = {}) => {
  const handlers = { onAddTask: vi.fn(), onOpenTask: vi.fn(), onDeleteColumn: vi.fn() };
  render(
    <DndContext sensors={[]}>
      <KanbanColumn
        column={props.column ?? todo()}
        tasks={props.tasks ?? []}
        isFiltering={props.isFiltering ?? false}
        isDropTarget={false}
        {...handlers}
      />
    </DndContext>,
  );
  return handlers;
};

beforeEach(() => resetBoard());

describe('KanbanColumn', () => {
  it('shows the title and every task', () => {
    renderColumn({ tasks: [makeTask({ id: 'a', title: 'Alpha' }), makeTask({ id: 'b', title: 'Beta' })] });
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
    expect(screen.getByLabelText('Task: Alpha')).toBeInTheDocument();
    expect(screen.getByLabelText('Task: Beta')).toBeInTheDocument();
  });

  it('shows the empty message', () => {
    renderColumn();
    expect(screen.getByText('Drop tasks here')).toBeInTheDocument();
  });

  it('shows "No matching tasks" while filtering', () => {
    renderColumn({ isFiltering: true });
    expect(screen.getByText('No matching tasks')).toBeInTheDocument();
  });

  it('calls onAddTask with the column id', async () => {
    const { onAddTask } = renderColumn();
    await userEvent.click(screen.getByRole('button', { name: 'Add task to To Do' }));
    expect(onAddTask).toHaveBeenCalledWith('todo');
  });

  it('calls onOpenTask when a card is clicked', async () => {
    const task = makeTask({ title: 'Alpha' });
    const { onOpenTask } = renderColumn({ tasks: [task] });
    await userEvent.click(screen.getByLabelText('Task: Alpha'));
    expect(onOpenTask).toHaveBeenCalledWith(task);
  });

  it('collapses the column through the store', async () => {
    renderColumn();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse To Do' }));
    expect(todo().collapsed).toBe(true);
  });

  it('a collapsed column shows the task count and can expand', async () => {
    useBoardStore.getState().toggleColumnCollapsed('todo');
    renderColumn({ tasks: [makeTask()] });

    const expand = screen.getByRole('button', { name: 'Expand To Do' });
    expect(expand).toHaveTextContent('1');
    await userEvent.click(expand);
    expect(todo().collapsed).toBe(false);
  });

  describe('actions menu', () => {
    it('"Delete list" passes the column to onDeleteColumn', async () => {
      const { onDeleteColumn } = renderColumn();
      await userEvent.click(screen.getByRole('button', { name: 'To Do actions' }));
      await userEvent.click(await screen.findByText('Delete list'));
      expect(onDeleteColumn).toHaveBeenCalledWith(todo());
    });
  });
});
