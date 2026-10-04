import { IonIcon } from '@ionic/react';
import { checkmark, close } from 'ionicons/icons';

interface DetailTopbarProps {
  isComplete: boolean;
  onToggleComplete: () => void;
  onClose: () => void;
}

const DetailTopbar: React.FC<DetailTopbarProps> = ({ isComplete, onToggleComplete, onClose }) => (
  <div className="k-detail__topbar">
    <button
      type="button"
      className={`k-mark${isComplete ? ' is-complete' : ''}`}
      aria-pressed={isComplete}
      onClick={onToggleComplete}
    >
      <IonIcon icon={checkmark} aria-hidden="true" />
      {isComplete ? 'Completed' : 'Mark Complete'}
    </button>
    <button type="button" className="k-icon-btn k-icon-btn--boxed" onClick={onClose} aria-label="Close">
      <IonIcon icon={close} aria-hidden="true" />
    </button>
  </div>
);

export default DetailTopbar;
