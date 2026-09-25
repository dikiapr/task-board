import type { ComponentProps } from 'react';
import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AlertButton, AlertOptions } from '@ionic/react';
import { alertCircleOutline, trashOutline } from 'ionicons/icons';
import KanbanPage from '../../pages/KanbanPage';
import type KanbanHeader from '../../components/header/KanbanHeader';
import type KanbanBoard from '../../components/board/KanbanBoard';
import type TaskDetailModal from '../../components/modal/TaskDetailModal';
import { useBoardStore } from '../../store/useBoardStore';
import { exportBoard } from '../../utils/exportImport';
import { EMPTY_FILTERS } from '../../utils/filterTasks';
import { createSeedTasks } from '../../data/seed';
import { makeTask, resetBoard } from '../fixtures';

interface ChildProps {
  header: ComponentProps<typeof KanbanHeader>;
  board: ComponentProps<typeof KanbanBoard>;
  modal: ComponentProps<typeof TaskDetailModal>;
}

// The children have their own tests; here they only record the props the page hands them.
const mocks = vi.hoisted(() => ({
  props: {} as ChildProps,
  toast: vi.fn(),
  presentAlert: vi.fn(),
}));

vi.mock('../../components/header/KanbanHeader', () => ({
  default: (p: ChildProps['header']) => ((mocks.props.header = p), null),
}));
vi.mock('../../components/board/KanbanBoard', () => ({
  default: (p: ChildProps['board']) => ((mocks.props.board = p), null),
}));
vi.mock('../../components/modal/TaskDetailModal', () => ({
  default: (p: ChildProps['modal']) => ((mocks.props.modal = p), null),
}));
vi.mock('../../hooks/useToast', () => ({ useToast: () => mocks.toast }));
vi.mock('@ionic/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@ionic/react')>()),
  useIonAlert: () => [mocks.presentAlert, vi.fn()],
}));
vi.mock('../../utils/exportImport', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../utils/exportImport')>()),
  exportBoard: vi.fn(),
}));

const { props, toast, presentAlert } = mocks;

const lastAlert = (): AlertOptions => presentAlert.mock.lastCall![0];
const alertButton = (text: string) =>
  (lastAlert().buttons as AlertButton[]).find((b) => b.text === text)!;
const lastToastOptions = () => toast.mock.lastCall![1];
const boardFile = (text: string) => ({ text: () => Promise.resolve(text) }) as File;
const state = () => useBoardStore.getState();

const alpha = makeTask({ id: 'a', title: 'Alpha' });
const beta = makeTask({ id: 'b', title: 'Beta', columnId: 'doing' });

beforeEach(() => {
  resetBoard([alpha, beta]);
  toast.mockReset();
  presentAlert.mockReset();
  vi.mocked(exportBoard).mockReset();
  render(<KanbanPage />);
});

