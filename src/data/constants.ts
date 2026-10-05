import type { Column, LabelType, Member, Priority } from '../types/task';

export const BOARD_NAME = 'Adhivasindo';

/** Toasts are anchored below the header so they never cover its buttons. */
export const HEADER_ID = 'kanban-header';

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'Doing' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
  { id: 'rework', title: 'Rework' },
];

export const DONE_COLUMN_ID = 'done';

export const LABELS: LabelType[] = ['Feature', 'Bug', 'Issue', 'Undefined'];

export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export const PRIORITY_COLORS: Record<Priority, string> = {
  Low: '#16a34a',
  Medium: '#d97706',
  High: '#dc2626',
};

export const MEMBERS: Member[] = [
  { id: 'm1', name: 'Andi Pratama', color: '#0ea5e9' },
  { id: 'm2', name: 'Budi Santoso', color: '#8b5cf6' },
  { id: 'm3', name: 'Citra Lestari', color: '#ec4899' },
  { id: 'm4', name: 'Dewi Anggraini', color: '#14b8a6' },
  { id: 'm5', name: 'Eko Wijaya', color: '#f59e0b' },
  { id: 'm6', name: 'Fajar Nugroho', color: '#6366f1' },
];

export const getMember = (id: string) => MEMBERS.find((m) => m.id === id);

export const DUMMY_COVERS = ['/covers/cover-1.jpg', '/covers/cover-2.jpg', '/covers/cover-3.jpg', '/covers/cover-4.jpg'];
