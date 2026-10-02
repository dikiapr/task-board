import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { addOutline, contractOutline, expandOutline } from 'ionicons/icons';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column, ColumnId, Task } from '../../types/task';
import { useBoardStore } from '../../store/useBoardStore';
import SortableKanbanCard from '../card/SortableKanbanCard';
import ColumnActionsMenu from './ColumnActionsMenu';
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
  const renameColumn = useBoardStore((s) => s.renameColumn);
  const toggleCollapsed = useBoardStore((s) => s.toggleColumnCollapsed);
  const [isRenaming, setIsRenaming] = useState(false);

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

  const commitRename = (value: string) => {
    if (value.trim()) renameColumn(column.id, value);
    setIsRenaming(false);
  };

  return (
    <section className={className} aria-label={`List ${column.title}`}>
      <header className="k-column__header">
        {isRenaming ? (
          <input
            className="k-column__rename"
            defaultValue={column.title}
            aria-label="List name"
            autoFocus
            onBlur={(e) => commitRename(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename(e.currentTarget.value);
              if (e.key === 'Escape') setIsRenaming(false);
            }}
          />
        ) : (
          <h2 className="k-column__title" onDoubleClick={() => setIsRenaming(true)}>
            {column.title}
          </h2>
        )}
        <button
          type="button"
          className="k-icon-btn k-icon-btn--add"
          onClick={() => onAddTask(column.id)}
          aria-label={`Add task to ${column.title}`}
        >
          <IonIcon icon={addOutline} aria-hidden="true" />
        </button>
        <ColumnActionsMenu
          column={column}
          onAddTask={() => onAddTask(column.id)}
          onRename={() => setIsRenaming(true)}
          onDelete={() => onDeleteColumn(column)}
        />
        <button
          type="button"
          className="k-icon-btn k-column__collapse"
          onClick={() => toggleCollapsed(column.id)}
          aria-label={`Collapse ${column.title}`}
          title="Collapse list"
        >
          <IonIcon icon={contractOutline} aria-hidden="true" />
        </button>
      </header>

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
