import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { TaskInput } from '../../../types/task';
import TaskInfoSection from '../../../components/modal/TaskInfoSection';
import { DEFAULT_COLUMNS } from '../../../data/constants';
import { makeTask } from '../../fixtures';

const { id, createdAt, activity, ...draft } = makeTask({ title: 'Fix login' });

const renderSection = (props: { draft?: TaskInput; isEditingTitle?: boolean; showTitleError?: boolean } = {}) => {
  const handlers = { update: vi.fn(), onEditingTitleChange: vi.fn() };
  render(
    <TaskInfoSection
      draft={props.draft ?? draft}
      columns={DEFAULT_COLUMNS}
      isEditingTitle={props.isEditingTitle ?? false}
      showTitleError={props.showTitleError ?? false}
      {...handlers}
    />,
  );
  return handlers;
};

describe('TaskInfoSection', () => {
  it('shows the title and switches to editing via the pencil button', async () => {
    const { onEditingTitleChange } = renderSection();
    expect(screen.getByRole('heading', { name: /Fix login/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Edit title' }));
    expect(onEditingTitleChange).toHaveBeenCalledWith(true);
  });

  it('shows the title input while editing', async () => {
    const { update } = renderSection({ isEditingTitle: true });
    await userEvent.type(screen.getByRole('textbox', { name: 'Task title' }), '!');
    expect(update).toHaveBeenCalledWith('title', 'Fix login!');
  });

  it('shows the error only when requested and the title is empty', () => {
    renderSection({ draft: { ...draft, title: '' }, isEditingTitle: true, showTitleError: true });
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('sends column, label, and priority changes to update', async () => {
    const { update } = renderSection();
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Column' }), 'review');
    expect(update).toHaveBeenCalledWith('columnId', 'review');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Label' }), 'Bug');
    expect(update).toHaveBeenCalledWith('label', 'Bug');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Priority' }), 'None');
    expect(update).toHaveBeenCalledWith('priority', undefined);
  });
});
