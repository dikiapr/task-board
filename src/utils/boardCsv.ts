import Papa from 'papaparse';
import { nanoid } from 'nanoid';
import type { BoardData, Column, LabelType, Priority, Subtask, Task } from '../types/task';
import { LABELS, MEMBERS, NEW_COLUMN_COLOR, PRIORITIES } from '../data/constants';
import { createDefaultColumns } from '../data/seed';

/**
 * One row per task. Lists, assignees, and the checklist are written as readable text
 * so the file can be edited in a spreadsheet; ids, attachments, and activity are not
 * part of the CSV.
 */
const HEADERS = ['List', 'Title', 'Description', 'Label', 'Priority', 'Due Date', 'Assignees', 'Checklist', 'Cover'];

const ASSIGNEE_SEPARATOR = '; ';

/** Excel cuts off longer cells, which would break an uploaded cover's data URL. */
const MAX_CELL_LENGTH = 32767;

/** Sample covers, web images, and uploaded images (stored as data URLs). */
const COVER_PATTERN = /^(\/covers\/[\w.-]+|https?:\/\/\S+|data:image\/(png|jpe?g|gif|webp);base64,[\w+/=]+)$/i;

/** Excel opens UTF-8 CSV correctly only with a byte order mark. */
const BOM = '\uFEFF';

export const boardToCsv = ({ columns, tasks }: BoardData): string => {
  const memberName = (id: string) => MEMBERS.find((m) => m.id === id)?.name;
  const rows = columns.flatMap((column) =>
    tasks
      .filter((t) => t.columnId === column.id)
      .map((t) => [
        column.title,
        t.title,
        t.description,
        t.label,
        t.priority ?? '',
        t.dueDate ?? '',
        t.assigneeIds.map(memberName).filter(Boolean).join(ASSIGNEE_SEPARATOR),
        t.subtasks.map((s) => `[${s.done ? 'x' : ' '}] ${s.title}`).join('\n'),
        t.coverImage && t.coverImage.length <= MAX_CELL_LENGTH ? t.coverImage : '',
      ]),
  );
  // escapeFormulae stops spreadsheet apps from running cells such as "=SUM(...)".
  return BOM + Papa.unparse({ fields: HEADERS, data: rows }, { escapeFormulae: true });
};

const normalizeHeader = (header: string) => header.trim().toLowerCase().replace(/\s+/g, '');

/** Undoes the quote Papa.unparse adds in front of formula-like text. */
const unescapeFormula = (value: string) => (/^'[=+\-@\t\r]/.test(value) ? value.slice(1) : value);

const cellReader = (row: Record<string, string>) => (key: string) => unescapeFormula(row[key] ?? '');

const matchOne = <T extends string>(options: readonly T[], value: string): T | undefined =>
  options.find((o) => o.toLowerCase() === value.trim().toLowerCase());

const parseDueDate = (value: string) => {
  const date = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) ? date : null;
};

const parseAssignees = (value: string) =>
  value
    .split(';')
    .map((name) => MEMBERS.find((m) => m.name.toLowerCase() === name.trim().toLowerCase())?.id)
    .filter((id): id is string => Boolean(id));

const parseCover = (value: string) => {
  const cover = value.trim();
  return COVER_PATTERN.test(cover) ? cover : undefined;
};

const parseChecklist = (value: string): Subtask[] =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = /^\[([ xX])\]\s*(.*)$/.exec(line);
      return { id: nanoid(), title: match ? match[2] : line, done: match?.[1].toLowerCase() === 'x' };
    })
    .filter((s) => s.title);

/**
 * Builds a board from a CSV made by `boardToCsv` (or by hand). The default lists are
 * always kept so "Done" exists; a list name that matches none of them adds a new list.
 */
export const parseBoardCsv = (text: string): BoardData => {
  const { data, meta } = Papa.parse<Record<string, string>>(text.replace(/^\uFEFF/, ''), {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: normalizeHeader,
  });
  if (!meta.fields?.includes('title')) throw new Error('CSV must have a "Title" column');

  const columns: Column[] = createDefaultColumns();
  const columnFor = (listName: string): Column => {
    const name = listName.trim();
    if (!name) return columns[0];
    const existing = columns.find((c) => c.title.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const column = { id: nanoid(8), title: name, color: NEW_COLUMN_COLOR };
    columns.push(column);
    return column;
  };

  const now = new Date().toISOString();
  const tasks: Task[] = data
    .map(cellReader)
    .filter((cell) => cell('title').trim())
    .map((cell) => ({
      id: nanoid(),
      columnId: columnFor(cell('list')).id,
      title: cell('title').trim(),
      description: cell('description').trim(),
      label: matchOne<LabelType>(LABELS, cell('label')) ?? 'Undefined',
      priority: matchOne<Priority>(PRIORITIES, cell('priority')),
      dueDate: parseDueDate(cell('duedate')),
      assigneeIds: parseAssignees(cell('assignees')),
      subtasks: parseChecklist(cell('checklist')),
      coverImage: parseCover(cell('cover')),
      attachments: [],
      activity: [],
      createdAt: now,
    }));

  return { columns, tasks };
};
