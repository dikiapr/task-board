import { fireEvent, render, screen } from '@testing-library/react';
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
  const view = render(<KanbanHeader filters={filters} resultCount={7} {...handlers} />);
  return { ...handlers, ...view };
};

describe('KanbanHeader', () => {
  describe('search', () => {
    it('sends the search text to onFiltersChange', async () => {
      const { onFiltersChange } = renderHeader();
      await userEvent.type(screen.getByRole('searchbox', { name: 'Search tasks' }), 'a');
      expect(onFiltersChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, search: 'a' });
    });

    it('hides the clear button when search is empty', () => {
      renderHeader();
      expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
    });

    it('the clear button empties the search', async () => {
      const { onFiltersChange } = renderHeader({ ...EMPTY_FILTERS, search: 'bug' });
      await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
      expect(onFiltersChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, search: '' });
    });
  });

  describe('menu', () => {
    it('"Export as JSON" calls onExport', async () => {
      const { onExport } = renderHeader();
      await userEvent.click(screen.getByRole('button', { name: 'Export / Import' }));
      await userEvent.click(await screen.findByText('Export as JSON'));
      expect(onExport).toHaveBeenCalled();
    });

    it('passes the file chosen for import to onImport', () => {
      const { onImport, container } = renderHeader();
      const file = new File(['{}'], 'board.json', { type: 'application/json' });
      fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } });
      expect(onImport).toHaveBeenCalledWith(file);
    });
  });
});
