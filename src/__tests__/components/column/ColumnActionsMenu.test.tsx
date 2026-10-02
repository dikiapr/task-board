import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Column } from '../../../types/task';
import ColumnActionsMenu from '../../../components/column/ColumnActionsMenu';
import { DEFAULT_COLUMNS } from '../../../data/constants';
import { nextPresent } from '../../fixtures';

const column = (id: string): Column => DEFAULT_COLUMNS.find((c) => c.id === id)!;

const renderMenu = (col: Column = column('todo')) => {
  const handlers = { onAddTask: vi.fn(), onRename: vi.fn(), onDelete: vi.fn() };
  render(<ColumnActionsMenu column={col} {...handlers} />);
  return handlers;
};

const openMenu = async (title = 'To Do') => {
  const shown = nextPresent();
  await userEvent.click(screen.getByRole('button', { name: `${title} actions` }));
  await shown;
};

describe('ColumnActionsMenu', () => {
  it('"Add task" calls onAddTask', async () => {
    const { onAddTask } = renderMenu();
    await openMenu();
    await userEvent.click(screen.getByText('Add task'));
    expect(onAddTask).toHaveBeenCalled();
  });

  it('"Rename list" calls onRename once the menu is dismissed', async () => {
    const { onRename } = renderMenu();
    await openMenu();
    await userEvent.click(screen.getByText('Rename list'));
    await vi.waitFor(() => expect(onRename).toHaveBeenCalledTimes(1));
  });

  it('"Delete list" calls onDelete', async () => {
    const { onDelete } = renderMenu();
    await openMenu();
    await userEvent.click(screen.getByText('Delete list'));
    expect(onDelete).toHaveBeenCalled();
  });

  it('"Delete list" is disabled for the Done column', async () => {
    renderMenu(column('done'));
    await openMenu('Done');
    const item = screen.getByText('Delete list').closest('ion-item');
    expect(item).toHaveProperty('disabled', true);
  });
});
