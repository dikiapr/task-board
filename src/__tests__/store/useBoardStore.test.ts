import type { Task, TaskInput } from '../../types/task';
import { useBoardStore } from '../../store/useBoardStore';
import { createDefaultColumns } from '../../data/seed';
import { beforeEach, describe, expect, it } from 'vitest';

const input = (overrides: Partial<TaskInput>): TaskInput => ({
  columnId: 'todo',
  title: 'Task',
  description: '',
  assigneeIds: [],
  dueDate: null,
  label: 'Undefined',
  subtasks: [],
  attachments: [],
  ...overrides,
});

const task = (id: string, columnId: Task['columnId']): Task => ({
  ...input({ columnId, title: id }),
  id,
  createdAt: '2026-01-01T00:00:00.000Z',
  activity: [],
});

const order = () => useBoardStore.getState().tasks.map((t) => `${t.columnId}:${t.id}`);

beforeEach(() => {
  useBoardStore.setState({
    columns: createDefaultColumns(),
    tasks: [task('a', 'todo'), task('b', 'todo'), task('c', 'todo'), task('x', 'doing'), task('y', 'doing')],
  });
});

describe('useBoardStore', () => {
  it('addTask adds a task with a new id & createdAt', () => {
    const created = useBoardStore.getState().addTask(input({ title: 'Baru', columnId: 'review' }));
    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();
    expect(useBoardStore.getState().tasks.at(-1)).toMatchObject({ title: 'Baru', columnId: 'review' });
  });

  it('updateTask changes only the given fields', () => {
    useBoardStore.getState().updateTask('b', { title: 'B edit', label: 'Bug' });
    expect(useBoardStore.getState().tasks.find((t) => t.id === 'b')).toMatchObject({
      title: 'B edit',
      label: 'Bug',
      columnId: 'todo',
    });
  });

  it('deleteTask removes the task', () => {
    useBoardStore.getState().deleteTask('b');
    expect(order()).toEqual(['todo:a', 'todo:c', 'doing:x', 'doing:y']);
  });

  describe('moveTask', () => {
    it('reorders within the same column (downwards)', () => {
      useBoardStore.getState().moveTask('a', 'todo', 'c');
      expect(order()).toEqual(['todo:b', 'todo:c', 'todo:a', 'doing:x', 'doing:y']);
    });

    it('reorders within the same column (upwards)', () => {
      useBoardStore.getState().moveTask('c', 'todo', 'a');
      expect(order()).toEqual(['todo:c', 'todo:a', 'todo:b', 'doing:x', 'doing:y']);
    });

    it('moves across columns, inserting before / after the target task', () => {
      useBoardStore.getState().moveTask('a', 'doing', 'y');
      expect(order()).toEqual(['todo:b', 'todo:c', 'doing:x', 'doing:a', 'doing:y']);

      useBoardStore.getState().moveTask('b', 'doing', 'y', 'after');
      expect(order()).toEqual(['todo:c', 'doing:x', 'doing:a', 'doing:y', 'doing:b']);
    });

    it('moving to an empty column puts the task at the end', () => {
      useBoardStore.getState().moveTask('x', 'done');
      expect(order()).toEqual(['todo:a', 'todo:b', 'todo:c', 'doing:y', 'done:x']);
    });
  });

  describe('activity', () => {
    it('updateTask logs only the changed fields', () => {
      useBoardStore.getState().updateTask('a', { title: 'A baru', label: 'Bug', description: '' });
      const task = useBoardStore.getState().tasks.find((t) => t.id === 'a')!;
      expect(task.activity.map((x) => x.message)).toEqual(['Updated title and label']);
    });

    it('logs a column change from the form, and moving to Done as "Marked as complete"', () => {
      useBoardStore.getState().updateTask('a', { columnId: 'doing' });
      useBoardStore.getState().updateTask('a', { columnId: 'done' });
      const task = useBoardStore.getState().tasks.find((t) => t.id === 'a')!;
      expect(task.activity.map((x) => x.message)).toEqual(['Marked as complete', 'Moved from To Do to Doing']);
    });

    it('logs nothing when nothing changed', () => {
      useBoardStore.getState().updateTask('a', { title: 'a' });
      expect(useBoardStore.getState().tasks.find((t) => t.id === 'a')!.activity).toEqual([]);
    });
  });

  it('restoreTask puts the task back in its original position (Undo)', () => {
    const { tasks } = useBoardStore.getState();
    const removed = tasks[1];
    useBoardStore.getState().deleteTask(removed.id);
    useBoardStore.getState().restoreTask(removed, 1);
    expect(order()).toEqual(['todo:a', 'todo:b', 'todo:c', 'doing:x', 'doing:y']);
  });

  describe('column', () => {
    it('addColumn & renameColumn', () => {
      const column = useBoardStore.getState().addColumn('  QA  ');
      useBoardStore.getState().renameColumn(column.id, 'Testing');
      expect(useBoardStore.getState().columns.at(-1)).toMatchObject({ id: column.id, title: 'Testing' });
    });

    it('deleteColumn removes the column and its tasks, except Done', () => {
      useBoardStore.getState().deleteColumn('doing');
      expect(useBoardStore.getState().columns.map((c) => c.id)).not.toContain('doing');
      expect(order()).toEqual(['todo:a', 'todo:b', 'todo:c']);

      useBoardStore.getState().deleteColumn('done');
      expect(useBoardStore.getState().columns.map((c) => c.id)).toContain('done');
    });
  });

  it('migrating version 1 data adds default columns & empty activity', () => {
    const migrate = useBoardStore.persist.getOptions().migrate!;
    const { activity: _unused, ...oldTask } = task('a', 'todo');
    const migrated = migrate({ tasks: [oldTask] }, 1) as { columns: unknown[]; tasks: Task[] };
    expect(migrated.columns).toHaveLength(5);
    expect(migrated.tasks[0].activity).toEqual([]);
  });

  it('migrating version 2 data drops attachments with disallowed formats', () => {
    const migrate = useBoardStore.persist.getOptions().migrate!;
    const oldTask = {
      ...task('a', 'todo'),
      attachments: [
        { id: '1', name: 'spec.pdf', type: 'pdf' },
        { id: '2', name: 'screenshot.png', type: 'image' },
        { id: '3', name: 'design.fig', type: 'other' },
      ],
    };
    const migrated = migrate({ columns: createDefaultColumns(), tasks: [oldTask] }, 2) as { tasks: Task[] };
    expect(migrated.tasks[0].attachments.map((a) => a.name)).toEqual(['spec.pdf']);
  });

  it('persists tasks to localStorage', () => {
    useBoardStore.getState().deleteTask('a');
    const saved = JSON.parse(localStorage.getItem('task-board') ?? '{}');
    expect(saved.state.tasks.map((t: Task) => t.id)).toEqual(['b', 'c', 'x', 'y']);
  });
});
