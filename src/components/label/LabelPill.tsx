import type { LabelType } from '../../types/task';
import './label.css';

const LabelPill: React.FC<{ label: LabelType }> = ({ label }) => (
  <span className={`k-label k-label--${label.toLowerCase()}`}>{label}</span>
);

export default LabelPill;
