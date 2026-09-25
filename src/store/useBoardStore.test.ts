import type { Task, TaskInput } from '../types/task';
import { useBoardStore } from './useBoardStore';
import { createDefaultColumns } from '../data/seed';
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
  it('addTask menambah task dengan id & createdAt baru', () => {
    const created = useBoardStore.getState().addTask(input({ title: 'Baru', columnId: 'review' }));
    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();
    expect(useBoardStore.getState().tasks.at(-1)).toMatchObject({ title: 'Baru', columnId: 'review' });
  });

  it('updateTask hanya mengubah field yang dikirim', () => {
    useBoardStore.getState().updateTask('b', { title: 'B edit', label: 'Bug' });
    expect(useBoardStore.getState().tasks.find((t) => t.id === 'b')).toMatchObject({
      title: 'B edit',
      label: 'Bug',
      columnId: 'todo',
    });
  });

  it('deleteTask menghapus task', () => {
    useBoardStore.getState().deleteTask('b');
    expect(order()).toEqual(['todo:a', 'todo:c', 'doing:x', 'doing:y']);
  });

  describe('moveTask', () => {
    it('mengurutkan ulang dalam kolom yang sama (ke bawah)', () => {
      useBoardStore.getState().moveTask('a', 'todo', 'c');
      expect(order()).toEqual(['todo:b', 'todo:c', 'todo:a', 'doing:x', 'doing:y']);
    });

    it('mengurutkan ulang dalam kolom yang sama (ke atas)', () => {
      useBoardStore.getState().moveTask('c', 'todo', 'a');
      expect(order()).toEqual(['todo:c', 'todo:a', 'todo:b', 'doing:x', 'doing:y']);
    });

    it('pindah kolom dan disisipkan sebelum / sesudah task tujuan', () => {
      useBoardStore.getState().moveTask('a', 'doing', 'y');
      expect(order()).toEqual(['todo:b', 'todo:c', 'doing:x', 'doing:a', 'doing:y']);

      useBoardStore.getState().moveTask('b', 'doing', 'y', 'after');
      expect(order()).toEqual(['todo:c', 'doing:x', 'doing:a', 'doing:y', 'doing:b']);
    });

    it('pindah ke kolom kosong ditaruh paling bawah', () => {
      useBoardStore.getState().moveTask('x', 'done');
      expect(order()).toEqual(['todo:a', 'todo:b', 'todo:c', 'doing:y', 'done:x']);
    });
  });

  describe('activity', () => {
    it('updateTask mencatat field yang berubah saja', () => {
      useBoardStore.getState().updateTask('a', { title: 'A baru', label: 'Bug', description: '' });
      const task = useBoardStore.getState().tasks.find((t) => t.id === 'a')!;
      expect(task.activity.map((x) => x.message)).toEqual(['Updated title and label']);
    });

    it('pindah kolom lewat form dicatat, pindah ke Done jadi "Marked as complete"', () => {
      useBoardStore.getState().updateTask('a', { columnId: 'doing' });
      useBoardStore.getState().updateTask('a', { columnId: 'done' });
      const task = useBoardStore.getState().tasks.find((t) => t.id === 'a')!;
      expect(task.activity.map((x) => x.message)).toEqual(['Marked as complete', 'Moved from To Do to Doing']);
    });

    it('tidak mencatat apa pun jika tidak ada yang berubah', () => {
      useBoardStore.getState().updateTask('a', { title: 'a' });
      expect(useBoardStore.getState().tasks.find((t) => t.id === 'a')!.activity).toEqual([]);
    });
  });

  it('restoreTask mengembalikan task ke posisi semula (Undo)', () => {
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

    it('deleteColumn menghapus kolom beserta task-nya, kecuali kolom Done', () => {
      useBoardStore.getState().deleteColumn('doing');
      expect(useBoardStore.getState().columns.map((c) => c.id)).not.toContain('doing');
      expect(order()).toEqual(['todo:a', 'todo:b', 'todo:c']);

      useBoardStore.getState().deleteColumn('done');
      expect(useBoardStore.getState().columns.map((c) => c.id)).toContain('done');
    });
  });

  it('migrasi data versi 1 menambahkan kolom default & activity kosong', () => {
    const migrate = useBoardStore.persist.getOptions().migrate!;
    const { activity: _unused, ...oldTask } = task('a', 'todo');
    const migrated = migrate({ tasks: [oldTask] }, 1) as { columns: unknown[]; tasks: Task[] };
    expect(migrated.columns).toHaveLength(5);
    expect(migrated.tasks[0].activity).toEqual([]);
  });

  it('migrasi data versi 2 membuang lampiran yang formatnya tidak diperbolehkan', () => {
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

  it('menyimpan tasks ke localStorage', () => {
    useBoardStore.getState().deleteTask('a');
    const saved = JSON.parse(localStorage.getItem('task-board') ?? '{}');
    expect(saved.state.tasks.map((t: Task) => t.id)).toEqual(['b', 'c', 'x', 'y']);
  });
});
