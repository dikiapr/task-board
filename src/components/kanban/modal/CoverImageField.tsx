import { useRef, useState } from 'react';
import { IonIcon, IonPopover } from '@ionic/react';
import { cloudUploadOutline, imageOutline } from 'ionicons/icons';
import { DUMMY_COVERS } from '../../../data/constants';
import { imageFileToDataUrl } from '../../../utils/image';
import Button from '../button/Button';
import { usePopover } from '../../../hooks/usePopover';

interface CoverImageFieldProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

const CoverImageField: React.FC<CoverImageFieldProps> = ({ value, onChange }) => {
  const picker = usePopover();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    try {
      onChange(await imageFileToDataUrl(file));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className={`k-cover${value ? ' k-cover--filled' : ''}`}>
      {value ? (
        <>
          <img src={value} alt="Task cover" />
          <div className="k-cover__actions">
            <Button variant="overlay" onClick={picker.open}>
              Change
            </Button>
            <Button variant="overlay" onClick={() => onChange(undefined)}>
              Remove
            </Button>
          </div>
        </>
      ) : (
        <button type="button" className="k-cover__empty" onClick={picker.open}>
          <IonIcon icon={imageOutline} className="k-cover__icon" aria-hidden="true" />
          <span>Add Cover Image</span>
        </button>
      )}
      {error && <p className="k-error">{error}</p>}

      <IonPopover {...picker.props} className="k-popover k-popover--wide">
        <div className="k-pop">
          <h3 className="k-pop__title">Cover image</h3>
          <div className="k-cover-grid">
            {DUMMY_COVERS.map((src) => (
              <button
                key={src}
                type="button"
                className={`k-cover-thumb${src === value ? ' is-selected' : ''}`}
                onClick={() => {
                  onChange(src);
                  picker.close();
                }}
                aria-label="Use this sample image"
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
          <Button
            variant="soft"
            icon={cloudUploadOutline}
            block
            onClick={() => {
              picker.close();
              fileInput.current?.click();
            }}
          >
            Upload from device
          </Button>
        </div>
      </IonPopover>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
};

export default CoverImageField;
