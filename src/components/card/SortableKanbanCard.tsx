import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types/task';
import { KanbanCard } from './KanbanCard';
import './card.css';

interface SortableKanbanCardProps {
  task: Task;
  onOpen: (task: Task) => void;
}

const SortableKanbanCard: React.FC<SortableKanbanCardProps> = ({ task, onOpen }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task' },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`k-sortable${isDragging ? ' k-sortable--dragging' : ''}`}
      {...attributes}
      {...listeners}
      aria-label={`Task: ${task.title}`}
      onClick={() => onOpen(task)}
      onKeyDown={(e) => {
        listeners?.onKeyDown?.(e);
        if (e.key === 'Enter' && !isDragging) onOpen(task);
      }}
    >
      <KanbanCard task={task} />
    </div>
  );
};

export default SortableKanbanCard;
