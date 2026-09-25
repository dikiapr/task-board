import type { BoardData, Column, Task } from '../types/task';
import { sanitizeAttachments } from './attachment';
import { todayISO } from './date';

export const exportBoard = (data: BoardData) => {
  const blob = new Blob([JSON.stringify({ app: 'task-board', version: 2, ...data }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `task-board-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

export const parseBoardFile = (text: string): BoardData => {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('File is not valid JSON');
  }
  if (!isObject(json) || !Array.isArray(json.columns) || !Array.isArray(json.tasks)) {
    throw new Error('File does not contain board data');
  }

  const columns = json.columns.filter(
    (c): c is Column => isObject(c) && typeof c.id === 'string' && typeof c.title === 'string',
  );
  const columnIds = new Set(columns.map((c) => c.id));

  const tasks = json.tasks
    .filter((t): t is Record<string, unknown> => isObject(t) && typeof t.id === 'string' && typeof t.title === 'string')
    .filter((t) => columnIds.has(t.columnId as string))
    .map((t) => {
      const task = {
        description: '',
        assigneeIds: [],
        dueDate: null,
        label: 'Undefined',
        subtasks: [],
        activity: [],
        createdAt: new Date().toISOString(),
        ...t,
      } as unknown as Task;
      return { ...task, attachments: sanitizeAttachments(Array.isArray(t.attachments) ? t.attachments : []) };
    });

  if (columns.length === 0) throw new Error('File does not contain any list');
  return { columns, tasks };
};