describe('KanbanPage', () => {
  it('shows every task when no filter is active', () => {
    expect(props.board.tasks).toEqual([alpha, beta]);
    expect(props.board.isFiltering).toBe(false);
    expect(props.header.resultCount).toBe(2);
    expect(props.header.filters).toEqual(EMPTY_FILTERS);
  });

  it('passes only matching tasks once a filter is set', () => {
    act(() => props.header.onFiltersChange({ ...EMPTY_FILTERS, search: 'alp' }));
    expect(props.board.tasks).toEqual([alpha]);
    expect(props.board.isFiltering).toBe(true);
    expect(props.header.resultCount).toBe(1);
  });

  it('updates the board when the store changes', () => {
    act(() => state().deleteTask('a'));
    expect(props.board.tasks).toEqual([beta]);
  });

  describe('task editor', () => {
    it('is closed at first', () => {
      expect(props.modal.editor).toBeNull();
    });

    it('opens in create mode for the chosen list', () => {
      act(() => props.board.onAddTask('review'));
      expect(props.modal.editor).toEqual({ mode: 'create', columnId: 'review' });
    });

    it('opens in edit mode for a clicked task and closes on dismiss', () => {
      act(() => props.board.onOpenTask(beta));
      expect(props.modal.editor).toEqual({ mode: 'edit', taskId: 'b' });

      act(() => props.modal.onDidDismiss());
      expect(props.modal.editor).toBeNull();
    });

    it.each([
      ['create', 'Task created'],
      ['edit', 'Task updated'],
    ] as const)('confirms a save in %s mode', (mode, message) => {
      props.modal.onSaved(mode, 'Alpha');
      expect(toast).toHaveBeenCalledWith(message);
    });

    it('offers to undo a delete, putting the task back where it was', () => {
      act(() => state().deleteTask('a'));
      props.modal.onDeleted(alpha, 0);

      expect(toast).toHaveBeenCalledWith('Task deleted', expect.objectContaining({ icon: trashOutline }));
      act(() => lastToastOptions().undo());
      expect(state().tasks.map((t) => t.id)).toEqual(['a', 'b']);
    });
  });

  describe('lists', () => {
    it('adds a list', () => {
      act(() => props.board.onAddColumn('Blocked'));
      expect(state().columns.at(-1)?.title).toBe('Blocked');
      expect(toast).toHaveBeenCalledWith('List created');
    });

    it('asks before deleting a list, mentioning how many tasks go with it', () => {
      const todo = state().columns.find((c) => c.id === 'todo')!;
      props.board.onDeleteColumn(todo);

      expect(lastAlert()).toMatchObject({
        header: 'Delete "To Do"?',
        message: 'This list and its 1 task(s) will be deleted.',
      });
      expect(alertButton('Cancel').role).toBe('cancel');
      expect(state().columns.some((c) => c.id === 'todo')).toBe(true);
    });

    it('uses a shorter message for an empty list', () => {
      const review = state().columns.find((c) => c.id === 'review')!;
      props.board.onDeleteColumn(review);
      expect(lastAlert().message).toBe('This list will be deleted.');
    });

    it('deletes the list and its tasks on confirm, and can undo it', () => {
      const before = { columns: state().columns, tasks: state().tasks };
      props.board.onDeleteColumn(before.columns.find((c) => c.id === 'todo')!);

      act(() => alertButton('Delete').handler!({}));
      expect(state().columns.some((c) => c.id === 'todo')).toBe(false);
      expect(state().tasks).toEqual([beta]);
      expect(toast).toHaveBeenCalledWith('List deleted', expect.objectContaining({ icon: trashOutline }));

      act(() => lastToastOptions().undo());
      expect({ columns: state().columns, tasks: state().tasks }).toEqual(before);
    });
  });

  describe('header actions', () => {
    it('confirms an invite', () => {
      props.header.onInvite('budi@company.com');
      expect(toast).toHaveBeenCalledWith('Invitation sent to budi@company.com (simulation)');
    });

    it('exports the whole board, ignoring the active filter', () => {
      act(() => props.header.onFiltersChange({ ...EMPTY_FILTERS, search: 'alp' }));
      props.header.onExport();

      expect(exportBoard).toHaveBeenCalledWith({ columns: state().columns, tasks: [alpha, beta] });
      expect(toast).toHaveBeenCalledWith('Board exported');
    });

    it('asks before importing a valid file, then replaces the board', async () => {
      const columns = [{ id: 'x', title: 'Imported' }];
      const tasks = [makeTask({ id: 'n', columnId: 'x' })];
      await props.header.onImport(boardFile(JSON.stringify({ columns, tasks })));

      expect(lastAlert()).toMatchObject({
        header: 'Import board?',
        message: '1 lists and 1 tasks will replace the current board.',
      });
      expect(state().tasks).toEqual([alpha, beta]);

      act(() => alertButton('Import').handler!({}));
      expect(state().columns).toEqual(columns);
      expect(state().tasks).toEqual(tasks);
      expect(toast).toHaveBeenCalledWith('Board imported');
    });

    it('reports an invalid import file without asking', async () => {
      await props.header.onImport(boardFile('not json'));

      expect(presentAlert).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith('File is not valid JSON', { icon: alertCircleOutline, color: 'danger' });
      expect(state().tasks).toEqual([alpha, beta]);
    });

    it('asks before resetting, then restores sample data and clears filters', () => {
      act(() => props.header.onFiltersChange({ ...EMPTY_FILTERS, search: 'alp' }));
      props.header.onReset();
      expect(lastAlert().header).toBe('Reset board?');

      act(() => alertButton('Reset').handler!({}));
      expect(state().tasks.map((t) => t.title)).toEqual(createSeedTasks().map((t) => t.title));
      expect(props.header.filters).toEqual(EMPTY_FILTERS);
      expect(toast).toHaveBeenCalledWith('Board reset to sample data');
    });
  });
});
