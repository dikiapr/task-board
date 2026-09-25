import { describe, expect, it } from 'vitest';
import type { Task } from '../types/task';
import { EMPTY_FILTERS, filterTasks, isFilterActive } from './filterTasks';

const TODAY = '2026-09-24';

const makeTask = (overrides: Partial<Task>): Task => ({
  id: overrides.id ?? 'x',
  columnId: 'todo',
  title: 'Task',
  description: '',
  assigneeIds: [],
  dueDate: null,
  label: 'Undefined',
  subtasks: [],
  attachments: [],
  activity: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const tasks: Task[] = [
  makeTask({ id: 'a', title: 'Login page', label: 'Feature', assigneeIds: ['m1'], dueDate: '2026-09-20' }),
  makeTask({ id: 'b', title: 'Fix crash', description: 'crash di halaman LOGIN', label: 'Bug', assigneeIds: ['m2'], dueDate: TODAY }),
  makeTask({ id: 'c', title: 'Docs', label: 'Undefined', assigneeIds: ['m1', 'm3'], dueDate: '2026-09-29' }),
  makeTask({ id: 'd', title: 'Old done task', columnId: 'done', dueDate: '2026-09-01' }),
];

const ids = (result: Task[]) => result.map((t) => t.id);

describe('filterTasks', () => {
  it('tanpa filter mengembalikan semua task', () => {
    expect(ids(filterTasks(tasks, EMPTY_FILTERS, TODAY))).toEqual(['a', 'b', 'c', 'd']);
  });

  it('search mencocokkan judul dan deskripsi tanpa peduli huruf besar/kecil', () => {
    expect(ids(filterTasks(tasks, { ...EMPTY_FILTERS, search: '  login ' }, TODAY))).toEqual(['a', 'b']);
  });

  it('filter assignee mengembalikan task yang punya salah satu assignee terpilih', () => {
    expect(ids(filterTasks(tasks, { ...EMPTY_FILTERS, assigneeIds: ['m3', 'm2'] }, TODAY))).toEqual(['b', 'c']);
  });

  it('filter label', () => {
    expect(ids(filterTasks(tasks, { ...EMPTY_FILTERS, labels: ['Bug', 'Feature'] }, TODAY))).toEqual(['a', 'b']);
  });

  it('filter due date', () => {
    const due = (d: typeof EMPTY_FILTERS.due) => ids(filterTasks(tasks, { ...EMPTY_FILTERS, due: d }, TODAY));
    expect(due('overdue')).toEqual(['a']); // task di Done tidak dihitung terlambat
    expect(due('today')).toEqual(['b']);
    expect(due('week')).toEqual(['b', 'c']);
    expect(due('none')).toEqual([]);
  });

  it('beberapa filter digabung dengan logika AND', () => {
    const result = filterTasks(tasks, { ...EMPTY_FILTERS, assigneeIds: ['m1'], labels: ['Feature'] }, TODAY);
    expect(ids(result)).toEqual(['a']);
  });

  it('isFilterActive', () => {
    expect(isFilterActive(EMPTY_FILTERS)).toBe(false);
    expect(isFilterActive({ ...EMPTY_FILTERS, search: '   ' })).toBe(false);
    expect(isFilterActive({ ...EMPTY_FILTERS, due: 'today' })).toBe(true);
  });
});
