import { useRef, useState } from 'react';
import {
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Task } from '../types/task';
import { moveMessage, useBoardStore } from '../store/useBoardStore';

const findTask = (id: UniqueIdentifier) => useBoardStore.getState().tasks.find((t) => t.id === id);
const isColumnId = (id: UniqueIdentifier) => useBoardStore.getState().columns.some((c) => c.id === id);

/**
 * Drag-and-drop state for the board. Cards move between columns live while dragging
 * (onDragOver), reorder within a column on drop (onDragEnd), and snap back on cancel.
 */
export const useBoardDnd = () => {
  const moveTask = useBoardStore((s) => s.moveTask);
  const logActivity = useBoardStore((s) => s.logActivity);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const snapshot = useRef<Task[] | null>(null);
  const draggingColumnId = useBoardStore((s) =>
    activeTask ? s.tasks.find((t) => t.id === activeTask.id)?.columnId : undefined,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space'] },
    }),
  );

  const onDragStart = ({ active }: DragStartEvent) => {
    snapshot.current = useBoardStore.getState().tasks;
    setActiveTask(findTask(active.id) ?? null);
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const task = findTask(active.id);
    if (!task) return;

    const overIsTask = over.data.current?.type === 'task';
    const overColumnId = isColumnId(over.id) ? String(over.id) : findTask(over.id)?.columnId;
    if (!overColumnId || overColumnId === task.columnId) return;

    const translated = active.rect.current.translated;
    const isBelowOverItem =
      overIsTask && translated !== null && translated.top > over.rect.top + over.rect.height / 2;

    moveTask(task.id, overColumnId, overIsTask ? String(over.id) : undefined, isBelowOverItem ? 'after' : 'before');
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const startColumnId = snapshot.current?.find((t) => t.id === active.id)?.columnId;
    setActiveTask(null);
    snapshot.current = null;

    if (over && active.id !== over.id && over.data.current?.type === 'task') {
      const task = findTask(active.id);
      const overTask = findTask(over.id);
      if (task && overTask && task.columnId === overTask.columnId) {
        moveTask(task.id, overTask.columnId, overTask.id);
      }
    }

    const endColumnId = findTask(active.id)?.columnId;
    if (startColumnId && endColumnId && startColumnId !== endColumnId) {
      logActivity(String(active.id), moveMessage(useBoardStore.getState().columns, startColumnId, endColumnId));
    }
  };

  const onDragCancel = () => {
    if (snapshot.current) useBoardStore.setState({ tasks: snapshot.current });
    snapshot.current = null;
    setActiveTask(null);
  };

  return {
    activeTask,
    draggingColumnId,
    contextProps: {
      sensors,
      collisionDetection: closestCorners,
      onDragStart,
      onDragOver,
      onDragEnd,
      onDragCancel,
    },
  };
};
