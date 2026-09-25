import { useState, type Dispatch, type SetStateAction } from 'react';
import { IonCheckbox, IonIcon } from '@ionic/react';
import { add, closeOutline } from 'ionicons/icons';
import { nanoid } from 'nanoid';
import type { Subtask } from '../../../types/task';
import Button from '../button/Button';
import { ProgressBar } from '../card/KanbanCard';

interface ChecklistFieldProps {
  value: Subtask[];
  onChange: Dispatch<SetStateAction<Subtask[]>>;
}

const ChecklistField: React.FC<ChecklistFieldProps> = ({ value, onChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const doneCount = value.filter((s) => s.done).length;

  const addSubtask = (rawTitle: string) => {
    const title = rawTitle.trim();
    if (!title) return;
    onChange((prev) => [...prev, { id: nanoid(), title, done: false }]);
    setNewTitle('');
  };

  const toggle = (id: string) =>
    onChange((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));

  const remove = (id: string) => onChange((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="k-checklist">
      <span className="k-checklist__count">
        {doneCount}/{value.length}
      </span>
      <ProgressBar done={doneCount} total={value.length} />

      {value.length > 0 && (
        <ul className="k-checklist__list">
          {value.map((s) => (
            <li key={s.id} className={`k-checklist__item${s.done ? ' is-done' : ''}`}>
              <IonCheckbox checked={s.done} onIonChange={() => toggle(s.id)} labelPlacement="end" justify="start">
                {s.title}
              </IonCheckbox>
              <button type="button" className="k-icon-btn" onClick={() => remove(s.id)} aria-label={`Remove ${s.title}`}>
                <IonIcon icon={closeOutline} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {isAdding ? (
        <div className="k-checklist__new">
          <input
            className="k-input"
            placeholder="Subtask title, press Enter to add"
            aria-label="New subtask title"
            value={newTitle}
            autoFocus
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSubtask(e.currentTarget.value);
              }
              if (e.key === 'Escape') setIsAdding(false);
            }}
          />
          <Button variant="primary" disabled={!newTitle.trim()} onClick={() => addSubtask(newTitle)}>
            Add
          </Button>
          <button type="button" className="k-icon-btn" onClick={() => setIsAdding(false)} aria-label="Cancel">
            <IonIcon icon={closeOutline} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <Button variant="soft" icon={add} block onClick={() => setIsAdding(true)}>
          Add subtask
        </Button>
      )}
    </div>
  );
};

export default ChecklistField;
