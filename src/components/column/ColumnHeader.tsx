import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { addOutline, contractOutline } from 'ionicons/icons';
import type { Column } from '../../types/task';
import { useBoardStore } from '../../store/useBoardStore';
import ColumnActionsMenu from './ColumnActionsMenu';

interface ColumnHeaderProps {
  column: Column;
  onAddTask: () => void;
  onDelete: () => void;
  onCollapse: () => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ column, onAddTask, onDelete, onCollapse }) => {
  const renameColumn = useBoardStore((s) => s.renameColumn);
  const [isRenaming, setIsRenaming] = useState(false);

  const commitRename = (value: string) => {
    if (value.trim()) renameColumn(column.id, value);
    setIsRenaming(false);
  };

  return (
    <header className="k-column__header">
      {isRenaming ? (
        <input
          className="k-column__rename"
          defaultValue={column.title}
          aria-label="List name"
          autoFocus
          onBlur={(e) => commitRename(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename(e.currentTarget.value);
            if (e.key === 'Escape') setIsRenaming(false);
          }}
        />
      ) : (
        <h2 className="k-column__title" onDoubleClick={() => setIsRenaming(true)}>
          {column.title}
        </h2>
      )}
      <button
        type="button"
        className="k-icon-btn k-icon-btn--add"
        onClick={onAddTask}
        aria-label={`Add task to ${column.title}`}
      >
        <IonIcon icon={addOutline} aria-hidden="true" />
      </button>
      <ColumnActionsMenu
        column={column}
        onAddTask={onAddTask}
        onRename={() => setIsRenaming(true)}
        onDelete={onDelete}
      />
      <button
        type="button"
        className="k-icon-btn k-column__collapse"
        onClick={onCollapse}
        aria-label={`Collapse ${column.title}`}
        title="Collapse list"
      >
        <IonIcon icon={contractOutline} aria-hidden="true" />
      </button>
    </header>
  );
};

export default ColumnHeader;
