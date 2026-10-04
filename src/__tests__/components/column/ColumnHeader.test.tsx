import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Column } from '../../../types/task';
import ColumnHeader from '../../../components/column/ColumnHeader';
import { useBoardStore } from '../../../store/useBoardStore';
import { nextPresent, resetBoard } from '../../fixtures';

const todo = (): Column => useBoardStore.getState().columns.find((c) => c.id === 'todo')!;

const renderHeader = () => {
  const handlers = { onAddTask: vi.fn(), onDelete: vi.fn(), onCollapse: vi.fn() };
  render(<ColumnHeader column={todo()} {...handlers} />);
  return handlers;
};

beforeEach(() => resetBoard());

describe('ColumnHeader', () => {
  it('shows the column title', () => {
    renderHeader();
    expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
  });

  it('the + button calls onAddTask', async () => {
    const { onAddTask } = renderHeader();
    await userEvent.click(screen.getByRole('button', { name: 'Add task to To Do' }));
    expect(onAddTask).toHaveBeenCalled();
  });

  it('the collapse button calls onCollapse', async () => {
    const { onCollapse } = renderHeader();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse To Do' }));
    expect(onCollapse).toHaveBeenCalled();
  });

  describe('rename', () => {
    it('double-clicking the title then Enter saves the new name', async () => {
      renderHeader();
      await userEvent.dblClick(screen.getByRole('heading', { name: 'To Do' }));
      const input = screen.getByRole('textbox', { name: 'List name' });
      await userEvent.clear(input);
      await userEvent.type(input, 'Backlog{Enter}');
      expect(todo().title).toBe('Backlog');
    });

    it('Escape cancels the rename', async () => {
      renderHeader();
      await userEvent.dblClick(screen.getByRole('heading', { name: 'To Do' }));
      await userEvent.type(screen.getByRole('textbox', { name: 'List name' }), ' baru{Escape}');
      expect(screen.queryByRole('textbox', { name: 'List name' })).not.toBeInTheDocument();
      expect(todo().title).toBe('To Do');
    });

    it('does not save an empty name', async () => {
      renderHeader();
      await userEvent.dblClick(screen.getByRole('heading', { name: 'To Do' }));
      const input = screen.getByRole('textbox', { name: 'List name' });
      await userEvent.clear(input);
      await userEvent.type(input, '{Enter}');
      expect(todo().title).toBe('To Do');
    });

    it('"Rename list" opens a rename input that keeps focus', async () => {
      renderHeader();
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
  });
});
