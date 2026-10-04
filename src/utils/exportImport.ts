import type { BoardData, Column, Task } from '../types/task';
import { sanitizeAttachments } from './attachment';
import { boardToCsv, parseBoardCsv } from './boardCsv';
import { todayISO } from './date';
import { downloadFile } from './download';

export type ExportFormat = 'json' | 'csv';

export const exportBoard = (data: BoardData, format: ExportFormat = 'json') => {
  const fileName = `task-board-${todayISO()}.${format}`;
  if (format === 'csv') {
    downloadFile(boardToCsv(data), fileName, 'text/csv;charset=utf-8');
  } else {
    downloadFile(JSON.stringify({ app: 'task-board', version: 2, ...data }, null, 2), fileName, 'application/json');
  }
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

/** Picks the parser from the file extension: `.csv` files are read as CSV, anything else as JSON. */
export const parseImportFile = (fileName: string, text: string): BoardData =>
  fileName.toLowerCase().endsWith('.csv') ? parseBoardCsv(text) : parseBoardFile(text);
