import { useRef } from 'react';
import { IonIcon } from '@ionic/react';
import { calendarOutline, closeCircle } from 'ionicons/icons';
import { formatLongDate } from '../../utils/date';

interface DueDateFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const DueDateField: React.FC<DueDateFieldProps> = ({ value, onChange }) => {
  const input = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const el = input.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      el.focus();
    }
  };

  return (
    <div className="k-date">
      <button type="button" className="k-select k-date__button" onClick={openPicker}>
        <span className={value ? undefined : 'k-placeholder'}>{value ? formatLongDate(value) : 'Select date'}</span>
        <IonIcon icon={calendarOutline} aria-hidden="true" />
      </button>
      {value && (
        <button type="button" className="k-date__clear" onClick={() => onChange(null)} aria-label="Clear due date">
          <IonIcon icon={closeCircle} aria-hidden="true" />
        </button>
      )}
      <input
        ref={input}
        type="date"
        className="k-date__native"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
};

export default DueDateField;
