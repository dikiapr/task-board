import type { LabelType, Task } from '../types/task';
import { DONE_COLUMN_ID, MEMBERS } from '../data/constants';
import { addDays, todayISO } from './date';

export type DueFilter = 'all' | 'overdue' | 'today' | 'week' | 'none';

export interface TaskFilters {
  search: string;
  assigneeIds: string[];
  labels: LabelType[];
  due: DueFilter;
}

export const EMPTY_FILTERS: TaskFilters = {
  search: '',
  assigneeIds: [],
  labels: [],
  due: 'all',
};

export const isFilterActive = (f: TaskFilters) =>
  f.search.trim() !== '' || f.assigneeIds.length > 0 || f.labels.length > 0 || f.due !== 'all';

const isOverdue = (task: Task, today: string) =>
  task.dueDate !== null && task.dueDate < today && task.columnId !== DONE_COLUMN_ID;

const matchesDue = (task: Task, due: DueFilter, today: string) => {
  switch (due) {
    case 'all':
      return true;
    case 'overdue':
      return isOverdue(task, today);
    case 'today':
      return task.dueDate === today;
    case 'week':
      return task.dueDate !== null && task.dueDate >= today && task.dueDate <= addDays(today, 7);
    case 'none':
      return task.dueDate === null;
  }
};

const searchableText = (task: Task) =>
  [
    task.title,
    task.description,
    task.label === 'Undefined' ? '' : task.label,
    ...task.assigneeIds.map((id) => MEMBERS.find((m) => m.id === id)?.name ?? ''),
    ...task.subtasks.map((s) => s.title),
  ]
    .join('\n')
    .toLowerCase();

const matchesSearch = (task: Task, words: string[]) => {
  const text = searchableText(task);
  return words.every((word) => text.includes(word));
};

export const filterTasks = (tasks: Task[], filters: TaskFilters, today = todayISO()): Task[] => {
  const words = filters.search.toLowerCase().split(/\s+/).filter(Boolean);

  return tasks.filter((task) => {
    if (words.length > 0 && !matchesSearch(task, words)) {
      return false;
    }
    if (
      filters.assigneeIds.length > 0 &&
      !task.assigneeIds.some((id) => filters.assigneeIds.includes(id))
    ) {
      return false;
    }
    if (filters.labels.length > 0 && !filters.labels.includes(task.label)) {
      return false;
    }
    return matchesDue(task, filters.due, today);
  });
};
