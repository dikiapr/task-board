import { IonIcon, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { checkmark, chevronDown, lockClosedOutline, refreshOutline } from 'ionicons/icons';
import { BOARD_NAME } from '../../data/constants';
import { usePopover } from '../../hooks/usePopover';

const WorkspaceMenu: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const menu = usePopover();

  return (
    <>
      <button type="button" className="k-workspace" onClick={menu.open}>
        <IonIcon icon={lockClosedOutline} aria-hidden="true" />
        <span>{BOARD_NAME}</span>
        <IonIcon icon={chevronDown} aria-hidden="true" />
      </button>

      <IonPopover {...menu.props} className="k-popover">
        <IonList lines="none" className="k-menu">
          <IonItem lines="none">
            <IonIcon slot="start" icon={checkmark} color="primary" />
            <IonLabel>{BOARD_NAME}</IonLabel>
          </IonItem>
          <IonItem
            button
            detail={false}
            onClick={() => {
              menu.close();
              onReset();
            }}
          >
            <IonIcon slot="start" icon={refreshOutline} />
            <IonLabel>Reset to sample data</IonLabel>
          </IonItem>
        </IonList>
      </IonPopover>
    </>
  );
};

export default WorkspaceMenu;
