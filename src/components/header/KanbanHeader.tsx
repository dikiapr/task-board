import { MEMBERS } from '../../data/constants';
import type { TaskFilters } from '../../utils/filterTasks';
import AvatarStack from '../avatar/AvatarStack';
import FilterMenu from './FilterMenu';
import InviteMenu from './InviteMenu';
import SearchInput from './SearchInput';
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
        <SearchInput value={filters.search} onChange={setSearch} />
      </div>
    </header>
  );
};

export default KanbanHeader;
