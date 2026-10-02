import { IonIcon } from '@ionic/react';
import { closeCircle, searchOutline } from 'ionicons/icons';
import { MEMBERS } from '../../data/constants';
import type { TaskFilters } from '../../utils/filterTasks';
import AvatarStack from '../avatar/AvatarStack';
import FilterMenu from './FilterMenu';
import InviteMenu from './InviteMenu';
import TransferMenu from './TransferMenu';
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
        <TransferMenu onExport={onExport} onImport={onImport} />
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
    </header>
  );
};

export default KanbanHeader;
