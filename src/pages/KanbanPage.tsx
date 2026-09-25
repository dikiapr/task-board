import { IonContent, IonPage } from '@ionic/react';
import { useBoardStore } from '../store/useBoardStore';
import KanbanBoard from '../components/kanban/KanbanBoard';
import '../components/kanban/kanban.css';

const KanbanPage: React.FC = () => {
  const tasks = useBoardStore((s) => s.tasks);

  return (
    <IonPage className="kanban">
      <IonContent scrollY={false} className="kanban__content">
        <KanbanBoard tasks={tasks} />
      </IonContent>
    </IonPage>
  );
};

export default KanbanPage;
