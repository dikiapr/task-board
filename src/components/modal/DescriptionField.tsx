import { IonIcon } from '@ionic/react';
import { pencil } from 'ionicons/icons';

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const DescriptionField: React.FC<DescriptionFieldProps> = ({ value, onChange }) => (
  <div className="k-description">
    <IonIcon icon={pencil} className="k-description__icon" aria-hidden="true" />
    <textarea aria-label="Description" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default DescriptionField;
