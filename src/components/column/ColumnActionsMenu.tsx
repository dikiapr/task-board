import { useRef } from 'react';
import { IonIcon, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { addOutline, createOutline, ellipsisVertical, trashOutline } from 'ionicons/icons';
import type { Column } from '../../types/task';
import { DONE_COLUMN_ID } from '../../data/constants';
import { usePopover } from '../../hooks/usePopover';

interface ColumnActionsMenuProps {
  column: Column;
  onAddTask: () => void;
  onRename: () => void;
  onDelete: () => void;
}

const ColumnActionsMenu: React.FC<ColumnActionsMenuProps> = ({ column, onAddTask, onRename, onDelete }) => {
  const menu = usePopover();
  const renameAfterMenu = useRef(false);

  return (
    <>
      <button type="button" className="k-icon-btn" onClick={menu.open} aria-label={`${column.title} actions`}>
        <IonIcon icon={ellipsisVertical} aria-hidden="true" />
      </button>

      <IonPopover
        {...menu.props}
        className="k-popover"
        alignment="end"
        onDidDismiss={() => {
          menu.props.onDidDismiss();
          // Start renaming only once the menu is gone: while it is still open its focus
          // trap pulls focus back, blurring the rename input and closing it right away.
          if (renameAfterMenu.current) {
            renameAfterMenu.current = false;
            onRename();
          }
        }}
      >
        <IonList lines="none" className="k-menu">
          <IonItem
            button
            detail={false}
            onClick={() => {
              menu.close();
              onAddTask();
            }}
          >
            <IonIcon slot="start" icon={addOutline} />
            <IonLabel>Add task</IonLabel>
          </IonItem>
          <IonItem
            button
            detail={false}
            onClick={() => {
              renameAfterMenu.current = true;
              menu.close();
            }}
          >
            <IonIcon slot="start" icon={createOutline} />
            <IonLabel>Rename list</IonLabel>
          </IonItem>
          <IonItem
            button
            detail={false}
            disabled={column.id === DONE_COLUMN_ID}
            onClick={() => {
              menu.close();
              onDelete();
            }}
          >
            <IonIcon slot="start" icon={trashOutline} color="danger" />
            <IonLabel color="danger">Delete list</IonLabel>
          </IonItem>
        </IonList>
      </IonPopover>
    </>
  );
};

export default ColumnActionsMenu;
