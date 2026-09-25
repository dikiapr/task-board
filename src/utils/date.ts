const toISODate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const todayISO = () => toISODate(new Date());

const parseISODate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (iso: string, days: number): string => {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

const daysBetween = (from: string, to: string): number => {
  const toUTC = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUTC(to) - toUTC(from)) / 86_400_000);
};

export type DueStatus = 'none' | 'overdue' | 'today' | 'soon' | 'later';

export const getDueStatus = (dueDate: string | null, today = todayISO()): DueStatus => {
  if (!dueDate) return 'none';
  const diff = daysBetween(today, dueDate);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 3) return 'soon';
  return 'later';
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatShortDate = (iso: string, today = todayISO()): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const base = `${d} ${MONTHS[m - 1]}`;
  return iso.slice(0, 4) === today.slice(0, 4) ? base : `${base} ${y}`;
};

export const formatLongDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}, ${y}`;
};

export const formatRelativeTime = (isoDateTime: string, now = Date.now()): string => {
  const minutes = Math.floor((now - new Date(isoDateTime).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatLongDate(toISODate(new Date(isoDateTime)));
};
