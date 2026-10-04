import { useRef } from 'react';
import { IonModal, useIonAlert } from '@ionic/react';
import type { EditorState } from '../../types/task';
import TaskDetailForm, { type TaskDetailFormProps } from './TaskDetailForm';
import './modal.css';

interface TaskDetailModalProps extends Pick<TaskDetailFormProps, 'onSaved' | 'onDeleted'> {
  editor: EditorState | null;
  onDidDismiss: () => void;
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

export default TaskDetailModal;
