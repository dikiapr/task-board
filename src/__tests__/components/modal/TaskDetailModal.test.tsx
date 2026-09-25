import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TaskDetailModal, { type EditorState } from '../../../components/modal/TaskDetailModal';
import { useBoardStore } from '../../../store/useBoardStore';
import { makeTask, nextPresent, resetBoard } from '../../fixtures';

const existing = makeTask({ id: 'e1', title: 'Write docs', columnId: 'doing' });

const renderModal = async (editor: EditorState) => {
  const handlers = { onDidDismiss: vi.fn(), onSaved: vi.fn(), onDeleted: vi.fn() };
  const shown = nextPresent();
  render(<TaskDetailModal editor={editor} {...handlers} />);
  await shown;
  return handlers;
};

const findTask = (id: string) => useBoardStore.getState().tasks.find((t) => t.id === id);

const alertButton = async (header: string, name: string) => {
  const alert = (await screen.findByText(header)).closest('ion-alert') as HTMLElement;
  // findByRole waits until the alert has finished presenting and its buttons are visible.
  return within(alert).findByRole('button', { name });
};

beforeEach(() => resetBoard([makeTask({ id: 'other' }), existing]));

describe('TaskDetailModal', () => {
  describe('create mode', () => {
    it('has no Delete button', async () => {
      await renderModal({ mode: 'create', columnId: 'todo' });
      expect(await screen.findByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });

    it('refuses to save without a title', async () => {
      const { onSaved } = await renderModal({ mode: 'create', columnId: 'todo' });
      await userEvent.click(await screen.findByRole('button', { name: 'Save' }));

      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(onSaved).not.toHaveBeenCalled();
      expect(useBoardStore.getState().tasks).toHaveLength(2);
    });

    it('saves the new task to the chosen column', async () => {
      const { onSaved } = await renderModal({ mode: 'create', columnId: 'review' });
      await userEvent.type(await screen.findByRole('textbox', { name: 'Task title' }), '  Riset UI  ');
      await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Label' }), 'Feature');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      const created = useBoardStore.getState().tasks.at(-1);
      expect(created).toMatchObject({ title: 'Riset UI', columnId: 'review', label: 'Feature' });
      expect(onSaved).toHaveBeenCalledWith('create', 'Riset UI');
    });
  });

  describe('edit mode', () => {
    it('shows the task title and lets it be edited', async () => {
      const { onSaved } = await renderModal({ mode: 'edit', taskId: 'e1' });
      expect(await screen.findByRole('heading', { name: /Write docs/ })).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Edit title' }));
      const input = screen.getByRole('textbox', { name: 'Task title' });
      await userEvent.clear(input);
      await userEvent.type(input, 'Write API docs{Enter}');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(findTask('e1')?.title).toBe('Write API docs');
      expect(onSaved).toHaveBeenCalledWith('edit', 'Write API docs');
    });

    it('saves a priority change', async () => {
      await renderModal({ mode: 'edit', taskId: 'e1' });
      await userEvent.selectOptions(await screen.findByRole('combobox', { name: 'Priority' }), 'High');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(findTask('e1')?.priority).toBe('High');
    });

    it('Mark Complete moves the task to Done and can be undone', async () => {
      await renderModal({ mode: 'edit', taskId: 'e1' });
      const mark = await screen.findByRole('button', { name: 'Mark Complete' });

      await userEvent.click(mark);
      expect(mark).toHaveAttribute('aria-pressed', 'true');
      expect(mark).toHaveTextContent('Completed');
      expect(screen.getByRole('combobox', { name: 'Column' })).toHaveValue('done');

      await userEvent.click(mark);
      expect(screen.getByRole('combobox', { name: 'Column' })).toHaveValue('doing');
    });
  });

  describe('delete', () => {
    it('deletes the task after confirmation', async () => {
      const { onDeleted } = await renderModal({ mode: 'edit', taskId: 'e1' });
      await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));

      expect(await screen.findByText('"Write docs" will be removed from the board.')).toBeInTheDocument();
      await userEvent.click(await alertButton('Delete task?', 'Delete'));

      expect(findTask('e1')).toBeUndefined();
      expect(onDeleted).toHaveBeenCalledWith(existing, 1);
    });

    it('keeps the task when cancelled', async () => {
      const { onDeleted } = await renderModal({ mode: 'edit', taskId: 'e1' });
      await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));
      await userEvent.click(await alertButton('Delete task?', 'Cancel'));

      expect(findTask('e1')).toBeDefined();
      expect(onDeleted).not.toHaveBeenCalled();
    });
  });

  describe('closing the modal', () => {
    it('Close without changes closes right away', async () => {
      const { onDidDismiss } = await renderModal({ mode: 'edit', taskId: 'e1' });
      await userEvent.click(await screen.findByRole('button', { name: 'Close' }));
      await waitFor(() => expect(onDidDismiss).toHaveBeenCalled());
    });

    it('Close with changes asks for confirmation', async () => {
      const { onDidDismiss } = await renderModal({ mode: 'edit', taskId: 'e1' });
      await userEvent.type(await screen.findByRole('textbox', { name: 'Description' }), 'Draft');
      await userEvent.click(screen.getByRole('button', { name: 'Close' }));

      await userEvent.click(await alertButton('Discard changes?', 'Keep editing'));
      expect(onDidDismiss).not.toHaveBeenCalled();
      expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('Draft');
    });

    it('Discard closes without confirming or saving', async () => {
      const { onDidDismiss, onSaved } = await renderModal({ mode: 'edit', taskId: 'e1' });
      await userEvent.type(await screen.findByRole('textbox', { name: 'Description' }), 'Draft');
      await userEvent.click(screen.getByRole('button', { name: 'Discard' }));

      await waitFor(() => expect(onDidDismiss).toHaveBeenCalled());
      expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
      expect(onSaved).not.toHaveBeenCalled();
      expect(findTask('e1')?.description).toBe('');
    });
  });
});
