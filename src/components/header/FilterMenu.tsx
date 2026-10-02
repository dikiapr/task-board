import { IonPopover } from '@ionic/react';
import { funnelOutline } from 'ionicons/icons';
import type { LabelType } from '../../types/task';
import { LABELS, MEMBERS } from '../../data/constants';
import { EMPTY_FILTERS, type DueFilter, type TaskFilters } from '../../utils/filterTasks';
import MemberAvatar from '../avatar/MemberAvatar';
import Button from '../button/Button';
import LabelPill from '../label/LabelPill';
import { usePopover } from '../../hooks/usePopover';

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

interface FilterMenuProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  resultCount: number;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ filters, onFiltersChange, resultCount }) => {
  const menu = usePopover();

  const set = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) =>
    onFiltersChange({ ...filters, [key]: value });
  const activeCount = countActiveFilters(filters);

  return (
    <>
      <Button
        variant="ghost"
        icon={funnelOutline}
        className={activeCount > 0 ? 'is-active' : undefined}
        onClick={menu.open}
      >
        Filter
        {activeCount > 0 && <span className="k-badge">{activeCount}</span>}
      </Button>

      <IonPopover {...menu.props} className="k-popover k-popover--wide">
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
            <Button
              variant="ghost"
              disabled={activeCount === 0 && !filters.search}
              onClick={() => onFiltersChange(EMPTY_FILTERS)}
            >
              Clear all
            </Button>
            <Button variant="primary" onClick={menu.close}>
              Done
            </Button>
          </div>
        </div>
      </IonPopover>
    </>
  );
};

export default FilterMenu;
