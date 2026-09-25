import { useRef, useState } from 'react';
import { IonIcon, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import {
  checkmark,
  chevronDown,
  closeCircle,
  cloudDownloadOutline,
  cloudUploadOutline,
  funnelOutline,
  lockClosedOutline,
  personAddOutline,
  refreshOutline,
  searchOutline,
  swapHorizontalOutline,
} from 'ionicons/icons';
import type { LabelType } from '../../types/task';
import { BOARD_NAME, LABELS, MEMBERS } from '../../data/constants';
import { EMPTY_FILTERS, type DueFilter, type TaskFilters } from '../../utils/filterTasks';
import { AvatarStack, MemberAvatar } from './Avatar';
import { LabelPill } from './KanbanCard';
import { usePopover } from './usePopover';

const DUE_OPTIONS: { value: DueFilter; label: string }[] = [
  { value: 'all', label: 'Any time' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due today' },
  { value: 'week', label: 'Next 7 days' },
  { value: 'none', label: 'No due date' },
];

const countActiveFilters = (f: TaskFilters) =>
  f.assigneeIds.length + f.labels.length + (f.due === 'all' ? 0 : 1);

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

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
  const filterMenu = usePopover();
  const transferMenu = usePopover();
  const importInput = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');

  const set = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) =>
    onFiltersChange({ ...filters, [key]: value });
  const activeCount = countActiveFilters(filters);
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
        <button type="button" className="k-btn k-btn--soft" onClick={inviteMenu.open}>
          <IonIcon icon={personAddOutline} aria-hidden="true" />
          Invite
        </button>
      </div>

      <div className="k-header__group k-header__group--end">
        <button
          type="button"
          className={`k-btn k-btn--ghost${activeCount > 0 ? ' is-active' : ''}`}
          onClick={filterMenu.open}
        >
          <IonIcon icon={funnelOutline} aria-hidden="true" />
          Filter
          {activeCount > 0 && <span className="k-badge">{activeCount}</span>}
        </button>
        <button type="button" className="k-btn k-btn--ghost" onClick={transferMenu.open}>
          <IonIcon icon={swapHorizontalOutline} aria-hidden="true" />
          <span className="k-hide-sm">Export / Import</span>
        </button>
        <label className="k-search">
          <IonIcon icon={searchOutline} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search Tasks"
            aria-label="Search tasks"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
          />
          {filters.search && (
            <button type="button" className="k-search__clear" onClick={() => set('search', '')} aria-label="Clear search">
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
            <button type="submit" className="k-btn k-btn--primary" disabled={!emailValid}>
              Invite
            </button>
          </form>
        </div>
      </IonPopover>

      {/* ---------- Filter ---------- */}
      <IonPopover {...filterMenu.props} className="k-popover k-popover--wide">
        <div className="k-pop">
          <div className="k-pop__header">
            <h3 className="k-pop__title">Filter tasks</h3>
            <span className="k-muted">{resultCount} shown</span>
          </div>

          <p className="k-pop__label">Assignee</p>
          <div className="k-chips">
            {MEMBERS.map((m) => {
              const selected = filters.assigneeIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`k-chip${selected ? ' is-selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => set('assigneeIds', toggle(filters.assigneeIds, m.id))}
                >
                  <MemberAvatar member={m} />
                  {m.name.split(' ')[0]}
                </button>
              );
            })}
          </div>

          <p className="k-pop__label">Label</p>
          <div className="k-chips">
            {LABELS.map((l: LabelType) => {
              const selected = filters.labels.includes(l);
              return (
                <button
                  key={l}
                  type="button"
                  className={`k-chip${selected ? ' is-selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => set('labels', toggle(filters.labels, l))}
                >
                  <LabelPill label={l} />
                </button>
              );
            })}
          </div>

          <p className="k-pop__label">Due date</p>
          <div className="k-chips">
            {DUE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`k-chip${filters.due === o.value ? ' is-selected' : ''}`}
                aria-pressed={filters.due === o.value}
                onClick={() => set('due', o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="k-pop__footer">
            <button
              type="button"
              className="k-btn k-btn--ghost"
              disabled={activeCount === 0 && !filters.search}
              onClick={() => onFiltersChange(EMPTY_FILTERS)}
            >
              Clear all
            </button>
            <button type="button" className="k-btn k-btn--primary" onClick={filterMenu.close}>
              Done
            </button>
          </div>
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
