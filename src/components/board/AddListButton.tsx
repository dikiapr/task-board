import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { addOutline, closeOutline } from 'ionicons/icons';
import Button from '../button/Button';
import './add-list.css';

const AddListButton: React.FC<{ onAdd: (title: string) => void }> = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    onAdd(title);
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <div className="k-add-list">
        <button type="button" className="k-add-list__button" onClick={() => setIsAdding(true)}>
          <IonIcon icon={addOutline} aria-hidden="true" />
          Add new List
        </button>
      </div>
    );
  }

  return (
    <form
      className="k-add-list k-add-list--form"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        className="k-input"
        placeholder="List name"
        aria-label="List name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setIsAdding(false)}
        autoFocus
      />
      <div className="k-add-list__actions">
        <Button type="submit" variant="primary" disabled={!title.trim()}>
          Add list
        </Button>
        <button type="button" className="k-icon-btn" onClick={() => setIsAdding(false)} aria-label="Cancel">
          <IonIcon icon={closeOutline} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};

export default AddListButton;
