import { useMemo, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useBoardStore } from '../store/useBoardStore';
import { EMPTY_FILTERS, filterTasks, isFilterActive } from '../utils/filterTasks';
import KanbanHeader from '../components/kanban/KanbanHeader';
import KanbanBoard from '../components/kanban/KanbanBoard';
import '../components/kanban/kanban.css';

const KanbanPage: React.FC = () => {
  const tasks = useBoardStore((s) => s.tasks);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const visibleTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);

  return (
    <IonPage className="kanban">
      <KanbanHeader filters={filters} onFiltersChange={setFilters} resultCount={visibleTasks.length} />

      <IonContent scrollY={false} className="kanban__content">
        <KanbanBoard tasks={visibleTasks} isFiltering={isFilterActive(filters)} />
      </IonContent>
    </IonPage>
  );
};

export default KanbanPage;
