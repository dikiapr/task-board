import { IonIcon } from '@ionic/react';
import { closeCircle, searchOutline } from 'ionicons/icons';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange }) => (
  <label className="k-search">
    <IonIcon icon={searchOutline} aria-hidden="true" />
    <input
      type="search"
      placeholder="Search Tasks"
      aria-label="Search tasks"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button type="button" className="k-search__clear" onClick={() => onChange('')} aria-label="Clear search">
        <IonIcon icon={closeCircle} aria-hidden="true" />
      </button>
    )}
  </label>
);

export default SearchInput;
