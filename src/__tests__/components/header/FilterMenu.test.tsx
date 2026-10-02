import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FilterMenu from '../../../components/header/FilterMenu';
import { EMPTY_FILTERS, type TaskFilters } from '../../../utils/filterTasks';

const renderMenu = (filters: TaskFilters = EMPTY_FILTERS) => {
  const onFiltersChange = vi.fn();
  render(<FilterMenu filters={filters} onFiltersChange={onFiltersChange} resultCount={7} />);
  return { onFiltersChange };
};

describe('FilterMenu', () => {
  it('shows a badge with the active filter count', () => {
    renderMenu({ ...EMPTY_FILTERS, assigneeIds: ['m1', 'm2'], labels: ['Bug'], due: 'overdue' });
    const button = screen.getByRole('button', { name: /Filter/ });
    expect(button).toHaveClass('is-active');
    expect(within(button).getByText('4')).toHaveClass('k-badge');
  });

  it('shows no badge without filters', () => {
    renderMenu();
    const button = screen.getByRole('button', { name: 'Filter' });
    expect(button).not.toHaveClass('is-active');
  });

  it('selects assignee, label, and due date through chips', async () => {
    const { onFiltersChange } = renderMenu();
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
    const { onFiltersChange } = renderMenu({ ...EMPTY_FILTERS, assigneeIds: ['m1'] });
    await userEvent.click(screen.getByRole('button', { name: /Filter/ }));
    await userEvent.click(await screen.findByRole('button', { name: /Andi/, pressed: true }));
    expect(onFiltersChange).toHaveBeenLastCalledWith({ ...EMPTY_FILTERS, assigneeIds: [] });
  });

  it('"Clear all" is disabled without filters', async () => {
    renderMenu();
    await userEvent.click(screen.getByRole('button', { name: 'Filter' }));
    expect(await screen.findByRole('button', { name: 'Clear all' })).toBeDisabled();
  });

  it('"Clear all" resets every filter including search', async () => {
    const { onFiltersChange } = renderMenu({ ...EMPTY_FILTERS, search: 'x', labels: ['Bug'] });
    await userEvent.click(screen.getByRole('button', { name: /Filter/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Clear all' }));
    expect(onFiltersChange).toHaveBeenCalledWith(EMPTY_FILTERS);
  });
});
