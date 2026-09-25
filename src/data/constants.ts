import type { Column, LabelType, Member, Priority } from '../types/task';

export const BOARD_NAME = 'Adhivasindo';

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: '#64748b' },
  { id: 'doing', title: 'Doing', color: '#3b82f6' },
  { id: 'review', title: 'Review', color: '#a855f7' },
  { id: 'done', title: 'Done', color: '#22c55e' },
  { id: 'rework', title: 'Rework', color: '#f97316' },
];

export const DONE_COLUMN_ID = 'done';

export const NEW_COLUMN_COLOR = '#94a3b8';

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
