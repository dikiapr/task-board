import { useMemo, useState } from 'react';
import { IonContent, IonPage, useIonAlert } from '@ionic/react';
import { alertCircleOutline, trashOutline } from 'ionicons/icons';
import type { Column, ColumnId, Task } from '../types/task';
import { useBoardStore } from '../store/useBoardStore';
import { EMPTY_FILTERS, filterTasks, isFilterActive } from '../utils/filterTasks';
import { exportBoard, parseBoardFile } from '../utils/exportImport';
import '../theme/kanban.css';
import KanbanHeader from '../components/header/KanbanHeader';
import KanbanBoard from '../components/board/KanbanBoard';
import TaskDetailModal, { type EditorState } from '../components/modal/TaskDetailModal';
import { useToast } from '../hooks/useToast';

const KanbanPage: React.FC = () => {
  const tasks = useBoardStore((s) => s.tasks);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const visibleTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const [editor, setEditor] = useState<EditorState | null>(null);

  const toast = useToast();
  const [presentAlert] = useIonAlert();

  const openCreate = (columnId: ColumnId) => setEditor({ mode: 'create', columnId });
  const openEdit = (task: Task) => setEditor({ mode: 'edit', taskId: task.id });

  const handleDeleted = (task: Task, index: number) =>
    toast('Task deleted', {
      icon: trashOutline,
      undo: () => useBoardStore.getState().restoreTask(task, index),
    });

  const handleDeleteColumn = (column: Column) => {
    const count = useBoardStore.getState().tasks.filter((t) => t.columnId === column.id).length;
    presentAlert({
      header: `Delete "${column.title}"?`,
      message: count > 0 ? `This list and its ${count} task(s) will be deleted.` : 'This list will be deleted.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            const snapshot = useBoardStore.getState();
            const before = { columns: snapshot.columns, tasks: snapshot.tasks };
            snapshot.deleteColumn(column.id);
            toast('List deleted', { icon: trashOutline, undo: () => useBoardStore.getState().importBoard(before) });
          },
        },
      ],
    });
  };

  const handleImport = async (file: File) => {
    try {
      const data = parseBoardFile(await file.text());
      presentAlert({
        header: 'Import board?',
        message: `${data.columns.length} lists and ${data.tasks.length} tasks will replace the current board.`,
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Import',
            handler: () => {
              useBoardStore.getState().importBoard(data);
              toast('Board imported');
            },
          },
        ],
      });
    } catch (e) {
      toast((e as Error).message, { icon: alertCircleOutline, color: 'danger' });
    }
  };

  const handleReset = () =>
    presentAlert({
      header: 'Reset board?',
      message: 'All changes will be lost and the board will return to the sample data.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Reset',
          role: 'destructive',
          handler: () => {
            useBoardStore.getState().resetBoard();
            setFilters(EMPTY_FILTERS);
            toast('Board reset to sample data');
          },
        },
      ],
    });

  return (
    <IonPage className="kanban">
      <KanbanHeader
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={visibleTasks.length}
        onInvite={(email) => toast(`Invitation sent to ${email} (simulation)`)}
        onExport={() => {
          const { columns, tasks: all } = useBoardStore.getState();
          exportBoard({ columns, tasks: all });
          toast('Board exported');
        }}
        onImport={handleImport}
        onReset={handleReset}
      />

      <IonContent scrollY={false} className="kanban__content">
        <KanbanBoard
          tasks={visibleTasks}
          isFiltering={isFilterActive(filters)}
          onAddTask={openCreate}
          onOpenTask={openEdit}
          onAddColumn={(title) => {
            useBoardStore.getState().addColumn(title);
            toast('List created');
          }}
          onDeleteColumn={handleDeleteColumn}
        />
      </IonContent>

      <TaskDetailModal
        editor={editor}
        onDidDismiss={() => setEditor(null)}
        onSaved={(mode) => toast(mode === 'create' ? 'Task created' : 'Task updated')}
        onDeleted={handleDeleted}
      />
    </IonPage>
  );
};

export default KanbanPage;
