import type { Member } from '../../types/task';
import './avatar.css';

export type AvatarSize = 'sm' | 'md';

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const MemberAvatar: React.FC<{ member: Member; size?: AvatarSize }> = ({ member, size = 'sm' }) => (
  <span
    className={`k-avatar k-avatar--${size}`}
    style={{ backgroundColor: member.color }}
    title={member.name}
    aria-label={member.name}
  >
    {initials(member.name)}
  </span>
);

export default MemberAvatar;
