import type { Column, ColumnId, Task, TaskInput } from '../types/task';
import { DONE_COLUMN_ID } from '../data/constants';

export const emptyDraft = (columnId: ColumnId): TaskInput => ({
  columnId,
  title: '',
  description: '',
  assigneeIds: [],
  dueDate: null,
  label: 'Undefined',
  priority: undefined,
  subtasks: [],
  attachments: [],
  coverImage: undefined,
});

export const toDraft = (task: Task): TaskInput => {
  const { id, createdAt, activity, ...input } = task;
  return input;
};

export const isDraftChanged = (draft: TaskInput, initial: TaskInput) =>
  JSON.stringify(draft) !== JSON.stringify(initial);

export const cleanDraft = (draft: TaskInput): TaskInput => ({
  ...draft,
  title: draft.title.trim(),
  description: draft.description.trim(),
});

export const getReturnColumnId = (initialColumnId: ColumnId, columns: Column[]): ColumnId =>
  initialColumnId !== DONE_COLUMN_ID
    ? initialColumnId
    : (columns.find((c) => c.id !== DONE_COLUMN_ID)?.id ?? DONE_COLUMN_ID);
