import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import KanbanHeader from '../../../components/header/KanbanHeader';
import { EMPTY_FILTERS, type TaskFilters } from '../../../utils/filterTasks';
import { nextPresent } from '../../fixtures';

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

  describe('filter', () => {
    it('shows a badge with the active filter count', () => {
      renderHeader({ ...EMPTY_FILTERS, assigneeIds: ['m1', 'm2'], labels: ['Bug'], due: 'overdue' });
      const button = screen.getByRole('button', { name: /Filter/ });
      expect(button).toHaveClass('is-active');
      expect(within(button).getByText('4')).toHaveClass('k-badge');
    });

    it('shows no badge without filters', () => {
      renderHeader();
      const button = screen.getByRole('button', { name: 'Filter' });
      expect(button).not.toHaveClass('is-active');
    });

    it('selects assignee, label, and due date through chips', async () => {
      const { onFiltersChange } = renderHeader();
      await userEvent.click(screen.getByRole('button', { name: 'Filter' }));
      expect(await screen.findByText('7 shown')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /Andi/, pressed: false }));
      expect(onFiltersChange).toHaveBeenLastCalledWith({ ...EMPTY_FILTERS, assigneeIds: ['m1'] });

      await userEvent.click(screen.getByRole('button', { name: 'Bug', pressed: false }));
      expect(onFiltersChange).toHaveBeenLastCalledWith({ ...EMPTY_FILTERS, labels: ['Bug'] });

      await userEvent.click(screen.getByRole('button', { name: 'Overdue' }));
      expect(onFiltersChange).toHaveBeenLastCalledWith({ ...EMPTY_FILTERS, due: 'overdue' });
    });

    it('clicking a selected chip deselects it', async () => {
      const { onFiltersChange } = renderHeader({ ...EMPTY_FILTERS, assigneeIds: ['m1'] });
      await userEvent.click(screen.getByRole('button', { name: /Filter/ }));
      await userEvent.click(await screen.findByRole('button', { name: /Andi/, pressed: true }));
      expect(onFiltersChange).toHaveBeenLastCalledWith({ ...EMPTY_FILTERS, assigneeIds: [] });
    });

    it('"Clear all" is disabled without filters', async () => {
      renderHeader();
      await userEvent.click(screen.getByRole('button', { name: 'Filter' }));
      expect(await screen.findByRole('button', { name: 'Clear all' })).toBeDisabled();
    });

    it('"Clear all" resets every filter including search', async () => {
      const { onFiltersChange } = renderHeader({ ...EMPTY_FILTERS, search: 'x', labels: ['Bug'] });
      await userEvent.click(screen.getByRole('button', { name: /Filter/ }));
      await userEvent.click(await screen.findByRole('button', { name: 'Clear all' }));
      expect(onFiltersChange).toHaveBeenCalledWith(EMPTY_FILTERS);
    });
  });

  describe('invite', () => {
    const openInvite = async () => {
      const shown = nextPresent();
      await userEvent.click(screen.getByRole('button', { name: 'Invite' }));
      await shown;
      const input = screen.getByRole('textbox', { name: 'Email to invite' });
      const form = input.closest('form')!;
      return { input, submit: within(form).getByRole('button', { name: 'Invite' }) };
    };

    it('lists the team members', async () => {
      renderHeader();
      await openInvite();
      expect(screen.getByText('Team members')).toBeInTheDocument();
      expect(screen.getByText('Fajar Nugroho')).toBeInTheDocument();
    });

    it('disables Invite for an invalid email', async () => {
      renderHeader();
      const { input, submit } = await openInvite();
      await userEvent.type(input, 'bukan-email');
      expect(submit).toBeDisabled();
    });

    it('sends a valid email, trimmed', async () => {
      const { onInvite } = renderHeader();
      const { input, submit } = await openInvite();
      await userEvent.type(input, '  budi@company.com ');
      await userEvent.click(submit);
      expect(onInvite).toHaveBeenCalledWith('budi@company.com');
    });
  });

  describe('menu', () => {
    it('"Reset to sample data" calls onReset', async () => {
      const { onReset } = renderHeader();
      await userEvent.click(screen.getByRole('button', { name: 'Adhivasindo' }));
      await userEvent.click(await screen.findByText('Reset to sample data'));
      expect(onReset).toHaveBeenCalled();
    });

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
