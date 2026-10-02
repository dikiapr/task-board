import { useRef } from 'react';
import { IonIcon, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import {
  closeCircle,
  cloudDownloadOutline,
  cloudUploadOutline,
  searchOutline,
  swapHorizontalOutline,
} from 'ionicons/icons';
import { MEMBERS } from '../../data/constants';
import type { TaskFilters } from '../../utils/filterTasks';
import AvatarStack from '../avatar/AvatarStack';
import Button from '../button/Button';
import { usePopover } from '../../hooks/usePopover';
import FilterMenu from './FilterMenu';
import InviteMenu from './InviteMenu';
import WorkspaceMenu from './WorkspaceMenu';
import './header.css';

interface KanbanHeaderProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  resultCount: number;
  onInvite: (email: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

const KanbanHeader: React.FC<KanbanHeaderProps> = ({
  filters,
  onFiltersChange,
  resultCount,
  onInvite,
  onExport,
  onImport,
  onReset,
}) => {
  const transferMenu = usePopover();
  const importInput = useRef<HTMLInputElement>(null);

  const setSearch = (search: string) => onFiltersChange({ ...filters, search });

  return (
    <header className="k-header">
      <div className="k-header__group">
        <WorkspaceMenu onReset={onReset} />
        <AvatarStack memberIds={MEMBERS.map((m) => m.id)} max={4} size="md" />
        <InviteMenu onInvite={onInvite} />
      </div>

      <div className="k-header__group k-header__group--end">
        <FilterMenu filters={filters} onFiltersChange={onFiltersChange} resultCount={resultCount} />
        <Button variant="ghost" icon={swapHorizontalOutline} onClick={transferMenu.open}>
          <span className="k-hide-sm">Export / Import</span>
        </Button>
        <label className="k-search">
          <IonIcon icon={searchOutline} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search Tasks"
            aria-label="Search tasks"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {filters.search && (
            <button type="button" className="k-search__clear" onClick={() => setSearch('')} aria-label="Clear search">
              <IonIcon icon={closeCircle} aria-hidden="true" />
            </button>
          )}
        </label>
      </div>

      {/* ---------- Export / Import ---------- */}
      <IonPopover {...transferMenu.props} className="k-popover">
        <IonList lines="none" className="k-menu">
          <IonItem
            button
            detail={false}
            onClick={() => {
              transferMenu.close();
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
              transferMenu.close();
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
    </header>
  );
};

export default KanbanHeader;
