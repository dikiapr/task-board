export type ColumnId = string;
export type LabelType = 'Feature' | 'Bug' | 'Issue' | 'Undefined';
export type Priority = 'Low' | 'Medium' | 'High';
export type AttachmentType = 'pdf' | 'doc' | 'image';

export interface Column {
  id: ColumnId;
  title: string;
  color: string;
  collapsed?: boolean;
}

export interface Member {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: AttachmentType;
}

export interface Activity {
  id: string;
  message: string;
  at: string;
}

export interface Task {
  id: string;
  columnId: ColumnId;
  title: string;
  description: string;
  assigneeIds: string[];
  dueDate: string | null;
  label: LabelType;
  priority?: Priority;
  subtasks: Subtask[];
  attachments: Attachment[];
  coverImage?: string;
  activity: Activity[];
  createdAt: string;
}

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'activity'>;

export interface BoardData {
  columns: Column[];
  tasks: Task[];
}
