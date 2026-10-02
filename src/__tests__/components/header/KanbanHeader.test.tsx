import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import KanbanHeader from '../../../components/header/KanbanHeader';
import { EMPTY_FILTERS, type TaskFilters } from '../../../utils/filterTasks';

const renderHeader = (filters: TaskFilters = EMPTY_FILTERS) => {
  const handlers = {
    onFiltersChange: vi.fn(),
    onInvite: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    onReset: vi.fn(),
  };
  render(<KanbanHeader filters={filters} resultCount={7} {...handlers} />);
  return handlers;
};

describe('KanbanHeader', () => {
  it('updates the search while keeping the other filters', async () => {
    const { onFiltersChange } = renderHeader({ ...EMPTY_FILTERS, labels: ['Bug'] });
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search tasks' }), 'a');
    expect(onFiltersChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, labels: ['Bug'], search: 'a' });
  });
});
