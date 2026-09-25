import { IonIcon, IonPopover } from '@ionic/react';
import { add, checkmark } from 'ionicons/icons';
import { MEMBERS } from '../../data/constants';
import { AvatarStack, MemberAvatar } from '../avatar/Avatar';
import { usePopover } from '../../hooks/usePopover';

interface AssigneeFieldProps {
  value: string[];
  onToggle: (memberId: string) => void;
}

const AssigneeField: React.FC<AssigneeFieldProps> = ({ value, onToggle }) => {
  const picker = usePopover();

  return (
    <div className="k-assignee">
      {value.length === 0 && <span className="k-placeholder">Unassigned</span>}
      <AvatarStack memberIds={value} max={4} size="md" />
      <button type="button" className="k-round-btn" onClick={picker.open} aria-label="Add or remove assignees">
        <IonIcon icon={add} aria-hidden="true" />
      </button>

      <IonPopover {...picker.props} className="k-popover">
        <div className="k-pop">
          <h3 className="k-pop__title">Assignees</h3>
          <ul className="k-member-list k-member-list--selectable">
            {MEMBERS.map((m) => {
              const selected = value.includes(m.id);
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    className={selected ? 'is-selected' : undefined}
                    onClick={() => onToggle(m.id)}
                  >
                    <MemberAvatar member={m} size="md" />
                    <span>{m.name}</span>
                    {selected && <IonIcon icon={checkmark} className="k-member-list__check" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </IonPopover>
    </div>
  );
};

export default AssigneeField;
