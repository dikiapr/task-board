import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import type { Column, Task } from '../../../types/task';
import KanbanColumn from '../../../components/column/KanbanColumn';
import { useBoardStore } from '../../../store/useBoardStore';
import { makeTask, nextPresent, resetBoard } from '../../fixtures';

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

  describe('rename', () => {
    it('double-clicking the title then Enter saves the new name', async () => {
      renderColumn();
      await userEvent.dblClick(screen.getByRole('heading', { name: 'To Do' }));
      const input = screen.getByRole('textbox', { name: 'List name' });
      await userEvent.clear(input);
      await userEvent.type(input, 'Backlog{Enter}');
      expect(todo().title).toBe('Backlog');
    });

    it('Escape cancels the rename', async () => {
      renderColumn();
      await userEvent.dblClick(screen.getByRole('heading', { name: 'To Do' }));
      await userEvent.type(screen.getByRole('textbox', { name: 'List name' }), ' baru{Escape}');
      expect(screen.queryByRole('textbox', { name: 'List name' })).not.toBeInTheDocument();
      expect(todo().title).toBe('To Do');
    });

    it('does not save an empty name', async () => {
      renderColumn();
      await userEvent.dblClick(screen.getByRole('heading', { name: 'To Do' }));
      const input = screen.getByRole('textbox', { name: 'List name' });
      await userEvent.clear(input);
      await userEvent.type(input, '{Enter}');
      expect(todo().title).toBe('To Do');
    });
  });

  describe('actions menu', () => {
    it('"Delete list" calls onDeleteColumn', async () => {
      const { onDeleteColumn } = renderColumn();
      await userEvent.click(screen.getByRole('button', { name: 'To Do actions' }));
      await userEvent.click(await screen.findByText('Delete list'));
      expect(onDeleteColumn).toHaveBeenCalledWith(todo());
    });

    it('"Rename list" opens a rename input that keeps focus', async () => {
      renderColumn();
      const shown = nextPresent();
      await userEvent.click(screen.getByRole('button', { name: 'To Do actions' }));
      await shown;
      await userEvent.click(screen.getByText('Rename list'));

      const input = await screen.findByRole('textbox', { name: 'List name' });
      await waitFor(() => expect(input).toHaveFocus());
      await userEvent.clear(input);
      await userEvent.type(input, 'Backlog{Enter}');
      expect(todo().title).toBe('Backlog');
    });

    it('"Delete list" is disabled for the Done column', async () => {
      const done = useBoardStore.getState().columns.find((c) => c.id === 'done')!;
      renderColumn({ column: done });
      await userEvent.click(screen.getByRole('button', { name: 'Done actions' }));
      const item = (await screen.findByText('Delete list')).closest('ion-item');
      expect(item).toHaveProperty('disabled', true);
    });
  });
});
