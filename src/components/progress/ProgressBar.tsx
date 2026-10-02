import './progress.css';

const ProgressBar: React.FC<{ done: number; total: number }> = ({ done, total }) => {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div
      className={`k-progress${total > 0 && done === total ? ' k-progress--complete' : ''}`}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${percent}%` }} />
    </div>
  );
};

export default ProgressBar;
