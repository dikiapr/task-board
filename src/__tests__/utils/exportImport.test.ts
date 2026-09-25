import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exportBoard, parseBoardFile } from '../../utils/exportImport';
import { todayISO } from '../../utils/date';
import type { Column } from '../../types/task';
import { makeTask } from '../fixtures';

const readBlob = (blob: Blob) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(blob);
  });

const columns: Column[] = [
  { id: 'todo', title: 'To Do', color: '#64748b' },
  { id: 'done', title: 'Done', color: '#22c55e' },
];

describe('exportBoard', () => {
  const { createObjectURL, revokeObjectURL } = URL;
  const clickedLink = () => vi.mocked(HTMLAnchorElement.prototype.click).mock.contexts[0] as HTMLAnchorElement;

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:board');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
  });

  it('downloads the board as a dated JSON file', async () => {
    const tasks = [makeTask()];
    exportBoard({ columns, tasks });

    expect(clickedLink().href).toBe('blob:board');
    expect(clickedLink().download).toBe(`task-board-${todayISO()}.json`);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:board');

    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blob.type).toBe('application/json');
    expect(JSON.parse(await readBlob(blob))).toEqual({ app: 'task-board', version: 2, columns, tasks });
  });

  it('round-trips through parseBoardFile', async () => {
    const tasks = [makeTask({ attachments: [{ id: 'a1', name: 'spec.pdf', type: 'pdf' }] })];
    exportBoard({ columns, tasks });

    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(parseBoardFile(await readBlob(blob))).toEqual({ columns, tasks });
  });
});

describe('parseBoardFile', () => {
  const parse = (data: unknown) => parseBoardFile(JSON.stringify(data));

  it('rejects text that is not JSON', () => {
    expect(() => parseBoardFile('{ nope')).toThrow('File is not valid JSON');
  });

  it.each([null, [], 'board', { columns: [] }, { tasks: [] }, { columns: {}, tasks: [] }])(
    'rejects JSON without columns & tasks arrays: %j',
    (data) => {
      expect(() => parse(data)).toThrow('File does not contain board data');
    },
  );

  it('rejects a board with no valid list', () => {
    expect(() => parse({ columns: [{ id: 'x' }, null, 'todo'], tasks: [] })).toThrow('File does not contain any list');
  });

  it('drops malformed lists', () => {
    const { columns: parsed } = parse({
      columns: [...columns, { id: 1, title: 'Bad id' }, { id: 'no-title' }, null],
      tasks: [],
    });
    expect(parsed).toEqual(columns);
  });

  it('drops malformed tasks and tasks in a list that does not exist', () => {
    const { tasks } = parse({
      columns,
      tasks: [
        makeTask({ id: 'ok' }),
        makeTask({ id: 'orphan', columnId: 'gone' }),
        { id: 'no-title', columnId: 'todo' },
        { title: 'No id', columnId: 'todo' },
        null,
      ],
    });
    expect(tasks.map((t) => t.id)).toEqual(['ok']);
  });

  it('fills in missing task fields with defaults', () => {
    vi.useFakeTimers({ now: new Date('2026-03-04T05:06:07.000Z') });
    try {
      const { tasks } = parse({ columns, tasks: [{ id: 't1', title: 'Bare', columnId: 'todo' }] });
      expect(tasks[0]).toEqual({
        id: 't1',
        title: 'Bare',
        columnId: 'todo',
        description: '',
        assigneeIds: [],
        dueDate: null,
        label: 'Undefined',
        subtasks: [],
        attachments: [],
        activity: [],
        createdAt: '2026-03-04T05:06:07.000Z',
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps fields the file provides', () => {
    const task = makeTask({ description: 'Hi', assigneeIds: ['m1'], dueDate: '2026-01-02', label: 'Bug' });
    expect(parse({ columns, tasks: [task] }).tasks).toEqual([task]);
  });

  it('removes disallowed attachments and ignores a non-array value', () => {
    const { tasks } = parse({
      columns,
      tasks: [
        makeTask({
          id: 'a',
          attachments: [
            { id: '1', name: 'spec.pdf', type: 'pdf' },
            { id: '2', name: 'virus.exe', type: 'other' },
          ] as never,
        }),
        { ...makeTask({ id: 'b' }), attachments: 'spec.pdf' },
      ],
    });
    expect(tasks[0].attachments).toEqual([{ id: '1', name: 'spec.pdf', type: 'pdf' }]);
    expect(tasks[1].attachments).toEqual([]);
  });
});
