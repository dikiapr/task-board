import { IonIcon } from '@ionic/react';
import { flag } from 'ionicons/icons';
import type { Priority } from '../../types/task';
import { PRIORITY_COLORS } from '../../data/constants';
import './priority.css';

const PriorityFlag: React.FC<{ priority: Priority }> = ({ priority }) => (
  <span
    className="k-priority"
    style={{ color: PRIORITY_COLORS[priority] }}
    title={`${priority} priority`}
    aria-label={`${priority} priority`}
  >
    <IonIcon icon={flag} aria-hidden="true" />
  </span>
);

export default PriorityFlag;
