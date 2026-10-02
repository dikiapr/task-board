import { useRef } from 'react';
import { IonIcon, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { cloudDownloadOutline, cloudUploadOutline, swapHorizontalOutline } from 'ionicons/icons';
import Button from '../button/Button';
import { usePopover } from '../../hooks/usePopover';

interface TransferMenuProps {
  onExport: () => void;
  onImport: (file: File) => void;
}

const TransferMenu: React.FC<TransferMenuProps> = ({ onExport, onImport }) => {
  const menu = usePopover();
  const importInput = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button variant="ghost" icon={swapHorizontalOutline} onClick={menu.open}>
        <span className="k-hide-sm">Export / Import</span>
      </Button>

      <IonPopover {...menu.props} className="k-popover">
        <IonList lines="none" className="k-menu">
          <IonItem
            button
            detail={false}
            onClick={() => {
              menu.close();
              onExport();
            }}
          >
            <IonIcon slot="start" icon={cloudDownloadOutline} />
            <IonLabel>Export as JSON</IonLabel>
          </IonItem>
          <IonItem
            button
            detail={false}
            onClick={() => {
              menu.close();
              importInput.current?.click();
            }}
          >
            <IonIcon slot="start" icon={cloudUploadOutline} />
            <IonLabel>Import from JSON</IonLabel>
          </IonItem>
        </IonList>
      </IonPopover>
      <input
        ref={importInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImport(file);
          e.target.value = '';
        }}
      />
    </>
  );
};

export default TransferMenu;
