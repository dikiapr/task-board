import { IonIcon } from '@ionic/react';
import { attachOutline, checkboxOutline, timeOutline } from 'ionicons/icons';
import type { Task } from '../../types/task';
import { DONE_COLUMN_ID } from '../../data/constants';
import { formatShortDate, getDueStatus } from '../../utils/date';
import AvatarStack from '../avatar/AvatarStack';
import LabelPill from '../label/LabelPill';
import PriorityFlag from '../priority/PriorityFlag';
import ProgressBar from '../progress/ProgressBar';
import './card.css';

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
          {task.priority && <PriorityFlag priority={task.priority} />}
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
