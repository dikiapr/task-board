import type { LabelType, Task } from '../types/task';
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

export const isOverdue = (task: Task, today = todayISO()) =>
  task.dueDate !== null && task.dueDate < today && task.columnId !== 'done';

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

export const filterTasks = (tasks: Task[], filters: TaskFilters, today = todayISO()): Task[] => {
  const query = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (
      query &&
      !task.title.toLowerCase().includes(query) &&
      !task.description.toLowerCase().includes(query)
    ) {
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
