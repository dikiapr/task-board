import type { Activity } from '../../types/task';
import { formatRelativeTime } from '../../utils/date';

const ActivityList: React.FC<{ items: Activity[] }> = ({ items }) => {
  if (items.length === 0) {
    return <p className="k-muted">Activity will appear here after the task is saved.</p>;
  }

  return (
    <ol className="k-activity">
      {items.map((a) => (
        <li key={a.id}>
          <span className="k-activity__dot" aria-hidden="true" />
          <span className="k-activity__message">{a.message}</span>
          <time className="k-activity__time" dateTime={a.at} title={new Date(a.at).toLocaleString()}>
            {formatRelativeTime(a.at)}
          </time>
        </li>
      ))}
    </ol>
  );
};

export default ActivityList;
