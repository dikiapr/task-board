import { useEffect, useRef, useState, type SetStateAction } from 'react';
import { IonContent, IonIcon, IonModal, useIonAlert } from '@ionic/react';
import { checkmark, close, pencil, trashOutline } from 'ionicons/icons';
import type { ColumnId, LabelType, Priority, Task, TaskInput } from '../../types/task';
import { BOARD_NAME, DONE_COLUMN_ID, LABELS, PRIORITIES } from '../../data/constants';
import { useBoardStore } from '../../store/useBoardStore';
import ActivityList from './detail/ActivityList';
import AssigneeField from './detail/AssigneeField';
import AttachmentsField from './detail/AttachmentsField';
import ChecklistField from './detail/ChecklistField';
import CoverImageField from './detail/CoverImageField';
import DueDateField from './detail/DueDateField';

export type EditorState = { mode: 'create'; columnId: ColumnId } | { mode: 'edit'; taskId: string };

interface TaskDetailModalProps {
  editor: EditorState | null;
  onDidDismiss: () => void;
  onSaved: (mode: EditorState['mode'], title: string) => void;
  onDeleted: (task: Task, index: number) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ editor, onDidDismiss, onSaved, onDeleted }) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const isDirty = useRef(false);
  const skipGuard = useRef(false);
  const [presentAlert] = useIonAlert();

  const confirmDiscard = () =>
    new Promise<boolean>((resolve) =>
      presentAlert({
        header: 'Discard changes?',
        message: 'Your unsaved changes will be lost.',
        buttons: [
          { text: 'Keep editing', role: 'cancel' },
          { text: 'Discard', role: 'destructive' },
        ],
        onDidDismiss: (e) => resolve(e.detail.role === 'destructive'),
      }),
    );

  const closeModal = (force: boolean) => {
    skipGuard.current = force;
    modal.current?.dismiss();
  };

  return (
    <IonModal
      ref={modal}
      isOpen={editor !== null}
      className="k-modal"
      canDismiss={async () => skipGuard.current || !isDirty.current || confirmDiscard()}
      onWillPresent={() => {
        skipGuard.current = false;
        isDirty.current = false;
      }}
      onDidDismiss={() => {
        skipGuard.current = true;
        onDidDismiss();
      }}
    >
      {editor && (
        <TaskDetailForm
          editor={editor}
          onDirtyChange={(dirty) => (isDirty.current = dirty)}
          onClose={closeModal}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      )}
    </IonModal>
  );
};

const emptyDraft = (columnId: ColumnId): TaskInput => ({
  columnId,
  title: '',
  description: '',
  assigneeIds: [],
  dueDate: null,
  label: 'Undefined',
  priority: undefined,
  subtasks: [],
  attachments: [],
  coverImage: undefined,
});

interface TaskDetailFormProps {
  editor: EditorState;
  onDirtyChange: (dirty: boolean) => void;
  onClose: (force: boolean) => void;
  onSaved: TaskDetailModalProps['onSaved'];
  onDeleted: TaskDetailModalProps['onDeleted'];
}

