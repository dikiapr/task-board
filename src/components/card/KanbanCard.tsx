import { IonIcon } from '@ionic/react';
import { attachOutline, checkboxOutline, flag, timeOutline } from 'ionicons/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { LabelType, Task } from '../../types/task';
import { DONE_COLUMN_ID, PRIORITY_COLORS } from '../../data/constants';
import { formatShortDate, getDueStatus } from '../../utils/date';
import { AvatarStack } from '../avatar/Avatar';
import './card.css';

export const LabelPill: React.FC<{ label: LabelType }> = ({ label }) => (
  <span className={`k-label k-label--${label.toLowerCase()}`}>{label}</span>
);

export const ProgressBar: React.FC<{ done: number; total: number }> = ({ done, total }) => {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div
      className={`k-progress${total > 0 && done === total ? ' k-progress--complete' : ''}`}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${percent}%` }} />
    </div>
  );
};

interface KanbanCardProps {
  task: Task;
  isOverlay?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, isOverlay }) => {
  const doneCount = task.subtasks.filter((s) => s.done).length;
  const total = task.subtasks.length;
  const dueStatus = task.columnId === DONE_COLUMN_ID ? 'none' : getDueStatus(task.dueDate);

  return (
    <article className={`k-card${isOverlay ? ' k-card--overlay' : ''}`}>
      {task.coverImage && (
        <img className="k-card__cover" src={task.coverImage} alt="" loading="lazy" draggable={false} />
      )}

      <div className="k-card__body">
        <div className="k-card__labels">
          <LabelPill label={task.label} />
          {task.priority && (
            <span
              className="k-card__priority"
              style={{ color: PRIORITY_COLORS[task.priority] }}
              title={`${task.priority} priority`}
              aria-label={`${task.priority} priority`}
            >
              <IonIcon icon={flag} aria-hidden="true" />
            </span>
          )}
        </div>

        {total > 0 && <ProgressBar done={doneCount} total={total} />}

        <h3 className="k-card__title">{task.title}</h3>

        <div className="k-card__footer">
          <div className="k-card__meta">
            {task.dueDate && (
              <span className={`k-due k-due--${dueStatus}`} title="Due date">
                <IonIcon icon={timeOutline} aria-hidden="true" />
                {formatShortDate(task.dueDate)}
              </span>
            )}
            {total > 0 && (
              <span className="k-meta" title="Checklist">
                <IonIcon icon={checkboxOutline} aria-hidden="true" />
                {doneCount}/{total}
              </span>
            )}
            {task.attachments.length > 0 && (
              <span className="k-meta" title="Attachments">
                <IonIcon icon={attachOutline} aria-hidden="true" />
                {task.attachments.length}
              </span>
            )}
          </div>
          <AvatarStack memberIds={task.assigneeIds} max={3} />
        </div>
      </div>
    </article>
  );
};

interface SortableKanbanCardProps {
  task: Task;
  onOpen: (task: Task) => void;
}

export const SortableKanbanCard: React.FC<SortableKanbanCardProps> = ({ task, onOpen }) => {
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
