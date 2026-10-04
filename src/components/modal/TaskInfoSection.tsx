import { IonIcon } from '@ionic/react';
import { pencil } from 'ionicons/icons';
import type { Column, LabelType, Priority, TaskInput } from '../../types/task';
import type { DraftUpdater } from '../../hooks/useTaskDraft';
import { BOARD_NAME, LABELS, PRIORITIES } from '../../data/constants';
import AssigneeField from './AssigneeField';
import DetailSection from './DetailSection';
import DueDateField from './DueDateField';

interface TaskInfoSectionProps {
  draft: TaskInput;
  update: DraftUpdater;
  columns: Column[];
  isEditingTitle: boolean;
  onEditingTitleChange: (editing: boolean) => void;
  showTitleError: boolean;
}

const TaskInfoSection: React.FC<TaskInfoSectionProps> = ({
  draft,
  update,
  columns,
  isEditingTitle,
  onEditingTitleChange,
  showTitleError,
}) => (
  <DetailSection>
    {isEditingTitle ? (
      <input
        className="k-title-input"
        placeholder="Task title"
        aria-label="Task title"
        value={draft.title}
        autoFocus
        onChange={(e) => update('title', e.target.value)}
        onBlur={() => draft.title.trim() && onEditingTitleChange(false)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
    ) : (
      <h2 className="k-detail__title">
        <span>{draft.title}</span>
        <button type="button" className="k-icon-btn" onClick={() => onEditingTitleChange(true)} aria-label="Edit title">
          <IonIcon icon={pencil} aria-hidden="true" />
        </button>
      </h2>
    )}
    {showTitleError && !draft.title.trim() && <p className="k-error">Title is required</p>}

    <div className="k-detail__grid">
      <div className="k-field">
        <span className="k-field__label">Assignee</span>
        <AssigneeField
          value={draft.assigneeIds}
          onToggle={(memberId) =>
            update('assigneeIds', (ids) =>
              ids.includes(memberId) ? ids.filter((id) => id !== memberId) : [...ids, memberId],
            )
          }
        />
      </div>
      <div className="k-field">
        <span className="k-field__label">Due Date</span>
        <DueDateField value={draft.dueDate} onChange={(v) => update('dueDate', v)} />
      </div>
      <label className="k-field">
        <span className="k-field__label">Board</span>
        <select className="k-select" value={BOARD_NAME} onChange={() => undefined}>
          <option>{BOARD_NAME}</option>
        </select>
      </label>
      <label className="k-field">
        <span className="k-field__label">Column</span>
        <select className="k-select" value={draft.columnId} onChange={(e) => update('columnId', e.target.value)}>
          {columns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>
      <label className="k-field">
        <span className="k-field__label">Label</span>
        <select
          className="k-select"
          value={draft.label}
          onChange={(e) => update('label', e.target.value as LabelType)}
        >
          {LABELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="k-field">
        <span className="k-field__label">Priority</span>
        <select
          className="k-select"
          value={draft.priority ?? ''}
          onChange={(e) => update('priority', (e.target.value || undefined) as Priority | undefined)}
        >
          <option value="">None</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
    </div>
  </DetailSection>
);

export default TaskInfoSection;
