import { useRef, useState } from 'react';
import { IonIcon, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import {
  checkmark,
  chevronDown,
  closeCircle,
  cloudDownloadOutline,
  cloudUploadOutline,
  lockClosedOutline,
  personAddOutline,
  refreshOutline,
  searchOutline,
  swapHorizontalOutline,
} from 'ionicons/icons';
import { BOARD_NAME, MEMBERS } from '../../data/constants';
import type { TaskFilters } from '../../utils/filterTasks';
import AvatarStack from '../avatar/AvatarStack';
import MemberAvatar from '../avatar/MemberAvatar';
import Button from '../button/Button';
import { usePopover } from '../../hooks/usePopover';
import FilterMenu from './FilterMenu';
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
  const workspaceMenu = usePopover();
  const inviteMenu = usePopover();
  const transferMenu = usePopover();
  const importInput = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');

  const setSearch = (search: string) => onFiltersChange({ ...filters, search });
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <header className="k-header">
      <div className="k-header__group">
        <button type="button" className="k-workspace" onClick={workspaceMenu.open}>
          <IonIcon icon={lockClosedOutline} aria-hidden="true" />
          <span>{BOARD_NAME}</span>
          <IonIcon icon={chevronDown} aria-hidden="true" />
        </button>
        <AvatarStack memberIds={MEMBERS.map((m) => m.id)} max={4} size="md" />
        <Button variant="soft" icon={personAddOutline} onClick={inviteMenu.open}>
          Invite
        </Button>
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

      {/* ---------- Workspace ---------- */}
      <IonPopover {...workspaceMenu.props} className="k-popover">
        <IonList lines="none" className="k-menu">
          <IonItem lines="none">
            <IonIcon slot="start" icon={checkmark} color="primary" />
            <IonLabel>{BOARD_NAME}</IonLabel>
          </IonItem>
          <IonItem
            button
            detail={false}
            onClick={() => {
              workspaceMenu.close();
              onReset();
            }}
          >
            <IonIcon slot="start" icon={refreshOutline} />
            <IonLabel>Reset to sample data</IonLabel>
          </IonItem>
        </IonList>
      </IonPopover>

      {/* ---------- Invite ---------- */}
      <IonPopover {...inviteMenu.props} className="k-popover k-popover--wide">
        <div className="k-pop">
          <h3 className="k-pop__title">Team members</h3>
          <ul className="k-member-list">
            {MEMBERS.map((m) => (
              <li key={m.id}>
                <MemberAvatar member={m} size="md" />
                <span>{m.name}</span>
              </li>
            ))}
          </ul>
          <form
            className="k-pop__row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!emailValid) return;
              onInvite(email.trim());
              setEmail('');
              inviteMenu.close();
            }}
          >
            <input
              className="k-input"
              type="email"
              placeholder="name@company.com"
              aria-label="Email to invite"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="primary" disabled={!emailValid}>
              Invite
            </Button>
          </form>
        </div>
      </IonPopover>

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
