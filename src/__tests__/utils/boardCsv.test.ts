import Papa from 'papaparse';
import { describe, expect, it } from 'vitest';
import { boardToCsv, parseBoardCsv } from '../../utils/boardCsv';
import { DEFAULT_COLUMNS } from '../../data/constants';
import type { Column } from '../../types/task';
import { makeTask } from '../fixtures';

const columns: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'qa', title: 'QA' },
];

const rowsOf = (csv: string) => Papa.parse<string[]>(csv.replace(/^\uFEFF/, '')).data;

describe('boardToCsv', () => {
  it('writes a header and one row per task, in list order', () => {
    const csv = boardToCsv({
      columns,
      tasks: [
        makeTask({ id: 'b', title: 'In QA', columnId: 'qa' }),
        makeTask({
          id: 'a',
          title: 'Fix login',
          description: 'Steps, then "fix"',
          label: 'Bug',
          priority: 'High',
          dueDate: '2026-10-05',
          assigneeIds: ['m1', 'm2', 'unknown'],
          coverImage: '/covers/cover-1.jpg',
          subtasks: [
            { id: 's1', title: 'Reproduce', done: true },
            { id: 's2', title: 'Patch', done: false },
          ],
        }),
      ],
    });

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(rowsOf(csv)).toEqual([
      ['List', 'Title', 'Description', 'Label', 'Priority', 'Due Date', 'Assignees', 'Checklist', 'Cover'],
      [
        'To Do',
        'Fix login',
        'Steps, then "fix"',
        'Bug',
        'High',
        '2026-10-05',
        'Andi Pratama; Budi Santoso',
        '[x] Reproduce\n[ ] Patch',
        '/covers/cover-1.jpg',
      ],
      ['QA', 'In QA', '', 'Undefined', '', '', '', '', ''],
    ]);
  });

  it('leaves out an uploaded cover too long for a spreadsheet cell', () => {
    const small = `data:image/jpeg;base64,${'A'.repeat(100)}`;
    const huge = `data:image/jpeg;base64,${'A'.repeat(40000)}`;
    const csv = boardToCsv({
      columns,
      tasks: [makeTask({ id: 'a', coverImage: small }), makeTask({ id: 'b', coverImage: huge })],
    });
    expect(rowsOf(csv).slice(1).map((row) => row[8])).toEqual([small, '']);
  });

  it('escapes cells that a spreadsheet would run as a formula', () => {
    const csv = boardToCsv({ columns, tasks: [makeTask({ title: '=HYPERLINK("x")' })] });
    expect(rowsOf(csv)[1][1]).toBe('\'=HYPERLINK("x")');
  });
});

describe('parseBoardCsv', () => {
  it('round-trips what boardToCsv writes', () => {
    const task = makeTask({
      title: '=SUM(1)',
      description: 'Line one\nline two',
      label: 'Feature',
      priority: 'Low',
      dueDate: '2026-10-05',
      assigneeIds: ['m3'],
      coverImage: 'https://images.example.com/cover.jpg',
      subtasks: [{ id: 's1', title: 'Draft', done: true }],
    });
    const { tasks } = parseBoardCsv(boardToCsv({ columns: DEFAULT_COLUMNS, tasks: [task] }));

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      columnId: 'todo',
      title: '=SUM(1)',
      description: 'Line one\nline two',
      label: 'Feature',
      priority: 'Low',
      dueDate: '2026-10-05',
      assigneeIds: ['m3'],
      subtasks: [{ title: 'Draft', done: true }],
      coverImage: 'https://images.example.com/cover.jpg',
      attachments: [],
    });
  });

  it('keeps the default lists and adds unknown ones in order of appearance', () => {
    const { columns: parsed, tasks } = parseBoardCsv('List,Title\nQA,One\ndone,Two\n,Three\nQA,Four');
    expect(parsed.map((c) => c.title)).toEqual([...DEFAULT_COLUMNS.map((c) => c.title), 'QA']);
    expect(tasks.map((t) => t.columnId)).toEqual([parsed[5].id, 'done', 'todo', parsed[5].id]);
  });

  it('accepts headers in any case and order, and skips rows without a title', () => {
    const { tasks } = parseBoardCsv('title , LABEL,due date\nA,bug,2026-02-03\n,Bug,\nB,,');
    expect(tasks.map((t) => [t.title, t.label, t.dueDate])).toEqual([
      ['A', 'Bug', '2026-02-03'],
      ['B', 'Undefined', null],
    ]);
  });

  it('falls back to defaults for values it does not recognise', () => {
    const { tasks } = parseBoardCsv(
      'Title,Label,Priority,Due Date,Assignees,Checklist\nT,Urgent,Max,05/10/2026,Nobody; andi pratama,plain item',
    );
    expect(tasks[0]).toMatchObject({
      label: 'Undefined',
      priority: undefined,
      dueDate: null,
      assigneeIds: ['m1'],
      subtasks: [{ title: 'plain item', done: false }],
    });
  });

  it('only accepts covers that are sample paths, web URLs, or image data URLs', () => {
    const covers = [
      '/covers/cover-2.jpg',
      'http://example.com/a.png',
      'data:image/png;base64,iVBORw0KGgo=',
      'javascript:alert(1)',
      'data:text/html;base64,PHNjcmlwdD4=',
      '/etc/passwd',
      'not a url',
    ];
    const csv = ['Title,Cover', ...covers.map((c, i) => `T${i},"${c}"`)].join('\n');
    expect(parseBoardCsv(csv).tasks.map((t) => t.coverImage)).toEqual([
      '/covers/cover-2.jpg',
      'http://example.com/a.png',
      'data:image/png;base64,iVBORw0KGgo=',
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('rejects a CSV without a Title column', () => {
    expect(() => parseBoardCsv('Name,List\nA,To Do')).toThrow('CSV must have a "Title" column');
    expect(() => parseBoardCsv('')).toThrow('CSV must have a "Title" column');
  });
});
