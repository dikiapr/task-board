import { useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { addOutline, closeOutline } from 'ionicons/icons';
import {
  closestCorners,
  DndContext,
  DragOverlay,
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
import type { Column, ColumnId, Task } from '../../types/task';
import { moveMessage, useBoardStore } from '../../store/useBoardStore';
import Button from '../button/Button';
import KanbanColumn from '../column/KanbanColumn';
import { KanbanCard } from '../card/KanbanCard';
import './board.css';

interface KanbanBoardProps {
  tasks: Task[];
  isFiltering: boolean;
  onAddTask: (columnId: ColumnId) => void;
  onOpenTask: (task: Task) => void;
  onAddColumn: (title: string) => void;
  onDeleteColumn: (column: Column) => void;
}

const findTask = (id: UniqueIdentifier) => useBoardStore.getState().tasks.find((t) => t.id === id);
const isColumnId = (id: UniqueIdentifier) => useBoardStore.getState().columns.some((c) => c.id === id);

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  isFiltering,
  onAddTask,
  onOpenTask,
  onAddColumn,
  onDeleteColumn,
}) => {
  const columns = useBoardStore((s) => s.columns);
  const moveTask = useBoardStore((s) => s.moveTask);
  const logActivity = useBoardStore((s) => s.logActivity);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const snapshot = useRef<Task[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space'] },
    }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    snapshot.current = useBoardStore.getState().tasks;
    setActiveTask(findTask(active.id) ?? null);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
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

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
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

  const handleDragCancel = () => {
    if (snapshot.current) useBoardStore.setState({ tasks: snapshot.current });
    snapshot.current = null;
    setActiveTask(null);
  };

  const draggingColumnId = activeTask ? findTask(activeTask.id)?.columnId : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="k-board">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter((t) => t.columnId === column.id)}
            isFiltering={isFiltering}
            isDropTarget={draggingColumnId === column.id}
            onAddTask={onAddTask}
            onOpenTask={onOpenTask}
            onDeleteColumn={onDeleteColumn}
          />
        ))}
        <AddListButton onAdd={onAddColumn} />
      </div>

      <DragOverlay>{activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}</DragOverlay>
    </DndContext>
  );
};

const AddListButton: React.FC<{ onAdd: (title: string) => void }> = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    onAdd(title);
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <div className="k-add-list">
        <button type="button" className="k-add-list__button" onClick={() => setIsAdding(true)}>
          <IonIcon icon={addOutline} aria-hidden="true" />
          Add new List
        </button>
      </div>
    );
  }

  return (
    <form
      className="k-add-list k-add-list--form"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        className="k-input"
        placeholder="List name"
        aria-label="List name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setIsAdding(false)}
        autoFocus
      />
      <div className="k-add-list__actions">
        <Button type="submit" variant="primary" disabled={!title.trim()}>
          Add list
        </Button>
        <button type="button" className="k-icon-btn" onClick={() => setIsAdding(false)} aria-label="Cancel">
          <IonIcon icon={closeOutline} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};

export default KanbanBoard;
