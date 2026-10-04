import { IonIcon } from '@ionic/react';
import { timeOutline } from 'ionicons/icons';
import { formatShortDate, getDueStatus } from '../../utils/date';
import './due.css';

interface DueBadgeProps {
  date: string;
  isDone?: boolean;
}

const DueBadge: React.FC<DueBadgeProps> = ({ date, isDone }) => {
  const status = isDone ? 'none' : getDueStatus(date);

  return (
    <span className={`k-due k-due--${status}`} title="Due date">
      <IonIcon icon={timeOutline} aria-hidden="true" />
      {formatShortDate(date)}
    </span>
  );
};

export default DueBadge;
