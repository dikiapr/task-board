import { IonIcon } from '@ionic/react';
import { expandOutline } from 'ionicons/icons';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column, ColumnId, Task } from '../../types/task';
import { useBoardStore } from '../../store/useBoardStore';
import SortableKanbanCard from '../card/SortableKanbanCard';
import ColumnHeader from './ColumnHeader';
import './column.css';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  isFiltering: boolean;
  isDropTarget: boolean;
  onAddTask: (columnId: ColumnId) => void;
  onOpenTask: (task: Task) => void;
  onDeleteColumn: (column: Column) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  isFiltering,
  isDropTarget,
  onAddTask,
  onOpenTask,
  onDeleteColumn,
}) => {
  const toggleCollapsed = useBoardStore((s) => s.toggleColumnCollapsed);

  const { setNodeRef } = useDroppable({ id: column.id, data: { type: 'column' } });

  const className = ['k-column', column.collapsed && 'k-column--collapsed', isDropTarget && 'k-column--target']
    .filter(Boolean)
    .join(' ');

  if (column.collapsed) {
    return (
      <section ref={setNodeRef} className={className} aria-label={`List ${column.title} (collapsed)`}>
        <button
          type="button"
          className="k-column__expand"
          onClick={() => toggleCollapsed(column.id)}
          aria-label={`Expand ${column.title}`}
        >
          <IonIcon icon={expandOutline} aria-hidden="true" />
          <span className="k-column__vertical-title">{column.title}</span>
          <span className="k-column__count">{tasks.length}</span>
        </button>
      </section>
    );
  }

  return (
    <section className={className} aria-label={`List ${column.title}`}>
      <ColumnHeader
        column={column}
        onAddTask={() => onAddTask(column.id)}
        onDelete={() => onDeleteColumn(column)}
        onCollapse={() => toggleCollapsed(column.id)}
      />

      <div ref={setNodeRef} className="k-column__body">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableKanbanCard key={task.id} task={task} onOpen={onOpenTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <p className="k-column__empty">{isFiltering ? 'No matching tasks' : 'Drop tasks here'}</p>
        )}
      </div>
    </section>
  );
};

export default KanbanColumn;
