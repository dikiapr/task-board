import { useEffect, useRef, useState, type SetStateAction } from 'react';
import { IonContent, IonIcon, IonModal, useIonAlert } from '@ionic/react';
import { pencil, trashOutline } from 'ionicons/icons';
import type { ColumnId, Task, TaskInput } from '../../types/task';
import { DONE_COLUMN_ID } from '../../data/constants';
import { useBoardStore } from '../../store/useBoardStore';
import Button from '../button/Button';
import ActivityList from './ActivityList';
import AttachmentsField from './AttachmentsField';
import ChecklistField from './ChecklistField';
import CoverImageField from './CoverImageField';
import DetailTopbar from './DetailTopbar';
import TaskInfoSection from './TaskInfoSection';
import './modal.css';

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
      <DetailTopbar
        isComplete={isComplete}
        onToggleComplete={() => update('columnId', isComplete ? returnColumnId : DONE_COLUMN_ID)}
        onClose={() => onClose(false)}
      />

      <IonContent className="k-detail__content">
        <CoverImageField value={draft.coverImage} onChange={(v) => update('coverImage', v)} />

        <TaskInfoSection
          draft={draft}
          update={update}
          columns={columns}
          isEditingTitle={isEditingTitle}
          onEditingTitleChange={setIsEditingTitle}
          showTitleError={showTitleError}
        />

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
        {editor.mode === 'edit' && (
          <Button variant="danger" icon={trashOutline} className="k-detail__delete" onClick={confirmDelete}>
            Delete
          </Button>
        )}
        <Button variant="soft" onClick={() => onClose(true)}>
          Discard
        </Button>
        <Button variant="primary" onClick={save}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default TaskDetailModal;
