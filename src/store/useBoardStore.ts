import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { Activity, Column, ColumnId, Task, TaskInput } from '../types/task';
import { createDefaultColumns, createSeedTasks } from '../data/seed';
import { DONE_COLUMN_ID, NEW_COLUMN_COLOR } from '../data/constants';
import { sanitizeAttachments } from '../utils/attachment';

export interface BoardData {
  columns: Column[];
  tasks: Task[];
}

interface BoardState extends BoardData {
  // ----- Task -----
  addTask: (input: TaskInput) => Task;
  updateTask: (id: string, changes: Partial<TaskInput>) => void;
  deleteTask: (id: string) => void;
  restoreTask: (task: Task, index: number) => void;
  moveTask: (
    id: string,
    toColumnId: ColumnId,
    overTaskId?: string,
    position?: 'before' | 'after',
  ) => void;
  logActivity: (id: string, message: string) => void;

  // ----- Column -----
  addColumn: (title: string) => Column;
  renameColumn: (id: ColumnId, title: string) => void;
  deleteColumn: (id: ColumnId) => void;
  toggleColumnCollapsed: (id: ColumnId) => void;

  // ----- Board -----
  importBoard: (data: BoardData) => void;
  resetBoard: () => void;
}

const MAX_ACTIVITY = 30;

const FIELD_NAMES: Record<Exclude<keyof TaskInput, 'columnId'>, string> = {
  title: 'title',
  description: 'description',
  assigneeIds: 'assignees',
  dueDate: 'due date',
  label: 'label',
  priority: 'priority',
  subtasks: 'checklist',
  attachments: 'attachments',
  coverImage: 'cover image',
};

const newActivity = (message: string): Activity => ({
  id: nanoid(),
  message,
  at: new Date().toISOString(),
});

const withActivity = (task: Task, messages: string[]): Task =>
  messages.length === 0
    ? task
    : { ...task, activity: [...messages.map(newActivity).reverse(), ...task.activity].slice(0, MAX_ACTIVITY) };

const joinList = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;

export const moveMessage = (columns: Column[], from: ColumnId, to: ColumnId) => {
  if (to === DONE_COLUMN_ID) return 'Marked as complete';
  const title = (id: ColumnId) => columns.find((c) => c.id === id)?.title ?? id;
  return `Moved from ${title(from)} to ${title(to)}`;
};

const describeChanges = (columns: Column[], before: Task, changes: Partial<TaskInput>): string[] => {
  const messages: string[] = [];
  if (changes.columnId !== undefined && changes.columnId !== before.columnId) {
    messages.push(moveMessage(columns, before.columnId, changes.columnId));
  }
  const changed = (Object.keys(FIELD_NAMES) as (keyof typeof FIELD_NAMES)[]).filter(
    (key) => key in changes && JSON.stringify(changes[key]) !== JSON.stringify(before[key]),
  );
  if (changed.length > 0) messages.push(`Updated ${joinList(changed.map((k) => FIELD_NAMES[k]))}`);
  return messages;
};

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      columns: createDefaultColumns(),
      tasks: createSeedTasks(),

      addTask: (input) => {
        const now = new Date().toISOString();
        const task: Task = {
          ...input,
          id: nanoid(),
          createdAt: now,
          activity: [{ id: nanoid(), message: 'Created this task', at: now }],
        };
        set((state) => ({ tasks: [...state.tasks, task] }));
        return task;
      },

      updateTask: (id, changes) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? withActivity({ ...t, ...changes }, describeChanges(state.columns, t, changes)) : t,
          ),
        })),

      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      restoreTask: (task, index) =>
        set((state) => {
          if (state.tasks.some((t) => t.id === task.id)) return state;
          const tasks = [...state.tasks];
          tasks.splice(Math.min(index, tasks.length), 0, task);
          return { tasks };
        }),

      moveTask: (id, toColumnId, overTaskId, position = 'before') =>
        set((state) => {
          const from = state.tasks.findIndex((t) => t.id === id);
          if (from === -1) return state;

          const current = state.tasks[from];
          const moved = { ...current, columnId: toColumnId };
          const sameColumn = current.columnId === toColumnId;

          if (sameColumn) {
            const to = overTaskId ? state.tasks.findIndex((t) => t.id === overTaskId) : -1;
            if (to === -1 || to === from) return state;
            const next = [...state.tasks];
            next.splice(from, 1);
            next.splice(to, 0, moved);
            return { tasks: next };
          }

          const rest = state.tasks.filter((t) => t.id !== id);
          const overIndex = overTaskId ? rest.findIndex((t) => t.id === overTaskId) : -1;
          if (overIndex === -1) return { tasks: [...rest, moved] };

          const insertAt = position === 'after' ? overIndex + 1 : overIndex;
          rest.splice(insertAt, 0, moved);
          return { tasks: rest };
        }),

      logActivity: (id, message) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? withActivity(t, [message]) : t)),
        })),

      addColumn: (title) => {
        const column: Column = { id: nanoid(8), title: title.trim(), color: NEW_COLUMN_COLOR };
        set((state) => ({ columns: [...state.columns, column] }));
        return column;
      },

      renameColumn: (id, title) =>
        set((state) => ({
          columns: state.columns.map((c) => (c.id === id ? { ...c, title: title.trim() } : c)),
        })),

      deleteColumn: (id) =>
        set((state) =>
          id === DONE_COLUMN_ID
            ? state
            : {
                columns: state.columns.filter((c) => c.id !== id),
                tasks: state.tasks.filter((t) => t.columnId !== id),
              },
        ),

      toggleColumnCollapsed: (id) =>
        set((state) => ({
          columns: state.columns.map((c) => (c.id === id ? { ...c, collapsed: !c.collapsed } : c)),
        })),

      importBoard: ({ columns, tasks }) => set({ columns, tasks }),

      resetBoard: () => set({ columns: createDefaultColumns(), tasks: createSeedTasks() }),
    }),
    {
      name: 'task-board',
      version: 3,
      partialize: (state): BoardData => ({ columns: state.columns, tasks: state.tasks }),
      migrate: (persisted, version) => {
        let state = persisted as Partial<BoardData>;
        if (version < 2) {
          state = {
            columns: createDefaultColumns(),
            tasks: (state.tasks ?? []).map((t) => ({ ...t, activity: t.activity ?? [] })),
          };
        }
        if (version < 3) {
          state = {
            ...state,
            tasks: (state.tasks ?? []).map((t) => ({ ...t, attachments: sanitizeAttachments(t.attachments ?? []) })),
          };
        }
        return state as BoardData;
      },
    },
  ),
);
