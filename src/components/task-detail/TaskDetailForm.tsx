import { useEffect, useState } from 'react';
import { IonContent, useIonAlert } from '@ionic/react';
import { trashOutline } from 'ionicons/icons';
import type { EditorState, Task } from '../../types/task';
import { DONE_COLUMN_ID } from '../../data/constants';
import { useBoardStore } from '../../store/useBoardStore';
import { useTaskDraft } from '../../hooks/useTaskDraft';
import { cleanDraft, getReturnColumnId } from '../../utils/taskDraft';
import Button from '../button/Button';
import ActivityList from './parts/ActivityList';
import AttachmentsField from './parts/AttachmentsField';
import ChecklistField from './parts/ChecklistField';
import CoverImageField from './parts/CoverImageField';
import DescriptionField from './parts/DescriptionField';
import DetailSection from './parts/DetailSection';
import DetailTopbar from './parts/DetailTopbar';
import TaskInfoSection from './parts/TaskInfoSection';
import './task-detail.css';

export interface TaskDetailFormProps {
  editor: EditorState;
  onDirtyChange: (dirty: boolean) => void;
  onClose: (force: boolean) => void;
  onSaved: (mode: EditorState['mode'], title: string) => void;
  onDeleted: (task: Task, index: number) => void;
}

const TaskDetailForm: React.FC<TaskDetailFormProps> = ({ editor, onDirtyChange, onClose, onSaved, onDeleted }) => {
  const columns = useBoardStore((s) => s.columns);
  const activity = useBoardStore((s) =>
    editor.mode === 'edit' ? s.tasks.find((t) => t.id === editor.taskId)?.activity : undefined,
  );
  const [presentAlert] = useIonAlert();

  const { initial, draft, update, isDirty } = useTaskDraft(editor);
  const [isEditingTitle, setIsEditingTitle] = useState(editor.mode === 'create');
  const [showTitleError, setShowTitleError] = useState(false);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const isComplete = draft.columnId === DONE_COLUMN_ID;
  const returnColumnId = getReturnColumnId(initial.columnId, columns);

  const save = () => {
    const data = cleanDraft(draft);
    if (!data.title) {
      setShowTitleError(true);
      setIsEditingTitle(true);
      return;
    }
    const { addTask, updateTask } = useBoardStore.getState();
    if (editor.mode === 'edit') updateTask(editor.taskId, data);
    else addTask(data);
    onSaved(editor.mode, data.title);
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

        <DetailSection title="Description">
          <DescriptionField value={draft.description} onChange={(v) => update('description', v)} />
        </DetailSection>

        <DetailSection title="Attachments">
          <AttachmentsField value={draft.attachments} onChange={(v) => update('attachments', v)} />
        </DetailSection>

        <DetailSection title="Check List">
          <ChecklistField value={draft.subtasks} onChange={(v) => update('subtasks', v)} />
        </DetailSection>

        <DetailSection title="Activity">
          <ActivityList items={activity ?? []} />
        </DetailSection>
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

export default TaskDetailForm;
