import { useState, type SetStateAction } from 'react';
import type { EditorState, TaskInput } from '../types/task';
import { useBoardStore } from '../store/useBoardStore';
import { emptyDraft, isDraftChanged, toDraft } from '../utils/taskDraft';

export type DraftUpdater = <K extends keyof TaskInput>(key: K, action: SetStateAction<TaskInput[K]>) => void;

export const useTaskDraft = (editor: EditorState) => {
  const [initial] = useState<TaskInput>(() => {
    const { tasks, columns } = useBoardStore.getState();
    if (editor.mode === 'create') return emptyDraft(editor.columnId);
    const task = tasks.find((t) => t.id === editor.taskId);
    return task ? toDraft(task) : emptyDraft(columns[0]?.id ?? 'todo');
  });
  const [draft, setDraft] = useState(initial);

  const update: DraftUpdater = <K extends keyof TaskInput>(key: K, action: SetStateAction<TaskInput[K]>) =>
    setDraft((d) => ({
      ...d,
      [key]: typeof action === 'function' ? (action as (prev: TaskInput[K]) => TaskInput[K])(d[key]) : action,
    }));

  return { initial, draft, update, isDirty: isDraftChanged(draft, initial) };
};
