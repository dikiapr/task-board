import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task } from '../../../types/task';
import KanbanBoard from '../../../components/board/KanbanBoard';
import { makeTask, resetBoard } from '../../fixtures';

const tasks: Task[] = [
  makeTask({ id: 'a', title: 'Alpha', columnId: 'todo' }),
  makeTask({ id: 'b', title: 'Beta', columnId: 'doing' }),
];

const renderBoard = () => {
  const handlers = {
    onAddTask: vi.fn(),
    onOpenTask: vi.fn(),
    onAddColumn: vi.fn(),
    onDeleteColumn: vi.fn(),
  };
  render(<KanbanBoard tasks={tasks} isFiltering={false} {...handlers} />);
  return handlers;
};

beforeEach(() => resetBoard(tasks));

describe('KanbanBoard', () => {
  it('renders every column from the store', () => {
    renderBoard();
    for (const title of ['To Do', 'Doing', 'Review', 'Done', 'Rework']) {
      expect(screen.getByRole('region', { name: `List ${title}` })).toBeInTheDocument();
    }
  });

  it('puts each task in its column', () => {
    renderBoard();
    expect(within(screen.getByRole('region', { name: 'List To Do' })).getByLabelText('Task: Alpha')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'List Doing' })).getByLabelText('Task: Beta')).toBeInTheDocument();
  });

  describe('Add new List', () => {
    it('adds a new list through the form', async () => {
      const { onAddColumn } = renderBoard();
      await userEvent.click(screen.getByRole('button', { name: 'Add new List' }));

      const submit = screen.getByRole('button', { name: 'Add list' });
      expect(submit).toBeDisabled();

      await userEvent.type(screen.getByRole('textbox', { name: 'List name' }), 'QA');
      await userEvent.click(submit);

      expect(onAddColumn).toHaveBeenCalledWith('QA');
      expect(screen.getByRole('button', { name: 'Add new List' })).toBeInTheDocument();
    });

    it('Cancel closes the form without adding a list', async () => {
      const { onAddColumn } = renderBoard();
      await userEvent.click(screen.getByRole('button', { name: 'Add new List' }));
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByRole('textbox', { name: 'List name' })).not.toBeInTheDocument();
      expect(onAddColumn).not.toHaveBeenCalled();
    });

    it('Escape closes the form', async () => {
      renderBoard();
      await userEvent.click(screen.getByRole('button', { name: 'Add new List' }));
      await userEvent.type(screen.getByRole('textbox', { name: 'List name' }), '{Escape}');
      expect(screen.queryByRole('textbox', { name: 'List name' })).not.toBeInTheDocument();
    });
  });
});
