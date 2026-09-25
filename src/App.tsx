import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Theme variables */
import './theme/variables.css';
import KanbanPage from './pages/KanbanPage';
import ErrorBoundary from './components/error/ErrorBoundary';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <ErrorBoundary>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="*" element={<Navigate to="/kanban" replace />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </ErrorBoundary>
  </IonApp>
);

export default App;
