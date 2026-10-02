import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { Column, ColumnId, Task } from '../../types/task';
import { useBoardStore } from '../../store/useBoardStore';
import { useBoardDnd } from '../../hooks/useBoardDnd';
import KanbanColumn from '../column/KanbanColumn';
import { KanbanCard } from '../card/KanbanCard';
import AddListButton from './AddListButton';
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

export default KanbanBoard;
