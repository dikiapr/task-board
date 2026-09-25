import type { Task } from '../types/task';
import { createDefaultColumns } from '../data/seed';
import { useBoardStore } from '../store/useBoardStore';

export const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
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

export const resetBoard = (tasks: Task[] = []) => useBoardStore.setState({ columns: createDefaultColumns(), tasks });

/**
 * Resolves once the next Ionic overlay finishes presenting. Ionic moves focus to the
 * overlay right after that, so wait for it before typing into anything inside.
 */
export const nextPresent = () =>
  new Promise<void>((resolve) => document.addEventListener('didPresent', () => resolve(), { once: true }));