const TaskDetailForm: React.FC<TaskDetailFormProps> = ({ editor, onDirtyChange, onClose, onSaved, onDeleted }) => {
  const columns = useBoardStore((s) => s.columns);
  const activity = useBoardStore((s) =>
    editor.mode === 'edit' ? s.tasks.find((t) => t.id === editor.taskId)?.activity : undefined,
  );
  const [presentAlert] = useIonAlert();

  const [initial] = useState<TaskInput>(() => {
    if (editor.mode === 'create') return emptyDraft(editor.columnId);
    const task = useBoardStore.getState().tasks.find((t) => t.id === editor.taskId);
    if (!task) return emptyDraft(columns[0]?.id ?? 'todo');
    const { id, createdAt, activity, ...input } = task;
    return input;
  });
  const [draft, setDraft] = useState(initial);
  const [isEditingTitle, setIsEditingTitle] = useState(editor.mode === 'create');
  const [showTitleError, setShowTitleError] = useState(false);

  useEffect(() => {
    onDirtyChange(JSON.stringify(draft) !== JSON.stringify(initial));
  }, [draft, initial, onDirtyChange]);

  const update = <K extends keyof TaskInput>(key: K, action: SetStateAction<TaskInput[K]>) =>
    setDraft((d) => ({
      ...d,
      [key]: typeof action === 'function' ? (action as (prev: TaskInput[K]) => TaskInput[K])(d[key]) : action,
    }));

  const isComplete = draft.columnId === DONE_COLUMN_ID;
  const returnColumnId =
    initial.columnId !== DONE_COLUMN_ID
      ? initial.columnId
      : (columns.find((c) => c.id !== DONE_COLUMN_ID)?.id ?? DONE_COLUMN_ID);

  const save = () => {
    const title = draft.title.trim();
    if (!title) {
      setShowTitleError(true);
      setIsEditingTitle(true);
      return;
    }
    const data: TaskInput = { ...draft, title, description: draft.description.trim() };
    const { addTask, updateTask } = useBoardStore.getState();
    if (editor.mode === 'edit') updateTask(editor.taskId, data);
    else addTask(data);
    onSaved(editor.mode, title);
    onClose(true);
  };

  const confirmDelete = () => {
    if (editor.mode !== 'edit') return;
    presentAlert({
      header: 'Delete task?',
      message: `"${initial.title}" will be removed from the board.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            const { tasks, deleteTask } = useBoardStore.getState();
            const index = tasks.findIndex((t) => t.id === editor.taskId);
            if (index === -1) return;
            const task = tasks[index];
            deleteTask(task.id);
            onDeleted(task, index);
            onClose(true);
          },
        },
      ],
    });
  };

  return (
    <div className="k-detail">
      <div className="k-detail__topbar">
        <button
          type="button"
          className={`k-mark${isComplete ? ' is-complete' : ''}`}
          aria-pressed={isComplete}
          onClick={() => update('columnId', isComplete ? returnColumnId : DONE_COLUMN_ID)}
        >
          <IonIcon icon={checkmark} aria-hidden="true" />
          {isComplete ? 'Completed' : 'Mark Complete'}
        </button>
        <div className="k-detail__topbar-actions">
          {editor.mode === 'edit' && (
            <button type="button" className="k-icon-btn k-icon-btn--danger" onClick={confirmDelete} aria-label="Delete task">
              <IonIcon icon={trashOutline} aria-hidden="true" />
            </button>
          )}
          <button type="button" className="k-icon-btn k-icon-btn--boxed" onClick={() => onClose(false)} aria-label="Close">
            <IonIcon icon={close} aria-hidden="true" />
          </button>
        </div>
      </div>

      <IonContent className="k-detail__content">
        <CoverImageField value={draft.coverImage} onChange={(v) => update('coverImage', v)} />

        <section className="k-detail__section">
          {isEditingTitle ? (
            <input
              className="k-title-input"
              placeholder="Task title"
              aria-label="Task title"
              value={draft.title}
              autoFocus
              onChange={(e) => update('title', e.target.value)}
              onBlur={() => draft.title.trim() && setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          ) : (
            <h2 className="k-detail__title">
              <span>{draft.title}</span>
              <button type="button" className="k-icon-btn" onClick={() => setIsEditingTitle(true)} aria-label="Edit title">
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
              <select
                className="k-select"
                value={draft.columnId}
                onChange={(e) => update('columnId', e.target.value)}
              >
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
        </section>

        <section className="k-detail__section">
          <h3 className="k-detail__heading">Description</h3>
          <div className="k-description">
            <IonIcon icon={pencil} className="k-description__icon" aria-hidden="true" />
            <textarea
              aria-label="Description"
              rows={3}
              value={draft.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>
        </section>

        <section className="k-detail__section">
          <h3 className="k-detail__heading">Attachments</h3>
          <AttachmentsField value={draft.attachments} onChange={(v) => update('attachments', v)} />
        </section>

        <section className="k-detail__section">
          <h3 className="k-detail__heading">Check List</h3>
          <ChecklistField value={draft.subtasks} onChange={(v) => update('subtasks', v)} />
        </section>

        <section className="k-detail__section">
          <h3 className="k-detail__heading">Activity</h3>
          <ActivityList items={activity ?? []} />
        </section>
      </IonContent>

      <div className="k-detail__footer">
        <button type="button" className="k-btn k-btn--soft" onClick={() => onClose(true)}>
          Discard
        </button>
        <button type="button" className="k-btn k-btn--primary" onClick={save}>
          Save
        </button>
      </div>
    </div>
  );
};

export default TaskDetailModal;
