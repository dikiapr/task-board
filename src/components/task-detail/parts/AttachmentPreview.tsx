import { IonIcon, IonModal } from '@ionic/react';
import { close, downloadOutline, openOutline } from 'ionicons/icons';
import type { Attachment } from '../../../types/task';
import { downloadBlob } from '../../../utils/download';
import Button from '../../button/Button';

export interface PreviewFile {
  attachment: Attachment;
  file: Blob;
  url: string;
}

interface AttachmentPreviewProps {
  preview: PreviewFile | null;
  onClose: () => void;
}

/** Shows an image or PDF attachment over the task detail. */
const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ preview, onClose }) => (
  <IonModal isOpen={preview !== null} className="k-preview-modal" onDidDismiss={onClose}>
    {preview && (
      <div className="k-preview">
        <div className="k-preview__bar">
          <span className="k-preview__name" title={preview.attachment.name}>
            {preview.attachment.name}
          </span>
          {preview.attachment.type === 'pdf' && (
            <a className="k-btn k-btn--ghost" href={preview.url} target="_blank" rel="noopener noreferrer">
              <IonIcon icon={openOutline} aria-hidden="true" />
              Open in new tab
            </a>
          )}
          <Button
            variant="soft"
            icon={downloadOutline}
            onClick={() => downloadBlob(preview.file, preview.attachment.name)}
          >
            Download
          </Button>
          <button type="button" className="k-icon-btn k-icon-btn--boxed" onClick={onClose} aria-label="Close preview">
            <IonIcon icon={close} aria-hidden="true" />
          </button>
        </div>
        <div className="k-preview__body">
          {preview.attachment.type === 'image' ? (
            <img src={preview.url} alt={preview.attachment.name} />
          ) : (
            <iframe src={preview.url} title={preview.attachment.name} />
          )}
        </div>
      </div>
    )}
  </IonModal>
);

export default AttachmentPreview;
