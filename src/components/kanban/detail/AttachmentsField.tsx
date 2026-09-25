import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { IonIcon } from '@ionic/react';
import { closeOutline, documentOutline, documentTextOutline, imageOutline } from 'ionicons/icons';
import { nanoid } from 'nanoid';
import type { Attachment, AttachmentType } from '../../../types/task';
import { ALLOWED_ATTACHMENT_LABEL, ATTACHMENT_ACCEPT, detectAttachmentType } from '../../../utils/attachment';

const ICONS: Record<AttachmentType, string> = {
  pdf: documentTextOutline,
  doc: documentOutline,
  image: imageOutline,
};

interface AttachmentsFieldProps {
  value: Attachment[];
  onChange: Dispatch<SetStateAction<Attachment[]>>;
}

const AttachmentsField: React.FC<AttachmentsFieldProps> = ({ value, onChange }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const added: Attachment[] = [];
    const skipped: string[] = [];

    for (const file of Array.from(files)) {
      const type = detectAttachmentType(file.name);
      if (type) added.push({ id: nanoid(), name: file.name, type });
      else skipped.push(file.name);
    }

    setRejected(skipped);
    if (added.length > 0) onChange((prev) => [...prev, ...added]);
  };

  return (
    <div className="k-attachments">
      <div
        className={`k-dropzone${isDragOver ? ' is-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <IonIcon icon={imageOutline} aria-hidden="true" />
        <span>Drag &amp; Drop files here</span>
        <span className="k-muted">or</span>
        <button type="button" className="k-link" onClick={() => fileInput.current?.click()}>
          browse from device
        </button>
      </div>
      <p className="k-muted k-attachments__hint">Allowed formats: {ALLOWED_ATTACHMENT_LABEL}</p>

      {rejected.length > 0 && (
        <p className="k-error" role="alert">
          Not added (format not allowed): {rejected.join(', ')}
        </p>
      )}

      {value.length > 0 && (
        <ul className="k-file-list">
          {value.map((a) => (
            <li key={a.id} className={`k-file k-file--${a.type}`}>
              <IonIcon icon={ICONS[a.type]} className="k-file__icon" aria-hidden="true" />
              <span className="k-file__name" title={a.name}>
                {a.name}
              </span>
              <button
                type="button"
                className="k-icon-btn"
                onClick={() => onChange((prev) => prev.filter((x) => x.id !== a.id))}
                aria-label={`Remove ${a.name}`}
              >
                <IonIcon icon={closeOutline} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={fileInput}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
};

export default AttachmentsField;
