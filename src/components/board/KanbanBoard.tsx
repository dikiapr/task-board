import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { addOutline, closeOutline } from 'ionicons/icons';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { Column, ColumnId, Task } from '../../types/task';
import { useBoardStore } from '../../store/useBoardStore';
import { useBoardDnd } from '../../hooks/useBoardDnd';
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

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  isFiltering,
  onAddTask,
  onOpenTask,
  onAddColumn,
  onDeleteColumn,
}) => {
  const columns = useBoardStore((s) => s.columns);
  const { activeTask, draggingColumnId, contextProps } = useBoardDnd();

  return (
    <DndContext {...contextProps}>
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
